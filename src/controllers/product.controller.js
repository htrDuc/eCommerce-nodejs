'use strict'

const { CREATED, SuccessResponse } = require('../core/success.response')
const ProductService = require('../services/product.service')
const ProductServiceV2 = require('../services/product.service.v2')

class ProductController {
  // createProduct = async (req, res) => {
  //   new SuccessResponse({
  //     message: 'Create product success!',
  //     metadata: await ProductService.createProduct(req.body.product_type, {
  //       ...req.body,
  //       product_shop: req.user.userId
  //     })
  //   }).send(res)
  // }
  createProduct = async (req, res) => {
    new SuccessResponse({
      message: 'Create product success!',
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  publishProductForShop = async (req, res) => {
    new SuccessResponse({
      message: 'Publish product success!',
      metadata: await ProductServiceV2.publishProductForShop({
        product_shop: req.user.userId,
        product_id: req.params.id
      })
    }).send(res)
  }

  unpublishProductForShop = async (req, res) => {
    new SuccessResponse({
      message: 'Unpublish product success!',
      metadata: await ProductServiceV2.unpublishProductForShop({
        product_shop: req.user.userId,
        product_id: req.params.id
      })
    }).send(res)
  }

  // QUERY //
  getAllDraftsForShop = async (req, res) => {
    new SuccessResponse({
      message: 'Get list draft product success!',
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId
      })
    }).send(res)
  }

  getAllPublishForShop = async (req, res) => {
    new SuccessResponse({
      message: 'Get list publish product success!',
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId
      })
    }).send(res)
  }

  getListSearchProduct = async (req, res) => {
    new SuccessResponse({
      message: 'Get list product search success!',
      metadata: await ProductServiceV2.searchProductsForUser(req.params)
    }).send(res)
  }

  findAllProducts = async (req, res) => {
    new SuccessResponse({
      message: 'Get findAllProducts success!',
      metadata: await ProductServiceV2.findAllProducts(req.query)
    }).send(res)
  }

  findProduct = async (req, res) => {
    new SuccessResponse({
      message: 'Get findProduct success!',
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id
      })
    }).send(res)
  }
}

module.exports = new ProductController()
