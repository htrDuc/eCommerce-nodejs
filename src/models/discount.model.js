'use strict'

const { Schema, model } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'

// Declare the Schema of the Mongo model
const discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: 'fixed_amount' }, // percentage
    discount_value: { type: Number, required: true }, // 10.000, 10%,
    discount_code: { type: String, required: true },
    discount_start_date: { type: Date, required: true },
    discount_end_date: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true }, // Number of discount can be used
    discount_uses_count: { type: Number, required: true }, // How many discount used
    discount_users_used: { type: Array, default: [] }, // who used
    discount_max_uses_per_user: { type: Number, required: true }, // The maximum number allowed per user to be used
    discount_min_order_value: { type: Number, required: true },
    discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    discount_is_active: { type: Boolean, default: true },

    discount_applies_to: {
      type: String,
      required: true,
      enum: ['all', 'specific'],
    }, // This discount can be applied to all products or specific product
    discount_product_ids: {
      type: Array,
      default: [],
    }, // List product can be applied this voucher
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  },
)

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema)
