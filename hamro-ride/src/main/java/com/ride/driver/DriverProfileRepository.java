package com.ride.driver;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriverProfileRepository extends JpaRepository<DriverProfile, UUID> {

    Optional<DriverProfile> findByUserId(UUID userId);
    
 // Admin: all online drivers
    List<DriverProfile> findByStatus(DriverStatus status);
}
