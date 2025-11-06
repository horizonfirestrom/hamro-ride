package com.ride.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {
  private final String issuer;
  private final Key key;
  private final long accessTtlMinutes;

  public JwtService(@Value("${jwt.issuer}") String issuer,
                    @Value("${jwt.secret}") String secret,
                    @Value("${jwt.accessTokenMinutes}") long accessTtlMinutes) {
    this.issuer = issuer;
    // If secret looks Base64 (often ending with '=' padding), decode; else use raw bytes.
    byte[] keyBytes = looksBase64(secret) ? Decoders.BASE64.decode(secret)
                                          : secret.getBytes(StandardCharsets.UTF_8);
    if (keyBytes.length < 32) {
      throw new IllegalArgumentException("jwt.secret must be at least 32 bytes (256 bits) after decoding");
    }
    this.key = Keys.hmacShaKeyFor(keyBytes);
    this.accessTtlMinutes = accessTtlMinutes;
  }

  private boolean looksBase64(String s) {
    // simple heuristic; feel free to always use Base64 if you prefer
    return s != null && (s.endsWith("=") || s.matches("^[A-Za-z0-9+/=]+$"));
  }

  public String generate(UUID userId, String email, String role) {
    Instant now = Instant.now();
    return Jwts.builder()
        .setIssuer(issuer)
        .setSubject(userId.toString())
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(now.plusSeconds(accessTtlMinutes * 60)))
        .addClaims(Map.of("email", email, "role", role))
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }

  public Jws<Claims> parse(String jwt) {
    return Jwts.parserBuilder()
        .requireIssuer(issuer)
        .setSigningKey(key)
        .build()
        .parseClaimsJws(jwt);
  }
}
