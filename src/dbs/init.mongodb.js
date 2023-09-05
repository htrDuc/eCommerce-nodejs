'use strict'

const mongoose = require('mongoose')
const {
  db: { host, name, port }
} = require('../configs/config.mongodb')

const connectString = `mongodb://${host}:${port}/${name}`
console.log(connectString)
const { countConnect } = require('../helpers/check.connect')

// ** Don't use this way
// mongoose
//   .connect(connectString)
//   .then((_) => console.log(`Connected Mongodb Success`))
//   .catch((err) => console.log(`Error Connect!`))

// // dev
// if (1 === 1) {
//   mongoose.set('debug', true)
//   mongoose.set('debug', { color: true })
// }

// module.exports = mongoose

// ** Recommend
// using singleton design pattern to create only instance
class Database {
  constructor() {
    this.connect()
  }

  // connect
  connect(type = 'mongodb') {
    // dev
    if (1 === 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })
    }

    mongoose
      .connect(connectString, {
        maxPoolSize: 50
      })
      .then((_) => {
        console.log(`Connected Mongodb Success PRO`)
        countConnect()
      })
      .catch((err) => console.log(`Error Connect!`))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }

    return Database.instance
  }
}

const instanceMongodb = Database.getInstance()

module.exports = instanceMongodb
