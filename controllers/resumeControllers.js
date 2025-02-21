import { readPdfText } from "pdf-text-reader";
import catchAsyncErrors from "../utils/catchAsyncErrors.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Applicant from "../models/applicantModel.js";
import { ErrorHandler } from "../utils/errorHandler.js";

dotenv.config();
// Helper function to extract text from pdf
const extractTextFromURL = async (url) => {
    try {
        if (!url) {
            throw new Error("No URL provided");
        }

        const pdfText = await readPdfText({ url });
        return pdfText;
    } catch (error) {
        console.error("Error extracting text from PDF:", error.message);
        throw new Error("Failed to extract text from the PDF. Please check the URL and try again.");
    }
};
// POST /resume/extract
export const extractPdf = catchAsyncErrors(async (req, res, next) => {
    const { url } = req.body;

    if (!url) {
        return next(new ErrorHandler("Pdf url is required", 400));
    }

    // Extract text from the PDF
    const pdfText = await extractTextFromURL(url);

    const jsonSchema = {
        name: "string",
        email: "string",
        education: [
            {
                degree: "string",
                branch: "string",
                institution: "string",
                year: "number"
            }
        ],
        experience: [
            {
                jobTitle: "string",
                company: "string",
                startDate: "string",
                endDate: "string"
            }
        ],
        summary: "string",
        skills: ["string"]
    };

    const prompt = `
    You are an AI that extracts structured data from resumes. Extract key details from the following resume text 
    and return ONLY a valid JSON object that matches this schema:
    
    Schema:
    ${JSON.stringify(jsonSchema, null, 2)}
    
    Instructions:
        - Return ONLY a valid JSON object matching the schema.
        - Do NOT include explanations, comments, or extra text—only return the JSON.
        - If a field is missing, set it to null instead of omitting it.
        - Ensure all date fields follow the format: YYYY-MM-DD.
        - Generate a concise 'profileSummary' field** based on the resume content.
    
    Resume Text:
    ${pdfText}
    `;


    try {
        // Initialize Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const responseText = await result.response.text();
        // console.log("Raw AI Response:", responseText);

        let resume;
        try {
            resume = JSON.parse(responseText);
        } catch (error) {
            console.error("Error parsing AI response:", error.message);
            return res.status(500).json({
                success: false,
                message: "Failed to process resume. AI response is not a valid JSON.",
            });
        }
        if (!resume.name || !resume.email) {
            return res.status(400).json({
                success: false,
                message: "Incomplete resume data. Required fields: name, email",
            });
        }
        resume.experience.forEach(exp => {
            exp.startDate = exp.startDate ? exp.startDate.split("T")[0] : null;
            exp.endDate = exp.endDate && exp.endDate !== "Present" ? exp.endDate.split("T")[0] : null;
        });

        const applicant = await Applicant.create(resume);

        return res.status(201).json({
            success: true,
            applicant,
        });

    } catch (error) {
        console.error("Error processing resume with Gemini:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to process resume using AI.",
        });
    }

});
// GET /resume/search
export const searchApplicant = catchAsyncErrors(async (req, res, next) => {
    const { name } = req.body;

    if (!name) {
        return next(new ErrorHandler("Name is required for searching", 400));
    }

    const applicant = await Applicant.find({
        name: { $regex: new RegExp(name, "i") }
    });

    if (applicant.length === 0) {
        return next(new ErrorHandler("No match found", 404));
    }

    res.status(200).json({
        success: true,
        count: applicant.length,
        applicant
    });
});
// GET /applicants
export const getApplicants = catchAsyncErrors(async (req, res, next) => {

    const applicants = await Applicant.find();
    if (applicants.length === 0) {
        return next(new ErrorHandler("No applicants found.", 404));
    }
    res.status(200).json({
        success: true,
        count: applicants.length,
        applicants
    });
});