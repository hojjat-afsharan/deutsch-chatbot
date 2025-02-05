import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'cas/discolm-mfto-german',
                prompt: prompt
            })
        });

        const responseText = await ollamaResponse.text();
        const lines = responseText.split('\n').filter(line => line.trim() !== '');
        let fullResponse = '';

        lines.forEach(line => {
            try {
                const json = JSON.parse(line);
                if (json.response) {
                    fullResponse += json.response;
                }
            } catch (err) {
                console.error('Error parsing JSON:', err);
            }
        });

        res.status(200).json({ response: fullResponse.replace(/\s+/g, ' ').trim() });
    } catch (error) {
        console.error('Error fetching from Ollama:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
