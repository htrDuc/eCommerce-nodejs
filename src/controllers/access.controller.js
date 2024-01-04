'use strict'

const { CREATED } = require('../core/success.response')
const AccessService = require('../services/access.service')

class AccessController {
  signUp = async (req, res) => {
    new CREATED({
      message: 'Registered Successfully!',
      metadata: await AccessService.signUp(req.body)
    }).send(res)
  }
}

module.exports = new AccessController()
