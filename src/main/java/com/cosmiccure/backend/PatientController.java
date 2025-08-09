package com.cosmiccure.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    private final UserRepository userRepository;

    PatientController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<?> getPatientHistoryByUserId(@PathVariable Long userId) {
    System.out.println("Received request for patient history for userId: " + userId);
    Optional<Patient> patientOptional = patientRepository.findByUserId(userId);
    
    if (patientOptional.isEmpty()) {
        System.out.println("Patient not found for userId: " + userId);
        return ResponseEntity.badRequest().body("Patient not found");
    }

    Patient patient = patientOptional.get();

    Map<String, Object> history = new HashMap<>();
    history.put("fullName", patient.getFullName());
    history.put("dob", patient.getDob());
    history.put("gender", patient.getGender());
    history.put("phone", patient.getPhone());
    history.put("address", patient.getAddress());

    return ResponseEntity.ok(history);
}

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patientDetails) {
        return patientRepository.findById(id)
                .map(patient -> {
                    patient.setFullName(patientDetails.getFullName());
                    patient.setDob(patientDetails.getDob());
                    patient.setGender(patientDetails.getGender());
                    patient.setPhone(patientDetails.getPhone());
                    patient.setAddress(patientDetails.getAddress());
                    Patient updatedPatient = patientRepository.save(patient);
                    return ResponseEntity.ok(updatedPatient);
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletePatient(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(patient -> {
                    patientRepository.delete(patient);
                    return ResponseEntity.noContent().build();
                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{patientId}/user")
    public ResponseEntity<User> getUserByPatientId(@PathVariable Long patientId) {
        return patientRepository.findById(patientId)
                .map(Patient::getUser)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
