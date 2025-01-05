// Import node-fetch
import fetch from 'node-fetch';

exports.handler = async function(event) {
    // Parse incoming request body
    let messages;
    try {
        messages = JSON.parse(event.body).messages;
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid request body" })
        };
    }

    console.log("Using model: ft:gpt-4o-mini-2024-07-18");

    // Check if API key is provided
    if (!process.env.OPENAI_API_KEY) {
        console.error("Missing API key");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Missing API key" })
        };
    }

    try {
        // Make API request to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'ft:gpt-4o-mini-2024-07-18',
                messages: [
                    { role: 'system', content: 'You are an ACLS Teacher. Guide the user through case-based scenarios in a quiz format.' },
                    ...messages
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        // Check if the response is successful
        if (!response.ok) {
            const errorDetails = await response.json();
            console.error("OpenAI API error:", errorDetails);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: errorDetails })
            };
        }

        // Parse and return the response
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Error connecting to OpenAI:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to connect to OpenAI API." })
        };
    }
};
