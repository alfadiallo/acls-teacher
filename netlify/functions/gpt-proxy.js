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

        // Extract the assistant's response and options
        const assistantResponse = data.choices[0].message.content;
        const options = assistantResponse.split('\n').filter(line => line.startsWith('1️⃣') || line.startsWith('2️⃣') || line.startsWith('3️⃣'));

        return {
            statusCode: 200,
            body: JSON.stringify({
                response: assistantResponse,
                options: options
            })
        };
    } catch (error) {
        console.error("Error connecting to OpenAI:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to connect to OpenAI API." })
        };
    }
};
