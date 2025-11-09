package com.ride.ride;

import com.ride.ride.dto.RideDtos.CreateRideReq;
import com.ride.ride.dto.RideDtos.RideResp;
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

    // Passenger: create ride
    @PostMapping
    public RideResp create(@Valid @RequestBody CreateRideReq req, Authentication auth) {
        return service.createRide(auth, req);
    }

    // Passenger/Driver: view ride if involved
    @GetMapping("/{id}")
    public RideResp get(@PathVariable UUID id, Authentication auth) {
        return service.getRide(id, auth);
    }

    // Passenger: list own rides
    @GetMapping("/me")
    public List<RideResp> myRides(Authentication auth) {
        return service.myRides(auth);
    }
}
