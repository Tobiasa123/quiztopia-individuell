const jwt = require('jsonwebtoken');

const validateToken = {
    before: async (request) => {
        try {
            const token = request.event.headers.authorization.replace('Bearer ', '');

            if (!token) throw new Error('no token provided');

            const data = jwt.verify(token, process.env.JWT_SECRET);
            request.event.userId = data.userId;

            return request.response;
        } catch (error) {
            console.error("Token validation error:", error); 
            throw error;
        }
    },
    onError: async (request) => {
        request.event.error = 'Unauthorized';
        request.response = {
        statusCode: 401,
        body: JSON.stringify({ message: request.event.error }),
        };
    return request.response;
    }
};

module.exports = { validateToken };