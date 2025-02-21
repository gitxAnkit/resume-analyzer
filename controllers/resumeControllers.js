import { readPdfText } from "pdf-text-reader";
import catchAsyncErrors from "../utils/catchAsyncErrors.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Applicant from "../models/applicantModel.js";

dotenv.config();

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

export const extractPdf = catchAsyncErrors(async (req, res, next) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            success: false,
            message: "PDF URL is required",
        });
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
        console.log("Raw AI Response:", responseText);

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
        // Ensure required fields are present
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

        // Save to MongoDB
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
