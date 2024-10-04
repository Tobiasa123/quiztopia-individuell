const { UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const { apiResponse } = require('../../utils/apiResponse');
const middy = require('@middy/core');
const { validateToken } = require('../../middleware/auth');

//functionality to register points to the leaderbord of a quiz
const scoreHandler = async (event) => {
    try {
        const {quizUserId, quizId, score} = JSON.parse(event.body);
        const playerId = event.userId;

        if (!quizUserId || typeof quizUserId !== 'string' || quizUserId.trim() === '' ||
            !quizId || typeof quizId !== 'string' || quizId.trim() === '' ||
            typeof score !== 'number' || isNaN(score)) {

            return apiResponse(400, { message: "userId, quizId and score required, score should be a number" });

        }

        const quizExists = await db.send(new GetCommand({
            TableName: 'quiz_table',
            Key: {
                userId: quizUserId,
                quizId 
            } 
        }));

        if (!quizExists.Item) {
            return apiResponse(404, { message: `quiz '${quizId}' not found for this user` });
        }

        const leaderboardEntry = { 
            userId: playerId,
            score: score 
        };

        const updateParams = {
            TableName: 'quiz_table',
            Key: {
                userId: quizUserId,
                quizId
            },
            UpdateExpression: 'SET leaderboard = list_append(leaderboard, :new_score)',
            ExpressionAttributeValues: {
                ':new_score': [leaderboardEntry]
            },
            ReturnValues: 'UPDATED_NEW'
        }

        await db.send(new UpdateCommand(updateParams));

        return apiResponse(200, { message: `score submitted for quiz: '${quizId}'` });
        
    } catch (error) {

        return apiResponse(500, { message: "error submitting score", error: error.message});
        
    }
}
const handler = middy(scoreHandler).use(validateToken);

module.exports = { handler }