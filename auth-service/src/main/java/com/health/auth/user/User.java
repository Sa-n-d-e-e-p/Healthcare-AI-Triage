package com.health.auth.user;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="users")
public class User {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false, unique=true) private String email;
  @Column(nullable=false) private String passwordHash;
  @Column(nullable=false) private String role;
  @Column(nullable=false) private Instant createdAt = Instant.now();
  public Long getId(){return id;}
  public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
  public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String s){this.passwordHash=s;}
  public String getRole(){return role;} public void setRole(String r){this.role=r;}
  public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant t){this.createdAt=t;}
}
