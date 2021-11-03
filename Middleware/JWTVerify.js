const jwt = require('jsonwebtoken')

const jwtVerify = (req, res, next) => {
    let token = req.headers.token 

    if(!token) return res.status(406).send({
        error: true, 
        message: 'Token Not Found',
        detail: 'Token Tidak Ditemukan!'
    })

    jwt.verify(token, process.env.JWT_SECRETKEY, (err, dataToken) => {
        try {
            if(err) throw err

            req.dataToken = dataToken
            next()
        } catch (error) {
            return res.status(500).send({
                error: true,
                message: error.message
            })
        }
    })
}

module.exports = jwtVerify