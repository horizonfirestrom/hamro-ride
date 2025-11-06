package com.ride.auth;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	
	 @Column(nullable = false, unique = true, length = 320)
	  private String email;

	  @Column(nullable = false)
	  private String passwordHash;

	  @Enumerated(EnumType.STRING)
	  @Column(nullable = false, length = 16)
	  private Role role = Role.PASSENGER;

	  @Column(length = 120) private String name;
	  @Column(length = 40)  private String phone;
	  private boolean enabled = true;

	  public UUID getId() { return id; }
	  public String getEmail() { return email; }
	  public void setEmail(String email) { this.email = email == null ? null : email.toLowerCase().trim(); }
	  public String getPasswordHash() { return passwordHash; }
	  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
	  public Role getRole() { return role; }
	  public void setRole(Role role) { this.role = role; }
	  public String getName() { return name; }
	  public void setName(String name) { this.name = name; }
	  public String getPhone() { return phone; }
	  public void setPhone(String phone) { this.phone = phone; }
	  public boolean isEnabled() { return enabled; }
	  public void setEnabled(boolean enabled) { this.enabled = enabled; }

}
