'use strict'

const { CREATED, SuccessResponse } = require('../core/success.response')
const AccessService = require('../services/access.service')

class AccessController {
  handleRefreshToken = async (req, res) => {
    // new SuccessResponse({
    //   message: 'Get token success!',
    //   metadata: await AccessService.handlerRefreshToken(req.body.refreshToken)
    // }).send(res)

    // v2 fixed, no need accessToken
    new SuccessResponse({
      message: 'Get token success!',
      metadata: await AccessService.handlerRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore
      })
    }).send(res)
  }

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
