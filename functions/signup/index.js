const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const {db} = require('../../services/db');
const {apiResponse} = require('../../utils/apiResponse');
const bcrypt = require('bcryptjs')

const validEmail = (email) => {
    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailFormat.test(email);
};

const validateBody = (value, minLength) => {
    return typeof value === 'string' && value.trim().length > minLength;
};


//signup, here email acts as the unique id, users can however have same usernames as this works as more of a nickname/name then username. as in some video games and social media
exports.handler = async (event) => {
    try {

        const {email, username, password} = JSON.parse(event.body)

        if (!validEmail(email)) {
            return apiResponse(400, { message: 'invalid email format' });
        }
        if (!validateBody(username, 4)) {
            return apiResponse(400, { message: 'username must be at least 5 characters long and in string format' });
        }
        if (!validateBody(password, 5)) {
            return apiResponse(400, { message: 'password must be at least 6 characters long and in string format' });
        }

        const userExistsParams = {
            TableName: "quiz_user_table",
            Key: { userId: email },
        };

        const { Item: userExists } = await db.send(new GetCommand(userExistsParams))

        if(userExists){
            return apiResponse(409,{ message: `a user already exists for this email: '${email}'`})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const userParams = {
            userId: email,
            username,
            password: hashedPassword
        }

        await db.send(new PutCommand({
            TableName: "quiz_user_table",
            Item: userParams
        }))

        return apiResponse(201,{ message: "new user registered"})

    } catch (error) {

      return apiResponse(500,{ message: "failed to register user", error: error.message })

    }
  };
  