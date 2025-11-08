package com.ride.ride;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RideRepository extends JpaRepository<Ride, UUID> {
    List<Ride> findByPassengerIdOrderByCreatedAtDesc(UUID passengerId);
}