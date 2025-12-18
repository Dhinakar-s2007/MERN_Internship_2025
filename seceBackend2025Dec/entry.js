const express = require("express");
const mdb = require("mongoose");
const Signup = require("./models/SignupSchema");
const bcrypt = require("bcrypt");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 8001;

// Load environment variables
dotenv.config();

// CORS configuration
const corsOptions = {
  origin: [
    'https://mern-intern-2025.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Enable CORS with the above options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Database connection
mdb
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connection Successful"))
  .catch((err) => console.log("MongoDB Connection Unsuccessful", err));

// Routes
app.get("/", (req, res) => {
  res.send("Server started successfully");
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    console.log(payload);
    console.log("Middleware check successful");
    req.username = payload.username;
    next();
  } catch (err) {
    console.log(err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

app.post("/signup", async (req, res) => {
  try {
    console.log("Signup request received:", req.body);
    const { email, username, password } = req.body;
    
    if (!email || !username || !password) {
      return res.status(400).json({ 
        message: "All fields are required",
        isSignup: false 
      });
    }

    const existingUser = await Signup.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already exists", 
        isSignup: false 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSignup = new Signup({
      email: email,
      username: username,
      password: hashedPassword,
    });
    
    await newSignup.save();
    console.log("User registered successfully:", { email, username });
    
    res.status(200).json({ 
      message: "Signup Successful", 
      isSignup: true 
    });
    
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      message: "Signup failed. Please try again.", 
      error: error.message,
      isSignup: false 
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);
    
    const existingUser = await Signup.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found. Please sign up first.",
        isLoggedIn: false,
      });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Incorrect password",
        isLoggedIn: false,
      });
    }

    const payload = {
      email: existingUser.email,
      username: existingUser.username
    };
    
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
    console.log("Login successful for:", email);
    
    res.status(200).json({
      message: "Login Successful",
      isLoggedIn: true,
      token: token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed. Please try again.",
      isLoggedIn: false,
    });
  }
});

// Protected routes
app.get('/getallsignup', async (req, res) => {
  try {
    const signup = await Signup.find();
    console.log("Fetched all signups");
    res.status(200).json(signup);
  } catch (error) {
    console.error("Error fetching signups:", error);
    res.status(500).json({ message: "Error fetching data" });
  }
});

app.get("/json", verifyToken, (req, res) => {
  res.json({
    College: "Sece",
    Dept: "CYS",
    StuCount: "64",
    fac: req.username
  });
});

app.get('/personal-profile', verifyToken, (req, res) => {
  res.send(`Welcome, ${req.username}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server Started Successfully on port ${PORT}`);
});