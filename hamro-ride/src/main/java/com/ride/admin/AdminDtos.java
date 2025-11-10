package com.ride.admin;

import com.ride.driver.DriverStatus;
import com.ride.ride.RideStatus;

import java.time.Instant;
import java.util.UUID;

public class AdminDtos {

    public record AdminRideView(
            UUID id,
            UUID passengerId,
            UUID driverId,
            RideStatus status,
            Double distanceMiles,
            Double estimatedFare,
            Double finalFare,
            Instant createdAt
    ) {}

    public record AdminDriverView(
            UUID userId,
            String name,
            String email,
            DriverStatus status,
            String make,
            String model,
            String plate,
            String category,
            Double rating
    ) {}
}
