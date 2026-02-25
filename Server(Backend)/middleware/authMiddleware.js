const jwt = require("jsonwebtoken");
const User = require("../models/user");

const extractBearerToken = (req) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
        return null;
    }

    return req.headers.authorization.split(" ")[1];
};

const attachAuthenticatedUser = async (req, res) => {
    const token = extractBearerToken(req);
    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            res.status(401).json({ message: "User not found" });
            return null;
        }

        req.user = user;
        req.tokenPayload = decoded;
        return user;
    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
        return null;
    }
};

const protect = async (req, res, next) => {
    const user = await attachAuthenticatedUser(req, res);
    if (!user) {
        return;
    }

    next();
};

const checkAdmin = async (req, res, next) => {
    const user = await attachAuthenticatedUser(req, res);
    if (!user) {
        return;
    }

    if (user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized: admin access required" });
    }

    next();
};

module.exports = { protect, checkAdmin };
