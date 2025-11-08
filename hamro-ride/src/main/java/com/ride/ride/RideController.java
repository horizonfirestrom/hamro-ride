package com.ride.ride;

import com.ride.driver.dto.DriverDtos;
import com.ride.ride.dto.RideDtos.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rides")
public class RideController {

    private final RideService service;

    public RideController(RideService service) {
        this.service = service;
    }

    // Create a new ride request (passenger must be authenticated)
    @PostMapping
    public RideResp create(@Valid @RequestBody CreateRideReq req,
                           Authentication auth) {
        return service.createRide(auth, req);
    }

    // Get single ride (only its passenger for now)
    @GetMapping("/{id}")
    public RideResp get(@PathVariable UUID id, Authentication auth) {
        return service.getRide(id, auth);
    }

    // List rides for current user (as passenger)
    @GetMapping("/me")
    public List<RideResp> myRides(Authentication auth) {
        return service.myRides(auth);
    }

    // Helper: see nearby drivers for a pickup location
    @GetMapping("/nearby-drivers")
    public List<DriverDtos.NearbyDriver> nearbyDrivers(@RequestParam double lat,
                                                       @RequestParam double lng,
                                                       @RequestParam(defaultValue = "5") int limit,
                                                       @RequestParam(defaultValue = "3000") double radiusMeters) {
        return service.nearbyDrivers(lat, lng, limit, radiusMeters);
    }
}
