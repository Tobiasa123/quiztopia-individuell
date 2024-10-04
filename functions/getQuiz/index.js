const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const {db} = require('../../services/db')
const {apiResponse} = require('../../utils/apiResponse')

//get one quiz with detailed info
//dont display leaderboard as that is accessed in another function
exports.handler = async (event) => {
    try {

        if (!event.pathParameters || !event.pathParameters.quizId) {
            return apiResponse(400, { message: 'quizId must be provided in path parameters' });
        }

        const { quizId } = event.pathParameters;
        const { quizUserId } = JSON.parse(event.body)

        if (!quizUserId || typeof quizUserId !== 'string') {
            return apiResponse(400, { message: 'quizUserId must be provided as a non empty string' });
        }

        const quizParams = {
            TableName: "quiz_table",
            Key: {
                userId: quizUserId,
                quizId
            },
        };

        const { Item: quiz } = await db.send(new GetCommand(quizParams))

        if(!quiz){
            return apiResponse(404, {message: "this user doesn't have this quiz"})
        }

        const { leaderboard, ...quizWithoutLeaderboard } = quiz;

        return apiResponse(200, { quiz: quizWithoutLeaderboard });

    } catch (error) {

      return apiResponse(500,{ message: "failed to fetch quiz", error: error.message })

    }
  };
  