package com.cosmiccure.backend;

import lombok.Data;

@Data
public class EmergencyAlertRequest {
    private Long patientId;
    private String patientName;
    private double latitude;
    private double longitude;
}
