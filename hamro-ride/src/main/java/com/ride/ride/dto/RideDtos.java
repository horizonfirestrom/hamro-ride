package com.ride.ride.dto;

import com.ride.ride.RideStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Instant;
import java.util.UUID;

public class RideDtos {

    public record CreateRideReq(
            @NotNull Double pickupLat,
            @NotNull Double pickupLng,
            String pickupAddress,
            @NotNull Double dropoffLat,
            @NotNull Double dropoffLng,
            String dropoffAddress
    ) {}

    public record RideResp(
            UUID id,
            UUID passengerId,
            UUID driverId,
            double pickupLat,
            double pickupLng,
            String pickupAddress,
            double dropoffLat,
            double dropoffLng,
            String dropoffAddress,
            RideStatus status,
            Instant createdAt,
            Double distanceMiles,
            Double estimatedFare,
            Double finalFare,
            Integer driverRating,
            Integer passengerRating
    ) {}


    public record NearbyDriverResp(
            UUID driverId,
            double distanceMeters
    ) {}

    public record EstimateReq(
            @NotNull Double pickupLat,
            @NotNull Double pickupLng,
            @NotNull Double dropoffLat,
            @NotNull Double dropoffLng
    ) {}

    public record EstimateResp(
            @Positive double distanceKm,
            @Positive double estimatedFare
    ) {}
    
 // NEW: for driver to update ride status
    public record UpdateRideStatusReq(
            @NotNull RideStatus status
    ) {}
    
    public record RatePassengerReq(int rating) {}

}
