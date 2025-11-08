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

    @Transactional
    public ProfileResp upsertProfile(Authentication auth, ProfileUpsertReq req) {
        UUID id = currentUserId(auth);
        User user = users.findById(id).orElseThrow();

        DriverProfile profile = profiles.findById(id)
                .orElseGet(() -> {
                    DriverProfile p = new DriverProfile();
                    p.setUserId(id);
                    p.setUser(user);
                    return p;
                });

        profile.setMake(req.make());
        profile.setModel(req.model());
        profile.setPlate(req.plate());
        profile.setCategory(req.category());
        profiles.save(profile);
        return toResp(profile);
    }

    @Transactional
    public ProfileResp setStatus(Authentication auth, StatusReq req) {
        UUID id = currentUserId(auth);
        DriverProfile profile = profiles.findById(id).orElseThrow();
        profile.setStatus(req.status());
        profiles.save(profile);

        if (req.status() != DriverStatus.ONLINE) {
            redis.opsForGeo().remove(GEO_KEY, id.toString());
        }
        return toResp(profile);
    }

    public void updateLocation(Authentication auth, LocationReq req) {
        UUID id = currentUserId(auth);
        DriverProfile profile = profiles.findById(id).orElseThrow();
        if (profile.getStatus() != DriverStatus.ONLINE) return;

        Point point = new Point(req.lng(), req.lat());
        redis.opsForGeo().add(GEO_KEY, point, id.toString());
    }

    public List<NearbyDriver> nearby(double lat, double lng, int limit, double radiusMeters) {
        var geo = redis.opsForGeo();
        Circle circle = new Circle(new Point(lng, lat), new Distance(radiusMeters));
        var args = RedisGeoCommands.GeoRadiusCommandArgs.newGeoRadiusArgs()
                .includeDistance().sortAscending().limit(limit);

        GeoResults<RedisGeoCommands.GeoLocation<String>> results =
                geo.radius(GEO_KEY, circle, args);

        if (results == null) return List.of();
        return results.getContent().stream()
                .map(r -> new NearbyDriver(
                        UUID.fromString(r.getContent().getName()),
                        r.getDistance().getValue()
                ))
                .toList();
    }

    private ProfileResp toResp(DriverProfile p) {
        return new ProfileResp(
                p.getUserId(),
                p.getStatus(),
                p.getMake(),
                p.getModel(),
                p.getPlate(),
                p.getCategory(),
                p.getRating()
        );
    }
}
