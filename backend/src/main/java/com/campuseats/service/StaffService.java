package com.campuseats.service;

import com.campuseats.dto.CreateStaffRequest;
import com.campuseats.dto.StaffResponse;
import com.campuseats.model.Staff;
import com.campuseats.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;

    public StaffResponse createStaff(CreateStaffRequest request) {
        Staff staff = new Staff();
        staff.setCanteenId(request.getCanteenId());
        staff.setStaffName(request.getStaffName());
        staff.setRole(request.getRole());
        staff.setPhone(request.getPhone());
        staff.setNicNumber(request.getNicNumber());
        staff.setEmploymentType(request.getEmploymentType());
        staff.setPayType(request.getPayType());
        staff.setPayRate(request.getPayRate());
        staff.setBankName(request.getBankName());
        staff.setAccountNumber(request.getAccountNumber());
        staff.setBankBranch(request.getBankBranch());
        staff.setStatus("ACTIVE");

        if (request.getJoinDate() != null && !request.getJoinDate().isEmpty()) {
            staff.setJoinDate(LocalDate.parse(request.getJoinDate()));
        } else {
            staff.setJoinDate(LocalDate.now());
        }

        Staff saved = staffRepository.save(staff);
        return convertToResponse(saved);
    }

    public List<StaffResponse> getStaffByCanteen(String canteenId) {
        return staffRepository.findByCanteenId(canteenId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<StaffResponse> getActiveStaffByCanteen(String canteenId) {
        return staffRepository.findByCanteenIdAndStatus(canteenId, "ACTIVE").stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public StaffResponse updateStaff(String staffId, CreateStaffRequest request) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        if (request.getStaffName() != null)
            staff.setStaffName(request.getStaffName());
        if (request.getRole() != null)
            staff.setRole(request.getRole());
        if (request.getPhone() != null)
            staff.setPhone(request.getPhone());
        if (request.getNicNumber() != null)
            staff.setNicNumber(request.getNicNumber());
        if (request.getEmploymentType() != null)
            staff.setEmploymentType(request.getEmploymentType());
        if (request.getPayType() != null)
            staff.setPayType(request.getPayType());
        if (request.getPayRate() != null)
            staff.setPayRate(request.getPayRate());
        if (request.getBankName() != null)
            staff.setBankName(request.getBankName());
        if (request.getAccountNumber() != null)
            staff.setAccountNumber(request.getAccountNumber());
        if (request.getBankBranch() != null)
            staff.setBankBranch(request.getBankBranch());
        if (request.getJoinDate() != null && !request.getJoinDate().isEmpty()) {
            staff.setJoinDate(LocalDate.parse(request.getJoinDate()));
        }

        Staff updated = staffRepository.save(staff);
        return convertToResponse(updated);
    }

    public StaffResponse updateStaffStatus(String staffId, String status) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));
        staff.setStatus(status);
        Staff updated = staffRepository.save(staff);
        return convertToResponse(updated);
    }

    public void deleteStaff(String staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));
        staff.setStatus("TERMINATED");
        staffRepository.save(staff);
    }

    public long getActiveStaffCount(String canteenId) {
        return staffRepository.countByCanteenIdAndStatus(canteenId, "ACTIVE");
    }

    public Staff getStaffById(String staffId) {
        return staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));
    }

    private StaffResponse convertToResponse(Staff staff) {
        return new StaffResponse(
                staff.getId(),
                staff.getCanteenId(),
                staff.getStaffName(),
                staff.getRole(),
                staff.getPhone(),
                staff.getNicNumber(),
                staff.getEmploymentType(),
                staff.getPayType(),
                staff.getPayRate(),
                staff.getBankName(),
                staff.getAccountNumber(),
                staff.getBankBranch(),
                staff.getJoinDate(),
                staff.getStatus(),
                staff.getCreatedAt(),
                staff.getUpdatedAt());
    }
}
