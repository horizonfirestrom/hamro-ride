package com.ride.ride;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID passengerId;

    @Column
    private UUID driverId; // null until assigned

    @Column(nullable = false)
    private double pickupLat;

    @Column(nullable = false)
    private double pickupLng;

    @Column(length = 255)
    private String pickupAddress;

    @Column(nullable = false)
    private double dropoffLat;

    @Column(nullable = false)
    private double dropoffLng;

    @Column(length = 255)
    private String dropoffAddress;
    
    
 // distance in miles between pickup & drop
    @Column(name = "distance_miles")
    private Double distanceMiles;

    // estimated fare at booking time
    @Column(name = "estimated_fare")
    private Double estimatedFare;

    // final fare (optional override/confirmation)
    @Column(name = "final_fare")
    private Double finalFare;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private RideStatus status = RideStatus.REQUESTED;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt;
    
 // Rating given by passenger to driver (1–5)
    @Column(name = "driver_rating")
    private Integer driverRating;

    // Rating given by driver to passenger (1–5)
    @Column(name = "passenger_rating")
    private Integer passengerRating;
    

    // getters & setters

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPassengerId() { return passengerId; }
    public void setPassengerId(UUID passengerId) { this.passengerId = passengerId; }
    public UUID getDriverId() { return driverId; }
    public void setDriverId(UUID driverId) { this.driverId = driverId; }
    public double getPickupLat() { return pickupLat; }
    public void setPickupLat(double pickupLat) { this.pickupLat = pickupLat; }
    public double getPickupLng() { return pickupLng; }
    public void setPickupLng(double pickupLng) { this.pickupLng = pickupLng; }
    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
    public double getDropoffLat() { return dropoffLat; }
    public void setDropoffLat(double dropoffLat) { this.dropoffLat = dropoffLat; }
    public double getDropoffLng() { return dropoffLng; }
    public void setDropoffLng(double dropoffLng) { this.dropoffLng = dropoffLng; }
    public String getDropoffAddress() { return dropoffAddress; }
    public void setDropoffAddress(String dropoffAddress) { this.dropoffAddress = dropoffAddress; }
    public RideStatus getStatus() { return status; }
    public void setStatus(RideStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    
    public Double getDistanceMiles() { return distanceMiles; }
    public void setDistanceMiles(Double distanceMiles) { this.distanceMiles = distanceMiles; }

    public Double getEstimatedFare() { return estimatedFare; }
    public void setEstimatedFare(Double estimatedFare) { this.estimatedFare = estimatedFare; }

    public Double getFinalFare() { return finalFare; }
    public void setFinalFare(Double finalFare) { this.finalFare = finalFare; }
    
    public Integer getDriverRating() {
        return driverRating;
    }

    public void setDriverRating(Integer driverRating) {
        this.driverRating = driverRating;
    }

    public Integer getPassengerRating() {
        return passengerRating;
    }

    public void setPassengerRating(Integer passengerRating) {
        this.passengerRating = passengerRating;
    }


}
