package com.campuseats.service;

import com.campuseats.model.CanteenOwner;
import com.campuseats.repository.CanteenOwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
