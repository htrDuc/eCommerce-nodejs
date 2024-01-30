'use strict'

const { product, clothing, electronic } = require('../models/product.model')
const { BadRequestError, AuthFailureError } = require('../core/error.response')

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
    return await product.create({
      ...this,
      _id: product_id
    })
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
}

// Register
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Clothing', Clothing)

module.exports = ProductFactory
