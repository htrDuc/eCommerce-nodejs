'use strict'

const { Schema, model } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

// Declare the Schema of the Mongo model
const orderTokenSchema = new Schema(
  {
    order_userId: { type: Number, required: true },
    /*
      order_checkout = {
        totalPrice,
        totalApplyDiscount,
        feeShip
      }
    */
    order_checkout: { type: Object, default: {} },
    /*
      street,
      city,
      state,
      country
    */
    order_shipping: { type: Object, default: {} },
    order_payment: { type: Object, default: {} },
    order_products: { type: Array, required: true },
    order_trackingNumber: { type: String, default: '#0000118052022' },
    order_status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'cancel', 'delivered'],
      default: 'pending',
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: 'createdOn',
      updatedAt: 'modifiedOn',
    },
  },
)

//Export the model
module.exports = {
  order: model(DOCUMENT_NAME, orderTokenSchema),
}
