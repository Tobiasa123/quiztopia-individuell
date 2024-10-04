const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const {db} = require('../../services/db');
const {apiResponse} = require('../../utils/apiResponse');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//login fucntionality
exports.handler = async (event) => {
    try {

        const {email, password} = JSON.parse(event.body)

        if (!email || typeof email !== 'string' || !password || typeof password !== 'string' || email.trim() === '' || password.trim() === '') {
          return apiResponse(400, { message: "invalid email or password format, should be string" });
        }

        const userParams = {
            TableName: "quiz_user_table",
            Key: { userId: email },
        };

        const { Item: user } = await db.send(new GetCommand(userParams))

       if (!user){
        return apiResponse(404, {message: `user with email '${email}' doesn't exist`})
       }

       const validPassword = await bcrypt.compare(password, user.password);
       if (!validPassword) {
           return apiResponse(401, { message: "Invalid password" });
       }


        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

       return apiResponse(200, {token})
    } catch (error) {
      return apiResponse(500,{ message: "failed to register user", error: error.message })
    }
  };
  