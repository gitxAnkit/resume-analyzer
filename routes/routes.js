import express from "express";
import { getUser, loginUser } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { extractPdf } from "../controllers/resumeControllers.js";

const router = express.Router();

router.route("/auth/login").post(loginUser);
router.route("/auth/user").get(isAuthenticated, getUser);
router.route("/resume/extract").post(extractPdf);
export default router;