import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with your API key from the environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,  // Make sure this is set in your .env.local file
});

// System prompt for the AI
const systemPrompt = `You have to generate the summary of each sales transcript`;

// Handle the POST request
export async function POST(req) {
    try {
        // Parse the incoming JSON data from the request body
        const data = await req.json();
        console.log('Received data:', data);  // Log the incoming data for debugging

        // Create a completion using the OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',  // Specify the model to use
            messages: [
                { role: 'system', content: systemPrompt },  // Add the system prompt
                ...data,  // Add the user's messages
            ],
        });

        console.log('OpenAI response:', completion);  // Log the API response for debugging

        // Return the completion result as a JSON response
        return NextResponse.json(completion);

    } catch (error) {
        // Log and return the error if something goes wrong
        console.error('Error processing request:', error.message);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
        }, { status: 500 });
    }
}