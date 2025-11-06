package com.ride.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.ride.auth.JwtService;
import com.ride.auth.security.JwtAuthFilter;

@Configuration
public class SecurityConfig {
	@Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
	@Bean
	  SecurityFilterChain filterChain(HttpSecurity http, JwtService jwt) throws Exception {
	    http.csrf(csrf -> csrf.disable());
	    http.cors(Customizer.withDefaults());

	    http.authorizeHttpRequests(auth -> auth
	        .requestMatchers("/api/v1/health", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
	        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login").permitAll()
	        .anyRequest().authenticated()
	    );
	    
	 http.addFilterBefore(new JwtAuthFilter(jwt), org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
	 return http.build();
	}
}
