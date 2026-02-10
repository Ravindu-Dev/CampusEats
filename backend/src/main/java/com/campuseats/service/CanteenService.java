package com.campuseats.service;

import com.campuseats.model.Canteen;
import com.campuseats.repository.CanteenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CanteenService {

    private final CanteenRepository canteenRepository;
    private static final String UPLOAD_DIR = "uploads/canteens/";

    public Canteen createCanteen(Canteen canteen) {
        return canteenRepository.save(canteen);
    }

    public Canteen updateCanteen(String id, Canteen canteenDetails) {
        Canteen canteen = canteenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canteen not found"));

        // Update fields
        if (canteenDetails.getCanteenName() != null) {
            canteen.setCanteenName(canteenDetails.getCanteenName());
        }
        if (canteenDetails.getDescription() != null) {
            canteen.setDescription(canteenDetails.getDescription());
        }
        if (canteenDetails.getOpeningTime() != null) {
            canteen.setOpeningTime(canteenDetails.getOpeningTime());
        }
        if (canteenDetails.getClosingTime() != null) {
            canteen.setClosingTime(canteenDetails.getClosingTime());
        }
        if (canteenDetails.getPhoneNumber() != null) {
            canteen.setPhoneNumber(canteenDetails.getPhoneNumber());
        }
        if (canteenDetails.getLocation() != null) {
            canteen.setLocation(canteenDetails.getLocation());
        }
        if (canteenDetails.getCuisineTypes() != null) {
            canteen.setCuisineTypes(canteenDetails.getCuisineTypes());
        }
        if (canteenDetails.getDietaryOptions() != null) {
            canteen.setDietaryOptions(canteenDetails.getDietaryOptions());
        }

        return canteenRepository.save(canteen);
    }

    public Canteen getCanteenByOwnerId(String ownerId) {
        return canteenRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new RuntimeException("Canteen not found for owner"));
    }

    public String uploadFile(MultipartFile file, String canteenId, String fileType) throws IOException {
        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR + canteenId);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String filename = fileType + "_" + UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return filePath.toString();
    }

    public List<String> uploadMultipleFiles(List<MultipartFile> files, String canteenId, String fileType)
            throws IOException {
        List<String> filePaths = new ArrayList<>();
        for (MultipartFile file : files) {
            String filePath = uploadFile(file, canteenId, fileType);
            filePaths.add(filePath);
        }
        return filePaths;
    }

    public Canteen updateStatus(String canteenId, String status) {
        Canteen canteen = canteenRepository.findById(canteenId)
                .orElseThrow(() -> new RuntimeException("Canteen not found"));
        canteen.setStatus(status);
        return canteenRepository.save(canteen);
    }
}
