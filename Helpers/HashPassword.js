const crypto = require('crypto')

function hashPassword(password){
    const hmac = crypto.createHmac('sha256', process.env.HASH_SECRETKEY)
    hmac.update(password)
    
    let hashedPassword = hmac.digest('hex')

    return hashedPassword
}

module.exports = hashPassword