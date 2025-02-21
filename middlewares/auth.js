import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/errorHandler.js";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

export const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    // console.log("secret key: ", SECRET_KEY);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ErrorHandler("Unauthorized: No token provided", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return next(new ErrorHandler("Unauthorized: Token missing", 401));
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return next(new ErrorHandler("Forbidden: Invalid token", 403));
        }

        req.user = user;
        next();
    });
};



