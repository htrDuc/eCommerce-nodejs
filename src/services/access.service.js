'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../auth/authUtils')
const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}
class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // step1: check email exists ??
      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) {
        return {
          code: 'xxx',
          message: `Shop already registered`
        }
      }
      const passwordHash = await bcrypt.hash(password, 10)

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP]
      })

      if (newShop) {
        // created privateKey, publicKey
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096
        })
        console.log({ publicKey, privateKey }) // save collection KeyStore

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey
        })

        if (!publicKeyString) {
          return {
            code: 'xxx',
            message: 'publicKeyString error'
          }
        }

        // created token pair
        const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyString, privateKey)
        console.log(`Created Token Success::`, tokens)

        return {
          code: 201,
          metadata: {
            shop: newShop,
            tokens
          }
        }
      }
      return {
        code: 200,
        metadata: null
      }
    } catch (error) {
      return {
        code: 'xxx',
        message: error.message,
        status: 'error'
      }
    }
  }
}

module.exports = AccessService
