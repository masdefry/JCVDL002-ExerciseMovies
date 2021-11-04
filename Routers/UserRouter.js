const express = require('express')
const Router = express.Router()

// Import JWT Verify
const jwtVerify = require('../Middleware/JWTVerify')

// Import Controller
const UserController = require('./../Controllers/UserController')

Router.post('/register', UserController.register)
Router.post('/deactive', jwtVerify, UserController.deactiveAccount)
Router.get('/all-movies', UserController.searchAllMovies)
Router.get('/search-movies/get', UserController.searchMoviesBy)

module.exports = Router