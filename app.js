import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from 'cors';
import { connectDB } from "./config/mongoDbConnection.js";
import errorMiddleware from "./middlewares/error.js";
import router from "./routes/routes.js";

const app = express();
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1", router);
app.get("/", (req, res) => {
    res.send("<h1>Welcome to Resume Analyzer</h1>");
})
app.use(errorMiddleware);
export default app;