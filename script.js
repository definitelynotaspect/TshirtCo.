document.addEventListener('DOMContentLoaded', () => {
    // --- Select Elements ---
    const navbar = document.getElementById('navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const contactForm = document.getElementById('contact-form');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutShipping = document.getElementById('checkout-shipping');
    const checkoutTotal = document.getElementById('checkout-total');
    const shippingMethodSelect = document.getElementById('shipping-method');

    // --- State ---
    let cart = JSON.parse(localStorage.getItem('tshirt-cart')) || [];

    // --- Initialization ---
    updateCartUI();

    // --- Sticky Navbar ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }
    });

    // --- Mobile Menu Toggle ---
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
        });
    });

    // --- Cart Functionality ---

    // Open Cart Modal
    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    // Close Cart Modal
    closeModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scrolling
    });

    // Close Checkout Modal
    const closeCheckoutModal = checkoutModal.querySelector('.close-modal');
    closeCheckoutModal.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close Modal on Outside Click
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Add to Cart
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            const image = button.getAttribute('data-image');

            addItemToCart(id, name, price, image);
            
            // Visual feedback
            const originalText = button.innerText;
            button.innerText = 'Added!';
            button.style.backgroundColor = '#28a745';
            setTimeout(() => {
                button.innerText = originalText;
                button.style.backgroundColor = '';
            }, 1500);
        });
    });

    function addItemToCart(id, name, price, image) {
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }

        saveCart();
        updateCartUI();
    }

    function removeItemFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
    }

    function saveCart() {
        localStorage.setItem('tshirt-cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        // Update Count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;

        // Update Items List
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
            cartTotalPrice.innerText = '₱0.00';
        } else {
            cartItemsContainer.innerHTML = '';
            let total = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.quantity} x ₱${item.price.toFixed(2)}</p>
                        <span class="remove-item" data-id="${item.id}">Remove</span>
                    </div>
                    <div class="cart-item-price">
                        ₱${itemTotal.toFixed(2)}
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });

            cartTotalPrice.innerText = `₱${total.toFixed(2)}`;

            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', () => {
                    const id = button.getAttribute('data-id');
                    removeItemFromCart(id);
                });
            });
        }
    }

    // --- Checkout Functionality ---

    // Open Checkout Modal
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add some items before checking out.');
            return;
        }
        cartModal.style.display = 'none';
        checkoutModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        updateCheckoutUI();
    });

    // Update Shipping Cost
    shippingMethodSelect.addEventListener('change', updateCheckoutUI);

    function updateCheckoutUI() {
        // Update Items List
        checkoutItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const checkoutItemElement = document.createElement('div');
            checkoutItemElement.classList.add('checkout-item');
            checkoutItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="checkout-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} x ₱${item.price.toFixed(2)}</p>
                </div>
                <div class="checkout-item-price">
                    ₱${itemTotal.toFixed(2)}
                </div>
            `;
            checkoutItemsContainer.appendChild(checkoutItemElement);
        });

        // Update Pricing
        checkoutSubtotal.innerText = `₱${subtotal.toFixed(2)}`;
        
        const shippingCost = getShippingCost();
        checkoutShipping.innerText = `₱${shippingCost.toFixed(2)}`;
        
        const total = subtotal + shippingCost;
        checkoutTotal.innerText = `₱${total.toFixed(2)}`;
    }

    function getShippingCost() {
        const selectedMethod = shippingMethodSelect.value;
        switch (selectedMethod) {
            case 'standard':
                return 150;
            case 'express':
                return 300;
            case 'overnight':
                return 600;
            default:
                return 0;
        }
    }

    // Handle Checkout Form Submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(checkoutForm);
        const orderData = {
            customer: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                zip: formData.get('zip'),
                country: formData.get('country')
            },
            shipping: {
                method: formData.get('shippingMethod'),
                cost: getShippingCost()
            },
            payment: {
                cardName: formData.get('cardName'),
                cardNumber: formData.get('cardNumber').slice(-4), // Only store last 4 digits
                expiry: formData.get('expiry')
            },
            items: cart,
            subtotal: parseFloat(checkoutSubtotal.innerText.replace('₱', '')),
            total: parseFloat(checkoutTotal.innerText.replace('₱', ''))
        };

        // Simulate order processing
        alert(`Thank you for your order, ${orderData.customer.firstName}! Your order has been placed successfully. Order total: ₱${orderData.total.toFixed(2)}`);
        
        // Clear cart and close modal
        cart = [];
        saveCart();
        updateCartUI();
        checkoutModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        checkoutForm.reset();
    });

    // --- Contact Form Handling ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            
            // Simple feedback (no backend)
            alert(`Thank you, ${name}! Your message has been sent successfully.`);
            contactForm.reset();
        });
    }

    // --- Smooth Scrolling for all links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
