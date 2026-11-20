package com.health.auth.security;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
@Service
public class JwtService {
  private final SecretKey key;
  private final long expirationMs;
  public JwtService(@Value("${app.jwt.secret}") String secret,
                    @Value("${app.jwt.expirationMinutes}") long expirationMinutes){
    this.key = Keys.hmacShaKeyFor(secret.getBytes());
    this.expirationMs = expirationMinutes * 60 * 1000;
  }
  public String generate(String subject, String role){
    Map<String,Object> claims=new HashMap<>(); claims.put("role", role);
    Instant now=Instant.now();
    return Jwts.builder().setClaims(claims).setSubject(subject)
      .setIssuedAt(Date.from(now)).setExpiration(new Date(now.toEpochMilli()+expirationMs))
      .signWith(key).compact();
  }
}
