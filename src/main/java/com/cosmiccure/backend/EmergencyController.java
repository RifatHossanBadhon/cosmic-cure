package com.cosmiccure.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/emergency")
public class EmergencyController {

    @Autowired
    private EmergencyAlertRepository emergencyAlertRepository;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping("/alert")
    public ResponseEntity<String> createEmergencyAlert(@RequestBody EmergencyAlertRequest request) {

        EmergencyAlert alert = new EmergencyAlert();
        alert.setPatientId(request.getPatientId());
        alert.setPatientName(request.getPatientName());
        alert.setLatitude(request.getLatitude());
        alert.setLongitude(request.getLongitude());
        alert.setTimestamp(LocalDateTime.now());

        emergencyAlertRepository.save(alert);

        return ResponseEntity.ok("Emergency alert created successfully!");
    }

    @GetMapping("/alerts")
    public List<EmergencyAlert> getAllEmergencyAlerts() {
        return emergencyAlertRepository.findAll();
    }

    @DeleteMapping("/alerts/{id}")
    public ResponseEntity<Void> deleteEmergencyAlert(@PathVariable Long id) {
        try {
            emergencyAlertRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
