package com.ride.ride;

import com.ride.driver.DriverService;
import com.ride.driver.dto.DriverDtos;
import com.ride.ride.dto.RideDtos.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private UUID passengerId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @Transactional
    public RideResp createRide(Authentication auth, CreateRideReq req) {
        UUID pid = passengerId(auth);

        Ride r = new Ride();
        r.setPassengerId(pid);
        r.setPickupLat(req.pickupLat());
        r.setPickupLng(req.pickupLng());
        r.setPickupAddress(req.pickupAddress());
        r.setDropoffLat(req.dropoffLat());
        r.setDropoffLng(req.dropoffLng());
        r.setDropoffAddress(req.dropoffAddress());
        r.setStatus(RideStatus.REQUESTED);

        rides.save(r);
        return toResp(r);
    }

    public RideResp getRide(UUID id, Authentication auth) {
        Ride r = rides.findById(id).orElseThrow();
        // simple safety: only passenger (or later driver/admin) can view
        UUID pid = passengerId(auth);
        if (!r.getPassengerId().equals(pid)) {
            // In real app throw custom 403 exception; for now:
            throw new RuntimeException("forbidden");
        }
        return toResp(r);
    }

    public List<RideResp> myRides(Authentication auth) {
        UUID pid = passengerId(auth);
        return rides.findByPassengerIdOrderByCreatedAtDesc(pid)
                .stream().map(this::toResp).toList();
    }

    // helper: show nearby drivers for the passenger's pickup (optional)
    public List<DriverDtos.NearbyDriver> nearbyDrivers(double lat, double lng, int limit, double radiusMeters) {
        return driverService.nearby(lat, lng, limit, radiusMeters);
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
                r.getCreatedAt()
        );
    }
}
