package com.cosmiccure.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private StaffRepository staffRepository;

    @GetMapping
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Staff> getStaffById(@PathVariable Long id) {
        return staffRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Staff> updateStaff(@PathVariable Long id, @RequestBody Staff staffDetails) {
        return staffRepository.findById(id)
                .map(staff -> {
                    staff.setFullName(staffDetails.getFullName());
                    staff.setGender(staffDetails.getGender());
                    staff.setPhone(staffDetails.getPhone());
                    staff.setRole(staffDetails.getRole());
                    Staff updatedStaff = staffRepository.save(staff);
                    return ResponseEntity.ok(updatedStaff);
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteStaff(@PathVariable Long id) {
        return staffRepository.findById(id)
                .map(staff -> {
                    staffRepository.delete(staff);
                    return ResponseEntity.noContent().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
