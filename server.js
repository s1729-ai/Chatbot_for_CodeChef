const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize Gemini API
const API_KEY = "AIzaSyDvUsnTrk00E-kZDfor6zFj7AETuktpw3Q";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Chat history storage (simple in-memory storage)
const chatHistory = {};

// Fallback knowledge base for when API is unavailable
const fallbackResponses = {
    "hello": "Hello! I'm using a fallback response system since the AI API is currently unavailable.",
    "hi": "Hi there! (Fallback response - AI API unavailable)",
    "how are you": "I'm functioning in fallback mode since the AI API is currently unavailable.",
    "what is your name": "I'm a chatbot currently running in fallback mode.",
    "default": "I apologize, but the Gemini AI service is currently unavailable due to an expired API key. I'm operating in fallback mode with limited responses."
};

// Function to get fallback response
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for exact matches
    if (fallbackResponses[lowerMessage]) {
        return fallbackResponses[lowerMessage];
    }
    
    // Check if message contains keywords
    for (const key in fallbackResponses) {
        if (key !== "default" && lowerMessage.includes(key)) {
            return fallbackResponses[key];
        }
    }
    
    // Return default response
    return fallbackResponses.default;
}

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        try {
            // Initialize chat for this session if it doesn't exist
            if (!chatHistory[sessionId]) {
                chatHistory[sessionId] = model.startChat();
            }

            // Get response from Gemini
            const result = await chatHistory[sessionId].sendMessage(message);
            const response = result.response.text();
            
            res.json({ response });
        } catch (apiError) {
            console.error('Error calling Gemini API:', apiError);
            
            // Use fallback response instead of failing
            const fallbackResponse = getFallbackResponse(message);
            res.json({ 
                response: fallbackResponse,
                fallback: true
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});