// server.js - Updated with hardcoded API keys
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API Keys - Replace these with your actual keys
const API_KEYS = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY
};


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Open AI API endpoint - now uses hardcoded API key
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEYS.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful chatbot." },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        res.json({ response: data.choices[0].message.content });

    } catch (error) {
        console.error("OpenAI Chat Error:", error);
        res.status(500).json({ error: "Failed to fetch OpenAI response" });
    }
});


// ElevenLabs TTS API endpoint - now uses hardcoded API key
app.post('/api/tts', async (req, res) => {
    try {
        const { text, voiceId, stability, clarity } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (API_KEYS.ELEVENLABS_API_KEY === 'PUT_YOUR_ELEVENLABS_API_KEY_HERE') {
            return res.status(500).json({ error: 'ElevenLabs API key not configured on server' });
        }

        // Default voice ID - Adam voice works well for Indian English
        const selectedVoiceId = voiceId || 'pNInz6obpgDQGcFmaJgB';

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': API_KEYS.ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_flash_v2_5', // Fastest model with good quality
                voice_settings: {
                    stability: stability || 0.5,
                    similarity_boost: clarity || 0.5,
                    style: 0.0,
                    use_speaker_boost: true
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }

        const audioBuffer = await response.buffer();
        const audioBase64 = audioBuffer.toString('base64');
        
        res.json({ 
            audioData: audioBase64,
            mimeType: 'audio/mpeg'
        });

    } catch (error) {
        console.error('ElevenLabs TTS error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get available ElevenLabs voices - now uses hardcoded API key
app.post('/api/voices', async (req, res) => {
    try {
        if (API_KEYS.ELEVENLABS_API_KEY === 'PUT_YOUR_ELEVENLABS_API_KEY_HERE') {
            return res.status(500).json({ error: 'ElevenLabs API key not configured on server' });
        }

        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: {
                'xi-api-key': API_KEYS.ELEVENLABS_API_KEY
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }

        const voices = await response.json();
        res.json(voices);

    } catch (error) {
        console.error('Voices API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running with ElevenLabs integration' });
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎤 Tarang Audio Chatbot Server is running on http://localhost:${PORT}`);
    console.log('✅ Gemini API integration ready');
    console.log('✅ ElevenLabs TTS integration ready');
    console.log('🚀 Ultra-fast 75ms latency with natural voices');
    console.log('');
    console.log('Make sure to:');
    console.log('1. Add your ElevenLabs API key to index.html');
    console.log('2. Your Gemini API key is already set');
    console.log('3. Get ElevenLabs API key from: https://elevenlabs.io/');
});