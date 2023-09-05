'use strict'

const JWT = require('jsonwebtoken')
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '2d'
    })

    // refreshToken
    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '7d'
    })

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`Error verify::`, err)
      } else {
        console.log(`Decode verify::`, decode)
      }
    })
    return {
      accessToken,
      refreshToken
    }
  } catch (error) {
    return error
  }
}

module.exports = {
  createTokenPair
}
