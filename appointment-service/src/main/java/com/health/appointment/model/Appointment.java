package com.health.appointment.model;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="appointments")
public class Appointment {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  private Long patientId; private Long doctorId;
  private Instant scheduledAt; private Integer durationMinutes = 30;
  private String status = "BOOKED"; private String reason;
  private String symptomCheckId;
  private String aiTriageSummary;
  private String createdByEmail; private Instant createdAt = Instant.now(); private Instant updatedAt = Instant.now();
  @PreUpdate public void onUpdate(){ this.updatedAt = Instant.now(); }
  public Long getId(){return id;} public Long getPatientId(){return patientId;} public void setPatientId(Long x){this.patientId=x;}
  public Long getDoctorId(){return doctorId;} public void setDoctorId(Long x){this.doctorId=x;}
  public Instant getScheduledAt(){return scheduledAt;} public void setScheduledAt(Instant t){this.scheduledAt=t;}
  public Integer getDurationMinutes(){return durationMinutes;} public void setDurationMinutes(Integer d){this.durationMinutes=d;}
  public String getStatus(){return status;} public void setStatus(String s){this.status=s;}
  public String getReason(){return reason;} public void setReason(String r){this.reason=r;}
  public String getSymptomCheckId(){return symptomCheckId;} public void setSymptomCheckId(String s){this.symptomCheckId=s;}
  public String getAiTriageSummary(){return aiTriageSummary;} public void setAiTriageSummary(String s){this.aiTriageSummary=s;}
  public String getCreatedByEmail(){return createdByEmail;} public void setCreatedByEmail(String e){this.createdByEmail=e;}
  public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
}
