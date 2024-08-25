
const { NextResponse } = require('next/server');
const { OpenAI} =require('openai');
const { DynamoDBClient, GetItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// Initialize OpenAI with your API key from the environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,  
});

// Initialize DynamoDB Client and DocumentClient
const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

// Table names
const COMMENTS_TABLE_NAME = "Comments";
const TRANSCRIPTS_TABLE_NAME = "Transcripts"; // Corrected table name

// System prompt for the AI
const systemPrompt = `You are a summary generator. Your primary goal is to generate the summary of each sales transcript between the customer and seller`;

// Function to generate a summary based on combined data
async function generateSummary(transcriptId) {
    try {
        // Fetch transcript data from DynamoDB
        const transcriptParams = {
            TableName: TRANSCRIPTS_TABLE_NAME,
            Key: {
                transcriptId: { S: transcriptId }
            }
        };

        const transcriptCommand = new GetItemCommand(transcriptParams);
        const transcriptResult = await dynamoDb.send(transcriptCommand);
        const transcript = transcriptResult.Item;

        if (!transcript) {
            throw new Error('Transcript not found');
        }

        // Fetch comments from DynamoDB
        const commentsParams = {
            TableName: COMMENTS_TABLE_NAME,
            KeyConditionExpression: "transcriptId = :transcriptId",
            ExpressionAttributeValues: {
                ":transcriptId": { S: transcriptId }
            }
        };

        const commentsCommand = new QueryCommand(commentsParams);
        const commentsResult = await dynamoDb.send(commentsCommand);
        const comments = commentsResult.Items;

        // Combine transcript and comments
        const combinedData = {
            transcript: transcript,
            comments: comments
        };

        // Prepare messages for OpenAI API
        const userMessages = [
            { role: 'user', content: `Transcript: ${JSON.stringify(transcript)}` },
            { role: 'user', content: `Comments: ${JSON.stringify(comments)}` }
        ];

        // Create a completion using the OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',  
            messages: [
                { role: 'system', content: systemPrompt },  // Add the system prompt
                ...userMessages,  // Add the user's messages
            ],
        });

        // Return the summary text
        return completion.choices[0].message.content;

    } catch (error) {
        console.error('Error generating summary:', error.message);
        throw new Error('Could not generate summary');
    }
}

// Handle the POST request
async function POST(req) {
    try {
        // Parse the incoming JSON data from the request body
        const { transcriptId } = await req.json();
        console.log('Received transcriptId:', transcriptId);  // Log the incoming data for debugging

        // Generate summary using the transcriptId
        const summary = await generateSummary(transcriptId);

        console.log('Generated summary:', summary);  // Log the summary for debugging

        // Return the summary as a JSON response
        return NextResponse.json({ summary });

    } catch (error) {
        // Log and return the error if something goes wrong
        console.error('Error processing request:', error.message);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
        }, { status: 500 });
    }
}

// GET

 async function getSummary(transcriptId) {
    try {
        // Parse the incoming JSON data from the request body
      //  const { transcriptId } = await req.json();
        console.log('Received transcriptId:', transcriptId);  // Log the incoming data for debugging

        // Generate summary using the transcriptId
        const summary = await generateSummary(transcriptId);

        console.log('Generated summary:', summary);  // Log the summary for debugging

        // Return the summary as a JSON response
        return NextResponse.json({ summary });

    } catch (error) {
        // Log and return the error if something goes wrong
        console.error('Error processing request:', error.message);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
        }, { status: 500 });
    }
}

    module.exports={
        getSummary,
        generateSummary
    }



