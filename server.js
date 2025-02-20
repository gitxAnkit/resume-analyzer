import express from "express";
import app from "./app.js";


const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server started at PORT${PORT} access at http://localhost:${PORT}`);
});
