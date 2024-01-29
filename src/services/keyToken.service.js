'use strict'

const { Types } = require('mongoose')
const keyTokenModel = require('../models/keytoken.model')

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // level 0
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey
      // })
      // return tokens ? tokens.publicKey : null

      // level xxx
      const filter = { user: userId }
      const update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken }
      const options = { upsert: true, new: true } // if not exist will be create, if exist will be update

      const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }

  static findByUserId = async (userId) => {
    return await keyTokenModel.findOne({
      user: new Types.ObjectId(userId)
    })
  }

  static removeKeyById = async (id) => {
    return await keyTokenModel.deleteOne({
      _id: new Types.ObjectId(id)
    })
  }

  static deleteKeyByUserId = async (userId) => {
    return await keyTokenModel.deleteOne({ user: new Types.ObjectId(userId) })
  }

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken }).lean()
  }

  static findByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshToken })
  }
}

module.exports = KeyTokenService
