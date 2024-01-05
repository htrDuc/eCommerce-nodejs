'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, AuthFailureError } = require('../core/error.response')
const ShopService = require('./shop.service')

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}
class AccessService {
  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    return delKey
  }
  /**
      1 - Check email in dbs
      2 - Match password
      3 - Create Access Token and Refresh Token and save
      4 - Generate Tokens
      5 - Get data return login
   */
  static login = async ({ email, password, refreshToken = null }) => {
    //1.
    const foundShop = await ShopService.findByEmail({ email })
    if (!foundShop) throw new BadRequestError('Shop not registered')

    //2.
    const match = await bcrypt.compare(password, foundShop.password)
    if (!match) throw new AuthFailureError('Authentication error')

    //3.
    // Created privateKey and publicKey
    const privateKey = crypto.randomBytes(64).toString('hex')
    const publicKey = crypto.randomBytes(64).toString('hex')

    //4 - generate tokens
    const { _id: userId } = foundShop
    const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId
    })

    return {
      shop: getInfoData({
        fields: ['_id', 'email', 'name'],
        object: foundShop
      }),
      tokens
    }
  }

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
      // Option 1

      // created privateKey, publicKey
      const privateKey = crypto.randomBytes(64).toString('hex')
      const publicKey = crypto.randomBytes(64).toString('hex')

      // save collection KeyStore
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey
      })
      if (!keyStore) throw new BadRequestError()

      // created token pair
      const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)

      return {
        shop: getInfoData({
          fields: ['_id', 'email', 'name'],
          object: newShop
        }),
        tokens
      }

      // Option 2: Create PublicK and PrivateK with rsa algorithm

      // const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: 'pkcs1',
      //     format: 'pem'
      //   },
      //   privateKeyEncoding: {
      //     type: 'pkcs1',
      //     format: 'pem'
      //   }
      // })

      // save collection KeyStore
      // const publicKeyString = await KeyTokenService.createKeyToken({
      //   userId: newShop._id,
      //   publicKey
      // })

      // if (!publicKeyString) {
      //   return {
      //     code: 'xxx',
      //     message: 'publicKeyString error'
      //   }
      // }

      // const publicKeyObject = crypto.createPublicKey(publicKeyString)
      // // created token pair
      // const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyObject, privateKey)

      // return {
      //   shop: getInfoData({
      //     fields: ['_id', 'email', 'name'],
      //     object: newShop
      //   }),
      //   tokens
      // }
    }
    return {
      code: 200,
      metadata: null
    }
  }
}

module.exports = AccessService
