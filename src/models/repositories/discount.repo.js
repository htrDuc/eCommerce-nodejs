const { getSelectData, getUnSelectData } = require('../../utils')
const discount = require('../discount.model')

const checkDiscountExists = async ({ model, filter }) => {
  return await model.findOne(filter).lean()
}

const findAllDiscountCodesUnSelect = async ({ limit, page, sort = 'ctime', filter, unSelect }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  return await discount.find(filter).sort(sortBy).limit(limit).skip(skip).select(getUnSelectData(unSelect)).lean()
}

const findAllDiscountCodesSelect = async ({ limit, page, sort, filter, select }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  return await discount.find(filter).sort(sortBy).limit(limit).skip(skip).select(getSelectData(select)).lean()
}

module.exports = {
  checkDiscountExists,
  findAllDiscountCodesUnSelect,
  findAllDiscountCodesSelect
}
