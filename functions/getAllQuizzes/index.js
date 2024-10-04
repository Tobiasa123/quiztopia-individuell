const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const {db} = require('../../services/db')
const {apiResponse} = require('../../utils/apiResponse')

//get all quizzes only get quizname and userid
//you get more info when only getting one quiz in another function
exports.handler = async (event) => {
    try {

        const scanParams = {
            TableName: "quiz_table",
            ProjectionExpression: "quizName, userId"
        };

        const {Items: quizzes} = await db.send(new ScanCommand(scanParams))

        if (!quizzes || quizzes.length === 0) {
          return apiResponse(404, { message: "No quizzes found" });
        }

       return apiResponse(200, {quizzes: quizzes})

    } catch (error) {

      return apiResponse(500,{ message: "failed to fetch quizzes", error: error.message })

    }
  };
  