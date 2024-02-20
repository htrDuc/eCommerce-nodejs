'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]))
}

const getUnSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]))
}

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      removeUndefinedObject(obj[k])
    } else {
      if (obj[k] === null) delete obj[k]
    }
  })
  return obj
}

const updateNestedObjectParse = (obj) => {
  console.log('1', obj)
  const final = {}
  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParse(obj[k])
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a]
      })
    } else {
      final[k] = obj[k]
    }
  })
  console.log('2', final)

  return final
}

const convertToObjectIdMongodb = (id) => new Types.ObjectId(id)

module.exports = {
  getInfoData,
  getSelectData,
  getUnSelectData,
  removeUndefinedObject,
  updateNestedObjectParse,
  convertToObjectIdMongodb
}
