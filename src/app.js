const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();

// init middleware
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())

// init db
app.get('/', (req, res) => {
    const hello = "hello123"
    return res.status(200).json({
        message: 'hello',
        metadata: hello.repeat(100000)
    })
} )
// handling error

module.exports = app