package com.health.profile.model;
import jakarta.persistence.*;
@Entity @Table(name="doctors")
public class Doctor {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  private String firstName; private String lastName; private String specialization; private String email; private String phone;
  public Long getId(){return id;}
  public String getFirstName(){return firstName;} public void setFirstName(String s){this.firstName=s;}
  public String getLastName(){return lastName;} public void setLastName(String s){this.lastName=s;}
  public String getSpecialization(){return specialization;} public void setSpecialization(String s){this.specialization=s;}
  public String getEmail(){return email;} public void setEmail(String s){this.email=s;}
  public String getPhone(){return phone;} public void setPhone(String s){this.phone=s;}
}
