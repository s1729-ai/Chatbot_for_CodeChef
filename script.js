// Session ID for the current chat
const sessionId = Date.now().toString();

// API endpoint for the Gemini AI backend
const API_ENDPOINT = 'http://localhost:3000/api/chat';

// DOM elements
let chatMessages;
let userInput;
let sendButton;
let typingIndicator;

// Initialize the chatbot when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    chatMessages = document.getElementById('chat-messages');
    userInput = document.getElementById('user-input');
    sendButton = document.getElementById('send-button');
    typingIndicator = document.getElementById('typing-indicator');

    // Add initial greeting
    addMessage("Hello! I'm an AI-powered chatbot using Google's Gemini. How can I help you today?", false);

    // Event listeners
    sendButton.addEventListener('click', handleUserInput);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    // Focus on input field when page loads
    userInput.focus();
});

// Function to add a message to the chat
function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to show typing indicator
function showTypingIndicator() {
    typingIndicator.style.display = 'block';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to hide typing indicator
function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// Function to get a response from the Gemini AI
async function getBotResponse(userMessage) {
    try {
        showTypingIndicator();
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                sessionId: sessionId
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get response from AI');
        }
        
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error getting AI response:', error);
        return "Sorry, I'm having trouble connecting to my AI brain right now. Please try again later.";
    } finally {
        hideTypingIndicator();
    }
}

// Handle user input and get AI response
async function handleUserInput() {
    const message = userInput.value.trim();
    
    if (message === '') return;
    
    // Add user message to chat
    addMessage(message, true);
    
    // Clear input field
    userInput.value = '';
    
    // Get bot response
    const botResponse = await getBotResponse(message);
    
    // Add bot response to chat
    addMessage(botResponse, false);
}