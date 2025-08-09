package com.cosmiccure.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);

    @Query("SELECT count(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND FUNCTION('DATE', a.appointmentTime) = :date")
    long countByDoctorIdAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND FUNCTION('DATE', a.appointmentTime) = :date ORDER BY a.appointmentTime")
    List<Appointment> findByDoctorIdAndDateOrderByTime(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    List<Appointment> findByDoctorId(Long doctorId);
}
