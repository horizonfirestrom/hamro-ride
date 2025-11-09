package com.ride.ride;

import com.ride.ride.dto.RideDtos.RideResp;
import com.ride.ride.dto.RideDtos.UpdateRideStatusReq;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/driver/rides")
public class DriverRideController {

    private final RideService service;

    public DriverRideController(RideService service) {
        this.service = service;
    }

    // Driver: get active rides assigned to them
    @GetMapping("/assigned")
    public List<RideResp> assigned(Authentication auth) {
        return service.getAssignedRidesForDriver(auth);
    }

    // Driver: update status of assigned ride
    @PostMapping("/{rideId}/status")
    public RideResp updateStatus(@PathVariable UUID rideId,
                                 @Valid @RequestBody UpdateRideStatusReq req,
                                 Authentication auth) {
        return service.updateRideStatusAsDriver(rideId, req, auth);
    }
}
