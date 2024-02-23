'use strict'

const express = require('express')
const { apiKey, permission } = require('../auth/checkAuth')
const ApiKeyService = require('../services/apikey.service')
const router = express.Router()

// router.post('/v1/api/createKey', async (req, res) => {
//   const apiKey = await ApiKeyService.createKey()
//   res.json(apiKey)
// })

// check apiKey
// router.use(apiKey)
// check permission
// router.use(permission('0000'))

router.use('/v1/api/cart', require('./cart'))
router.use('/v1/api/discount', require('./discount'))
router.use('/v1/api/product', require('./product'))
router.use('/v1/api', require('./access'))

module.exports = router
