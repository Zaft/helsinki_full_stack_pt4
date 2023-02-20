require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI
logger.info('connecting to', url)
mongoose.connect(url)
    .then(result => {
        logger.info("connected to MongoDB")
    })
    .catch(error => {
        logger.error("MongoDB connect error", error)
    })

module.exports = app

