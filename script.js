// Variables to hold current selection

// --- 1. HAMBURGER MENU LOGIC ---
function toggleMenu() {
    let navbar = document.querySelector('.navbar');
    navbar.classList.toggle('active');
}

// Window scroll hone par menu band ho jaye (Optional but good)
window.onscroll = () => {
    document.querySelector('.navbar').classList.remove('active');
}

// --- 2. LOGIN CHECK & PROFILE UPDATE ---
// Page load hote hi check karo user login hai ya nahi
window.onload = function() {
    checkLoginState();
};

function checkLoginState() {
    let userString = localStorage.getItem("user");
    let loginBtn = document.getElementById("login-btn");
    let userProfile = document.getElementById("user-profile");

    if (userString) {
        // User logged in hai
        let user = JSON.parse(userString);
        
        // Login button chhupa do, Profile dikha do
        loginBtn.style.display = "none";
        userProfile.style.display = "flex";
        
        // Header me naam update karo
        document.getElementById("header-username").innerText = user.name.split(" ")[0]; // Sirf First Name
    } else {
        // User logged out hai
        loginBtn.style.display = "block";
        userProfile.style.display = "none";
    }
}

// --- 3. ACCOUNT MODAL FUNCTIONS ---
function openAccountModal() {
    let user = JSON.parse(localStorage.getItem("user"));
    if(!user) return;

    // Modal me data bharo
    document.getElementById("acc-name").innerText = user.name;
    document.getElementById("acc-email").innerText = user.email;
    document.getElementById("acc-phone").innerText = user.phone;
    
    // Subscription Check (Default Normal agar data nahi hai)
    let plan = user.subscription ? user.subscription : "Normal";
    document.getElementById("acc-plan").innerText = plan;

    // Modal Show karo
    document.getElementById("account-modal").style.display = "flex";
}

function closeAccountModal() {
    document.getElementById("account-modal").style.display = "none";
}

// --- 4. LOGOUT FUNCTION ---
function logout() {
    localStorage.removeItem("user"); // Browser se data hatao
    alert("Logged Out Successfully!");
    location.reload(); // Page refresh karo
}

let currentPrice = 0;
let quantity = 1;

// Function to Open Order Modal
function openOrderPage(name, price, imgSrc) {
    const modal = document.getElementById('order-modal');
    
    // Set Data
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-price').innerText = price;
    document.getElementById('modal-img').src = imgSrc;
    
    // Reset Logic
    currentPrice = price;
    quantity = 1;
    document.getElementById('quantity').value = quantity;
    updateTotal();
    
    // Show Modal
    modal.style.display = "flex";
}

// Function to Close Modal
function closeOrderPage() {
    document.getElementById('order-modal').style.display = "none";
}

// Function to Change Quantity
function changeQty(change) {
    quantity += change;
    if (quantity < 1) quantity = 1; // Minimum 1 order
    document.getElementById('quantity').value = quantity;
    updateTotal();
}

// Update Total Price
function updateTotal() {
    let total = currentPrice * quantity;
    document.getElementById('total-price').innerText = total;
}

// Buttons Logic (Simulation)
// --- CART PAGE LOGIC ---

// Agar hum Cart page par hain, to items load karo
if (window.location.pathname.includes("cart.html")) {
    loadCartItems();
}

function loadCartItems() {
    let cart = JSON.parse(localStorage.getItem("myCart")) || [];
    let container = document.getElementById("cart-items-container");
    let checkoutSection = document.getElementById("checkout-section");
    let grandTotalEl = document.getElementById("grand-total");

    if (cart.length === 0) {
        container.innerHTML = "<h3>Your cart is empty! 😢 <br> <a href='index.html' style='color:orange;'>Go back to Menu</a></h3>";
        checkoutSection.style.display = "none";
        return;
    }

    checkoutSection.style.display = "block";
    let html = "";
    let total = 0;

    // Har item ko list me dikhao
    cart.forEach((item, index) => {
        total += item.price;
        html += `
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee; padding: 10px 0;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${item.img}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">
                    <div>
                        <h4 style="margin: 0;">${item.name}</h4>
                        <small>Qty: ${item.qty}</small>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="font-weight: bold; margin: 0;">₹${item.price}</p>
                    <button onclick="removeFromCart(${index})" style="color: red; background: none; cursor: pointer; font-size: 0.8rem;">Remove</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    grandTotalEl.innerText = total;
}

// 3. Item Delete karne ka function
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("myCart"));
    cart.splice(index, 1); // Item hatao
    localStorage.setItem("myCart", JSON.stringify(cart)); // Update save karo
    loadCartItems(); // List refresh karo
    updateCartCount(); // Navbar badge update karo
}

// 4. QR Toggle for Cart Page
function toggleCartQR(show) {
    let qr = document.getElementById("cart-qr");
    qr.style.display = show ? "block" : "none";
}

// 5. FINAL ORDER PLACEMENT (Checkout)
async function placeCartOrder() {
    let cart = JSON.parse(localStorage.getItem("myCart")) || [];
    let address = document.getElementById("cart-address").value;
    let payMethod = document.querySelector('input[name="cart-pay"]:checked').value;
    let total = document.getElementById("grand-total").innerText;

    // Login Check
    let userString = localStorage.getItem("user");
    if (!userString) {
        alert("Please Login to place order!");
        window.location.href = "login.html";
        return;
    }
    let user = JSON.parse(userString);

    if (address === "") {
        alert("Please enter delivery address!");
        return;
    }

    // Items ki string banao (Ex: "2 x Egg Roll, 1 x Paneer Roll")
    let orderDetails = cart.map(item => `${item.qty} x ${item.name}`).join(", ");

    try {
        const response = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: user.name,
                items: orderDetails,
                totalPrice: total,
                address: address,
                phone: user.phone,
                paymentMethod: payMethod
            })
        });

        if (response.ok) {
            // WhatsApp Message
            let myNumber = "916299572199"; // APNA NUMBER
            let msg = `*New Bulk Order!* 🛒%0A` +
                      `Name: ${user.name}%0A` +
                      `Items: ${orderDetails}%0A` +
                      `Total: ₹${total}%0A` +
                      `Address: ${address}%0A` +
                      `Payment: ${payMethod}`;

            if(payMethod === "UPI") msg += " (Screenshot Attached)";

            // Cart Khali karo
            localStorage.removeItem("myCart");
            
            // Redirect
            window.open(`https://wa.me/${myNumber}?text=${msg}`, '_blank');
            window.location.href = "index.html"; // Home bhej do
        } else {
            alert("Order Failed!");
        }
    } catch (err) {
        console.log(err);
        alert("Server Error");
    }
}
// 🔥 IS FUNCTION KO ADD KARO (Ye item ko save karega) 🔥
function addToCart() { //add to cart ka hai 
    // 1. Modal se Data uthao
    let item = document.getElementById('modal-title').innerText;
    
    // Price text (e.g., "₹120") se sirf number nikalo
    let priceText = document.getElementById('modal-price').innerText; 
    let pricePerItem = parseInt(priceText.replace('₹', '').trim()); // Rs symbol hata kar number lo
    
    let qty = parseInt(document.getElementById('quantity').value);
    
    // Total Price calculate karo
    let totalPrice = pricePerItem * qty;
    
    // Image ka URL bhi uthao
    let imgElement = document.getElementById('modal-img');
    let img = imgElement ? imgElement.src : "https://via.placeholder.com/150"; // Fallback image

    // 2. Product Object banao
    let product = {
        name: item,
        price: totalPrice,
        qty: qty,
        img: img
    };

    // 3. Pehle se jo cart hai use nikalo, agar nahi hai to khali array []
    let cart = JSON.parse(localStorage.getItem("myCart")) || [];
    
    // Naya item list me jodo
    cart.push(product);

    // 4. Wapas save karo (Sabse Important Step)
    localStorage.setItem("myCart", JSON.stringify(cart));

    // 5. User ko batao aur Navbar update karo
    alert(qty + " x " + item + " added to Cart! 🛒");
    
    closeOrderPage(); // Modal band karo
    updateCartCount(); // Navbar badge number badhao
}
async function buyNow() {
    console.log("Buy Now Clicked");

    // 1. Data Collect Karo
    let item = document.getElementById('modal-title').innerText;
    let price = document.getElementById('total-price').innerText;
    let qty = document.getElementById('quantity').value;
    let address = document.getElementById('delivery-address').value;
    
    // Payment Method Pata Karo
    let paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

    // Login Check
    let userString = localStorage.getItem("user");
    if (!userString) {
        alert("Please Login first to order!");
        window.location.href = "login.html";
        return;
    }
    let user = JSON.parse(userString);

    // Address Validation
    if (address === "") {
        alert("Please enter delivery address!");
        return;
    }

    let orderDetails = `${qty} x ${item}`;

    // 2. Database me Save Karo
    try {
        const response = await fetch('/api/order', {  // <-- Agar Render pe ho to '/api/order', agar local to 'http://localhost:5000/api/order'
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: user.name,
                items: orderDetails,
                totalPrice: price,
                address: address,
                phone: user.phone,
                paymentMethod: paymentMethod // 🔥 Naya Data
            })
        });

        if (response.ok) {
            // 3. WhatsApp Redirect
            let myNumber = "916299572199"; // ⚠️ Apna Number Daalo
            
            let msg = `*New Order Alert!* 🌯%0A` +
                      `Name: ${user.name}%0A` +
                      `Order: ${orderDetails}%0A` +
                      `Total: ₹${price}%0A` +
                      `Address: ${address}%0A` +
                      `Payment: *${paymentMethod}*`; // 🔥 WhatsApp me dikhega

            // Agar UPI hai to user ko bolo screenshot bheje
            if(paymentMethod === "UPI / Online") {
                msg += `%0A(Customer will share payment screenshot)`;
            }

            let url = `https://wa.me/${myNumber}?text=${msg}`;
            window.open(url, '_blank');
            
            closeOrderPage(); // Modal band kar do
        } else {
            alert("Order Save Failed!");
        }

    } catch (error) {
        console.log("Error:", error);
        alert("Something went wrong!");
    }
}

// Close modal if clicked outside content
window.onclick = function(event) {
    const modal = document.getElementById('order-modal');
    if (event.target == modal) {
        closeOrderPage();
    }
}
// --- BACKEND CONNECTION CODE ---

// 1. Signup Function
async function handleSignup(event) {
    event.preventDefault(); // Page reload hone se rokega
    console.log("Signup button dabaya!");

    // IDs se data uthana
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-pass').value;

    console.log("Data:", name, email, phone);

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();
        
        if(response.ok) {
            alert("Account Ban Gaya! Ab Login karo.");
            // Login form par switch kar do
            document.getElementById("login").style.left = "50px";
            document.getElementById("register").style.left = "450px";
            document.getElementById("btn").style.left = "0";
        } else {
            alert("Error: " + data.error);
        }
    } catch (err) {
        console.log(err);
        alert("Server se connect nahi ho paya. Kya 'nodemon server.js' chal raha hai?");
    }
}

// 2. Login Function
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });

        const data = await response.json();
        
        if(data.user) {
            alert("Welcome " + data.user.name);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "index.html";
        } else {
            alert("Galat Email ya Password!");
        }
    } catch (err) {
        console.log(err);
        alert("Login nahi ho paya.");
    }
}
async function submitContactForm(event) {
    event.preventDefault(); // Page reload roko

    // Data uthao
    const name = document.querySelector('input[placeholder="Your Name"]').value;
    const email = document.querySelector('input[placeholder="Email (Optional)"]').value;
    const mobile = document.querySelector('input[placeholder="Mobile Number"]').value;
    const message = document.querySelector('textarea').value;

    // Backend ko bhejo
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, mobile, message })
        });
        
        if (response.ok) {
            alert("Message Sent Successfully!");
            
            // WhatsApp par bhejo
            let myNumber = "916299572199"; // APNA NUMBER DAALNA MAT BHOOLNA
            let waMsg = `*New Inquiry via Website* 📩%0A` +
                        `Name: ${name}%0A` +
                        `Mobile: ${mobile}%0A` +
                        `Message: ${message}`;
            
            window.open(`https://wa.me/${myNumber}?text=${waMsg}`, '_blank');
        } else {
            alert("Error sending message to server.");
        }
    } catch (error) {
        console.log(error);
        alert("Server Error! Check console.");
    }
}

// --- PAYMENT QR TOGGLE LOGIC ---
function toggleQR(show) {
    const qrBox = document.getElementById("qr-container");
    if (show) {
        qrBox.style.display = "block";
    } else {
        qrBox.style.display = "none";
    }
}

// Navbar par Cart ka number update karne ke liye
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("myCart")) || [];
    let badge = document.getElementById("cart-count");
    if(badge) {
        badge.innerText = cart.length;
    }
}

// Page load hote hi number check karo
window.addEventListener('load', updateCartCount);

// =========================================
//  TYPEWRITER EFFECT LOGIC
// =========================================

const typingElement = document                    
  .getElementById('typing-text');

// Yahan wo words likho jo tum dikhana chahte ho
const phrases = [
    "Delicious Rolls",
    "Custom Rolls",
    "Order & Enjoy",
    "Best In Town"
];

let phraseIndex = 0; // Abhi kaunsa word chal raha hai
let charIndex = 0;   // Kaunsa letter type ho raha hai
let isDeleting = false; // Kya hum delete kar rahe hain?
let typingSpeed = 150; // Type karne ki speed

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        // Delete karne ka logic: Ek letter kam karo
        typingElement.innerText = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 75; // Delete fast hona chahiye
    } else {
        // Type karne ka logic: Ek letter add karo
        typingElement.innerText = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 150; // Type normal speed me
    }

    // Agar word pura type ho gaya
    if (!isDeleting && charIndex === currentPhrase.length) {
        // Thoda wait karo (2 second) fir delete karna shuru karo
        typingSpeed = 2000; 
        isDeleting = true;
    } 
    // Agar word pura delete ho gaya
    else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        // Agle word par jao
        phraseIndex++;
        // Agar list khatam ho gayi to wapas pehle word par aa jao (Loop)
        if (phraseIndex === phrases.length) {
            phraseIndex = 0;
        }
        typingSpeed = 500; // Naya word shuru karne se pehle thoda pause
    }

    // Ye function baar-baar chalega
    setTimeout(typeEffect, typingSpeed);
}

// Jab page load ho jaye tab effect shuru karo
document.addEventListener('DOMContentLoaded', () => {
    if (typingElement) {
        typeEffect();
    }
});

