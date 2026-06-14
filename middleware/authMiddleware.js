const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  try {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please login first.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next(); // Continue to next middleware/controller
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
