// API Proxy Server - Hides the API key from the client
// In production, this should be deployed to protect your API credentials

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API Configuration
const API_BASE = 'https://hadithapi.com/api';
const API_KEY = process.env.HADITH_API_KEY || '$2y$10$dxEFNOPnn0190K7rdCCZj0HQiFco8AUAiV6Csamw5lwqAsxi';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Proxy endpoint for books
app.get('/api/books', async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE}/books`, {
            params: { apiKey: API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch books',
            message: error.message
        });
    }
});

// Proxy endpoint for chapters
app.get('/api/:bookSlug/chapters', async (req, res) => {
    try {
        const { bookSlug } = req.params;
        const response = await axios.get(`${API_BASE}/${bookSlug}/chapters`, {
            params: { apiKey: API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch chapters',
            message: error.message
        });
    }
});

// Proxy endpoint for hadiths
app.get('/api/hadiths', async (req, res) => {
    try {
        const { book, chapter, page, search } = req.query;
        const params = { apiKey: API_KEY };

        if (book) params.book = book;
        if (chapter) params.chapter = chapter;
        if (page) params.page = page;
        if (search) params.search = search;

        const response = await axios.get(`${API_BASE}/hadiths/`, { params });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch hadiths',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Hadith API Proxy Server running on http://localhost:${PORT}`);
    console.log('Note: In production, use environment variables for API keys');
});

module.exports = app;
