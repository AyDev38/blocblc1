const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Token is not valid' });
            }

            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'Authentication token is missing' });
    }
};

module.exports = authenticateJWT;
