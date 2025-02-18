const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register User

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, rollNo, studentClass, backlogs, cgpa } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: "Resume file is required and must be a PDF" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    // Get Cloudinary File URL
    const resumeLink = req.file.path; // Cloudinary auto-generates a URL

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      rollNo,
      studentClass,
      backlogs: backlogs || 0,
      cgpa: parseFloat(cgpa),
      resume: resumeLink, //  Store Cloudinary URL in DB
    });

    await newUser.save();
    res.status(201).json({ msg: "User registered successfully!" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ msg: "Registration failed. Check your inputs." });
  }
};


// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1.5h" });
        res.json({ token, user });  // ✅ Ensure token is sent to frontend
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};


// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve profile" });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, rollNo, studentClass, backlogs, cgpa } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, rollNo, studentClass, backlogs, cgpa },
            { new: true }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Profile update failed" });
    }
};