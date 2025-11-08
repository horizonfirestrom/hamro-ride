package com.ride.driver;

import com.ride.driver.dto.DriverDtos.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/driver")
public class DriverController {

    private final DriverService service;

    public DriverController(DriverService service) { this.service = service; }

    @PostMapping("/profile")
    public ProfileResp upsertProfile(@Valid @RequestBody ProfileUpsertReq req, Authentication auth) {
        return service.upsertProfile(auth, req);
    }

    @PatchMapping("/status")
    public ProfileResp setStatus(@Valid @RequestBody StatusReq req, Authentication auth) {
        return service.setStatus(auth, req);
    }

    @PatchMapping("/location")
    public void updateLocation(@Valid @RequestBody LocationReq req, Authentication auth) {
        service.updateLocation(auth, req);
    }

    @GetMapping("/nearby")
    public List<NearbyDriver> nearby(@RequestParam double lat,
                                     @RequestParam double lng,
                                     @RequestParam(defaultValue = "5") int limit,
                                     @RequestParam(defaultValue = "3000") double radiusMeters) {
        return service.nearby(lat, lng, limit, radiusMeters);
    }
}
