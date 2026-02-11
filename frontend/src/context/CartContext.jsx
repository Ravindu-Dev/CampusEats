import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const refreshCart = useCallback(async () => {
        if (!user) {
            setCart(null);
            return;
        }
        try {
            setLoading(true);
            const data = await cartService.getCart();
            setCart(data);
        } catch (err) {
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            refreshCart();
        } else {
            setCart(null);
            setIsCartOpen(false);
        }
    }, [user, refreshCart]);

    const addToCart = async (menuItemId, quantity = 1) => {
        if (!user) return false;
        try {
            setLoading(true);
            const updatedCart = await cartService.addToCart(menuItemId, quantity);
            setCart(updatedCart);
            setIsCartOpen(true);
            return true;
        } catch (err) {
            console.error('Error adding to cart:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (menuItemId, quantity) => {
        try {
            const updatedCart = await cartService.updateCartItem(menuItemId, quantity);
            setCart(updatedCart);
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const removeItem = async (menuItemId) => {
        try {
            const updatedCart = await cartService.removeFromCart(menuItemId);
            setCart(updatedCart);
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clearCart();
            setCart({ items: [] });
        } catch (err) {
            console.error('Error clearing cart:', err);
        }
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const subtotal = cart?.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;

    const value = {
        cart,
        loading,
        isCartOpen,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        toggleCart,
        setIsCartOpen,
        refreshCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
