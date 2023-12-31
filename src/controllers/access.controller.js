'use strict'

const { CREATED, SuccessResponse } = require('../core/success.response')
const AccessService = require('../services/access.service')

class AccessController {
  logout = async (req, res) => {
    new SuccessResponse({
      message: 'Logout success!',
      metadata: await AccessService.logout(req.keyStore)
    }).send(res)
  }

  login = async (req, res) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body)
    }).send(res)
  }

  signUp = async (req, res) => {
    new CREATED({
      message: 'Registered Successfully!',
      metadata: await AccessService.signUp(req.body)
    }).send(res)
  }
}

module.exports = new AccessController()
