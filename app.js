/**
 * BlueStream E-Commerce - State, Cart & Dynamic Checkout Management
 * Safe, vanilla modern JavaScript implementation.
 */

(() => {
    'use strict';

    // --- 1. Configuration (ONLY numbers, no + or 00) ---
    const businessNumber = "923400608885"; 

    // --- State Management ---
    let cart = [];

    // Safe JSON parser to initialize from localStorage
    const initCart = () => {
        try {
            const savedCart = localStorage.getItem('bluestream_cart');
            cart = savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Failed to parse cart data safely.", error);
            cart = [];
        }
    };

    const saveCartToStorage = () => {
        localStorage.setItem('bluestream_cart', JSON.stringify(cart));
    };

    // --- UI Context Utilities (XSS Prevention) ---
    const escapeHTML = (str) => {
        if (!str) return '';
        return str.replace(/[&<>"']/g, (match) => {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return escapeMap[match];
        });
    };

    // --- Core UI Renderer for the Shopping Cart Widget ---
    const updateCartUI = () => {
        const container = document.getElementById('cart-items-container');
        const totalSpan = document.getElementById('cart-total-price');
        
        if (!container || !totalSpan) return; 
        container.innerHTML = '';
        let totalPrice = 0;

        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
            totalSpan.textContent = '0.00';
            return;
        }

        // Updated loop to pass down tracking indices for target removals
        cart.forEach((item, index) => {
            const priceNum = parseFloat(item.price) || 0;
            totalPrice += priceNum;

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            
            // Integrated dynamic remove button mapped to explicit array positions
            itemElement.innerHTML = `
                <span class="item-name">${escapeHTML(item.name)}</span>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="item-price">Rs${priceNum.toFixed(2)}</span>
                    <button class="btn-remove-item" data-index="${index}" title="Remove item">&times;</button>
                </div>
            `;
            container.appendChild(itemElement);
        });

        totalSpan.textContent = totalPrice.toFixed(2);
    };

    // --- Action Handlers ---

    // Handler 1: Adding items to the collective cart
    const handleAddToCart = (event) => {
        const button = event.target.closest('.btn-add-cart');
        if (!button) return;

        const name = button.getAttribute('data-name');
        const price = button.getAttribute('data-price');

        if (name && price) {
            cart.push({ name, price: parseFloat(price) });
            saveCartToStorage();
            updateCartUI();
        }
    };

    // Handler 2: Checkout complete collective cart via WhatsApp
    const handleCartCheckout = () => {
        if (cart.length === 0) {
            alert("Your shopping cart is currently empty!");
            return;
        }

        let rawMessage = "New Order from Strike & Style\n\n";
        let overallTotal = 0;

        cart.forEach((item, index) => {
            const itemPrice = parseFloat(item.price) || 0;
            overallTotal += itemPrice;
            rawMessage += `${index + 1}. ${item.name} - Rs${itemPrice.toFixed(2)}\n`;
        });

        rawMessage += `\nTotal Amount: Rs${overallTotal.toFixed(2)}`;
        rawMessage += `\n\nPlease let me know availability and delivery details. Thanks!`;

        const encodedMessage = encodeURIComponent(rawMessage);
        const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    // Handler 3: Single Item Instant Purchase (Integrated from your logic)
    const handleInstantPurchase = (event) => {
        const button = event.target.closest('.btn-instant-buy');
        if (!button) return;

        event.preventDefault();

        const productCard = button.closest('.product-card') || button.closest('article');
        if (productCard) {
            const productName = productCard.querySelector('h3').innerText;
            const productPrice = productCard.querySelector('.price').innerText;
            
            const section = productCard.closest('section');
            const seriesName = section ? section.querySelector('h2').innerText : "General Collection";

            const rawMessage = `Hello Jawad! 👋\n\nI would like to order the following product:\n\n*Product:* ${productName}\n*Price:* ${productPrice}\n*Collection:* ${seriesName}\n\nPlease let me know the availability and delivery details. Thanks!`;

            const encodedMessage = encodeURIComponent(rawMessage);
            const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
    };

    // --- Event Initializations & Registrations ---
    const initializeApp = () => {
        initCart();
        updateCartUI();
        const catalogContainer = document.querySelector('.products-catalog');
        if (catalogContainer) {
            catalogContainer.addEventListener('click', handleAddToCart);
            catalogContainer.addEventListener('click', handleInstantPurchase);
        }

        const checkoutBtn = document.getElementById('whatsapp-checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', handleCartCheckout);
        }

        // --- Integrated Extension: Clear Entire Cart Listener ---
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (cart.length === 0) return;
                if (confirm("Are you sure you want to clear all items from your cart?")) {
                    cart = [];
                    saveCartToStorage();
                    updateCartUI();
                }
            });
        }

        // --- Integrated Extension: Remove Specific Item Delegation Listener ---
        const cartItemsContainer = document.getElementById('cart-items-container');
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (event) => {
                const removeBtn = event.target.closest('.btn-remove-item');
                if (!removeBtn) return;

                // Safely grab the corresponding array position index
                const targetIndex = parseInt(removeBtn.getAttribute('data-index'), 10);
                
                if (!isNaN(targetIndex)) {
                    cart.splice(targetIndex, 1); // Delete single targeted item
                    saveCartToStorage();
                    updateCartUI();
                }
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();