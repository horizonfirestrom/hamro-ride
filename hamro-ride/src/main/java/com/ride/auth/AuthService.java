package com.ride.auth;

import com.ride.auth.dto.AuthDtos.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtService jwt;

  public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
    this.users = users; this.encoder = encoder; this.jwt = jwt;
  }

  @Transactional
  public String register(RegisterReq r) {
    String email = r.email().toLowerCase();
    if (users.existsByEmail(email)) throw new IllegalArgumentException("email_already_used");
    User u = new User();
    u.setEmail(email);
    u.setPasswordHash(encoder.encode(r.password()));
    u.setName(r.name());
    u.setPhone(r.phone());
    if (r.role() != null) u.setRole(r.role());
    users.save(u);
    return jwt.generate(u.getId(), u.getEmail(), u.getRole().name());
  }

  public String login(LoginReq r) {
    var u = users.findByEmail(r.email().toLowerCase())
        .orElseThrow(() -> new IllegalArgumentException("invalid_credentials"));
    if (!u.isEnabled() || !encoder.matches(r.password(), u.getPasswordHash()))
      throw new IllegalArgumentException("invalid_credentials");
    return jwt.generate(u.getId(), u.getEmail(), u.getRole().name());
  }
}
