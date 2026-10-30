// Lớp trình bày: nhận HTTP, kiểm định dạng (tầng 1), gọi service, trả JSON. Mọi lối vào đều đi qua service.
const express = require('express');
const wrap = require('./async');
const { toApi } = require('./presenter');
const { validateCreateCustomer, validateUpdateCustomer } = require('../validators/customer.validator');
const { parseId, failIfAny } = require('../validators/common');

module.exports = function customerRoutes(customerService) {
  const router = express.Router();

  // GET /api/customers?phone=...  (US1, FR8: kèm name để đối chiếu)
  router.get('/', wrap(async (req, res) => {
    if (!req.query.phone) failIfAny({ phone: 'Bắt buộc nhập số điện thoại' });
    res.json(toApi(await customerService.lookupByPhone(req.user, req.query.phone, req.query.name)));
  }));

  router.post('/', wrap(async (req, res) => {
    res.status(201).json(toApi(await customerService.createCustomer(req.user, validateCreateCustomer(req.body))));
  }));

  router.get('/:id', wrap(async (req, res) => {
    res.json(toApi(await customerService.getCustomer(req.user, parseId(req.params.id))));
  }));

  router.patch('/:id', wrap(async (req, res) => {
    const patch = validateUpdateCustomer(req.body);
    res.json(toApi(await customerService.updateCustomer(req.user, parseId(req.params.id), patch)));
  }));

  // QT-13: không có endpoint DELETE; "xóa" là xóa mềm
  router.post('/:id/soft-delete', wrap(async (req, res) => {
    res.json(toApi(await customerService.softDeleteCustomer(req.user, parseId(req.params.id))));
  }));

  return router;
};
