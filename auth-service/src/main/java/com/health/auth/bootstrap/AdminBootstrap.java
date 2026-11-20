package com.health.auth.bootstrap;
import com.health.auth.user.User;
import com.health.auth.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {
  private final UserRepository users;
  private final PasswordEncoder enc;
  @Value("${app.admin.email}") String adminEmail;
  @Value("${app.admin.password}") String adminPassword;

  public AdminBootstrap(UserRepository u, PasswordEncoder e){
    this.users = u;
    this.enc = e;
  }

  @Override
  public void run(String... args){
    // Seed Admin
    seedUserIfMissing(adminEmail, adminPassword, "ADMIN");

    // Seed Demo Doctors
    seedUserIfMissing("doc1@clinic.org", "DocPass@123", "DOCTOR");
    seedUserIfMissing("doc2@clinic.org", "DocPass@123", "DOCTOR");
    seedUserIfMissing("doc3@clinic.org", "DocPass@123", "DOCTOR");
    seedUserIfMissing("doc4@clinic.org", "DocPass@123", "DOCTOR");

    // Seed Demo Patient
    seedUserIfMissing("patient@example.com", "Patient@123", "PATIENT");
  }

  private void seedUserIfMissing(String email, String password, String role) {
    if (!users.existsByEmail(email)) {
      User u = new User();
      u.setEmail(email);
      u.setPasswordHash(enc.encode(password));
      u.setRole(role);
      users.save(u);
    }
  }
}
