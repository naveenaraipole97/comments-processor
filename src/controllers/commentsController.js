const { v4: uuidv4 } = require('uuid');
// AWS SDK v3 imports
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { formatDate, formatTime } = require('../utils/formatDateTime');

// Initialize DynamoDB Client and DocumentClient
const client = new DynamoDBClient({ }); // Ensure the region is set correctly
const dynamoDb = DynamoDBDocumentClient.from(client);

// Table name
const TABLE_NAME = "Comments";

const createComment = async (req, res) => {
    const { transcriptId, text } = req.body;
    const commentId = uuidv4(); // Generate a unique commentId
    const createdAt = new Date().toISOString();
    const sortKey = `${createdAt}#${commentId}`;
    const createdAtDate = formatDate(createdAt)
    const createdAtTime = formatTime(createdAt)

    const params = {
        TableName: TABLE_NAME,
        Item: {
            commentId,
            transcriptId,
            text,
            createdAt,
            createdAtDate,
            createdAtTime,
            sortKey
        }
    };

    try {
        const command = new PutCommand(params);
        await dynamoDb.send(command);
        res.status(201).json({ message: 'Comment created', comment: params.Item });
    } catch (error) {
        res.status(500).json({ error: 'Could not create comment', details: error.message });
    }
};

const getCommentById = async (req, res) => {
    const { transcriptId, commentId } = req.params;

    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "transcriptId = :transcriptId AND commentId = :commentId",
        ExpressionAttributeValues: {
            ":transcriptId": transcriptId,
            ":commentId": commentId,
        },
    };

    try {
        const command = new QueryCommand(params);
        const result = await dynamoDb.send(command);
        if (result.Items && result.Items.length > 0) {
            res.json(result.Items[0]);
        } else {
            res.status(404).json({ error: 'Comment not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not retrieve comment', details: error.message });
    }
};

const getAllComments = async (req, res) => {
    const { transcriptId } = req.params;

    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "transcriptId = :transcriptId",
        ExpressionAttributeValues: {
            ":transcriptId": transcriptId
        },
    };

    try {
        const command = new QueryCommand(params);
        const result = await dynamoDb.send(command);
        if (result.Items && result.Items.length > 0) {
            res.json(result.Items);
        } else {
            res.status(404).json({ error: 'No comments found for this transcriptId' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not retrieve comments', details: error.message });
    }
};

const updateComment = async (req, res) => {
    const { transcriptId, commentId } = req.params;
    const { text } = req.body;

    const params = {
        TableName: TABLE_NAME,
        Key: {
            transcriptId,
            commentId
        },
        UpdateExpression: "SET #txt = :text",
        ExpressionAttributeNames: {
            "#txt": "text"
        },
        ExpressionAttributeValues: {
            ":text": text
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const command = new UpdateCommand(params);
        const result = await dynamoDb.send(command);
        res.json({ message: 'Comment updated', updatedAttributes: result.Attributes });
    } catch (error) {
        res.status(500).json({ error: 'Could not update comment', details: error.message });
    }
};

const deleteComment = async (req, res) => {
    const { transcriptId, commentId } = req.params;

    const params = {
        TableName: TABLE_NAME,
        Key: {
            transcriptId,
            commentId
        }
    };

    try {
        const command = new DeleteCommand(params);
        await dynamoDb.send(command);
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Could not delete comment', details: error.message });
    }
};

module.exports = {
    createComment,
    getCommentById,
    getAllComments,
    updateComment,
    deleteComment
};
