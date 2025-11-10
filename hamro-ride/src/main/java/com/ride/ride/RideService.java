package com.ride.ride;

import com.ride.common.exception.BadRequestException;
import com.ride.common.exception.ForbiddenException;
import com.ride.common.exception.NotFoundException;
import com.ride.driver.DriverProfile;
import com.ride.driver.DriverProfileRepository;
import com.ride.driver.DriverService;
import com.ride.driver.dto.DriverDtos;
import com.ride.pricing.FareService;
import com.ride.realtime.RideUpdateMessage;
import com.ride.ride.dto.RideDtos.CreateRideReq;
import com.ride.ride.dto.RideDtos.RideResp;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

@Service
public class RideService {

    private final RideRepository rides;
    private final DriverService driverService;
    private final FareService fareService;
    private final DriverProfileRepository driverProfiles;
    private final SimpMessagingTemplate messaging;

    public RideService(RideRepository rides, DriverService driverService, FareService fareService, DriverProfileRepository driverProfiles, SimpMessagingTemplate messaging) {
        this.rides = rides;
        this.driverService = driverService;
        this.fareService = fareService;
        this.driverProfiles = driverProfiles;
        this.messaging = messaging;
        
    }

    private UUID currentUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    // ================= PASSENGER =================

    @Transactional
    public RideResp createRide(Authentication auth, CreateRideReq req) {
        UUID passengerId = currentUserId(auth);

        Ride r = new Ride();
        r.setPassengerId(passengerId);
        r.setPickupLat(req.pickupLat());
        r.setPickupLng(req.pickupLng());
        r.setPickupAddress(req.pickupAddress());
        r.setDropoffLat(req.dropoffLat());
        r.setDropoffLng(req.dropoffLng());
        r.setDropoffAddress(req.dropoffAddress());
        r.setStatus(RideStatus.REQUESTED);
        
        
		double distanceMiles = fareService.distanceMiles(req.pickupLat(), req.pickupLng(),req.dropoffLat(), req.dropoffLng());
		double estimatedFare = fareService.estimateFare(distanceMiles);
        r.setDistanceMiles(distanceMiles);
        r.setEstimatedFare(estimatedFare);
     // r.setFinalFare(...) can be set later at completion if needed

        // auto-assign nearest driver (simple version)
        List<DriverDtos.NearbyDriver> nearby = driverService.nearby(
                req.pickupLat(), req.pickupLng(), 5, 5_000
        );

        if (!nearby.isEmpty()) {
            UUID driverId = nearby.get(0).driverId();
            r.setDriverId(driverId);
            r.setStatus(RideStatus.DRIVER_ASSIGNED);
        }

        rides.save(r);
        publishRideUpdate(r);
        return toResp(r);
    }

    public List<RideResp> myRides(Authentication auth) {
        UUID passengerId = currentUserId(auth);
        return rides.findByPassengerIdOrderByCreatedAtDesc(passengerId)
                .stream().map(this::toResp).toList();
    }

    public RideResp getRide(UUID id, Authentication auth) {
        Ride r = rides.findById(id).orElseThrow();
        UUID me = currentUserId(auth);
        if (!isParticipant(r, me)) throw forbidden();
        return toResp(r);
    }

    @Transactional
    public RideResp cancelAsPassenger(UUID rideId, Authentication auth) {
        UUID passengerId = currentUserId(auth);
        Ride r = rides.findById(rideId).orElseThrow();

        if (!passengerId.equals(r.getPassengerId())) throw forbidden();
        if (!EnumSet.of(
                RideStatus.REQUESTED,
                RideStatus.DRIVER_ASSIGNED,
                RideStatus.DRIVER_ACCEPTED,
                RideStatus.DRIVER_ARRIVING
        ).contains(r.getStatus())) {
            throw new IllegalStateException("Cannot cancel at this stage");
        }

        r.setStatus(RideStatus.CANCELLED_BY_PASSENGER);
        rides.save(r);
        publishRideUpdate(r);
        return toResp(r);
    }

    // ================= DRIVER =================

    public List<RideResp> getAssignedRidesForDriver(Authentication auth) {
        UUID driverId = currentUserId(auth);
        return rides.findByDriverId(driverId).stream()
                .filter(r -> !EnumSet.of(
                        RideStatus.COMPLETED,
                        RideStatus.CANCELLED_BY_DRIVER,
                        RideStatus.CANCELLED_BY_PASSENGER,
                        RideStatus.CANCELLED_SYSTEM
                ).contains(r.getStatus()))
                .map(this::toResp)
                .toList();
    }

    @Transactional
    public RideResp acceptAsDriver(UUID rideId, Authentication auth) {
        Ride r = getRideForDriverOrThrow(rideId, auth);

        if (r.getStatus() != RideStatus.DRIVER_ASSIGNED &&
            r.getStatus() != RideStatus.REQUESTED) {
            throw new IllegalStateException("Ride not in assignable state");
        }

        // If no driver yet (REQUESTED), this driver is now claiming it (simple version)
        if (r.getDriverId() == null) {
            r.setDriverId(currentUserId(auth));
        }

        r.setStatus(RideStatus.DRIVER_ACCEPTED);
        rides.save(r);
        return toResp(r);
    }

    @Transactional
    public RideResp markArriving(UUID rideId, Authentication auth) {
        Ride r = getRideForDriverOrThrow(rideId, auth);
        if (r.getStatus() != RideStatus.DRIVER_ACCEPTED) {
            throw new IllegalStateException("Must accept before arriving");
        }
        r.setStatus(RideStatus.DRIVER_ARRIVING);
        rides.save(r);
        publishRideUpdate(r);
        return toResp(r);
    }

    @Transactional
    public RideResp startRide(UUID rideId, Authentication auth) {
        Ride r = getRideForDriverOrThrow(rideId, auth);
        if (!EnumSet.of(RideStatus.DRIVER_ACCEPTED, RideStatus.DRIVER_ARRIVING)
                .contains(r.getStatus())) {
            throw new IllegalStateException("Cannot start from current status");
        }
        r.setStatus(RideStatus.IN_PROGRESS);
        rides.save(r);
        publishRideUpdate(r);
        return toResp(r);
    }

    @Transactional
    public RideResp completeRide(UUID rideId, Authentication auth) {
    	Ride r = getRideForDriverOrThrow(rideId, auth);

        if (r.getStatus() != RideStatus.IN_PROGRESS) {
            throw new BadRequestException("Only in-progress rides can be completed");
        }

        r.setStatus(RideStatus.COMPLETED);
        if (r.getFinalFare() == null && r.getEstimatedFare() != null) {
            r.setFinalFare(r.getEstimatedFare());
        }

        rides.save(r);
        publishRideUpdate(r);  // NEW

        return toResp(r);
    }


    @Transactional
    public RideResp cancelAsDriver(UUID rideId, Authentication auth) {
        Ride r = getRideForDriverOrThrow(rideId, auth);
        if (!EnumSet.of(
                RideStatus.REQUESTED,
                RideStatus.DRIVER_ASSIGNED,
                RideStatus.DRIVER_ACCEPTED,
                RideStatus.DRIVER_ARRIVING
        ).contains(r.getStatus())) {
            throw new IllegalStateException("Cannot cancel at this stage");
        }
        r.setStatus(RideStatus.CANCELLED_BY_DRIVER);
        rides.save(r);
        publishRideUpdate(r);
        return toResp(r);
    }

    // ================= INTERNAL HELPERS =================

    private Ride getRideForDriverOrThrow(UUID rideId, Authentication auth) {
        UUID driverId = currentUserId(auth);
        Ride r = rides.findById(rideId).orElseThrow();
        if (r.getDriverId() == null || !r.getDriverId().equals(driverId)) {
            throw forbidden();
        }
        return r;
    }

    private boolean isParticipant(Ride r, UUID userId) {
        return r.getPassengerId().equals(userId) ||
                (r.getDriverId() != null && r.getDriverId().equals(userId));
    }

    private RuntimeException forbidden() {
        return new RuntimeException("Forbidden");
    }

    private RideResp toResp(Ride r) {
        return new RideResp(
                r.getId(),
                r.getPassengerId(),
                r.getDriverId(),
                r.getPickupLat(),
                r.getPickupLng(),
                r.getPickupAddress(),
                r.getDropoffLat(),
                r.getDropoffLng(),
                r.getDropoffAddress(),
                r.getStatus(),
                r.getCreatedAt(),
                r.getDistanceMiles(),
                r.getEstimatedFare(),
                r.getFinalFare(),
                r.getDriverRating(),
                r.getPassengerRating()
        );
    }
    
    @Transactional
    public RideResp rateDriver(UUID rideId, int rating, Authentication auth) {
        UUID passengerId = currentUserId(auth);
        Ride r = rides.findById(rideId)
                .orElseThrow(() -> new NotFoundException("Ride not found"));

        if (!passengerId.equals(r.getPassengerId())) {
            throw new ForbiddenException("You are not passenger of this ride");
        }
        if (r.getStatus() != RideStatus.COMPLETED) {
            throw new BadRequestException("Can rate driver only after ride is completed");
        }
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        // set / overwrite rating for this ride
        r.setDriverRating(rating);
        publishRideUpdate(r);
        rides.save(r);

        // --- NEW: recompute driver's average rating ---
        if (r.getDriverId() != null) {
            var profileOpt = driverProfiles.findByUserId(r.getDriverId());
            if (profileOpt.isPresent()) {
                DriverProfile profile = profileOpt.get();

                var ratedRides = rides.findByDriverIdAndDriverRatingIsNotNull(r.getDriverId());
                double avg = ratedRides.stream()
                        .mapToInt(Ride::getDriverRating)
                        .average()
                        .orElse(rating); // fallback, though list shouldn't be empty

                profile.setRating(roundToOneDecimal(avg));
                driverProfiles.save(profile);
            }
        }

        return toResp(r);
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
    
    @Transactional
    public RideResp ratePassenger(UUID rideId, int rating, Authentication auth) {
        UUID driverId = currentUserId(auth);
        Ride r = rides.findById(rideId)
                .orElseThrow(() -> new NotFoundException("Ride not found"));

        if (r.getDriverId() == null || !driverId.equals(r.getDriverId())) {
            throw new ForbiddenException("You are not driver of this ride");
        }
        if (r.getStatus() != RideStatus.COMPLETED) {
            throw new BadRequestException("Can rate passenger only after ride is completed");
        }
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        r.setPassengerRating(rating);
        rides.save(r);
        publishRideUpdate(r);

        // (Optional) later: compute passenger's avg rating similarly
        return toResp(r);
    }
    
    private void publishRideUpdate(Ride r) {
        RideUpdateMessage msg = new RideUpdateMessage(
                r.getId(),
                r.getPassengerId(),
                r.getDriverId(),
                r.getStatus(),
                r.getDistanceMiles(),
                r.getEstimatedFare(),
                r.getFinalFare(),
                Instant.now()
        );
        String destination = "/topic/rides/" + r.getId();
        messaging.convertAndSend(destination, msg);
    }



}
