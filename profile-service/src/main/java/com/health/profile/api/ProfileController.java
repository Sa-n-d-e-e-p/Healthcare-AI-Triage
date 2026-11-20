package com.health.profile.api;
import com.health.profile.model.Patient; import com.health.profile.model.Doctor;
import com.health.profile.repo.PatientRepository; import com.health.profile.repo.DoctorRepository;
import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import java.util.List; import java.util.Map;
@RestController @RequestMapping("/api/profiles")
public class ProfileController {
  private final PatientRepository patients; private final DoctorRepository doctors;
  public ProfileController(PatientRepository p, DoctorRepository d){ this.patients=p; this.doctors=d; }
  @GetMapping("/patients") public List<Patient> allPatients(){ return patients.findAll(); }
  @PostMapping("/patients") @ResponseStatus(HttpStatus.CREATED) public Patient createPatient(@RequestBody Patient p){ return patients.save(p); }
  @GetMapping("/doctors") public List<Doctor> allDoctors(){ return doctors.findAll(); }
  @PostMapping("/doctors") @ResponseStatus(HttpStatus.CREATED) public Doctor createDoctor(@RequestBody Doctor d){ return doctors.save(d); }
  @GetMapping("/doctors/by-email/{email}")
  public Doctor doctorByEmail(@PathVariable String email){
    return doctors.findByEmail(email).orElseThrow(()-> new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND));
  }
  @PutMapping("/doctors/{id}")
  public Doctor updateDoctor(@PathVariable Long id, @RequestBody Doctor update){
    Doctor d = doctors.findById(id).orElseThrow(()-> new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND));
    if (update.getFirstName() != null) d.setFirstName(update.getFirstName());
    if (update.getLastName() != null) d.setLastName(update.getLastName());
    if (update.getSpecialization() != null) d.setSpecialization(update.getSpecialization());
    if (update.getPhone() != null) d.setPhone(update.getPhone());
    return doctors.save(d);
  }
}
