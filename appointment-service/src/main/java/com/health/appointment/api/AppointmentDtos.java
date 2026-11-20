package com.health.appointment.api;
import jakarta.validation.constraints.Min; import jakarta.validation.constraints.NotNull; import java.time.Instant;
public class AppointmentDtos {
  public static class CreateRequest {
    @NotNull public Long patientId;
    @NotNull public Long doctorId;
    @NotNull public Instant scheduledAt;
    @Min(5) public Integer durationMinutes = 30;
    public String reason;
    public String symptomCheckId;
    public String aiTriageSummary;
  }
}
