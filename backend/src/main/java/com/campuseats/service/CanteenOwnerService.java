package com.campuseats.service;

import com.campuseats.model.CanteenOwner;
import com.campuseats.repository.CanteenOwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CanteenOwnerService {

    private final CanteenOwnerRepository canteenOwnerRepository;

    public CanteenOwner createCanteenOwner(CanteenOwner owner) {
        return canteenOwnerRepository.save(owner);
    }

    public CanteenOwner getOwnerByEmail(String email) {
        return canteenOwnerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Canteen owner not found"));
    }

    public CanteenOwner getOwnerById(String id) {
        return canteenOwnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canteen owner not found"));
    }

    public CanteenOwner updateOwner(String id, CanteenOwner ownerDetails) {
        CanteenOwner owner = canteenOwnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canteen owner not found"));

        if (ownerDetails.getOwnerName() != null) {
            owner.setOwnerName(ownerDetails.getOwnerName());
        }
        if (ownerDetails.getPhoneNumber() != null) {
            owner.setPhoneNumber(ownerDetails.getPhoneNumber());
        }

        return canteenOwnerRepository.save(owner);
    }

    public List<CanteenOwner> getPendingRegistrations() {
        return canteenOwnerRepository.findByApprovalStatus("PENDING");
    }

    public CanteenOwner approveRegistration(String ownerId, String adminId) {
        CanteenOwner owner = canteenOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Canteen owner not found"));

        owner.setApprovalStatus("APPROVED");
        owner.setApprovedBy(adminId);
        owner.setApprovedAt(LocalDateTime.now());
        owner.setEnabled(true);

        return canteenOwnerRepository.save(owner);
    }

    public CanteenOwner rejectRegistration(String ownerId, String adminId, String reason) {
        CanteenOwner owner = canteenOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Canteen owner not found"));

        owner.setApprovalStatus("REJECTED");
        owner.setApprovedBy(adminId);
        owner.setApprovedAt(LocalDateTime.now());
        owner.setRejectionReason(reason);
        owner.setEnabled(false);

        return canteenOwnerRepository.save(owner);
    }

    public long getPendingCount() {
        return canteenOwnerRepository.countByApprovalStatus("PENDING");
    }

    public List<CanteenOwner> getAllCanteenOwners() {
        return canteenOwnerRepository.findAll();
    }
}
