const { DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const {db} = require('../../services/db')
const {apiResponse} = require('../../utils/apiResponse')
const middy = require('@middy/core')
const {validateToken} = require('../../middleware/auth')

//delete a quiz, must be the same userid as the one who created it to delete it
const deleteHandler = async (event) => {
    try {

        if (!event.pathParameters || !event.pathParameters.quizId) {
            return apiResponse(400, { message: 'quizId must be provided in path parameters' });
        }

        const {quizId} = event.pathParameters;
        const userId = event.userId;

        const quizParams = {
            TableName: "quiz_table",
            Key: {
                userId,
                quizId
            }
        }
        const { Item: quiz } = await db.send(new GetCommand(quizParams));

        if (!quiz) {
            return apiResponse(404, { message: `Quiz '${quizId}' does not exist or does not belong to this user` });
        }
        

        await db.send(new DeleteCommand(quizParams))

        return apiResponse(201, { message: `Quiz deleted! quizId: '${quizId}'` }); 

    } catch (error) {
        console.error('Error deleting quiz:', error);
        return apiResponse(500, { message: "Error deleting quiz" });
    }
};

const handler = middy(deleteHandler).use(validateToken);

module.exports = { handler };