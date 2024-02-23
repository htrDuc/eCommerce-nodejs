const { NotFoundError } = require('../core/error.response')
const { cart } = require('../models/cart.model')
const { getProductById } = require('../models/repositories/product.repo')

class CartService {
  // 1. Add product to Cart [User]
  // 2. Reduce product quantity [User]
  // 3. Increase product quantity [User]
  // 4. Get list to cart [User]
  // 5. Delete cart [User]
  // 6. Delete cart item [User]
  // Start Repo cart
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: 'active' }
    const updateOrInsert = {
      $addToSet: {
        cart_products: product
      }
    }
    const options = { upsert: true, new: true }
    return await cart.create(query, updateOrInsert, options)
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product
    const query = {
      cart_userId: userId,
      'cart_products.productId': productId,
      cart_state: 'active'
    }
    const updateSet = {
      $inc: {
        'cart_products.$.quantity': quantity
      }
    }
    const options = { upsert: true, new: true }
    return await cart.findOneAndUpdate(query, updateSet, options)
  }
  // End Repo cart

  static async addToCart({ userId, product = {} }) {
    // check cart ton tai hay khong
    const userCart = await cart.findOne({ cart_userId: userId })
    if (!userCart) {
      // create cart for User
      return await CartService.createUserCart({ userId, product })
    }

    // neu co gio hang roi nhung chua co san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product]
      return await userCart.save()
    }

    // gio hang ton tai va co san pham nay thi update quantity
    return await CartService.updateUserCartQuantity({ userId, product })
  }

  // update cart
  /*
    shop_orders_ids: [
      {
        shopId,
        item_products: [
          {
            quantity,
            old_quantity,
            productId
          }
        ],
        version
      }
    ]
  */

  static async addToCartV2({ userId, shop_order_ids = [] }) {
    const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]
    const foundProduct = await getProductById(productId)

    if (!foundProduct) throw new NotFoundError('')

    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError('Product do not belong to the Shop')
    }

    if (quantity === 0) {
      //deleted
    }
    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    })
  }

  static async deleteItemInCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: 'active' }
    const updateSet = {
      $pull: {
        cart_products: {
          productId
        }
      }
    }
    const deleteCart = await cart.updateOne(query, updateSet)
    return deleteCart
  }

  static async getListUserCart({ userId }) {
    return await cart
      .findOne({
        cart_userId: +userId
      })
      .lean()
  }
}

module.exports = CartService
