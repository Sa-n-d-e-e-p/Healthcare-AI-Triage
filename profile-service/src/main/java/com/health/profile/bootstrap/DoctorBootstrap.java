package com.health.profile.bootstrap;

import com.health.profile.model.Doctor;
import com.health.profile.model.Patient;
import com.health.profile.repo.DoctorRepository;
import com.health.profile.repo.PatientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DoctorBootstrap implements CommandLineRunner {
  private final DoctorRepository doctors;
  private final PatientRepository patients;

  public DoctorBootstrap(DoctorRepository d, PatientRepository p) {
    this.doctors = d;
    this.patients = p;
  }

  @Override
  public void run(String... args) {
    seedDoctorIfMissing("Meera", "Iyer", "Dermatology", "doc1@clinic.org", "+1-555-0101");
    seedDoctorIfMissing("Robert", "Chen", "Cardiology", "doc2@clinic.org", "+1-555-0102");
    seedDoctorIfMissing("Sarah", "Jenkins", "Neurology", "doc3@clinic.org", "+1-555-0103");
    seedDoctorIfMissing("David", "Patel", "General Medicine", "doc4@clinic.org", "+1-555-0104");

    if (patients.findAll().isEmpty()) {
      Patient p = new Patient();
      p.setFirstName("Alex");
      p.setLastName("Morgan");
      p.setEmail("patient@example.com");
      p.setPhone("+1-555-0199");
      patients.save(p);
    }
  }

  private void seedDoctorIfMissing(String first, String last, String spec, String email, String phone) {
    if (doctors.findByEmail(email).isEmpty()) {
      Doctor doc = new Doctor();
      doc.setFirstName(first);
      doc.setLastName(last);
      doc.setSpecialization(spec);
      doc.setEmail(email);
      doc.setPhone(phone);
      doctors.save(doc);
    }
  }
}
