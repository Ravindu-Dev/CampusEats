package com.campuseats.service;

import com.campuseats.dto.CanteenQueueStatusDTO;
import com.campuseats.model.Canteen;
import com.campuseats.model.Order;
import com.campuseats.repository.CanteenRepository;
import com.campuseats.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CanteenService {

    private final CanteenRepository canteenRepository;
    private final OrderRepository orderRepository;
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

    public Canteen getCanteenById(String id) {
        return canteenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canteen not found"));
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

    public List<Canteen> getAllCanteens() {
        return canteenRepository.findAll();
    }

    public List<CanteenQueueStatusDTO> getAllCanteenQueueStatus() {
        // Get all active canteens
        List<Canteen> canteens = canteenRepository.findAll().stream()
                .filter(Canteen::isActive)
                .collect(Collectors.toList());

        // Statuses to count as "pending" (not yet ready for pickup)
        List<Order.OrderStatus> pendingStatuses = Arrays.asList(
                Order.OrderStatus.PENDING,
                Order.OrderStatus.PREPARING);

        String successfulPaymentStatus = "succeeded";

        return canteens.stream().map(canteen -> {
            // Count total pending orders for this canteen (only paid orders)
            Long totalPendingOrders = orderRepository.countByOrderItemsCanteenIdAndOrderStatusInAndPaymentStatus(
                    canteen.getId(),
                    pendingStatuses,
                    successfulPaymentStatus);

            // Count by order type (only paid orders)
            Long nowOrders = orderRepository.countByOrderItemsCanteenIdAndOrderStatusInAndOrderTypeAndPaymentStatus(
                    canteen.getId(),
                    pendingStatuses,
                    Order.OrderType.NOW,
                    successfulPaymentStatus);

            Long laterOrders = orderRepository.countByOrderItemsCanteenIdAndOrderStatusInAndOrderTypeAndPaymentStatus(
                    canteen.getId(),
                    pendingStatuses,
                    Order.OrderType.LATER,
                    successfulPaymentStatus);

            // Build order type breakdown
            Map<Order.OrderType, Integer> ordersByType = new HashMap<>();
            ordersByType.put(Order.OrderType.NOW, nowOrders.intValue());
            ordersByType.put(Order.OrderType.LATER, laterOrders.intValue());

            // Determine queue status based on thresholds
            String queueStatus;
            int pendingCount = totalPendingOrders.intValue();

            if (pendingCount >= 5) {
                queueStatus = "HIGH";
            } else if (pendingCount >= 3) {
                queueStatus = "MEDIUM";
            } else if (pendingCount >= 1) {
                queueStatus = "LOW";
            } else {
                queueStatus = "NONE";
            }

            return new CanteenQueueStatusDTO(
                    canteen.getId(),
                    canteen.getCanteenName(),
                    queueStatus,
                    pendingCount,
                    ordersByType);
        }).collect(Collectors.toList());
    }
}
