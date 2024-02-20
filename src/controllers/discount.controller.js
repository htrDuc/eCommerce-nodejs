'use strict'

const { CREATED, SuccessResponse } = require('../core/success.response')
const DiscountService = require('../services/discount.service')

class DiscountController {
  createDiscountCode = async (req, res) => {
    new SuccessResponse({
      message: 'Create discount code success!',
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId
      })
    }).send(res)
  }

  getAllDiscountCodesByShop = async (req, res) => {
    new SuccessResponse({
      message: 'Get all discount codes success!',
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId
      })
    }).send(res)
  }

  getDiscountAmount = async (req, res) => {
    new SuccessResponse({
      message: 'Get discount amount success!',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body
      })
    }).send(res)
  }

  getAllDiscountCodesWithProducts = async (req, res) => {
    new SuccessResponse({
      message: 'Get all discount codes with product success!',
      metadata: await DiscountService.getAllDiscountCodesWithProducts({
        ...req.query
      })
    }).send(res)
  }
}

module.exports = new DiscountController()
