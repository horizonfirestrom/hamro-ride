package com.ride.ride;

import com.ride.ride.dto.RideDtos.RideResp;
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

    @GetMapping("/assigned")
    public List<RideResp> assigned(Authentication auth) {
        return service.getAssignedRidesForDriver(auth);
    }

    @PostMapping("/{rideId}/accept")
    public RideResp accept(@PathVariable UUID rideId, Authentication auth) {
        return service.acceptAsDriver(rideId, auth);
    }

    @PostMapping("/{rideId}/arriving")
    public RideResp arriving(@PathVariable UUID rideId, Authentication auth) {
        return service.markArriving(rideId, auth);
    }

    @PostMapping("/{rideId}/start")
    public RideResp start(@PathVariable UUID rideId, Authentication auth) {
        return service.startRide(rideId, auth);
    }

    @PostMapping("/{rideId}/complete")
    public RideResp complete(@PathVariable UUID rideId, Authentication auth) {
        return service.completeRide(rideId, auth);
    }

    @PostMapping("/{rideId}/cancel")
    public RideResp cancel(@PathVariable UUID rideId, Authentication auth) {
        return service.cancelAsDriver(rideId, auth);
    }
}
