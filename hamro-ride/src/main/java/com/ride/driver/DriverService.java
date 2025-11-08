package com.ride.driver;

import com.ride.auth.User;
import com.ride.auth.UserRepository;
import com.ride.driver.dto.DriverDtos.*;
import org.springframework.data.geo.Circle;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DriverService {

    private final DriverProfileRepository profiles;
    private final UserRepository users;
    private final StringRedisTemplate redis;

    private static final String GEO_KEY = "drivers:online";

    public DriverService(DriverProfileRepository profiles,
                         UserRepository users,
                         StringRedisTemplate redis) {
        this.profiles = profiles;
        this.users = users;
        this.redis = redis;
    }

    private UUID currentUserId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    /**
     * Create or update the current driver's profile.
     */
    @Transactional
    public ProfileResp upsertProfile(Authentication auth, ProfileUpsertReq req) {
        UUID userId = currentUserId(auth);
        User user = users.findById(userId).orElseThrow();

        // Either load existing profile for this user or create a new one
        DriverProfile profile = profiles.findByUserId(userId)
                .orElseGet(() -> {
                    DriverProfile p = new DriverProfile();
                    p.setUser(user);               // link to owning user
                    return p;
                });

        profile.setMake(req.make());
        profile.setModel(req.model());
        profile.setPlate(req.plate());
        profile.setCategory(req.category());

        profiles.save(profile);
        return toResp(profile);
    }

    /**
     * Update driver's availability status.
     */
    @Transactional
    public ProfileResp setStatus(Authentication auth, StatusReq req) {
        UUID userId = currentUserId(auth);
        DriverProfile profile = profiles.findByUserId(userId).orElseThrow();

        profile.setStatus(req.status());
        profiles.save(profile);

        // If not ONLINE, remove from GEO index
        if (req.status() != DriverStatus.ONLINE) {
            redis.opsForGeo().remove(GEO_KEY, userId.toString());
        }

        return toResp(profile);
    }

    /**
     * Update driver location in Redis GEO if driver is ONLINE.
     */
    @Transactional
    public void updateLocation(Authentication auth, LocationReq req) {
        UUID userId = currentUserId(auth);
        DriverProfile profile = profiles.findByUserId(userId).orElseThrow();

        if (profile.getStatus() != DriverStatus.ONLINE) {
            return; // ignore location updates when offline
        }

        Point point = new Point(req.lng(), req.lat());
        redis.opsForGeo().add(GEO_KEY, point, userId.toString());
    }

    /**
     * Find nearby online drivers around given coordinate.
     */
    public List<NearbyDriver> nearby(double lat, double lng, int limit, double radiusMeters) {
        var geo = redis.opsForGeo();

        Circle circle = new Circle(new Point(lng, lat), new Distance(radiusMeters));
        var args = RedisGeoCommands.GeoRadiusCommandArgs.newGeoRadiusArgs()
                .includeDistance()
                .sortAscending()
                .limit(limit);

        GeoResults<RedisGeoCommands.GeoLocation<String>> results =
                geo.radius(GEO_KEY, circle, args);

        if (results == null) {
            return List.of();
        }

        return results.getContent().stream()
                .map(r -> new NearbyDriver(
                        UUID.fromString(r.getContent().getName()),
                        r.getDistance() != null ? r.getDistance().getValue() : null
                ))
                .toList();
    }

    private ProfileResp toResp(DriverProfile p) {
        // Expose the driver's userId externally
        UUID driverId = p.getUser() != null ? p.getUser().getId() : null;

        return new ProfileResp(
                driverId,
                p.getStatus(),
                p.getMake(),
                p.getModel(),
                p.getPlate(),
                p.getCategory(),
                p.getRating()
        );
    }
}
