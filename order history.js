document.addEventListener("DOMContentLoaded", function() {
    const ordersContainer = document.getElementById("ordersContainer");
    const emptyState = document.getElementById("emptyState");
    const filterButtons = document.querySelectorAll(".filter-buttons .btn");
    
    let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    let currentFilter = "all";

    // Display orders
    function displayOrders(filter = "all") {
        ordersContainer.innerHTML = "";
        
        let filteredOrders = orderHistory;
        if (filter !== "all") {
            filteredOrders = orderHistory.filter(order => order.status === filter);
        }

        if (filteredOrders.length === 0) {
            emptyState.style.display = "block";
            ordersContainer.style.display = "none";
            return;
        }

        emptyState.style.display = "none";
        ordersContainer.style.display = "block";

        filteredOrders.forEach((order, index) => {
            const orderCard = createOrderCard(order, index);
            ordersContainer.appendChild(orderCard);
        });
    }

    // Create order card
    function createOrderCard(order, index) {
        const card = document.createElement("div");
        card.className = "order-card";

        const orderDate = new Date(order.orderDate);
        const statusClass = `status-${order.status}`;
        const statusText = formatStatus(order.status);

        let itemsSummary = order.items.slice(0, 3).map(item => 
            `${item.name} (x${item.quantity})`
        ).join(", ");
        
        if (order.items.length > 3) {
            itemsSummary += ` +${order.items.length - 3} more`;
        }

        card.innerHTML = `
            <div class="order-header">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <strong>Order ID</strong><br>
                        <span>${order.orderId}</span>
                    </div>
                    <div class="col-md-3">
                        <strong>Date</strong><br>
                        <span>${orderDate.toLocaleDateString()}</span><br>
                        <small class="text-muted">${orderDate.toLocaleTimeString()}</small>
                    </div>
                    <div class="col-md-3">
                        <strong>Total</strong><br>
                        <span style="font-size: 18px; color: #28a745;">₱${order.pricing.total}</span>
                    </div>
                    <div class="col-md-3 text-end">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
            </div>
            <div class="order-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6><i class="fas fa-shopping-bag"></i> Items Ordered</h6>
                        <p class="text-muted mb-3">${itemsSummary}</p>
                        
                        <h6><i class="fas fa-map-marker-alt"></i> Delivery Address</h6>
                        <p class="text-muted mb-0">${order.customerInfo.address}</p>
                        <p class="text-muted">${order.customerInfo.city} - ${order.customerInfo.pincode}</p>
                        
                        <h6><i class="fas fa-credit-card"></i> Payment Method</h6>
                        <p class="text-muted">${formatPaymentMethod(order.paymentMethod)}</p>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-outline-primary btn-sm mb-2 w-100" onclick="viewOrderDetails(${index})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn btn-success btn-sm mb-2 w-100" onclick="reorderItems(${index})">
                            <i class="fas fa-redo"></i> Reorder
                        </button>
                        ${order.status !== 'delivered' ? `
                            <button class="btn btn-info btn-sm w-100" onclick="trackOrder('${order.orderId}')">
                                <i class="fas fa-shipping-fast"></i> Track Order
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    // Format status text
    function formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'preparing': 'Preparing',
            'out-for-delivery': 'Out for Delivery',
            'delivered': 'Delivered'
        };
        return statusMap[status] || status;
    }

    // Format payment method
    function formatPaymentMethod(method) {
        const methodMap = {
            'cod': 'Cash on Delivery',
            'card': 'Credit/Debit Card',
            'upi': 'UPI Payment',
            'wallet': 'Digital Wallet'
        };
        return methodMap[method] || method;
    }

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener("click", function() {
            filterButtons.forEach(btn => {
                btn.classList.remove("active");
                btn.classList.remove("btn-primary");
                btn.classList.add("btn-outline-primary");
            });
            
            this.classList.add("active");
            this.classList.add("btn-primary");
            this.classList.remove("btn-outline-primary");
            
            currentFilter = this.getAttribute("data-filter");
            displayOrders(currentFilter);
        });
    });

    // View order details
    window.viewOrderDetails = function(index) {
        const order = orderHistory[index];
        const modalBody = document.getElementById("modalBody");
        
        let itemsHTML = order.items.map(item => `
            <div class="order-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>₱${item.price * item.quantity}</span>
            </div>
        `).join("");

        modalBody.innerHTML = `
            <div class="mb-3">
                <h6><i class="fas fa-receipt"></i> Order ID: ${order.orderId}</h6>
                <p class="text-muted">Placed on: ${new Date(order.orderDate).toLocaleString()}</p>
            </div>
            
            <h6 class="mt-3">Order Items</h6>
            ${itemsHTML}
            
            <div class="mt-3">
                <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>₱${order.pricing.subtotal}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Delivery Fee:</span>
                    <span>₱40</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>₱${order.pricing.tax}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between">
                    <strong>Total:</strong>
                    <strong>₱${order.pricing.total}</strong>
                </div>
            </div>
            
            <h6 class="mt-4">Customer Information</h6>
            <p class="mb-1"><strong>Name:</strong> ${order.customerInfo.name}</p>
            <p class="mb-1"><strong>Phone:</strong> ${order.customerInfo.phone}</p>
            <p class="mb-1"><strong>Email:</strong> ${order.customerInfo.email}</p>
            
            <h6 class="mt-3">Delivery Address</h6>
            <p class="mb-1">${order.customerInfo.address}</p>
            <p class="mb-1">${order.customerInfo.city} - ${order.customerInfo.pincode}</p>
            ${order.customerInfo.landmark ? `<p class="mb-1"><strong>Landmark:</strong> ${order.customerInfo.landmark}</p>` : ''}
            
            <h6 class="mt-3">Payment Method</h6>
            <p>${formatPaymentMethod(order.paymentMethod)}</p>
            
            ${order.customerInfo.instructions ? `
                <h6 class="mt-3">Special Instructions</h6>
                <p>${order.customerInfo.instructions}</p>
            ` : ''}
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    };

    // Reorder items
    window.reorderItems = function(index) {
        const order = orderHistory[index];
        
        // Clear current cart
        localStorage.removeItem("cart");
        
        // Add order items to cart
        localStorage.setItem("cart", JSON.stringify(order.items));
        
        // Redirect to menu
        alert("Items added to cart! Redirecting to menu...");
        window.location.href = "menu.html";
    };

    // Track order
    window.trackOrder = function(orderId) {
        window.location.href = `order_tracking.html?orderId=${orderId}`;
    };

    // Initialize
    displayOrders(currentFilter);
});