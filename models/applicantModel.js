import mongoose from "mongoose";
import validator from "validator";

const applicantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Applicant name is required"],
        trim: true,
    },
    email: {
        type: String,
        validate: {
            validator: validator.isEmail,
            message: "Invalid email format",
        },
    },
    education: {
        type: [
            {
                degree: { type: String, trim: true },
                branch: { type: String, trim: true },
                institution: { type: String, trim: true },
                year: { type: Number, min: 1900, max: new Date().getFullYear() },
            },
        ],
        default: [],
    },
    experience: {
        type: [
            {
                jobTitle: { type: String, trim: true },
                company: { type: String, trim: true },
                startDate: { type: Date },
                endDate: { type: Date },
            },
        ],
        default: [],
    },
    summary: {
        type: String,
        required: [true, "Profile summary is required"],
        trim: true,
    },
    skills: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

const Applicant = mongoose.model("Applicant", applicantSchema);
export default Applicant;
