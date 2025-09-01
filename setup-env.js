import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/interview-prep-ai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
PORT=8000

# File Upload Configuration
MAX_FILE_SIZE=5242880
`;

const envPath = path.join(__dirname, ".env");

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file created successfully!");
  console.log("📝 Please update the following variables:");
  console.log(
    "   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey"
  );
  console.log("   - JWT_SECRET: Change to a secure random string");
  console.log("   - MONGODB_URI: Update if using a different database");
} else {
  console.log("⚠️  .env file already exists. Skipping creation.");
}

console.log("\n🚀 To start the backend server:");
console.log("   npm run dev");
