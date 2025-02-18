const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        console.error(" No token found in request");
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        console.log(" Decoded Token:", decoded); // Debugging

        if (!decoded.id) {
            console.error(" Token does not contain user ID");
            return res.status(401).json({ error: "Invalid token structure" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error(" Invalid Token Error:", error.message);
        res.status(401).json({ error: "Invalid token" });
    }
};
