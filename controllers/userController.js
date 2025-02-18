const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const { name, rollNo, class: studentClass, backlogs, cgpa, password } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        // Update fields
        user.name = name || user.name;
        user.rollNo = rollNo || user.rollNo;
        user.class = studentClass || user.class;
        user.backlogs = backlogs || user.backlogs;
        user.cgpa = cgpa || user.cgpa;

        // If password is updated, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ message: "Profile updated successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
