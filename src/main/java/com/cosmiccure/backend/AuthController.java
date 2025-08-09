package com.cosmiccure.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already taken!");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole().toUpperCase());
        userRepository.save(user);

        switch (registerRequest.getRole().toUpperCase()) {
            case "PATIENT":
                Patient patient = new Patient();
                patient.setUser(user);
                patient.setFullName(registerRequest.getFullName());
                patient.setDob(registerRequest.getDob());
                patient.setGender(registerRequest.getGender());
                patient.setPhone(registerRequest.getPhone());
                patient.setAddress(registerRequest.getAddress());
                patientRepository.save(patient);
                break;
            case "DOCTOR":
                Doctor doctor = new Doctor();
                doctor.setUser(user);
                doctor.setFullName(registerRequest.getFullName());
                doctor.setGender(registerRequest.getGender());
                doctor.setPhone(registerRequest.getPhone());
                doctor.setSpecialty(registerRequest.getSpecialty());
                doctor.setFee(registerRequest.getFee());
                doctorRepository.save(doctor);
                break;
            case "STAFF":
                Staff staff = new Staff();
                staff.setUser(user);
                staff.setFullName(registerRequest.getFullName());
                staff.setGender(registerRequest.getGender());
                staff.setPhone(registerRequest.getPhone());
                staff.setRole(registerRequest.getStaffType().toUpperCase());
                staffRepository.save(staff);
                break;
            default:
                return ResponseEntity.badRequest().body("Error: Invalid role specified!");
        }

        return ResponseEntity.ok("User registered successfully!");
    }
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        Map<String, Object> response = new HashMap<>();

        if (userOptional.isEmpty() || !passwordEncoder.matches(loginRequest.getPassword(), userOptional.get().getPassword())) {
            return ResponseEntity.badRequest().body("Error: Invalid email or password!");
        }

        User user = userOptional.get();
        String requestedProfileType = loginRequest.getProfileType().toUpperCase();
        String actualUserRole = user.getRole().toUpperCase();
        if (actualUserRole.equals("STAFF")) {
            Optional<Staff> staffOptional = staffRepository.findByUser(user);
            if (staffOptional.isPresent()) {
                String staffSpecificRole = staffOptional.get().getRole().toUpperCase();
                if (!requestedProfileType.equals(staffSpecificRole)) {
                    return ResponseEntity.badRequest().body("Error: Invalid profile type for this user.");
                }
            } else {
                return ResponseEntity.badRequest().body("Error: Staff profile not found.");
            }
        } else {
            if (!requestedProfileType.equals(actualUserRole)) {
                return ResponseEntity.badRequest().body("Error: Invalid profile type for this user.");
            }
        }

        String fullName = "";
        Long entityId = null;
        switch (actualUserRole) {
            case "PATIENT":
                Optional<Patient> patient = patientRepository.findByUser(user);
                if (patient.isPresent()) {
                    fullName = patient.get().getFullName();
                    response.put("patientEntityId", patient.get().getId()); 
                }
                entityId = user.getId();
                break;
            case "DOCTOR":
                Optional<Doctor> doctor = doctorRepository.findByUser(user);
                if (doctor.isPresent()) {
                    fullName = doctor.get().getFullName();
                    entityId = doctor.get().getId();
                }
                break;
            case "ADMIN":
            case "PHARMACIST":
            case "SUPPORT_STAFF":
                Optional<Staff> staff = staffRepository.findByUser(user);
                if (staff.isPresent()) {
                    fullName = staff.get().getFullName();
                    entityId = staff.get().getId();
                }
                break;
        }

     
        response.put("message", "User logged in successfully!");
        response.put("role", user.getRole());
        response.put("name", fullName);
        response.put("userId", entityId);
        if (actualUserRole.equals("STAFF")) {
            Optional<Staff> staff = staffRepository.findByUser(user);
            staff.ifPresent(value -> response.put("specificRole", value.getRole()));
        }
        return ResponseEntity.ok(response);
    }
}