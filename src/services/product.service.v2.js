'use strict'

const { product, clothing, electronic } = require('../models/product.model')
const { BadRequestError, AuthFailureError } = require('../core/error.response')
const {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductForShop,
  unpublishProductForShop,
  searchProductsForUser,
  findAllProducts,
  findProduct,
  updateProductById,
  getProductById
} = require('../models/repositories/product.repo')
const { removeUndefinedObject, updateNestedObjectParse } = require('../utils')
const { insertInventory } = require('../models/repositories/inventory.repo')

// Factory pattern
class ProductFactory {
  static productRegistry = {}
  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef
  }
  static async createProduct(type, payload) {
    const productTypeClass = ProductFactory.productRegistry[type]
    if (!productTypeClass) throw new BadRequestError(`Invalid Product Type ${type}`)

    return new productTypeClass(payload).createProduct()
  }

  static async updateProduct(type, productId, payload) {
    const productTypeClass = ProductFactory.productRegistry[type]
    if (!productTypeClass) throw new BadRequestError(`Invalid Product Type ${type}`)

    return new productTypeClass(payload).updateProduct(productId)
  }

  // PUT //
  static async publishProductForShop({ product_shop, product_id }) {
    return await publishProductForShop({ product_shop, product_id })
  }
  static async unpublishProductForShop({ product_shop, product_id }) {
    return await unpublishProductForShop({ product_shop, product_id })
  }
  // END PUT //

  // QUERY //
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true }
    return await findAllDraftsForShop({ query, limit, skip })
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true }
    return await findAllPublishForShop({ query, limit, skip })
  }

  static async searchProductsForUser({ keySearch }) {
    return await searchProductsForUser({ keySearch })
  }

  static async findAllProducts({ limit = 50, page = 1, sort = 'ctime', filter = { isPublished: true } }) {
    return await findAllProducts({
      limit,
      page,
      sort,
      filter,
      select: ['product_name', 'product_price', 'product_thumb', 'product_shop']
    })
  }

  static async findProduct({ product_id }) {
    return await findProduct({
      product_id,
      unselect: ['__v']
    })
  }
  // END QUERY //
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes
  }) {
    this.product_attributes = product_attributes
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
  }

  // create new Product
  async createProduct(product_id) {
    const newProduct = await product.create({
      ...this,
      _id: product_id
    })
    if (newProduct) {
      // add product_stock in inventory collection
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity
      })
    }
    return newProduct
  }

  async updateProduct(productId, payload) {
    return await updateProductById({ productId, payload, model: product })
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newClothing) throw new BadRequestError('Create new Clothing error')

    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct) throw new BadRequestError('Create new Product error')
    return newProduct
  }

  async updateProduct(productId) {
    const foundProduct = await getProductById(productId)
    if (!foundProduct) throw new BadRequestError('Can not find product')
    if (this.product_shop !== foundProduct.product_shop.toString()) {
      throw new BadRequestError('You are not owner of this product')
    }

    const objectParams = removeUndefinedObject(this)
    if (this.product_shop)
      if (objectParams.product_attributes) {
        await updateProductById({
          productId,
          payload: updateNestedObjectParse(objectParams.product_attributes),
          model: clothing
        })
      }
    const updateProduct = await super.updateProduct(productId, updateNestedObjectParse(objectParams))
    return updateProduct
  }
}

class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newElectronic) throw new BadRequestError('Create new Clothing error')

    const newProduct = await super.createProduct(newElectronic._id)
    if (!newProduct) throw new BadRequestError('Create new Product error')
    return newProduct
  }

  async updateProduct(productId) {
    const foundProduct = await getProductById(productId)
    if (!foundProduct) throw new BadRequestError('Can not find product')
    if (this.product_shop !== foundProduct.product_shop.toString()) {
      throw new BadRequestError('You are not owner of this product')
    }
    const objectParams = this
    console.log(objectParams)
    if (objectParams.product_attributes) {
      await updateProductById({ productId, objectParams, clothing })
    }
    const updateProduct = await super.updateProduct(productId, objectParams)
    return updateProduct
  }
}

// Register
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Clothing', Clothing)

module.exports = ProductFactory
