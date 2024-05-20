const express = require('express');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static('public')); // Serve static files from the 'public' directory

// OpenAI client setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Session-based message history
const sessions = {};

app.post('/chat', async (req, res) => {
    const { sessionId, message, dryRun } = req.body;

    // Initialize conversation history if not existing
    if (!sessions[sessionId]) {
        sessions[sessionId] = [];
    }

    // Add user's message to history
    sessions[sessionId].push({
        role: 'user',
        content: message
    });

    if (dryRun) {
        // If in dry run mode, return a static response
        sessions[sessionId].push({
            role: 'system',
            content: "I'm a chat bot!"
        });
        res.json({ reply: "I'm a chat bot!" });
    } else {
        try {
            const response = await openai.chat.completions.create({
                // model: "gpt-4-turbo-2024-04-09",
                model: "gpt-3.5-turbo",
                messages: sessions[sessionId],
                temperature: 1,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });

            // Add bot's response to history
            const botMessage = response.choices[0].message.content;
            sessions[sessionId].push({
                role: 'system',
                content: botMessage
            });

            res.json({ reply: botMessage });
        } catch (error) {
            console.error('Error with OpenAI API:', error);
            res.status(500).send('Failed to fetch response from OpenAI.');
        }
    }
});

// Server listening on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
