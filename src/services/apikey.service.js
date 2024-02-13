'use strict'

const apiKeyModel = require('../models/apiKey.model')
const crypto = require('crypto')

class ApiKeyService {
  static findById = async (key) => {
    const objKey = await apiKeyModel.findOne({ key, status: true }).lean()
    return objKey
  }

  static createKey = async () => {
    const newKey = await apiKeyModel.create({
      key: crypto.randomBytes(64).toString('hex'),
      permissions: ['0000']
    })
    return newKey
  }
}

module.exports = ApiKeyService
