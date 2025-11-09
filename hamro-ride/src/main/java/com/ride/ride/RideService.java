package com.ride.ride;

import com.ride.driver.DriverService;
import com.ride.driver.dto.DriverDtos;
import com.ride.ride.dto.RideDtos.CreateRideReq;
import com.ride.ride.dto.RideDtos.RideResp;
import com.ride.ride.dto.RideDtos.UpdateRideStatusReq;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

@Service
public class RideService {

    private final RideRepository rides;
    private final DriverService driverService;

    public RideService(RideRepository rides, DriverService driverService) {
        this.rides = rides;
        this.driverService = driverService;
    }

    private UUID currentUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    // ========== PASSENGER METHODS ==========

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

        // Try auto-assign nearest ONLINE driver (e.g. within 5km)
        List<DriverDtos.NearbyDriver> nearby = driverService.nearby(
                req.pickupLat(), req.pickupLng(), 5, 5_000
        );

        if (!nearby.isEmpty()) {
            UUID driverId = nearby.get(0).driverId();
            r.setDriverId(driverId);
            r.setStatus(RideStatus.DRIVER_ASSIGNED);
        }

        rides.save(r);
        return toResp(r);
    }

    public RideResp getRide(UUID id, Authentication auth) {
        Ride r = rides.findById(id).orElseThrow();
        UUID userId = currentUserId(auth);
        // simple visibility: passenger or assigned driver may view
        if (!r.getPassengerId().equals(userId) &&
                (r.getDriverId() == null || !r.getDriverId().equals(userId))) {
            throw new RuntimeException("Forbidden");
        }
        return toResp(r);
    }

    public List<RideResp> myRides(Authentication auth) {
        UUID passengerId = currentUserId(auth);
        return rides.findByPassengerIdOrderByCreatedAtDesc(passengerId)
                .stream().map(this::toResp).toList();
    }

    // ========== DRIVER METHODS ==========

    /**
     * Get all active rides assigned to currently authenticated driver.
     */
    public List<RideResp> getAssignedRidesForDriver(Authentication auth) {
        UUID driverId = currentUserId(auth);
        // Fetch all rides where driverId matches and status is not completed/cancelled
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

    /**
     * Driver updates status of an assigned ride.
     */
    @Transactional
    public RideResp updateRideStatusAsDriver(UUID rideId,
                                             UpdateRideStatusReq req,
                                             Authentication auth) {
        UUID driverId = currentUserId(auth);
        Ride r = rides.findById(rideId).orElseThrow();

        if (r.getDriverId() == null || !r.getDriverId().equals(driverId)) {
            throw new RuntimeException("Forbidden: ride not assigned to this driver");
        }

        RideStatus current = r.getStatus();
        RideStatus target = req.status();

        // Very simple allowed transitions:
        if (!isAllowedTransitionForDriver(current, target)) {
            throw new RuntimeException("Invalid status transition: " + current + " -> " + target);
        }

        r.setStatus(target);
        rides.save(r);
        return toResp(r);
    }

    private boolean isAllowedTransitionForDriver(RideStatus from, RideStatus to) {
        return switch (from) {
            case DRIVER_ASSIGNED -> (to == RideStatus.DRIVER_ARRIVING
                    || to == RideStatus.CANCELLED_BY_DRIVER);
            case DRIVER_ARRIVING -> (to == RideStatus.IN_PROGRESS
                    || to == RideStatus.CANCELLED_BY_DRIVER);
            case IN_PROGRESS -> (to == RideStatus.COMPLETED
                    || to == RideStatus.CANCELLED_BY_DRIVER);
            default -> false;
        };
    }

    // ========== HELPERS ==========

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
                r.getCreatedAt()
        );
    }
}
