'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError } = require('../core/error.response')

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}
class AccessService {
  static signUp = async ({ name, email, password }) => {
    // step1: check email exists ??
    const holderShop = await shopModel.findOne({ email }).lean()
    if (holderShop) {
      throw new BadRequestError('Error: Shop already registered!')
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
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
        }
      })

      // save collection KeyStore
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

      const publicKeyObject = crypto.createPublicKey(publicKeyString)
      // created token pair
      const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyObject, privateKey)

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ['_id', 'email', 'name'],
            object: newShop
          }),
          tokens
        }
      }
    }
    return {
      code: 200,
      metadata: null
    }
  }
}

module.exports = AccessService
