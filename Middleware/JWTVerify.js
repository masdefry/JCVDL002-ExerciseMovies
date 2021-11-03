const jwt = require('jsonwebtoken')

const jwtVerify = (req, res, next) => {
    const token = req.headers.token 

    if(!token) return res.status(406).send({ error: true, message: 'Error Token', detail: 'Token Tidak Ditemukan!' })

    jwt.verify(token, 'abc123', (err, dataToken) => {
        try {
            if(err) throw err 

            req.dataToken = dataToken
            next()
        } catch (error) {
            res.status(500).send({ 
                error: true, 
                message: 'Error Token', 
                detail: error.message
            })
        }
    })
}

module.exports = jwtVerify