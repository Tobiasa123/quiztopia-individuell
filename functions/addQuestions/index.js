const { UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const {db} = require('../../services/db')
const {apiResponse} = require('../../utils/apiResponse')
const middy = require('@middy/core')
const {validateToken} = require('../../middleware/auth')

//add one or multiple questions, just add new objects in body to add multiple
const quizHandler = async (event) => {
    try {
        const { quizId, questions } = JSON.parse(event.body);

        const userId = event.userId;
        if (!userId) {
            throw new Error("User ID is missing");
        }

        const getParams = {
            TableName: 'quiz_table',
            Key: {
                userId,
                quizId
            }
        };

        const quizResult = await db.send(new GetCommand(getParams));

        if (!quizResult.Item) {
            return apiResponse(404, { message: `quiz with ID ${quizId} not found for this user` });
        }

        let newQuestions = [];

        for (const q of questions) {
            if (
                !q.question || typeof q.question !== 'string' || q.question.trim() === '' ||
                !q.answer || typeof q.answer !== 'string' || q.answer.trim() === '' ||
                !q.longitude || typeof q.longitude !== 'string' || q.longitude.trim() === '' ||
                !q.latitude || typeof q.latitude !== 'string' || q.latitude.trim() === ''
            ) {
                return apiResponse(400, { message: "each question must have 'question', 'answer', 'longitude', and 'latitude' filled in non empty string format" });
            }
            newQuestions.push({
                question: q.question,
                answer: q.answer,
                location: {
                    longitude: q.longitude,
                    latitude: q.latitude
                }
            });
        }
 
        const updateParams = {
            TableName: 'quiz_table',
            Key: {
                userId,
                quizId
            },
            UpdateExpression: 'SET questions = list_append(questions, :newQuestions)',
            ExpressionAttributeValues: {
                ':newQuestions': newQuestions
            },
            ReturnValues: 'UPDATED_NEW'
        };

        const result = await db.send(new UpdateCommand(updateParams));

        return apiResponse(201, {
            message: `Questions added to quiz: '${quizId}'`,
            updatedQuestions: result.Attributes.questions
        });

    } catch (error) {
        console.error('Error adding questions:', error);
        return apiResponse(500, { message: "Error adding questions" });
    }
};

const handler = middy(quizHandler).use(validateToken);

module.exports = { handler };

