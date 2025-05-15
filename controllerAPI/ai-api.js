const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');

router.post('/',authenticate, async (req, res) => {
    try {
        // Verify the request parameters
        if (!req.body?.messages) {
            return res.status(400).json({
                code: 40001,
                message: 'Necessary parameters are missing: messages'
            });
        }

        // Construct request parameters
        const payload = {
            model: req.body.model || "gpt-4o",
            messages: req.body.messages,
            max_tokens: req.body.max_tokens || 400,
            stream: false
        };

        // call the ai api
        const aiResponse = await fetch("https://ai.xiaomango.net/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer sk-D9EPohqNJzpmvJonOLGGDuQCeHviyJec8MQfkcNjhlSRjVYO`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Process the response
        if (!aiResponse.ok) {
            const errorData = await aiResponse.json();
            throw new Error(`AI API Error: ${errorData.error?.message}`);
        }

        const data = await aiResponse.json();
        res.json({
            code: 0,
            data: data.choices[0].message
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            code: 50001,
            message: error.message || 'Server Error'
        });
    }
});

module.exports = router;