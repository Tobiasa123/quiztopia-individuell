const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const { db } = require('../../services/db');
const { apiResponse } = require('../../utils/apiResponse');

//view the sorted leaderboard
//this is to get the whole leaderboard,
//simply add a limit to how many you will view if traffic increases or only want to view top 10 etc in another function
exports.handler = async (event) => {
    try {
        const { quizUserId, quizId } = JSON.parse(event.body)

        if (!quizUserId || typeof quizUserId !== 'string' || !quizId || typeof quizId !== 'string') {
            return apiResponse(400, { message: 'both quizUserId and quizId must be provided and as strings' });
        }
        
        const quizParams = {
            TableName: 'quiz_table',
            Key: {
                userId: quizUserId,
                quizId
                }
        };

        const {Item: quiz} = await db.send(new GetCommand(quizParams))

        if (!quiz) {
            return apiResponse(404, { message: `quiz with quizId: '${quizId}' not found` });
        }

        const leaderboard = quiz.leaderboard || [];
        leaderboard.sort((a, b) => b.score - a.score);

        return apiResponse(200, {leaderboard})

    } catch (error) {
        return apiResponse(500, {message: 'error getting leaderboard', error: error.message})
    }
}