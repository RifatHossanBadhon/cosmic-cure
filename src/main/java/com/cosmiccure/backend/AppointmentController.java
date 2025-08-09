package com.cosmiccure.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody AppointmentRequest appointmentRequest) {
        System.out.println("Received appointment request: " + appointmentRequest);
        Optional<Patient> patientOptional = patientRepository.findById(appointmentRequest.getPatientId());
        Optional<Doctor> doctorOptional = doctorRepository.findById(appointmentRequest.getDoctorId());

        if (patientOptional.isEmpty()) {
            System.out.println("Patient not found for ID: " + appointmentRequest.getPatientId());
            return ResponseEntity.badRequest().build();
        }
        if (doctorOptional.isEmpty()) {
            System.out.println("Doctor not found for ID: " + appointmentRequest.getDoctorId());
            return ResponseEntity.badRequest().build();
        }

        Patient patient = patientOptional.get();
        Doctor doctor = doctorOptional.get();

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentTime(appointmentRequest.getAppointmentTime());
        appointment.setFee(doctor.getFee());
        appointment.setReason(appointmentRequest.getReason());

        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentRepository.findByPatientId(patientId));
    }

    @GetMapping("/count/today")
    public ResponseEntity<Long> getTodaysAppointmentCount(@RequestParam Long doctorId) {
        return ResponseEntity.ok(appointmentRepository.countByDoctorIdAndDate(doctorId, LocalDate.now()));
    }

    @GetMapping("/schedule/today")
    public ResponseEntity<List<Appointment>> getTodaysSchedule(@RequestParam Long doctorId) {
        return ResponseEntity.ok(appointmentRepository.findByDoctorIdAndDateOrderByTime(doctorId, LocalDate.now()));
    }
}
