package com.ride.ride;

public enum RideStatus {
	REQUESTED,      // passenger created request, not yet assigned
    DRIVER_ASSIGNED,
    DRIVER_ARRIVING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED_BY_PASSENGER,
    CANCELLED_BY_DRIVER,
    CANCELLED_SYSTEM
}
