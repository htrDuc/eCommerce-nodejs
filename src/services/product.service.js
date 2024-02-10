'use strict'

const { product, clothing, electronic } = require('../models/product.model')
const { BadRequestError, AuthFailureError } = require('../core/error.response')
const { updateProductById } = require('../models/repositories/product.repo')

class ProductFactory {
  static async createProduct(type, payload) {
    switch (type) {
      case 'Electronic':
        return new Electronic(payload).createProduct()
      case 'Clothing':
        return new Clothing(payload).createProduct()
      default:
        throw new BadRequestError(`Invalid Product Type ${type}`)
    }
  }
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
    product_attributes,
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
    return await product.create({
      ...this,
      _id: product_id,
    })
  }

  async updateProduct(productId, payload) {
    return await updateProductById({ productId, payload, product })
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    })
    if (!newClothing) throw new BadRequestError('Create new Clothing error')

    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct) throw new BadRequestError('Create new Product error')
    return newProduct
  }

  async updateProduct(productId) {
    const objectParams = this
    if (objectParams.product_attributes) {
      await updateProductById({ productId, objectParams, clothing })
    }
    const updateProduct = await super.updateProduct(productId, objectParams)
    return updateProduct
  }
}

class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    })
    if (!newElectronic) throw new BadRequestError('Create new Clothing error')

    const newProduct = await super.createProduct(newElectronic._id)
    if (!newProduct) throw new BadRequestError('Create new Product error')
    return newProduct
  }
}

module.exports = ProductFactory
