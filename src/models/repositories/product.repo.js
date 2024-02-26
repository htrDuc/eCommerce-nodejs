const { Types } = require('mongoose')
const { product } = require('../product.model')
const { getSelectData, getUnSelectData, convertToObjectIdMongodb } = require('../../utils')

const searchProductsForUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch)
  const results = await product
    .find(
      {
        isPublished: true,
        $text: {
          $search: regexSearch
        }
      },
      {
        score: { $meta: 'textScore' }
      }
    )
    .sort({
      score: { $meta: 'textScore' }
    })
    .lean()
  return results
}

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const publishProductForShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id)
  })

  if (!foundShop) return null

  const { modifiedCount } = await product.updateOne(
    {
      _id: new Types.ObjectId(product_id)
    },
    {
      isDraft: false,
      isPublished: true
    }
  )
  return modifiedCount
}

const unpublishProductForShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id)
  })

  if (!foundShop) return null
  const { modifiedCount } = await product.updateOne(
    {
      _id: new Types.ObjectId(product_id)
    },
    {
      isDraft: true,
      isPublished: false
    }
  )
  return modifiedCount
}

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
}

const findAllProducts = async ({ limit, page, sort, filter, select }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  return await product.find(filter).sort(sortBy).limit(limit).skip(skip).select(getSelectData(select)).lean()
}

const findProduct = async ({ product_id, unselect }) => {
  return await product.findById(product_id).select(getUnSelectData(unselect))
}

const updateProductById = async ({ productId, payload, model, isNew = true }) => {
  return await model.findByIdAndUpdate(productId, payload, {
    new: isNew
  })
}

const getProductById = async (productId) => {
  return await product.findOne({ _id: convertToObjectIdMongodb(productId) }).lean()
}

const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById(product.productId)
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          productId: product.productId
        }
      }
    })
  )
}

module.exports = {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductForShop,
  unpublishProductForShop,
  searchProductsForUser,
  findAllProducts,
  findProduct,
  updateProductById,
  checkProductByServer,
  getProductById
}
