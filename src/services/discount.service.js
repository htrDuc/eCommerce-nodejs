'use strict'

const { NotFoundError, BadRequestError } = require('../core/error.response')
const discount = require('../models/discount.model')
const {
  checkDiscountExists,
  findAllDiscountCodesUnSelect,
  findAllDiscountCodesSelect
} = require('../models/repositories/discount.repo')
const { convertToObjectIdMongodb } = require('../utils')
const { findAllProducts } = require('../models/repositories/product.repo')
class DiscountService {
  static async createDiscountCode(payload) {
    const {
      name,
      description,
      type,
      value,
      code,
      start_date,
      end_date,
      max_uses,
      uses_count,
      users_used,
      max_uses_per_user,
      min_order_value,
      is_active,
      applies_to,
      product_ids,
      shopId
    } = payload
    // Kiem tra
    if ((new Date() < new Date(start_date)) | (new Date() > new Date(end_date))) {
      throw new BadRequestError('Discount code has expired')
    }

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError('Start date must be before end date')
    }

    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId)
      }
    })

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError(`Discount exists`)
    }

    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : product_ids,
      discount_shopId: shopId
    })

    return newDiscount
  }

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true
      },
      select: ['discount_code', 'discount_name']
    })
    return discounts
  }

  static async getAllDiscountCodesWithProducts({ codeId, shopId, limit, page }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId)
      }
    })

    if (!foundDiscount && !foundDiscount.discount_is_active) throw new NotFoundError(`Discount does not exist`)

    const { discount_applies_to, discount_product_ids } = foundDiscount
    let products
    if (discount_applies_to === 'all') {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name']
      })
    }

    if (discount_applies_to === 'specific') {
      // get the products ids
      products = await findAllProducts({
        filter: {
          _id: {
            $in: discount_product_ids
          },
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name']
      })
    }

    return products
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId)
      }
    })

    if (!foundDiscount) throw new NotFoundError(`Discount does not exist`)

    const {
      discount_is_active,
      discount_max_uses,
      discount_value,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_users_used,
      discount_max_uses_per_user,
      discount_type
    } = foundDiscount
    if (!discount_is_active) throw new NotFoundError(`Discount expired!`)
    if (!discount_max_uses) throw new NotFoundError(`Discount are out!`)

    if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
      throw new NotFoundError(`Discount expired!`)
    }

    // check xem co set gia tri toi thieu hay ko
    let totalOrder = 0
    if (discount_min_order_value > 0) {
      // Get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price
      }, 0)

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(`Discount requires a minimum order value of ${discount_min_order_value}!`)
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUseDiscount = discount_users_used.find((user) => user.userId === userId)
      if (userUseDiscount) {
        //...
      }
    }

    // check xem discount nay la fixed_amount or percentage
    const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount
    }
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId)
    })
    return deleted
  }

  /**
   * Cancel Discount Code ()
   */
  static async cancelDiscountCode({ shopId, codeId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId)
      }
    })

    if (!foundDiscount) throw new NotFoundError(`Discount does not exist`)

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1
      }
    })
    return result
  }
}

module.exports = DiscountService
