const products = [
    {
        id: "nova-pro",
        name: "Nova Pro 5G",
        category: "flagship",
        categoryLabel: "Flagship phone",
        price: 899,
        rating: "4.9",
        tag: "Best seller",
        image: "images/phone-orbit.jpg",
        alt: "A modern smartphone with a bright screen",
        color: "product-lilac"
    },
    {
        id: "orbit-ultra",
        name: "Orbit Ultra",
        category: "flagship",
        categoryLabel: "Flagship phone",
        price: 1099,
        rating: "4.9",
        tag: "Pro camera",
        image: "images/phone-flagship.jpg",
        alt: "A sleek smartphone viewed from the back",
        color: "product-peach"
    },
    {
        id: "nova",
        name: "Nova 5G",
        category: "everyday",
        categoryLabel: "Everyday phone",
        price: 599,
        rating: "4.8",
        tag: "Great all-rounder",
        image: "images/phone-nova.jpg",
        alt: "A smartphone displayed against a clean background",
        color: "product-blue"
    },
    {
        id: "pixel-lite",
        name: "Pixel Lite",
        category: "budget",
        categoryLabel: "Budget friendly",
        price: 299,
        rating: "4.7",
        tag: "Smart value",
        image: "images/phone-everyday.jpg",
        alt: "A smartphone ready for everyday use",
        color: "product-green"
    },
    {
        id: "mini-go",
        name: "Mini Go",
        category: "budget",
        categoryLabel: "Budget friendly",
        price: 199,
        rating: "4.6",
        tag: "Easy on budget",
        image: "images/phone-nova.jpg",
        alt: "Compact modern smartphone",
        color: "product-blue"
    },
    {
        id: "air-buds",
        name: "Wireless Earbuds",
        category: "accessories",
        categoryLabel: "Accessory",
        price: 79,
        rating: "4.8",
        tag: "Wireless audio",
        image: "images/earbuds.jpg",
        alt: "Wireless earbuds for listening on the go",
        color: "product-peach"
    },
    {
        id: "studio-headphones",
        name: "Studio Headphones",
        category: "accessories",
        categoryLabel: "Accessory",
        price: 89,
        rating: "4.7",
        tag: "Immersive sound",
        image: "images/accessories.jpg",
        alt: "Wireless headphones",
        color: "product-lilac"
    }
];

const cartStorageKey = "pocketTechCart";
const ordersStorageKey = "pocketTechOrders";
let cart = JSON.parse(localStorage.getItem(cartStorageKey) || "{}");
let activeCategory = "all";

function formatPrice(price) {
    return `₱${price.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function getCartQuantity() {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}

function getCartEntries() {
    return products
        .filter((product) => Number.isInteger(cart[product.id]) && cart[product.id] > 0)
        .map((product) => ({ ...product, quantity: cart[product.id] }));
}

function getCartSubtotal(entries = getCartEntries()) {
    return entries.reduce((total, product) => total + product.price * product.quantity, 0);
}

function renderCartCount() {
    document.querySelectorAll("[data-cart-count]").forEach((count) => {
        count.textContent = String(getCartQuantity());
    });
}

function productCard(product) {
    return `<div class="col-sm-6 col-lg-3">
        <article class="product-card">
            <div class="product-image ${product.color}">
                <span class="product-tag">${product.tag}</span>
                <img src="${product.image}" alt="${product.alt}" loading="lazy">
                <button class="quick-add" type="button" data-add-product="${product.id}" aria-label="Add ${product.name} to your cart">+</button>
            </div>
            <div class="product-info">
                <div class="product-type">${product.categoryLabel}</div>
                <h3>${product.name}</h3>
                <div class="product-meta"><span>${formatPrice(product.price)}</span><span class="product-rating">★ ${product.rating}</span></div>
            </div>
        </article>
    </div>`;
}

function renderProducts() {
    const grid = document.querySelector("[data-product-grid]");
    if (!grid) return;

    const query = (document.querySelector("[data-product-search]")?.value || "").trim().toLowerCase();
    const matches = products.filter((product) => {
        const matchesCategory = activeCategory === "all" || product.category === activeCategory;
        const matchesSearch = `${product.name} ${product.categoryLabel} ${product.tag}`.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });
    const limit = Number(grid.dataset.limit) || matches.length;
    const shownProducts = matches.slice(0, limit);

    grid.innerHTML = shownProducts.map(productCard).join("");
    const status = document.querySelector("[data-catalog-status]");
    if (status) status.textContent = `Showing ${shownProducts.length} of ${matches.length} ${matches.length === 1 ? "product" : "products"}.`;
    const emptyState = document.querySelector("[data-empty-state]");
    if (emptyState) emptyState.classList.toggle("d-none", shownProducts.length > 0);
}

function renderCart() {
    const cartItems = document.querySelector("[data-cart-items]");
    renderCartCount();
    if (!cartItems) return;

    const entries = getCartEntries();
    cartItems.innerHTML = entries.map((product) => `
        <article class="cart-item">
            <img src="${product.image}" alt="${product.alt}">
            <div class="cart-item-info"><h3>${product.name}</h3><span>${formatPrice(product.price)} each</span></div>
            <div class="cart-quantity" aria-label="Quantity controls for ${product.name}">
                <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Decrease ${product.name} quantity">−</button>
                <span>${product.quantity}</span>
                <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Increase ${product.name} quantity">+</button>
            </div>
            <strong class="cart-line-total">${formatPrice(product.price * product.quantity)}</strong>
            <button class="cart-remove" type="button" data-cart-action="remove" data-product-id="${product.id}">Remove</button>
        </article>`).join("");

    const isEmpty = entries.length === 0;
    document.querySelector("[data-cart-empty]")?.classList.toggle("d-none", !isEmpty);
    document.querySelector("[data-cart-summary]")?.classList.toggle("d-none", isEmpty);

    const subtotal = getCartSubtotal(entries);
    const subtotalElement = document.querySelector("[data-cart-subtotal]");
    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
}

function showCartToast(productName) {
    const toastElement = document.querySelector("[data-cart-toast]");
    if (!toastElement || !window.bootstrap) return;
    document.querySelector("[data-cart-toast-message]").textContent = `${productName} added to your cart.`;
    bootstrap.Toast.getOrCreateInstance(toastElement).show();
}

document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-product]");
    if (addButton) {
        const product = products.find((item) => item.id === addButton.dataset.addProduct);
        if (!product) return;
        cart[product.id] = (cart[product.id] || 0) + 1;
        saveCart();
        renderCart();
        showCartToast(product.name);
        return;
    }

    const cartButton = event.target.closest("[data-cart-action]");
    if (!cartButton) return;
    const productId = cartButton.dataset.productId;
    if (cartButton.dataset.cartAction === "remove" || (cartButton.dataset.cartAction === "decrease" && cart[productId] <= 1)) {
        delete cart[productId];
    } else if (cartButton.dataset.cartAction === "decrease") {
        cart[productId] -= 1;
    } else if (cartButton.dataset.cartAction === "increase") {
        cart[productId] = (cart[productId] || 0) + 1;
    }
    saveCart();
    renderCart();
});

document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        document.querySelectorAll("[data-category]").forEach((filter) => {
            const isActive = filter === button;
            filter.classList.toggle("active", isActive);
            filter.setAttribute("aria-pressed", String(isActive));
        });
        renderProducts();
    });
});

document.querySelector("[data-product-search]")?.addEventListener("input", renderProducts);

document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        form.nextElementSibling.textContent = "Thanks for signing up! Keep an eye on your inbox.";
        form.reset();
    });
});

document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    document.querySelector("[data-contact-feedback]").textContent = "Thanks for reaching out! This demo form isn't connected to email yet. You can contact us at hello@pockettech.example.";
    event.currentTarget.reset();
});

const checkoutModalElement = document.querySelector("#checkoutModal");
const checkoutForm = document.querySelector("[data-checkout-form]");
const checkoutModal = checkoutModalElement && window.bootstrap
    ? window.bootstrap.Modal.getOrCreateInstance(checkoutModalElement)
    : null;

function renderCheckoutSummary(entries) {
    const items = document.querySelector("[data-checkout-items]");
    const total = document.querySelector("[data-checkout-total]");
    if (!items || !total) return;

    items.innerHTML = entries.map((product) => `
        <div class="checkout-order-item">
            <span>${product.name} <small>× ${product.quantity}</small></span>
            <strong>${formatPrice(product.price * product.quantity)}</strong>
        </div>`).join("");
    total.textContent = formatPrice(getCartSubtotal(entries));
}

document.querySelector("[data-checkout]")?.addEventListener("click", () => {
    const entries = getCartEntries();
    const error = document.querySelector("[data-checkout-error]");
    if (!entries.length) {
        if (error) error.textContent = "Your cart is empty. Add an item before checkout.";
        return;
    }
    if (!checkoutModal) {
        if (error) error.textContent = "Checkout could not open. Please reload the page and try again.";
        return;
    }

    checkoutForm.reset();
    checkoutForm.classList.remove("d-none");
    document.querySelector("[data-checkout-success]").classList.add("d-none");
    error.textContent = "";
    renderCheckoutSummary(entries);
    checkoutModal.show();
});

checkoutForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!checkoutForm.reportValidity()) return;

    const entries = getCartEntries();
    const error = document.querySelector("[data-checkout-error]");
    if (!entries.length) {
        error.textContent = "Your cart is empty. Add an item before placing an order.";
        return;
    }

    const formData = new FormData(checkoutForm);
    const customer = {
        name: String(formData.get("name")).trim(),
        email: String(formData.get("email")).trim(),
        phone: String(formData.get("phone")).trim(),
        address: String(formData.get("address")).trim(),
        city: String(formData.get("city")).trim(),
        postalCode: String(formData.get("postalCode")).trim()
    };
    if (Object.values(customer).some((value) => !value)) {
        error.textContent = "Please complete every delivery field.";
        return;
    }

    const orderNumber = `PT-${Date.now().toString(36).toUpperCase()}`;
    const order = {
        orderNumber,
        createdAt: new Date().toISOString(),
        customer,
        paymentMethod: "Cash on delivery",
        items: entries.map(({ id, name, price, quantity }) => ({
            id,
            name,
            price,
            quantity,
            lineTotal: price * quantity
        })),
        total: getCartSubtotal(entries)
    };

    let savedOrders;
    try {
        savedOrders = JSON.parse(localStorage.getItem(ordersStorageKey) || "[]");
    } catch {
        error.textContent = "Saved orders could not be read in this browser. Your cart is unchanged.";
        return;
    }
    if (!Array.isArray(savedOrders)) {
        error.textContent = "Saved order data is invalid. Your cart is unchanged.";
        return;
    }

    try {
        localStorage.setItem(ordersStorageKey, JSON.stringify([...savedOrders, order]));
    } catch {
        error.textContent = "This browser could not save your order. Check available storage and try again; your cart is unchanged.";
        return;
    }

    try {
        localStorage.setItem(cartStorageKey, "{}");
    } catch {
        error.textContent = `Order ${orderNumber} was saved, but the cart could not be cleared. Check your saved orders before retrying.`;
        return;
    }

    cart = {};
    renderCart();
    checkoutForm.classList.add("d-none");
    document.querySelector("[data-order-number]").textContent = orderNumber;
    document.querySelector("[data-checkout-success]").classList.remove("d-none");
});

renderProducts();
renderCart();
