'use strict'

const { CREATED, SuccessResponse } = require('../core/success.response')
const InventoryService = require('../services/inventory.service')

class InventoryController {
  addStockToInventory = async (req, res) => {
    new SuccessResponse({
      message: 'Add stock to inventory success!',
      metadata: await InventoryService.addStockToInventory(req.body),
    }).send(res)
  }
}

module.exports = new InventoryController()
