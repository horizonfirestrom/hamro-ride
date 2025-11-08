package com.ride.driver;

import com.ride.auth.User;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "driver_profiles")
public class DriverProfile {

    @Id
    @GeneratedValue
    private UUID id;  // independent primary key

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DriverStatus status = DriverStatus.OFFLINE;

    private String make;
    private String model;
    private String plate;
    private String category;
    private Double rating = 5.0;

    // getters/setters

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public DriverStatus getStatus() { return status; }
    public void setStatus(DriverStatus status) { this.status = status; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getPlate() { return plate; }
    public void setPlate(String plate) { this.plate = plate; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
}
