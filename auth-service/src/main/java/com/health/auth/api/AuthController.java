package com.health.auth.api;
import com.health.auth.security.JwtService;
import com.health.auth.user.User;
import com.health.auth.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;
@RestController @RequestMapping("/api")
public class AuthController {
  private final UserRepository users; private final PasswordEncoder enc; private final JwtService jwt;
  public AuthController(UserRepository u, PasswordEncoder e, JwtService j){ this.users=u; this.enc=e; this.jwt=j; }
  @PostMapping("/auth/register") @ResponseStatus(HttpStatus.CREATED)
  public Map<String,Object> register(@Valid @RequestBody RegisterRequest req){
    if (!"PATIENT".equals(req.role)) {
      throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Self-register allowed only for PATIENT");
    }
    if (users.existsByEmail(req.email))
      throw new org.springframework.web.server.ResponseStatusException(HttpStatus.CONFLICT,"Email exists");
    User u=new User(); u.setEmail(req.email); u.setPasswordHash(enc.encode(req.password)); u.setRole("PATIENT"); users.save(u);
    return Map.of("id",u.getId(),"email",u.getEmail(),"role",u.getRole());
  }
  @PostMapping("/auth/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest req){
    User u=users.findByEmail(req.email).orElseThrow(()-> new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid"));
    if(!enc.matches(req.password,u.getPasswordHash())) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid");
    return new AuthResponse(jwt.generate(u.getEmail(), u.getRole()));
  }
  @PostMapping("/admin/users/doctors") @ResponseStatus(HttpStatus.CREATED)
  public Map<String,Object> adminCreateDoctor(@Valid @RequestBody AdminCreateDoctorRequest req){
    if (users.existsByEmail(req.email))
      throw new org.springframework.web.server.ResponseStatusException(HttpStatus.CONFLICT,"Email exists");
    User u = new User(); u.setEmail(req.email); u.setPasswordHash(enc.encode(req.password)); u.setRole("DOCTOR"); users.save(u);
    return Map.of("id",u.getId(),"email",u.getEmail(),"role",u.getRole());
  }
  public record RegisterRequest(@Email @NotBlank String email, @NotBlank String password, @NotBlank String role){}
  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password){}
  public record AdminCreateDoctorRequest(@Email @NotBlank String email, @NotBlank String password){}
  public record AuthResponse(String token){}
}
