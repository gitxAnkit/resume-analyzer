# Resume-Analyzer
(Neobuild assingment)

This is a backend API for extracting and storing applicant data from pdf resume. The API utilizes **Node.js, Express, MongoDB, and Google Gemini AI** to parse resumes, extract key details and store them securely in a database.

Test this API on **[POSTMAN COLLECTION.](https://www.postman.com/warped-astronaut-754683/workspace/new-public-workspace/collection/34165850-43a9f53e-14c4-49b7-bb2e-4dbfc8b32560?action=share&creator=34165850)**
**Deployed link:** https://resume-analyzer-i448.onrender.com
## Features 🚀
- Extract text from a **PDF resume** using `pdf-text-reader`.
- Parse **structured data** (name, email, education, experience, skills, summary) using **Google Gemini AI** and store them in mongoDB database.
- Search applicants based on "name".

---
## Tech Stack 🛠️
- **Node.js** (Backend Server)
- **Express.js** (Web Framework)
- **MongoDB + Mongoose** (Database & ODM)
- **Google Generative AI** (Resume Parsing)

---
## Installation & Setup ⚙️
### 1️⃣ Clone the Repository
```sh
git clone git@github.com:gitxAnkit/resume-analyzer.git
cd resume-analyzer
```
### 2️⃣ Install Dependencies
```sh
npm install
```
### 3️⃣ Configure Environment Variables
Create a `.env` file and add:
```ini
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=5d
MONGO_URI=mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
```

---
## API Endpoints 📌
1. POST /api/v1/auth/login
2. POST /api/v1/resume/extract
3. GET  /api/v1/resume/search
4. GET  /api/v1/applicants

---
## Author ✨
[Ankit Verma](https://github.com/gitxAnkit)

---

