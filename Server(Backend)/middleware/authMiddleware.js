const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
    let token;

    // 1️⃣ Check if Authorization header exists
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            console.log("TOKEN RECEIVED:", token);
            console.log("SECRET USED:", process.env.JWT_SECRET);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("DECODED:", decoded);

            req.user = await User.findById(decoded.id).select("-password");

            next();

        } catch (error) {
            console.log("JWT ERROR:", error.message);
            res.status(401).json({ message: "Not authorized, token failed" });
        }

    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

module.exports = { protect };
