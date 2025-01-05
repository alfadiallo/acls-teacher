import fetch from 'node-fetch';

exports.handler = async function(event) {
    console.log("Function invoked with event:", event);

    let messages;
    try {
        messages = JSON.parse(event.body).messages;
        console.log("Parsed messages:", messages);
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid request body" })
        };
    }

    console.log("Using model: ft:gpt-4o-mini-2024-07-18:personal::Am9r0EsV");

    if (!process.env.OPENAI_API_KEY) {
        console.error("Missing API key");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Missing API key" })
        };
    }

    // If no messages are sent in the request, start with Vignette 1
    if (!messages || messages.length === 0) {
        messages = [
            { role: 'system', content: 'You are an ACLS Instructor. Guide the user through case-based scenarios in a quiz format.' },
            { role: 'assistant', content: 'Vignette 1: A 55-year-old male is found unresponsive. Bystanders report he suddenly collapsed. What is the next step?' }
        ];
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'ft:gpt-4o-mini-2024-07-18:personal::Am9r0EsV',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error("OpenAI API error:", errorDetails);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: errorDetails })
            };
        }

        const data = await response.json();
        console.log("Response from OpenAI:", data);
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
