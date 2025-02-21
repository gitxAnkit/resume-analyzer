// import catchAsyncErrors from "../utils/catchAsyncErrors.js";
import catchAsyncErrors from "../utils/catchAsyncErrors.js"
import { ErrorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

const AUTH = {
    username: "naval.ravikant",
    password: "05111974"
}
const generateToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "2d" });
};
// POST /auth/login
export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { username, password } = req.body;

    if (username !== AUTH.username || password !== AUTH.password) {
        return next(new ErrorHandler("Wrong username or password", 400));
    }
    const token = generateToken({ username });

    res.status(200).json({
        JWT: token,
    })
});

//get 
export const getUser = catchAsyncErrors(async (req, res, next) => {
    res.json({
        success: true,
        user: req.user
    })
})