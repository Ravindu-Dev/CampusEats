package com.campuseats.controller;

import com.campuseats.model.MenuItem;
import com.campuseats.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemRepository menuItemRepository;

    @GetMapping
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        return ResponseEntity.ok(menuItemRepository.findAll());
    }

    @GetMapping("/canteen/{canteenId}")
    public ResponseEntity<List<MenuItem>> getMenuItemsByCanteen(@PathVariable String canteenId) {
        return ResponseEntity.ok(menuItemRepository.findByCanteenId(canteenId));
    }

    @PostMapping
    public ResponseEntity<MenuItem> createMenuItem(@RequestBody MenuItem menuItem) {
        menuItem.setLastUpdated(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItemRepository.save(menuItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable String id, @RequestBody MenuItem menuItemDetails) {
        return menuItemRepository.findById(id)
                .map(menuItem -> {
                    menuItem.setName(menuItemDetails.getName());
                    menuItem.setDescription(menuItemDetails.getDescription());
                    menuItem.setPrice(menuItemDetails.getPrice());
                    menuItem.setCategory(menuItemDetails.getCategory());
                    menuItem.setImageUrl(menuItemDetails.getImageUrl());
                    menuItem.setAvailable(menuItemDetails.isAvailable());
                    menuItem.setVegetarian(menuItemDetails.isVegetarian());
                    menuItem.setLastUpdated(LocalDateTime.now());
                    return ResponseEntity.ok(menuItemRepository.save(menuItem));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String id) {
        return menuItemRepository.findById(id)
                .map(menuItem -> {
                    menuItemRepository.delete(menuItem);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
