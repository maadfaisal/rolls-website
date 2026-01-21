// server.js - FINAL RENDER READY CODE
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // 🔥 1. YE IMPORT ADD KIYA HAI

const app = express();

// 🔥 2. PORT UPDATE (Render apna port dega, nahi to 5000 use karega)
const PORT = process.env.PORT || 5000; 

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 🔥 3. FRONTEND FILES SERVE KARNA (Bahut Zaroori)
// Ye line batati hai ki HTML/CSS/Images yahin rakhi hain
app.use(express.static(__dirname));

// 🔥 4. HOME ROUTE (Jab koi website khol to index.html dikhe)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// --- DATABASE CONNECTION ---
const MONGO_URI = "mongodb+srv://faisalmaad:faisal123@cluster0.ggs2toi.mongodb.net/rollsDB?appName=Cluster0";

mongoose.connect(MONGO_URI) 
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error: ", err));


// --- SCHEMAS (DATA MODELS) ---

const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    message: String,
    date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', ContactSchema);

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    subscription: { type: String, default: "Normal" }
});
const User = mongoose.model('User', UserSchema);

const OrderSchema = new mongoose.Schema({
    customerName: String,
    items: String, 
    totalPrice: Number,
    address: String,
    phone: Number,
    paymentMethod: String, // 🔥 YE WAPAS ADD KIYA (Kyunki tumne Cart me Payment lagaya hai)
    date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);


// --- API ROUTES ---

// 1. Contact Route
app.post('/api/contact', async (req, res) => {
    const { name, email, mobile, message } = req.body;
    try {
        const newContact = new Contact({ name, email, mobile, message });
        await newContact.save();
        res.json({ success: true, message: "Message Saved!" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Save Failed" });
    }
});

// 2. Signup Route
app.post('/api/signup', async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
        const newUser = new User({ name, email, phone, password });
        await newUser.save();
        res.json({ message: "Account Created Successfully!" });
    } catch (err) {
        res.status(400).json({ error: "Email already exists or Error occured" });
    }
});

// 3. Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (user) {
            res.json({ message: "Login Success", user: user });
        } else {
            res.status(400).json({ error: "Invalid Credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 4. Place Order Route
app.post('/api/order', async (req, res) => {
    // Payment Method bhi receive kar rahe hain ab
    const { customerName, items, totalPrice, address, phone, paymentMethod } = req.body;
    try {
        const newOrder = new Order({ customerName, items, totalPrice, address, phone, paymentMethod });
        await newOrder.save();
        res.json({ message: "Order Saved to Database!" });
    } catch (err) {
        res.status(500).json({ error: "Order Failed" });
    }
});

// Server Start
app.listen(PORT, () => {
    console.log(`🚀 Server running on Port ${PORT}`);
});