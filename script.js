// Ce script.js est partagé par toutes les pages (index.html, shop.html, about.html, contact.html, cart.html, checkout.html)

document.addEventListener('DOMContentLoaded', () => {
    // --- Gestion du Header Sticky ---
    const header = document.getElementById('main-header');
    // let lastScrollY = window.scrollY; // Commenté car non utilisé pour le moment

    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }

        // Optionnel: masquer le header en défilant vers le bas, afficher en défilant vers le haut
        // if (window.scrollY > lastScrollY && window.scrollY > 200) {
        //     header.style.transform = 'translateY(-100%)';
        // } else {
        //     header.style.transform = 'translateY(0)';
        // }
        // lastScrollY = window.scrollY;
    });

    // --- Gestion du Menu Burger Mobile ---
    const burgerButton = document.getElementById('burger-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu');
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');

    // Ouvre le menu mobile
    burgerButton.addEventListener('click', () => {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden'; // Empêche le défilement du corps
    });

    // Ferme le menu mobile
    closeMobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = ''; // Rétablit le défilement du corps
    });

    // Ferme le menu mobile quand un lien est cliqué
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // --- Défilement fluide vers les sections (pour les liens d'ancrage) ---
    // S'assure que le défilement fluide fonctionne même si on vient d'une autre page
    document.querySelectorAll('a[href^="index.html#"], a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Si le lien est une ancre sur la page actuelle ou vers index.html
            if (href.startsWith('#') || (href.startsWith('index.html#') && window.location.pathname.endsWith('index.html'))) {
                e.preventDefault(); // Empêche le comportement de saut par défaut

                const targetId = href.split('#')[1]; // Récupère l'ID de la cible
                const targetElement = document.getElementById(targetId);
                const headerOffset = header.offsetHeight; // Hauteur du header sticky
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth' // Active le défilement fluide
                });
            }
            // Pour les liens vers d'autres pages (shop.html, about.html, contact.html), le comportement par default est conservé
        });
    });


    // --- Animations au Scroll (Fade-in) ---
    // Cette logique ne s'applique qu'aux éléments avec la classe 'fade-in'
    const faders = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.3, // Déclenche l'animation quand 30% de l'élément est visible
        rootMargin: "0px 0px -100px 0px" // Permet de déclencher un peu avant d'atteindre le bas de l'écran
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return; // Si l'élément n'est pas visible, ne fait rien
            } else {
                entry.target.classList.add('active'); // Ajoute la classe 'active' pour l'animation
                appearOnScroll.unobserve(entry.target); // Arrête d'observer une fois l'animation déclenchée
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader); // Commence à observer chaque élément .fade-in
    });

    // --- Slider Hero (uniquement sur index.html) ---
    const sliderItems = document.querySelectorAll('.slider-item');
    if (sliderItems.length > 0) { // S'assure que le slider n'est initialisé que sur la page d'accueil
        const dots = document.querySelectorAll('.dot');
        const sliderContainer = document.querySelector('.slider-container');
        let currentSlide = 0;
        let slideInterval;

        // Fonction pour afficher une slide spécifique
        function showSlide(index) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
            sliderContainer.style.transform = `translateX(-${index * 100}%)`;
            currentSlide = index;
        }

        // Fonction pour passer à la slide suivante
        function nextSlide() {
            currentSlide = (currentSlide + 1) % sliderItems.length;
            showSlide(currentSlide);
        }

        // Initialise le slider et démarre l'autoplay
        function startSlider() {
            showSlide(currentSlide);
            slideInterval = setInterval(nextSlide, 5000);
        }

        // Gère le clic sur les points de navigation du slider
        dots.forEach(dot => {
            dot.addEventListener('click', function() {
                clearInterval(slideInterval);
                const slideIndex = parseInt(this.dataset.slide);
                showSlide(slideIndex);
                startSlider();
            });
        });

        // Démarre le slider au chargement de la page
        startSlider();
    }


    // --- Système de Panier (simple avec localStorage) ---
    const cartCountElement = document.getElementById('cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    let cart = JSON.parse(localStorage.getItem('urbanwearCart')) || []; // Charge le panier depuis localStorage

    // Met à jour le nombre d'articles dans l'icône du panier
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    // Ajoute un produit au panier
    function addProductToCart(productId, productName, productPrice) {
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }
        localStorage.setItem('urbanwearCart', JSON.stringify(cart)); // Sauvegarde dans localStorage
        updateCartCount(); // Met à jour l'affichage du nombre d'articles
        // Remplacer alert() par un message box custom pour une meilleure UX
        const message = `${productName} a été ajouté au panier !`;
        displayCustomMessage(message, 'success');
    }

    // Attache les écouteurs d'événements aux boutons "Ajouter au panier"
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.productPrice);
            addProductToCart(productId, productName, productPrice);
        });
    });

    // Redirige vers la page du panier quand le bouton panier est cliqué
    const cartButtonInHeader = document.getElementById('cart-button');
    if (cartButtonInHeader) {
        cartButtonInHeader.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    // Initialise le compteur du panier au chargement de la page
    updateCartCount();

    // --- Fonction pour afficher un message personnalisé (remplace alert()) ---
    function displayCustomMessage(message, type = 'info') {
        let messageBox = document.getElementById('custom-message-box');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.id = 'custom-message-box';
            messageBox.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-50px); /* Initialement décalé vers le haut */
                padding: 15px 25px;
                border-radius: 8px;
                color: var(--color-white-pure);
                font-weight: 600;
                z-index: 2000;
                opacity: 0;
                transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 10px;
            `;
            document.body.appendChild(messageBox);
        }

        messageBox.textContent = ''; // Efface le contenu précédent
        let iconHtml = '';
        let bgColor = '';

        if (type === 'success') {
            bgColor = '#28a745'; // Vert pour succès
            iconHtml = '<i class="fas fa-check-circle"></i>';
        } else if (type === 'error') {
            bgColor = '#dc3545'; // Rouge pour erreur
            iconHtml = '<i class="fas fa-times-circle"></i>';
        } else {
            bgColor = '#007bff'; // Bleu pour info
            iconHtml = '<i class="fas fa-info-circle"></i>';
        }

        messageBox.style.backgroundColor = bgColor;
        messageBox.innerHTML = iconHtml + message;

        // Affiche le message
        messageBox.style.opacity = '1';
        messageBox.style.transform = 'translateX(-50%) translateY(0)';

        // Cache le message après 3 secondes
        setTimeout(() => {
            messageBox.style.opacity = '0';
            messageBox.style.transform = 'translateX(-50%) translateY(-20px)';
            // Supprime du DOM après la transition pour nettoyer
            setTimeout(() => {
                if (messageBox.parentNode) {
                    messageBox.parentNode.removeChild(messageBox);
                }
            }, 500);
        }, 3000);
    }

    // --- Gestion du formulaire Newsletter (simple validation) ---
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Empêche l'envoi du formulaire par défaut
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;

            if (email && email.includes('@') && email.includes('.')) {
                displayCustomMessage(`Merci de vous être abonné avec l'adresse : ${email} !`, 'success');
                emailInput.value = ''; // Réinitialise le champ
            } else {
                displayCustomMessage('Veuillez entrer une adresse email valide.', 'error');
            }
        });
    }

    // --- Logique spécifique à la page Boutique (shop.html) ---
    // Gestion des filtres de catégorie
    const filterLinks = document.querySelectorAll('.filter-link');
    const productCards = document.querySelectorAll('.product-card');

    filterLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            filterLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const category = this.dataset.category; // Récupère la catégorie du lien

            productCards.forEach(card => {
                const cardCategories = card.dataset.category.split(' '); // Récupère toutes les catégories de la carte
                if (category === 'all' || cardCategories.includes(category)) {
                    card.style.display = 'flex'; // Affiche la carte
                } else {
                    card.style.display = 'none'; // Masque la carte
                }
            });
        });
    });

    // Gestion du slider de prix
    const priceSlider = document.getElementById('price-slider');
    const priceValueSpan = document.getElementById('price-value');

    if (priceSlider && priceValueSpan) {
        priceValueSpan.textContent = priceSlider.value + '€'; // Initialise la valeur affichée

        priceSlider.addEventListener('input', function() {
            priceValueSpan.textContent = this.value + '€';
            // Ici, vous ajouteriez la logique de filtrage des produits par prix
            // Pour cet exemple, nous ne filtrons que par catégorie.
        });
    }

    // --- Logique spécifique à la page Contact (contact.html) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Empêche l'envoi du formulaire par défaut

            // Récupérer les valeurs des champs
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Simple validation
            if (name && email && message && email.includes('@') && email.includes('.')) {
                // Ici, vous enverriez normalement les données à un serveur (ex: via fetch API)
                // Pour cet exemple, nous affichons juste un message de succès.
                displayCustomMessage(`Merci ${name}, votre message a été envoyé ! Nous vous répondrons bientôt.`, 'success');
                contactForm.reset(); // Réinitialise le formulaire
            } else {
                displayCustomMessage('Veuillez remplir tous les champs obligatoires et entrer une adresse email valide.', 'error');
            }
        });
    }

    // --- Logique spécifique à la page Panier (cart.html) ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutButton = document.getElementById('checkout-button'); // Maintenant un lien <a>

    function renderCartItems() {
        if (!cartItemsContainer) return; // S'assure que nous sommes sur la page du panier

        cartItemsContainer.innerHTML = ''; // Vide le conteneur actuel
        let totalPrice = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block'; // Affiche le message "panier vide"
            checkoutButton.classList.add('disabled'); // Désactive visuellement le bouton commander
            checkoutButton.style.pointerEvents = 'none'; // Empêche le clic
            checkoutButton.href = '#'; // Retire le lien valide
        } else {
            emptyCartMessage.style.display = 'none'; // Cache le message "panier vide"
            checkoutButton.classList.remove('disabled'); // Active visuellement le bouton commander
            checkoutButton.style.pointerEvents = 'auto'; // Permet le clic
            checkoutButton.href = 'checkout.html'; // Remet le lien valide

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;

                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                    <img src="https://placehold.co/80x80/EAEAEA/0D0D0D?text=${item.name.replace(/\s/g, '+')}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>${item.price.toFixed(2)} € / pièce</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="decrease-quantity" data-product-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity}" min="1" data-product-id="${item.id}">
                        <button class="increase-quantity" data-product-id="${item.id}">+</button>
                    </div>
                    <p class="cart-item-price">${itemTotal.toFixed(2)} €</p>
                    <button class="remove-item-btn" data-product-id="${item.id}"><i class="fas fa-trash"></i></button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }
        cartTotalPriceElement.textContent = totalPrice.toFixed(2) + ' €';

        // Attache les écouteurs d'événements pour les boutons du panier
        attachCartEventListeners();
    }

    function attachCartEventListeners() {
        // Boutons de diminution de quantité
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.onclick = (e) => {
                const productId = e.target.dataset.productId;
                const item = cart.find(i => i.id == productId);
                if (item && item.quantity > 1) {
                    item.quantity--;
                    localStorage.setItem('urbanwearCart', JSON.stringify(cart));
                    renderCartItems(); // Re-render pour mise à jour visuelle
                    updateCartCount();
                }
            };
        });

        // Boutons d'augmentation de quantité
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.onclick = (e) => {
                const productId = e.target.dataset.productId;
                const item = cart.find(i => i.id == productId);
                if (item) {
                    item.quantity++;
                    localStorage.setItem('urbanwearCart', JSON.stringify(cart));
                    renderCartItems(); // Re-render pour mise à jour visuelle
                    updateCartCount();
                }
            };
        });

        // Champs de quantité (input)
        document.querySelectorAll('.cart-item-quantity input').forEach(input => {
            input.onchange = (e) => {
                const productId = e.target.dataset.productId;
                const newQuantity = parseInt(e.target.value);
                const item = cart.find(i => i.id == productId);
                if (item && !isNaN(newQuantity) && newQuantity >= 1) {
                    item.quantity = newQuantity;
                    localStorage.setItem('urbanwearCart', JSON.stringify(cart));
                    renderCartItems(); // Re-render pour mise à jour visuelle
                    updateCartCount();
                } else {
                    // Revert to old quantity if input is invalid
                    e.target.value = item ? item.quantity : 1;
                }
            };
        });

        // Boutons de suppression d'article
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.onclick = (e) => {
                const productId = e.target.dataset.productId;
                cart = cart.filter(item => item.id != productId);
                localStorage.setItem('urbanwearCart', JSON.stringify(cart));
                renderCartItems(); // Re-render pour mise à jour visuelle
                updateCartCount();
                displayCustomMessage('Article supprimé du panier.', 'info');
            };
        });
    }

    // Gère le bouton "Passer la commande" sur cart.html (maintenant un lien)
    if (checkoutButton && window.location.pathname.endsWith('cart.html')) {
        // Le clic est géré par le href du lien, mais on peut ajouter une validation si besoin
        checkoutButton.addEventListener('click', (e) => {
            if (cart.length === 0) {
                e.preventDefault(); // Empêche la redirection si le panier est vide
                displayCustomMessage('Votre panier est vide. Ajoutez des articles avant de commander.', 'error');
            }
        });
    }

    // Appelle renderCartItems() si nous sommes sur la page du panier
    if (window.location.pathname.endsWith('cart.html')) {
        renderCartItems();
    }

    // --- Logique spécifique à la page Checkout (checkout.html) ---
    const checkoutCartItemsContainer = document.getElementById('checkout-cart-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const placeOrderButton = document.getElementById('place-order-button');
    const checkoutEmptyCartMessage = document.getElementById('checkout-empty-cart-message');
    const shippingForm = document.getElementById('shipping-form');

    function renderCheckoutSummary() {
        if (!checkoutCartItemsContainer) return; // S'assure que nous sommes sur la page de commande

        checkoutCartItemsContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            checkoutEmptyCartMessage.style.display = 'block';
            placeOrderButton.disabled = true;
            placeOrderButton.classList.add('disabled');
            shippingForm.style.pointerEvents = 'none'; // Désactive le formulaire si panier vide
            shippingForm.style.opacity = '0.5';
        } else {
            checkoutEmptyCartMessage.style.display = 'none';
            placeOrderButton.disabled = false;
            placeOrderButton.classList.remove('disabled');
            shippingForm.style.pointerEvents = 'auto';
            shippingForm.style.opacity = '1';

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                const checkoutItemElement = document.createElement('div');
                checkoutItemElement.classList.add('checkout-cart-item');
                checkoutItemElement.innerHTML = `
                    <img src="https://placehold.co/50x50/EAEAEA/0D0D0D?text=${item.name.replace(/\s/g, '+')}" alt="${item.name}">
                    <div class="checkout-item-details">
                        <span>${item.name}</span>
                        <small>Qté: ${item.quantity}</small>
                    </div>
                    <span class="checkout-item-price">${itemTotal.toFixed(2)} €</span>
                    <button class="remove-item-btn-checkout" data-product-id="${item.id}"><i class="fas fa-trash"></i></button>
                `;
                checkoutCartItemsContainer.appendChild(checkoutItemElement);
            });
        }

        summarySubtotal.textContent = subtotal.toFixed(2) + ' €';
        // Pour cet exemple, la livraison est gratuite, donc le total est le sous-total
        summaryTotal.textContent = subtotal.toFixed(2) + ' €';

        // Attache les écouteurs d'événements pour les boutons de suppression sur la page de commande
        document.querySelectorAll('.remove-item-btn-checkout').forEach(button => {
            button.onclick = (e) => {
                const productId = e.target.dataset.productId;
                cart = cart.filter(item => item.id != productId);
                localStorage.setItem('urbanwearCart', JSON.stringify(cart));
                updateCartCount(); // Met à jour le compteur dans le header
                renderCheckoutSummary(); // Re-render le résumé sur la page de commande
                displayCustomMessage('Article supprimé du panier.', 'info');
            };
        });
    }

    // Gère le bouton "Confirmer la Commande" sur checkout.html
    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', (e) => {
            e.preventDefault(); // Empêche l'envoi du formulaire par défaut

            // Simple validation des champs du formulaire de livraison
            const fullName = document.getElementById('full-name').value;
            const address = document.getElementById('address').value;
            const city = document.getElementById('city').value;
            const postalCode = document.getElementById('postal-code').value;
            const country = document.getElementById('country').value;
            const phone = document.getElementById('phone').value;
            const cardNumber = document.getElementById('card-number').value;
            const expiryDate = document.getElementById('expiry-date').value;
            const cvv = document.getElementById('cvv').value;

            if (!fullName || !address || !city || !postalCode || !country || !phone || !cardNumber || !expiryDate || !cvv) {
                displayCustomMessage('Veuillez remplir toutes les informations de livraison et de paiement.', 'error');
                return;
            }

            if (cart.length > 0) {
                displayCustomMessage('Commande confirmée ! Merci pour votre achat.', 'success');
                // Ici, vous enverriez les données au serveur pour le traitement réel
                // Pour l'exemple, nous vidons le panier après une "commande" simulée.
                cart = [];
                localStorage.setItem('urbanwearCart', JSON.stringify(cart));
                updateCartCount(); // Met à jour le compteur dans le header
                renderCheckoutSummary(); // Met à jour le résumé sur la page de commande
                shippingForm.reset(); // Réinitialise le formulaire
            } else {
                displayCustomMessage('Votre panier est vide. Impossible de passer commande.', 'error');
            }
        });
    }

    // Appelle renderCheckoutSummary() si nous sommes sur la page de commande
    if (window.location.pathname.endsWith('checkout.html')) {
        renderCheckoutSummary();
    }

});
