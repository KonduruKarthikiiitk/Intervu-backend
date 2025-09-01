import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  conceptExplainPrompt,
  questionAnswerPrompt,
} from "../utils/prompts.js";
import { jsonrepair } from "jsonrepair";

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to add timeout to promises
const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    ),
  ]);
};

// Enhanced JSON parsing with better repair logic
const parseAIResponse = (rawText) => {
  let cleanedText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  // Try to parse the JSON directly first
  try {
    const result = JSON.parse(cleanedText);

    return result;
  } catch (parseError) {
    try {
      // Try jsonrepair library
      const repairedJson = jsonrepair(cleanedText);

      return JSON.parse(repairedJson);
    } catch (repairError) {
      // Manual JSON repair attempts
      try {
        // Try to fix common issues
        let fixedText = cleanedText;

        // Fix missing quotes around property names
        fixedText = fixedText.replace(/(\w+):/g, '"$1":');

        // Fix single quotes to double quotes
        fixedText = fixedText.replace(/'/g, '"');

        // Fix trailing commas
        fixedText = fixedText.replace(/,(\s*[}\]])/g, "$1");

        // Try parsing the fixed text
        const result = JSON.parse(fixedText);
        return result;
      } catch (manualFixError) {
        console.error("All JSON parsing attempts failed");
        console.error("Original text:", rawText);
        console.error("Cleaned text:", cleanedText);
        console.error("Manual fix error:", manualFixError.message);

        // Try to extract JSON-like content as a last resort
        try {
          // Look for JSON-like patterns in the text
          const jsonMatch = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (extractError) {
          console.error("JSON extraction failed:", extractError.message);
        }

        throw new Error("Unable to parse AI response as JSON");
      }
    }
  }
};

const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    // Validate required fields
    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({
        message:
          "All fields are required: role, experience, topicsToFocus, numberOfQuestions",
      });
    }

    // Validate numberOfQuestions is a number
    const numQuestions = parseInt(numberOfQuestions);
    if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 20) {
      return res.status(400).json({
        message: "numberOfQuestions must be a number between 1 and 20",
      });
    }

    // Check if API key is set
    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === "your-gemini-api-key-here"
    ) {
      return res.status(500).json({
        message: "AI service configuration error",
        error: "Please set a valid GEMINI_API_KEY in your .env file",
      });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numQuestions
    );

    // Use the correct Gemini API method with timeout
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generatePromise = model.generateContent(prompt);
    const result = await withTimeout(generatePromise, 25000); // 25 second timeout
    const response = await result.response;
    const rawText = response.text();

    // Parse the response using enhanced parsing
    let data;
    try {
      data = parseAIResponse(rawText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return res.status(500).json({
        message: "Failed to parse AI response",
        error: parseError.message,
        raw: rawText.substring(0, 500), // Send first 500 chars for debugging
      });
    }

    // Validate the response structure
    if (!Array.isArray(data)) {
      return res.status(500).json({
        message: "AI response is not in expected format",
        error: "Expected array of questions",
        raw: rawText.substring(0, 500),
      });
    }

    // Validate each question has required fields
    const validQuestions = data.filter(
      (item) =>
        item &&
        typeof item.question === "string" &&
        typeof item.answer === "string"
    );

    if (validQuestions.length === 0) {
      return res.status(500).json({
        message: "No valid questions found in AI response",
        error: "Questions must have 'question' and 'answer' fields",
        raw: rawText.substring(0, 500),
      });
    }

    res.status(200).json({
      questions: validQuestions,
      count: validQuestions.length,
    });
  } catch (error) {
    console.error("Error in generateInterviewQuestions:", error);

    // Handle timeout specifically
    if (error.message === "Request timeout") {
      return res.status(408).json({
        message: "Request timeout",
        error: "AI service took too long to respond. Please try again.",
      });
    }

    // Check if it's an API key error
    if (error.message && error.message.includes("API key")) {
      return res.status(500).json({
        message: "AI service configuration error",
        error: "Invalid or missing API key",
      });
    }

    // Check if it's a network error
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return res.status(500).json({
        message: "AI service unavailable",
        error: "Unable to connect to AI service",
      });
    }

    return res.status(500).json({
      message: "Error generating interview questions",
      error: error.message,
    });
  }
};

const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        message: "Question is required and must be a string",
      });
    }

    // Check if API key is set
    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === "your-gemini-api-key-here"
    ) {
      return res.status(500).json({
        message: "AI service configuration error",
        error: "Please set a valid GEMINI_API_KEY in your .env file",
      });
    }

    const prompt = conceptExplainPrompt(question);

    // Use the correct Gemini API method with timeout
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generatePromise = model.generateContent(prompt);
    const result = await withTimeout(generatePromise, 15000); // 15 second timeout for explanations
    const response = await result.response;
    const rawText = response.text();

    // Parse the response using enhanced parsing
    let data;
    try {
      data = parseAIResponse(rawText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);

      const fallbackTitle = question.split(" ").slice(0, 3).join(" ") + "...";
      const fallbackExplanation =
        rawText.length > 500 ? rawText.substring(0, 500) + "..." : rawText;

      data = {
        title: fallbackTitle,
        explanation: fallbackExplanation,
      };
    }

    // Validate the response structure
    if (
      !data ||
      typeof data.title !== "string" ||
      typeof data.explanation !== "string"
    ) {
      return res.status(500).json({
        message: "AI response is not in expected format",
        error: "Expected object with 'title' and 'explanation' fields",
        raw: rawText.substring(0, 500),
      });
    }

    res.status(200).json({
      title: data.title,
      explanation: data.explanation,
    });
  } catch (error) {
    if (error.message === "Request timeout") {
      return res.status(408).json({
        message: "Request timeout",
        error: "AI service took too long to respond. Please try again.",
      });
    }

    // Check if it's an API key error
    if (error.message && error.message.includes("API key")) {
      return res.status(500).json({
        message: "AI service configuration error",
        error: "Invalid or missing API key",
      });
    }

    // Check if it's a network error
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return res.status(500).json({
        message: "AI service unavailable",
        error: "Unable to connect to AI service",
      });
    }

    return res.status(500).json({
      message: "Error generating concept explanation",
      error: error.message,
    });
  }
};

export { generateInterviewQuestions, generateConceptExplanation };
