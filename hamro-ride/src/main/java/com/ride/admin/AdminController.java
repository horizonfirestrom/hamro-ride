package com.ride.admin;

import com.ride.admin.AdminDtos.AdminRideView;
import com.ride.admin.AdminDtos.AdminDriverView;
import com.ride.ride.RideStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    // GET /api/v1/admin/rides?status=IN_PROGRESS
    @GetMapping("/rides")
    public List<AdminRideView> listRides(@RequestParam(required = false) RideStatus status) {
        return service.listRides(status);
    }

    // GET /api/v1/admin/rides/active
    @GetMapping("/rides/active")
    public List<AdminRideView> activeRides() {
        return service.listActiveRides();
    }

    // GET /api/v1/admin/rides/{rideId}
    @GetMapping("/rides/{rideId}")
    public AdminRideView getRide(@PathVariable UUID rideId) {
        return service.getRide(rideId);
    }

    // GET /api/v1/admin/drivers/online
    @GetMapping("/drivers/online")
    public List<AdminDriverView> onlineDrivers() {
        return service.listOnlineDrivers();
    }
}
