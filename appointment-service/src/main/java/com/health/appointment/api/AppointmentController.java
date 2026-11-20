package com.health.appointment.api;
import com.health.appointment.model.Appointment;
import com.health.appointment.repo.AppointmentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@RestController @RequestMapping("/api/appointments")
public class AppointmentController {
  private final AppointmentRepository repo;
  private final RestTemplate http = new RestTemplate();
  private final String profileServiceUrl;
  private final String notifyServiceUrl;

  public AppointmentController(
      AppointmentRepository repo,
      @Value("${app.services.profile:http://localhost:8083}") String profileServiceUrl,
      @Value("${app.services.notify:http://localhost:8084}") String notifyServiceUrl) {
    this.repo = repo;
    this.profileServiceUrl = profileServiceUrl;
    this.notifyServiceUrl = notifyServiceUrl;
  }

  @GetMapping
  public List<Appointment> all(Authentication auth, @RequestParam(value="mine", defaultValue="false") boolean mine){
    if (!mine || auth == null) return repo.findAll();
    boolean isPatient = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(a->a.equals("ROLE_PATIENT"));
    boolean isDoctor  = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(a->a.equals("ROLE_DOCTOR"));
    if (isPatient) return repo.findByCreatedByEmail(auth.getName());
    if (isDoctor) {
      try {
        String url = profileServiceUrl + "/api/profiles/doctors/by-email/" + auth.getName();
        Map<?,?> doc = http.getForObject(url, Map.class);
        if (doc != null && doc.get("id") != null) {
          Long doctorId = Long.valueOf(String.valueOf(doc.get("id")));
          return repo.findByDoctorId(doctorId);
        }
      } catch (Exception ignored) {}
      return List.of();
    }
    return repo.findAll();
  }

  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  public Appointment create(@Valid @RequestBody AppointmentDtos.CreateRequest req, Authentication auth){
    System.out.println(">>> AppointmentController.create called! auth=" + auth);
    if (auth==null || auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).noneMatch(a->a.equals("ROLE_PATIENT"))) {
      System.err.println(">>> FAILED ROLE CHECK: auth=" + auth + ", authorities=" + (auth != null ? auth.getAuthorities() : "null"));
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only PATIENT can create");
    }
    Instant start = req.scheduledAt;
    Instant end = req.scheduledAt.plus(Duration.ofMinutes(req.durationMinutes!=null? req.durationMinutes:30));

    // 1. Conflict Check: Doctor cannot be double-booked by any patient
    for (Appointment a : repo.findByDoctorId(req.doctorId)) {
      if ("CANCELLED".equalsIgnoreCase(a.getStatus())) continue;
      Instant aStart = a.getScheduledAt();
      Instant aEnd = a.getScheduledAt().plus(Duration.ofMinutes(a.getDurationMinutes()!=null? a.getDurationMinutes():30));
      boolean overlap = start.isBefore(aEnd) && aStart.isBefore(end);
      if (overlap) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, 
          "This doctor is already booked for this time slot. Please select another time or doctor.");
      }
    }

    // 2. Conflict Check: Patient cannot book multiple doctors at the same time
    String patientEmail = auth.getName();
    for (Appointment a : repo.findByCreatedByEmail(patientEmail)) {
      if ("CANCELLED".equalsIgnoreCase(a.getStatus())) continue;
      Instant aStart = a.getScheduledAt();
      Instant aEnd = a.getScheduledAt().plus(Duration.ofMinutes(a.getDurationMinutes()!=null? a.getDurationMinutes():30));
      boolean overlap = start.isBefore(aEnd) && aStart.isBefore(end);
      if (overlap) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, 
          "You already have a consultation scheduled at this time. Please select a different time slot.");
      }
    }
    Appointment a=new Appointment();
    a.setPatientId(req.patientId);
    a.setDoctorId(req.doctorId);
    a.setScheduledAt(req.scheduledAt);
    a.setDurationMinutes(req.durationMinutes!=null? req.durationMinutes:30);
    a.setReason(req.reason);
    a.setSymptomCheckId(req.symptomCheckId);
    a.setAiTriageSummary(req.aiTriageSummary);
    a.setCreatedByEmail(auth.getName());
    Appointment saved = repo.save(a);
    try {
      Map<String,Object> payload=new HashMap<>();
      payload.put("type","APPOINTMENT_BOOKED");
      payload.put("appointmentId", saved.getId());
      payload.put("patientId", saved.getPatientId());
      payload.put("doctorId", saved.getDoctorId());
      payload.put("scheduledAt", saved.getScheduledAt().toString());
      payload.put("createdBy", saved.getCreatedByEmail());
      if (saved.getSymptomCheckId() != null) {
        payload.put("symptomCheckId", saved.getSymptomCheckId());
      }
      HttpHeaders h=new HttpHeaders();
      h.setContentType(MediaType.APPLICATION_JSON);
      http.postForEntity(notifyServiceUrl + "/api/notify", new HttpEntity<>(payload,h), Map.class);
    } catch(Exception ignore){}
    return saved;
  }

  @PatchMapping("/{id}/status")
  public Appointment updateStatus(@PathVariable Long id, @RequestBody Map<String,String> body){
    Appointment a = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    if (body.containsKey("status")) {
      a.setStatus(body.get("status"));
      return repo.save(a);
    }
    return a;
  }

  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void cancel(@PathVariable Long id){ repo.deleteById(id); }
}
