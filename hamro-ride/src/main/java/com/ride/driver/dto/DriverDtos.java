package com.ride.driver.dto;

import java.util.UUID;

import com.ride.driver.DriverStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DriverDtos {
	
	 public record ProfileUpsertReq(
	            @NotBlank String make,
	            @NotBlank String model,
	            @NotBlank String plate,
	            @NotBlank String category
	    ) {}
	 
	 public record ProfileResp(
	            UUID driverId,
	            DriverStatus status,
	            String make,
	            String model,
	            String plate,
	            String category,
	            Double rating
	    ) {}
	 
	 public record StatusReq(@NotNull DriverStatus status) {}

	    public record LocationReq(@NotNull Double lat, @NotNull Double lng) {}

	    public record NearbyDriver(UUID driverId, double distanceMeters) {}

}
