'use strict';

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');

const _SECONDS = 5000

// count connect
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections: ${numConnection}`);
}

// check over load
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length
    }, _SECONDS); // Monitor every 5 seconds
}

module.exports = {
    countConnect
}