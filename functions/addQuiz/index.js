const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const {db} = require('../../services/db')
const {apiResponse} = require('../../utils/apiResponse')
const middy = require('@middy/core')
const {validateToken} = require('../../middleware/auth')
const {v4: uuidv4} = require('uuid')

//create a quiz, another function adds one or multiple questions for it
const quizHandler = async (event) => {
    try {
        const userId = event.userId;

        if (!userId) {
            throw new Error("userId is missing"); 
        }

        const { quizName } = JSON.parse(event.body);

        if (!quizName || typeof quizName !== 'string' || quizName.trim() === '') {
            return apiResponse(400, { message: "only quiz name is required at this stage and must be a non empty string" });
        }

        const quizId = uuidv4();

        const newQuiz = {
            userId: userId,
            quizId: quizId,
            quizName: quizName,
            questions: [],
            leaderboard: []
        };

        await db.send(new PutCommand({
            TableName: 'quiz_table',
            Item: newQuiz
        }));

        return apiResponse(201, { message: `Quiz '${newQuiz.quizName}' added! quizId: '${newQuiz.quizId}' , userId: '${newQuiz.userId}'` }); 

    } catch (error) {
        console.error('Error creating quiz:', error);
        return apiResponse(500, { message: "Error creating quiz" });
    }
};

const handler = middy(quizHandler).use(validateToken);

module.exports = { handler };