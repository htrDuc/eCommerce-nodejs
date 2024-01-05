'use strict'

const ApiKeyService = require('../services/apikey.service')

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization'
}

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]

    if (!key) {
      return res.status(403).json({
        message: 'Forbidden Error'
      })
    }
    // check objKey
    const objKey = await ApiKeyService.findById(key)
    if (!objKey) {
      return res.status(403).json({
        message: 'Forbidden Error'
      })
    }
    req.objKey = objKey
    return next()
  } catch (error) {
    return error
  }
}

const permission = (permission) => {
  return (req, res, next) => {
    console.log(req.objKey)
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: 'Permission denied'
      })
    }

    console.log('permissions:: ' + req.objKey.permissions)
    const validPermissions = req.objKey.permissions.includes(permission)
    if (!validPermissions) {
      return res.status(403).json({
        message: 'Permission denied'
      })
    }

    return next()
  }
}

module.exports = {
  apiKey,
  permission
}
