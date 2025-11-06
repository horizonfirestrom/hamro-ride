package com.ride.auth;

import com.ride.auth.dto.AuthDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final AuthService auth;

  public AuthController(AuthService auth) { this.auth = auth; }

  @PostMapping("/register")
  public ResponseEntity<AuthResp> register(@Valid @RequestBody RegisterReq req) {
    String token = auth.register(req);
    return ResponseEntity.ok(new AuthResp(token));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResp> login(@Valid @RequestBody LoginReq req) {
    String token = auth.login(req);
    return ResponseEntity.ok(new AuthResp(token));
  }
}
