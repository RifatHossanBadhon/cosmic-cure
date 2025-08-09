package com.cosmiccure.backend;

import lombok.Data;

import java.util.Date;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String role; 
    private String fullName;
    private Date dob;
    private String gender;
    private String phone;
    private String address;
    private String specialty;
    private double fee;
    private String staffRole;
    private String staffType;
}