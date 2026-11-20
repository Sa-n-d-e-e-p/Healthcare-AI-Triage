package com.health.notify.model;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="notifications")
public class Notification {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  private String type; @Column(length=2048) private String payloadJson; private Instant createdAt = Instant.now();
  public Long getId(){return id;} public String getType(){return type;} public void setType(String t){this.type=t;}
  public String getPayloadJson(){return payloadJson;} public void setPayloadJson(String s){this.payloadJson=s;}
  public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant t){this.createdAt=t;}
}
