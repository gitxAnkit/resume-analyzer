import express from "express";
import { loginUser } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { extractPdf, getApplicants, searchApplicant } from "../controllers/resumeControllers.js";

const router = express.Router();

router.route("/auth/login").post(loginUser);

router.route("/resume/extract").post(isAuthenticated, extractPdf);
router.route("/resume/search").get(isAuthenticated, searchApplicant);
router.route("/applicants").get(isAuthenticated, getApplicants);

export default router;