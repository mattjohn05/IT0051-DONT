document.addEventListener("DOMContentLoaded", function() {
    console.log("Checkout page loaded");
    
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const orderItemsContainer = document.getElementById("orderItems");
    const subtotalEl = document.getElementById("subtotal");
    const deliveryFeeEl = document.getElementById("deliveryFee");
    const taxEl = document.getElementById("tax");
    const finalTotalEl = document.getElementById("finalTotal");
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const deliveryForm = document.getElementById("deliveryForm");

    const DELIVERY_FEE = 40;
    const TAX_RATE = 0.05;

    // Check if cart is empty
    if (cart.length === 0) {
        console.warn("Cart is empty, redirecting to menu");
        alert("Your cart is empty. Please add items before checkout.");
        window.location.href = "menu.html";
        return;
    }

    console.log("Cart items:", cart);

    // Display order items
    function displayOrderItems() {
        try {
            let subtotal = 0;
            orderItemsContainer.innerHTML = "";

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                const orderItem = document.createElement("div");
                orderItem.className = "order-item";
                orderItem.innerHTML = `
                    <div>
                        <strong>${item.name}</strong>
                        <br>
                        <small>₱${item.price} × ${item.quantity}</small>
                    </div>
                    <div><strong>₱${itemTotal}</strong></div>
                `;
                orderItemsContainer.appendChild(orderItem);
            });

            const tax = Math.round(subtotal * TAX_RATE);
            const total = subtotal + DELIVERY_FEE + tax;

            subtotalEl.textContent = `₱${subtotal}`;
            taxEl.textContent = `₱${tax}`;
            finalTotalEl.textContent = `₱${total}`;

            console.log("Order totals calculated:", { subtotal, tax, total });
            return { subtotal, tax, total };
        } catch (error) {
            console.error("Error displaying order items:", error);
            alert("Error loading order items. Please try again.");
            return null;
        }
    }

    // Payment method selection
    try {
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                paymentMethods.forEach(m => m.classList.remove('selected'));
                this.classList.add('selected');
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    console.log("Payment method selected:", radio.value);
                }
            });
        });
    } catch (error) {
        console.error("Error setting up payment methods:", error);
    }

    // Calculate estimated delivery time
    function getEstimatedDelivery() {
        try {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 45);
            return now.toISOString();
        } catch (error) {
            console.error("Error calculating delivery time:", error);
            return new Date().toISOString();
        }
    }

    // Place order
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("Place order button clicked");

            try {
                // Validate form
                if (!deliveryForm.checkValidity()) {
                    console.warn("Form validation failed");
                    deliveryForm.reportValidity();
                    return;
                }

                console.log("Form is valid, processing order...");

                // Get selected payment method
                const selectedPayment = document.querySelector('input[name="payment"]:checked');
                if (!selectedPayment) {
                    alert("Please select a payment method");
                    return;
                }

                // Get pricing information
                const pricing = displayOrderItems();
                if (!pricing) {
                    alert("Error calculating order total. Please try again.");
                    return;
                }

                // Get form data
                const orderData = {
                    orderId: 'ORD' + Date.now(),
                    orderDate: new Date().toISOString(),
                    items: cart,
                    customerInfo: {
                        name: document.getElementById("fullName").value.trim(),
                        phone: document.getElementById("phone").value.trim(),
                        email: document.getElementById("email").value.trim(),
                        address: document.getElementById("address").value.trim(),
                        city: document.getElementById("city").value,
                        pincode: document.getElementById("pincode").value.trim(),
                        landmark: document.getElementById("landmark").value.trim(),
                        instructions: document.getElementById("instructions").value.trim()
                    },
                    paymentMethod: selectedPayment.value,
                    pricing: pricing,
                    status: 'pending',
                    estimatedDelivery: getEstimatedDelivery()
                };

                console.log("Order data prepared:", orderData);

                // Save order to order history
                try {
                    let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
                    orderHistory.unshift(orderData);
                    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
                    console.log("Order saved to history");
                } catch (storageError) {
                    console.error("Error saving to order history:", storageError);
                    // Continue anyway - this is not critical
                }

                // Save current order for tracking
                try {
                    localStorage.setItem("currentOrder", JSON.stringify(orderData));
                    console.log("Current order saved");
                } catch (storageError) {
                    console.error("Error saving current order:", storageError);
                }

                // Clear cart
                try {
                    localStorage.removeItem("cart");
                    console.log("Cart cleared");
                } catch (storageError) {
                    console.error("Error clearing cart:", storageError);
                }

                // Redirect to order tracking page
                console.log("Redirecting to order tracking...");
                const redirectUrl = `order_tracking.html?orderId=${orderData.orderId}`;
                console.log("Redirect URL:", redirectUrl);
                
                // Use a slight delay to ensure localStorage is written
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 100);

            } catch (error) {
                console.error("Error placing order:", error);
                alert("An error occurred while placing your order. Please try again.\n\nError details: " + error.message);
            }
        });
    } else {
        console.error("Place order button not found!");
    }

    // Initialize
    try {
        displayOrderItems();
        console.log("Checkout page initialized successfully");
    } catch (error) {
        console.error("Error initializing checkout page:", error);
        alert("Error loading checkout page. Please try again.");
    }
});