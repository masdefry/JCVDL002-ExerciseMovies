// Initialize Library
const express = require('express')
const app = express()
const cors = require('cors')

// Initialize Cors
app.use(cors())

// Initialize Body Parser
app.use(express.json())

// Initialize PORT
const PORT = 5000

// Import Router 
const UserRouter = require('./Routers/UserRouter')

// Route 
app.get('/', (req, res) => {
    res.status(200).send(
        '<h1>Bioskop PWD System API</h1>'
    )
})

app.use('/user', UserRouter)

app.listen(PORT, () => console.log('API RUNNING ON PORT ' + PORT))