package com.ride.admin;

import com.ride.driver.DriverProfile;
import com.ride.driver.DriverProfileRepository;
import com.ride.driver.DriverStatus;
import com.ride.admin.AdminDtos.AdminRideView;
import com.ride.admin.AdminDtos.AdminDriverView;
import com.ride.ride.Ride;
import com.ride.ride.RideRepository;
import com.ride.ride.RideStatus;
import com.ride.auth.User;
import com.ride.auth.UserRepository;
import com.ride.common.exception.NotFoundException;

import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

	private final RideRepository rides;
	private final DriverProfileRepository driverProfiles;
	private final UserRepository users;

	public AdminService(RideRepository rides, DriverProfileRepository driverProfiles, UserRepository users) {
		this.rides = rides;
		this.driverProfiles = driverProfiles;
		this.users = users;
	}

	// All rides, optionally filtered by status
	public List<AdminRideView> listRides(RideStatus status) {
		List<Ride> list = (status == null) ? rides.findAll() : rides.findByStatus(status);

		return list.stream().map(this::toRideView).toList();
	}

	// Active rides only: not completed or cancelled
	public List<AdminRideView> listActiveRides() {
		var activeStatuses = EnumSet.of(RideStatus.REQUESTED, RideStatus.DRIVER_ASSIGNED, RideStatus.DRIVER_ACCEPTED,
				RideStatus.DRIVER_ARRIVING, RideStatus.IN_PROGRESS);
		return rides.findByStatusIn(activeStatuses.stream().toList()).stream().map(this::toRideView).toList();
	}

	// All online drivers
	public List<AdminDriverView> listOnlineDrivers() {
		return driverProfiles.findByStatus(DriverStatus.ONLINE).stream().map(this::toDriverView).toList();
	}

	// Single ride by id
	public AdminRideView getRide(UUID rideId) {
		Ride r = rides.findById(rideId).orElseThrow(() -> new NotFoundException("Ride not found"));
		return toRideView(r);
	}

	private AdminRideView toRideView(Ride r) {
		return new AdminRideView(r.getId(), r.getPassengerId(), r.getDriverId(), r.getStatus(), r.getDistanceMiles(),
				r.getEstimatedFare(), r.getFinalFare(), r.getCreatedAt());
	}

	private AdminDriverView toDriverView(DriverProfile p) {
		User u = p.getUser(); // no extra query needed

		return new AdminDriverView(p.getUserId(), u != null ? u.getName() : null, u != null ? u.getEmail() : null,
				p.getStatus(), p.getMake(), p.getModel(), p.getPlate(), p.getCategory(), p.getRating());
	}

}
