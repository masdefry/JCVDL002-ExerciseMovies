const express = require('express')
const Router = express.Router()

// Import Controller
const UserController = require('./../Controllers/UserController')

// Import JWTVerify 
const jwtVerify = require('./../Middleware/JWTVerify')

// Routing
Router.post('/register', UserController.register)
Router.patch('/deactive', jwtVerify, UserController.deactiveAccount)
Router.get('/all-movies', UserController.searchAllMovies)
Router.get('/search-movies', UserController.searchMoviesBy)

module.exports = Router