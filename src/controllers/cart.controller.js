'use strict'

const { CREATED, SuccessResponse } = require('../core/success.response')
const CartService = require('../services/cart.service')

class CartController {
  addToCart = async (req, res) => {
    new SuccessResponse({
      message: 'Create new cart success!',
      metadata: await CartService.addToCart(req.body)
    }).send(res)
  }

  update = async (req, res) => {
    new SuccessResponse({
      message: 'Create new cart success!',
      metadata: await CartService.addToCartV2(req.body)
    }).send(res)
  }

  deleteItemInCart = async (req, res) => {
    new SuccessResponse({
      message: 'Delete cart success!',
      metadata: await CartService.deleteItemInCart(req.body)
    }).send(res)
  }

  listUserCart = async (req, res) => {
    new SuccessResponse({
      message: 'List cart success!',
      metadata: await CartService.getListUserCart(req.params)
    }).send(res)
  }
}

module.exports = new CartController()
