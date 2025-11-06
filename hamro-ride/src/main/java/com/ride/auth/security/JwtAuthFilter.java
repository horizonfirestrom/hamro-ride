package com.ride.auth.security;

import com.ride.auth.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

public class JwtAuthFilter extends OncePerRequestFilter {
	  private final JwtService jwt;
	  public JwtAuthFilter(JwtService jwt) { this.jwt = jwt; }

	  @Override
	  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
	      throws ServletException, IOException {
	    String header = req.getHeader(HttpHeaders.AUTHORIZATION);
	    if (header != null && header.startsWith("Bearer ")) {
	      try {
	        var jws = jwt.parse(header.substring(7));
	        Claims c = jws.getBody();
	        var auth = new UsernamePasswordAuthenticationToken(
	            c.getSubject(), null,
	            List.of(new SimpleGrantedAuthority("ROLE_" + (String)c.get("role"))));
	        SecurityContextHolder.getContext().setAuthentication(auth);
	      } catch (Exception ignored) {}
	    }
	    chain.doFilter(req, res);
	  }
	}