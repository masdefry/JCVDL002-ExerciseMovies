// Init All Library
const express = require('express')
const app = express()
const cors = require('cors')

// Init Cors
app.use(cors())

// Init Body Parser
app.use(express.json())

// Init PORT
const PORT = 5000 

// Import Routers
const UserRouter = require('./Routers/UserRouter')

// Routing
app.get('/', (req, res) => {
    res.status(200).send(
        '<h1>Bioskop PWD System API</h1>'
    )
})

app.use('/user', UserRouter)

app.listen(PORT, () => console.log('API RUNNING ON PORT ' + PORT))