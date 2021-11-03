const jwt = require('jsonwebtoken')

// Import .env
require('dotenv').config()

const jwtSign = (data) => {
    return jwt.sign({uid: data.uid, role: data.role}, process.env.JWT_SECRETKEY)
}

module.exports = jwtSign