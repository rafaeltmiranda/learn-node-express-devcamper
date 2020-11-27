const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];

    } else if (req.cookies.token) {
        token = req.cookies.token;

    }

    // Make sure the token exists
    if (!token) {
        return next(new ErrorResponse('Full authentication is required to access this resource', 401));
    }

    try {
        // Verify token
        const decoded = jwt.decode(token, process.env.JWT_SECRET);
        console.log(decoded);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorResponse('Full authentication is required to access this resource', 401));
        }

        next();
    } catch (err) {
        return next(new ErrorResponse('Full authentication is required to access this resource', 401));
    }
});

// Grant access by role
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role [${req.user.role}] is not authorized to access this resource`,
                    401
                )
            );
        }
        next();
    }
}