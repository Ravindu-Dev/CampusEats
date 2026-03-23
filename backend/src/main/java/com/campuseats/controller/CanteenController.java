package com.campuseats.controller;

import com.campuseats.model.Canteen;
import com.campuseats.service.CanteenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/canteens")
@RequiredArgsConstructor
@Slf4j
public class CanteenController {

    private final CanteenService canteenService;

    @GetMapping
    public ResponseEntity<List<Canteen>> getAllCanteens() {
        return ResponseEntity.ok(canteenService.getAllCanteens());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCanteenById(@PathVariable("id") String id) {
        log.info("Fetching canteen with ID: {}", id);
        try {
            Canteen canteen = canteenService.getCanteenById(id);
            log.info("Canteen found: {}", canteen.getCanteenName());
            return ResponseEntity.ok(canteen);
        } catch (Exception e) {
            log.error("Canteen not found with ID: {}. Error: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getCanteenByOwnerId(@PathVariable("ownerId") String ownerId) {
        log.info("Fetching canteen for owner ID: {}", ownerId);
        try {
            Canteen canteen = canteenService.getCanteenByOwnerId(ownerId);
            log.info("Canteen found: {} for owner: {}", canteen.getCanteenName(), ownerId);
            return ResponseEntity.ok(canteen);
        } catch (Exception e) {
            log.error("Canteen not found for owner ID: {}. Error: {}", ownerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCanteen(@PathVariable("id") String id, @RequestBody Canteen canteenDetails) {
        try {
            Canteen updatedCanteen = canteenService.updateCanteen(id, canteenDetails);
            return ResponseEntity.ok(updatedCanteen);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/upload-logo")
    public ResponseEntity<?> uploadLogo(@PathVariable("id") String id, @RequestParam("file") MultipartFile file) {
        try {
            String filePath = canteenService.uploadFile(file, id, "logo");
            // Update canteen with logo path
            Canteen canteen = canteenService.getCanteenByOwnerId(id);
            canteen.setLogoUrl(filePath);
            canteenService.updateCanteen(canteen.getId(), canteen);
            return ResponseEntity.ok("Logo uploaded successfully: " + filePath);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/upload-banner")
    public ResponseEntity<?> uploadBanner(@PathVariable("id") String id, @RequestParam("file") MultipartFile file) {
        try {
            String filePath = canteenService.uploadFile(file, id, "banner");
            // Update canteen with banner path
            Canteen canteen = canteenService.getCanteenByOwnerId(id);
            canteen.setBannerUrl(filePath);
            canteenService.updateCanteen(canteen.getId(), canteen);
            return ResponseEntity.ok("Banner uploaded successfully: " + filePath);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/upload-gallery")
    public ResponseEntity<?> uploadGallery(@PathVariable("id") String id, @RequestParam("files") List<MultipartFile> files) {
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
    public ResponseEntity<?> uploadDocuments(@PathVariable("id") String id,
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
    public ResponseEntity<?> updateStatus(@PathVariable("id") String id, @RequestParam("status") String status) {
        try {
            Canteen canteen = canteenService.updateStatus(id, status);
            return ResponseEntity.ok(canteen);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/queue-status")
    public ResponseEntity<?> getQueueStatus() {
        try {
            return ResponseEntity.ok(canteenService.getAllCanteenQueueStatus());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}
