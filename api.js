const db = require('./db');

const {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
    UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');

const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
    
const getPost = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ postId: event.pathParameters.postId }),
        };

        const { Item } = await db.send(new GetItemCommand(params));
        response.body = JSON.stringify(unmarshall(Item));
    } catch (err) {
        response.statusCode = 500;
        response.body = JSON.stringify(err);
    }
};

const createPost = async (event) => {
    const response = { statusCode: 200 };

    try {
        const post = JSON.parse(event.body);

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(post),
        };

        await db.send(new PutItemCommand(params));
        response.body = JSON.stringify(post);
    } catch (err) {
        response.statusCode = 500;
        response.body = JSON.stringify(err);
    }
};

const updatePost = async (event) => {
    const response = { statusCode: 200 };

    try {
        const post = JSON.parse(event.body);
        const objKeys = Object.keys(post);

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ postId: event.pathParameters.postId }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };

        await db.send(new UpdateItemCommand(params));
        response.body = JSON.stringify(post);
    } catch (err) {
        response.statusCode = 500;
        response.body = JSON.stringify(err);
    }
};

const deletePost = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ postId: event.pathParameters.postId }),
        };

        await db.send(new DeleteItemCommand(params));
    } catch (err) {
        response.statusCode = 500;
        response.body = JSON.stringify(err);
    }
};

const listPosts = async () => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
        };

        const { Items } = await db.send(new ScanCommand(params));
        response.body = JSON.stringify(Items.map((item) => unmarshall(item)));
    } catch (err) {
        response.statusCode = 500;
        response.body = JSON.stringify(err);
    }
};

module.exports = {
    getPost,
    createPost,
    updatePost,
    deletePost,
    listPosts,
};