package com.ride.auth.dto;

import com.ride.auth.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {
  public record RegisterReq(
      @Email @NotBlank String email,
      @NotBlank String password,
      String name,
      String phone,
      Role role
  ) {}

  public record LoginReq(@Email @NotBlank String email, @NotBlank String password) {}

  public record AuthResp(String accessToken) {}
}
