'use strict'

const { BadRequestError } = require('../core/error.response')
const { findCartById } = require('../models/repositories/cart.repo')
const { checkProductByServer } = require('../models/repositories/product.repo')
const { getDiscountAmount } = require('./discount.service')
const { acquireLock, releaseLock } = require('./redis.service')

class CheckoutService {
  // login and without login
  /*
        {
            cardId, // check
            userId, // check
            shop_order_ids: [
                {
                    shopId,
                    shop_discount: [],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                },
                {
                    shopId,
                    shop_discount: [{
                        shopId,
                        discountId
                        codeId
                    }],
                    item_products: [
                        {
                            price, // check
                            quantity,
                            productId
                        }
                    ]
                }
            ]
        }
    */
  static async checkoutReview({ cardId, userId, shop_order_ids }) {
    // check cardId ton tai khong
    const foundCart = await findCartById(cardId)
    if (!foundCart) throw new BadRequestError('Cart does not exist')

    const checkout_order = {
      totalPrice: 0, // tong tien hang
      feeShip: 0, // phi van chuyem
      totalDiscount: 0, // tong tien discount giam gia
      totalCheckout: 0, // tong thanh toan
    }
    const shop_order_ids_new = []
    // tinh tong tien bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i]
      // check product avaible
      const checkProductServer = await checkProductByServer(item_products)
      if (!checkProductServer[0]) throw new BadRequestError('order wrong !!')

      // tong tien dat hang
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.price * product.quantity
      }, 0)

      // tong tien truoc khi giam gia
      checkout_order.totalPrice += checkoutPrice

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tien truoc khi giam gia
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      }

      // new shop_discounts ton tai > 0, check xem co hop le hay khong
      if (shop_discounts.length > 0) {
        // gia su chi co mot discount
        // get amount discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        })
        // tong cong discount giam gia
        checkout_order.totalDiscount += discount
        // neu tien giam gia lon hon 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount
        }
      }

      // tong thanh toan cuoi cung
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
      shop_order_ids_new.push(itemCheckout)
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    }
  }

  // order
  static async orderByUser({
    shop_order_ids_new,
    cardId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids: shop_order_ids_new,
      })

    // check lai 1 lan nua xem vuot ton kho hay khong ?
    // Get new Array Products
    const products = shop_order_ids_new.flatMap((order) => order.item_products)
    console.log('🚀 ~ CheckoutService ~ orderByUser ~ products:', products)
    const acquireProduct = []
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i]
      const keyLock = await acquireLock(productId, quantity, cartId)
      acquireProduct.push(keyLock ? true : false)
      if(keyLock) {
        await releaseLock(keyLock)
      }
    }

    // check if co mot san pham het hang trong kho
    if()
  }
}

module.exports = CheckoutService
