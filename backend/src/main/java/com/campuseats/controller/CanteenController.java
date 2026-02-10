package com.campuseats.controller;

import com.campuseats.model.Canteen;
import com.campuseats.service.CanteenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/canteens")
@RequiredArgsConstructor
public class CanteenController {

    private final CanteenService canteenService;

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getCanteenByOwnerId(@PathVariable String ownerId) {
        try {
            Canteen canteen = canteenService.getCanteenByOwnerId(ownerId);
            return ResponseEntity.ok(canteen);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCanteen(@PathVariable String id, @RequestBody Canteen canteenDetails) {
        try {
            Canteen updatedCanteen = canteenService.updateCanteen(id, canteenDetails);
            return ResponseEntity.ok(updatedCanteen);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/upload-logo")
    public ResponseEntity<?> uploadLogo(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            String filePath = canteenService.uploadFile(file, id, "logo");
            // Update canteen with logo path
            Canteen canteen = canteenService.getCanteenByOwnerId(id);
            canteen.setLogoPath(filePath);
            canteenService.updateCanteen(canteen.getId(), canteen);
            return ResponseEntity.ok("Logo uploaded successfully: " + filePath);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/upload-banner")
    public ResponseEntity<?> uploadBanner(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            String filePath = canteenService.uploadFile(file, id, "banner");
            // Update canteen with banner path
            Canteen canteen = canteenService.getCanteenByOwnerId(id);
            canteen.setBannerPath(filePath);
            canteenService.updateCanteen(canteen.getId(), canteen);
            return ResponseEntity.ok("Banner uploaded successfully: " + filePath);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/upload-gallery")
    public ResponseEntity<?> uploadGallery(@PathVariable String id, @RequestParam("files") List<MultipartFile> files) {
        try {
            List<String> filePaths = canteenService.uploadMultipleFiles(files, id, "gallery");
            // Update canteen with gallery paths
            Canteen canteen = canteenService.getCanteenByOwnerId(id);
            canteen.setGalleryPaths(filePaths);
            canteenService.updateCanteen(canteen.getId(), canteen);
            return ResponseEntity.ok("Gallery uploaded successfully: " + filePaths);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/upload-documents")
    public ResponseEntity<?> uploadDocuments(@PathVariable String id,
            @RequestParam("files") List<MultipartFile> files) {
        try {
            List<String> filePaths = canteenService.uploadMultipleFiles(files, id, "document");
            // Update canteen with document paths
            Canteen canteen = canteenService.getCanteenByOwnerId(id);
            canteen.setDocumentPaths(filePaths);
            canteenService.updateCanteen(canteen.getId(), canteen);
            return ResponseEntity.ok("Documents uploaded successfully: " + filePaths);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestParam String status) {
        try {
            Canteen canteen = canteenService.updateStatus(id, status);
            return ResponseEntity.ok(canteen);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}
