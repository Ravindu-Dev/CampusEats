package com.campuseats.controller;

import com.campuseats.dto.AddToCartRequest;
import com.campuseats.dto.UpdateCartItemRequest;
import com.campuseats.model.Cart;
import com.campuseats.model.User;
import com.campuseats.repository.UserRepository;
import com.campuseats.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Cart> getCart() {
        return ResponseEntity.ok(cartService.getCartByUserId(getCurrentUserId()));
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Cart> addItemToCart(@RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addItemToCart(
                getCurrentUserId(),
                request.getMenuItemId(),
                request.getQuantity()));
    }

    @PutMapping("/items/{menuItemId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Cart> updateCartItemQuantity(
            @PathVariable String menuItemId,
            @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateCartItemQuantity(
                getCurrentUserId(),
                menuItemId,
                request.getQuantity()));
    }

    @DeleteMapping("/items/{menuItemId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Cart> removeItemFromCart(@PathVariable String menuItemId) {
        return ResponseEntity.ok(cartService.removeItemFromCart(getCurrentUserId(), menuItemId));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart(getCurrentUserId());
        return ResponseEntity.ok().build();
    }
}
