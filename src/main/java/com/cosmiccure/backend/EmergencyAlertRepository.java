package com.cosmiccure.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, Long> {
}
