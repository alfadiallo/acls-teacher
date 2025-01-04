const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async function(event) {
    // Handle GET requests
    if (event.httpMethod === "GET") {
        return {
            statusCode: 200,
            body: "This endpoint is for POST requests only."
        };
    }

    // Handle POST requests
    let messages;
    try {
        messages = JSON.parse(event.body).messages;
        if (!messages) {
            throw new Error("Messages field is missing.");
        }
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid JSON input." })
        };
    }

    // Send request to OpenAI API
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages
            })
        });

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to connect to OpenAI API." })
        };
    }
};
