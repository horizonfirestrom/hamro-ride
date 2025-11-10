package com.ride.realtime;

import com.ride.auth.JwtService;
import com.ride.common.exception.ForbiddenException;
import com.ride.ride.Ride;
import com.ride.ride.RideRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final RideRepository rideRepository;

    public WebSocketConfig(JwtService jwtService, RideRepository rideRepository) {
        this.jwtService = jwtService;
        this.rideRepository = rideRepository;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
                // .withSockJS(); // optional
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) return message;

                StompCommand command = accessor.getCommand();
                if (command == null) return message;

                // 1) Authenticate on CONNECT using JWT
                if (StompCommand.CONNECT.equals(command)) {
                    String token = resolveToken(accessor);
                    if (token != null) {
                        var claimsJws = jwtService.parse(token);
                        String userId = claimsJws.getBody().getSubject();

                        var auth = new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of() // we don't need roles for topic check here
                        );
                        accessor.setUser(auth);
                    }
                }

                // 2) Authorize SUBSCRIBE to ride topics
                if (StompCommand.SUBSCRIBE.equals(command)) {
                    Principal user = accessor.getUser();
                    String destination = accessor.getDestination();

                    if (destination != null && destination.startsWith("/topic/rides/")) {
                        if (user == null || user.getName() == null) {
                            throw new ForbiddenException("Unauthenticated WebSocket subscription");
                        }

                        UUID userId = UUID.fromString(user.getName());
                        UUID rideId = extractRideId(destination);

                        Ride ride = rideRepository.findById(rideId)
                                .orElseThrow(() -> new ForbiddenException("Ride not found"));

                        boolean isPassenger = ride.getPassengerId().equals(userId);
                        boolean isDriver = ride.getDriverId() != null && ride.getDriverId().equals(userId);

                        if (!isPassenger && !isDriver) {
                            throw new ForbiddenException("Not allowed to subscribe to this ride");
                        }
                    }
                }

                return message;
            }

            private String resolveToken(StompHeaderAccessor accessor) {
                // Prefer standard Authorization header
                List<String> authHeaders = accessor.getNativeHeader("Authorization");
                if (authHeaders != null && !authHeaders.isEmpty()) {
                    String v = authHeaders.get(0);
                    if (v.startsWith("Bearer ")) {
                        return v.substring(7);
                    }
                    return v;
                }

                // Optional: support ?token=... style if you want
                List<String> tokenHeader = accessor.getNativeHeader("token");
                if (tokenHeader != null && !tokenHeader.isEmpty()) {
                    return tokenHeader.get(0);
                }

                return null;
            }

            private UUID extractRideId(String destination) {
                // /topic/rides/{rideId}
                String[] parts = destination.split("/");
                String last = parts[parts.length - 1];
                return UUID.fromString(last);
            }
        });
    }
}
