'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const ShopService = require('./shop.service')

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}
class AccessService {
  /**
    Check this token used
  */
  // static handlerRefreshToken = async (refreshToken) => {
  //   // Check if token is used
  //   const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
  //   // If used
  //   if (foundToken) {
  //     // Decode to know who are you ?
  //     const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
  //     console.log('[1]', { userId, email })

  //     // Remove token in KeyStore
  //     await KeyTokenService.deleteKeyByUserId(userId)
  //     throw new ForbiddenError('Something wrong happened!! Please login again')
  //   }

  //   // If not
  //   const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
  //   if (!holderToken) throw new AuthFailureError('Shop is not registered 1')

  //   // Verify token
  //   const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
  //   console.log('[2]', { userId, email })

  //   const foundShop = await ShopService.findByEmail({ email })
  //   if (!foundShop) throw new AuthFailureError('Shop is not registered 2')
  //   console.log('[3]', foundShop)

  //   // Create new pair tokens
  //   const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)
  //   console.log(tokens)
  //   // Update token
  //   await holderToken.updateOne({
  //     $set: {
  //       refreshToken: tokens.refreshToken
  //     },
  //     $addToSet: {
  //       refreshTokensUsed: refreshToken // Used to create new token pair
  //     }
  //   })

  //   return {
  //     user: { userId, email },
  //     tokens
  //   }
  // }

  // Fixed V2
  static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyByUserId(userId)
      throw new ForbiddenError('Something wrong happened!! Please login again')
    }

    if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop is not registered')

    const foundShop = await ShopService.findByEmail({ email })
    if (!foundShop) throw new AuthFailureError('Shop is not registered')

    // Create new pair tokens
    const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

    // Update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken // Used to create new token pair
      }
    })

    return {
      user,
      tokens
    }
  }

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
