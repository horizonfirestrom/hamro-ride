package com.ride.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Hamro Ride API",
                version = "v1",
                description = "Backend for ride hailing (Passenger + Driver + Rides)",
                contact = @Contact(name = "Hamro Ride Backend")
        ),
        servers = @Server(url = "http://localhost:8080", description = "Local Dev"),
        security = {
                @SecurityRequirement(name = "bearer-jwt")
        }
)
@SecurityScheme(
        name = "bearer-jwt",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class OpenApiConfig {
}
