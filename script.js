document.addEventListener('DOMContentLoaded', () => {
    const currencyLabel = 'PHP';

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
    const revealElements = document.querySelectorAll('.reveal');
    const tiltCards = document.querySelectorAll('.tilt-card');
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');

    // --- State ---
    let cart = JSON.parse(localStorage.getItem('tshirt-cart')) || [];

    // --- Initialization ---
    updateCartUI();
    setupRevealAnimations();
    setupTiltCards();
    setupHeroParallax();

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

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
        });
    });

    // --- Cart Functionality ---
    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    closeModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    const closeCheckoutModal = checkoutModal.querySelector('.close-modal');
    closeCheckoutModal.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

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

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            const image = button.getAttribute('data-image');

            addItemToCart(id, name, price, image);

            const originalText = button.innerText;
            button.innerText = 'Added!';
            button.style.backgroundColor = '#7f5539';
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

    function formatCurrency(amount) {
        return `${currencyLabel} ${amount.toFixed(2)}`;
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
            cartTotalPrice.innerText = formatCurrency(0);
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
                        <p>${item.quantity} x ${formatCurrency(item.price)}</p>
                        <span class="remove-item" data-id="${item.id}">Remove</span>
                    </div>
                    <div class="cart-item-price">
                        ${formatCurrency(itemTotal)}
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });

            cartTotalPrice.innerText = formatCurrency(total);

            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', () => {
                    const id = button.getAttribute('data-id');
                    removeItemFromCart(id);
                });
            });
        }
    }

    // --- Checkout Functionality ---
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

    shippingMethodSelect.addEventListener('change', updateCheckoutUI);

    function updateCheckoutUI() {
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
                    <p>${item.quantity} x ${formatCurrency(item.price)}</p>
                </div>
                <div class="checkout-item-price">
                    ${formatCurrency(itemTotal)}
                </div>
            `;
            checkoutItemsContainer.appendChild(checkoutItemElement);
        });

        checkoutSubtotal.innerText = formatCurrency(subtotal);

        const shippingCost = getShippingCost();
        checkoutShipping.innerText = formatCurrency(shippingCost);

        const total = subtotal + shippingCost;
        checkoutTotal.innerText = formatCurrency(total);
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

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

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
                cardNumber: formData.get('cardNumber').slice(-4),
                expiry: formData.get('expiry')
            },
            items: cart,
            subtotal: parseFloat(checkoutSubtotal.innerText.replace(`${currencyLabel} `, '')),
            total: parseFloat(checkoutTotal.innerText.replace(`${currencyLabel} `, ''))
        };

        alert(`Thank you for your order, ${orderData.customer.firstName}! Your order has been placed successfully. Order total: ${formatCurrency(orderData.total)}`);

        cart = [];
        saveCart();
        updateCartUI();
        checkoutModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        checkoutForm.reset();
    });

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name');

            alert(`Thank you, ${name}! Your message has been sent successfully.`);
            contactForm.reset();
        });
    }

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

    function setupRevealAnimations() {
        if (!revealElements.length) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.16,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach((element, index) => {
            element.style.transitionDelay = `${Math.min(index * 60, 360)}ms`;
            revealObserver.observe(element);
        });
    }

    function setupTiltCards() {
        if (!tiltCards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        tiltCards.forEach((card) => {
            card.addEventListener('mousemove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;

                card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    function setupHeroParallax() {
        if (!hero || !heroContent || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        hero.addEventListener('mousemove', (event) => {
            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            const offsetX = (x - 0.5) * 18;
            const offsetY = (y - 0.5) * 18;
            heroContent.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        });

        hero.addEventListener('mouseleave', () => {
            heroContent.style.transform = 'translate3d(0, 0, 0)';
        });
    }
});
