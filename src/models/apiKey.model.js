'use strict'

const { Schema, model } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'ApiKey'
const COLLECTION_NAME = 'ApiKey'

// Declare the Schema of the Mongo model
var apiKeyTokenSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: Boolean,
      default: true
    },
    permissions: {
      type: [String],
      enum: ['0000', '1111', '2222'],
      required: true
    }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

//Export the model
module.exports = model(DOCUMENT_NAME, apiKeyTokenSchema)
