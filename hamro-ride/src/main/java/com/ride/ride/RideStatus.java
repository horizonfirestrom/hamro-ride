package com.ride.ride;

public enum RideStatus {
    REQUESTED,              // passenger created, no driver yet
    DRIVER_ASSIGNED,        // system picked a driver
    DRIVER_ACCEPTED,        // driver explicitly accepted
    DRIVER_ARRIVING,        // driver en route to pickup
    IN_PROGRESS,            // passenger on board
    COMPLETED,              // finished normally

    CANCELLED_BY_PASSENGER,
    CANCELLED_BY_DRIVER,
    CANCELLED_SYSTEM
}
