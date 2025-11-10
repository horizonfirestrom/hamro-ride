package com.ride.realtime;

import com.ride.ride.RideStatus;

import java.time.Instant;
import java.util.UUID;

public class RideUpdateMessage {
    public UUID rideId;
    public UUID passengerId;
    public UUID driverId;
    public RideStatus status;
    public Double distanceMiles;
    public Double estimatedFare;
    public Double finalFare;
    public Instant updatedAt;

    public RideUpdateMessage(UUID rideId,
                             UUID passengerId,
                             UUID driverId,
                             RideStatus status,
                             Double distanceMiles,
                             Double estimatedFare,
                             Double finalFare,
                             Instant updatedAt) {
        this.rideId = rideId;
        this.passengerId = passengerId;
        this.driverId = driverId;
        this.status = status;
        this.distanceMiles = distanceMiles;
        this.estimatedFare = estimatedFare;
        this.finalFare = finalFare;
        this.updatedAt = updatedAt;
    }
}
