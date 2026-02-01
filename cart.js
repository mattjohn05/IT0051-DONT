document.addEventListener("DOMContentLoaded", function () {
    const cartBtn = document.getElementById("cartBtn");
    const cartPopup = document.getElementById("cartPopup");
    const closeCart = document.querySelector(".close-cart");
    const cartItemsContainer = document.querySelector(".cart-items");
    const cartCount = document.getElementById("cartCount");
    const totalPriceEl = document.querySelector(".total");
    const checkoutBtn = document.querySelector(".checkout-btn");
    
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Update Cart UI
    function updateCartUI() {
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = "";
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p style='text-align: center; padding: 20px;'>Your cart is empty.</p>";
            if (checkoutBtn) {
                checkoutBtn.disabled = true;
                checkoutBtn.style.opacity = "0.5";
            }
        } else {
            cart.forEach((item, index) => {
                totalPrice += item.price * item.quantity;

                const cartItem = document.createElement("div");
                cartItem.classList.add("cart-item");

                cartItem.innerHTML = `
                    <div style="flex: 1;">
                        <strong>${item.name}</strong>
                        <br>
                        <small>₱${item.price} each</small>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button class="decrease-qty btn-sm" data-index="${index}">-</button>
                        <span style="min-width: 30px; text-align: center;"><strong>${item.quantity}</strong></span>
                        <button class="increase-qty btn-sm" data-index="${index}">+</button>
                        <span style="min-width: 80px; text-align: right;"><strong>₱${item.price * item.quantity}</strong></span>
                        <button class="remove-item btn-sm" data-index="${index}" style="color: red;">✕</button>
                    </div>
                `;

                cartItemsContainer.appendChild(cartItem);
            });

            if (checkoutBtn) {
                checkoutBtn.disabled = false;
                checkoutBtn.style.opacity = "1";
            }
        }

        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
        
        if (totalPriceEl) {
            totalPriceEl.textContent = `Total: ₱${totalPrice}`;
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Add to Cart - Global event delegation
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("add-to-cart") || e.target.closest(".add-to-cart")) {
            e.preventDefault();
            
            const button = e.target.classList.contains("add-to-cart") ? e.target : e.target.closest(".add-to-cart");
            const card = button.closest(".card-body") || button.closest(".box");
            
            if (!card) {
                console.log("Card not found");
                return;
            }

            const itemName = card.querySelector(".card-title")?.textContent?.trim() || 
                           card.querySelector("h3")?.textContent?.trim();
            const priceText = card.querySelector(".price")?.textContent || "";
            const itemPrice = parseInt(priceText.replace(/[^0-9]/g, ""));

            console.log("Item:", itemName, "Price:", itemPrice);

            if (!itemName || !itemPrice || isNaN(itemPrice)) {
                alert("Error adding item to cart");
                return;
            }

            const existingItem = cart.find(item => item.name === itemName);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name: itemName, price: itemPrice, quantity: 1 });
            }

            updateCartUI();
            
            // Show feedback
            const originalText = button.textContent;
            button.textContent = "Added!";
            button.style.background = "#28a745";
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = "";
            }, 1000);
        }
    });

    // Remove from Cart
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener("click", function (e) {
            if (e.target.classList.contains("remove-item")) {
                const index = e.target.getAttribute("data-index");
                cart.splice(index, 1);
                updateCartUI();
            }
        });

        // Increase Quantity
        cartItemsContainer.addEventListener("click", function (e) {
            if (e.target.classList.contains("increase-qty")) {
                const index = e.target.getAttribute("data-index");
                cart[index].quantity += 1;
                updateCartUI();
            }
        });

        // Decrease Quantity
        cartItemsContainer.addEventListener("click", function (e) {
            if (e.target.classList.contains("decrease-qty")) {
                const index = e.target.getAttribute("data-index");
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                updateCartUI();
            }
        });
    }

    // Show/Hide Cart Popup
    if (cartBtn) {
        cartBtn.addEventListener("click", () => {
            if (cartPopup) {
                cartPopup.style.display = "block";
                updateCartUI();
            }
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener("click", () => {
            if (cartPopup) {
                cartPopup.style.display = "none";
            }
        });
    }

    // Checkout Button
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cart.length > 0) {
                window.location.href = "checkout.html";
            }
        });
    }

    // Close popup when clicking outside
    if (cartPopup) {
        cartPopup.addEventListener("click", (e) => {
            if (e.target === cartPopup) {
                cartPopup.style.display = "none";
            }
        });
    }

    // Load Cart on Page Load
    updateCartUI();
});