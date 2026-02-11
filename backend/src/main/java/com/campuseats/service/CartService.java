package com.campuseats.service;

import com.campuseats.model.Cart;
import com.campuseats.model.CartItem;
import com.campuseats.model.MenuItem;
import com.campuseats.model.Canteen;
import com.campuseats.repository.CartRepository;
import com.campuseats.repository.MenuItemRepository;
import com.campuseats.repository.CanteenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final MenuItemRepository menuItemRepository;
    private final CanteenRepository canteenRepository;

    public Cart getCartByUserId(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });
    }

    public Cart addItemToCart(String userId, String menuItemId, Integer quantity) {
        if (userId == null || menuItemId == null)
            throw new IllegalArgumentException("User ID and Menu Item ID must not be null");
        Cart cart = getCartByUserId(userId);

        // Fetch menu item details
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        // Fetch canteen details
        String canteenName = "Campus Canteen";
        String canteenId = menuItem.getCanteenId();
        if (canteenId != null) {
            Optional<Canteen> canteen = canteenRepository.findById(canteenId);
            if (canteen.isPresent()) {
                canteenName = canteen.get().getCanteenName();
            }
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getMenuItemId().equals(menuItemId))
                .findFirst();

        if (existingItem.isPresent()) {
            // Update quantity
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
        } else {
            // Add new item
            CartItem cartItem = new CartItem();
            cartItem.setMenuItemId(menuItemId);
            cartItem.setName(menuItem.getName());
            cartItem.setPrice(menuItem.getPrice());
            cartItem.setQuantity(quantity);
            cartItem.setImageUrl(menuItem.getImageUrl());
            cartItem.setCanteenId(menuItem.getCanteenId());
            cartItem.setCanteenName(canteenName);
            cartItem.setCategory(menuItem.getCategory());
            cartItem.setVegetarian(menuItem.isVegetarian());

            cart.getItems().add(cartItem);
        }

        return cartRepository.save(cart);
    }

    public Cart updateCartItemQuantity(String userId, String menuItemId, Integer quantity) {
        if (userId == null || menuItemId == null)
            throw new IllegalArgumentException("User ID and Menu Item ID must not be null");
        Cart cart = getCartByUserId(userId);

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> menuItemId.equals(item.getMenuItemId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(cartItem);
        } else {
            cartItem.setQuantity(quantity);
        }

        return cartRepository.save(cart);
    }

    public Cart removeItemFromCart(String userId, String menuItemId) {
        Cart cart = getCartByUserId(userId);

        cart.getItems().removeIf(item -> item.getMenuItemId().equals(menuItemId));

        return cartRepository.save(cart);
    }

    public void clearCart(String userId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public Double calculateSubtotal(Cart cart) {
        return cart.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }
}
