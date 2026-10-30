const express = require('express');
const wrap = require('./async');
const { toApi } = require('./presenter');
const {
  validateCreateTicket, validateUpdateTicket, validateApproveWarranty,
} = require('../validators/ticket.validator');
const { parseId, parsePaging, failIfAny } = require('../validators/common');

module.exports = function ticketRoutes(ticketService) {
  const router = express.Router();

  // GET /api/tickets  hoặc  ?warranty_verified=false (Quản lý, phiếu chờ xác minh)
  router.get('/', wrap(async (req, res) => {
    const wv = req.query.warranty_verified;
    if (wv !== undefined && wv !== 'false') failIfAny({ warranty_verified: 'Chỉ nhận giá trị false' });
    const paging = parsePaging(req.query);
    const { rows, total } = await ticketService.listTickets(req.user, { onlyUnverified: wv === 'false', ...paging });
    res.json(toApi({ data: rows, page: paging.page, size: paging.size, total }));
  }));

  router.post('/', wrap(async (req, res) => {
    res.status(201).json(toApi(await ticketService.createTicket(req.user, validateCreateTicket(req.body))));
  }));

  router.get('/:id', wrap(async (req, res) => {
    res.json(toApi(await ticketService.getTicket(req.user, parseId(req.params.id))));
  }));

  router.patch('/:id', wrap(async (req, res) => {
    const patch = validateUpdateTicket(req.body);
    res.json(toApi(await ticketService.updateTicket(req.user, parseId(req.params.id), patch)));
  }));

  router.patch('/:id/approve-warranty', wrap(async (req, res) => {
    const input = validateApproveWarranty(req.body);
    res.json(toApi(await ticketService.approveWarranty(req.user, parseId(req.params.id), input)));
  }));

  router.get('/:id/status-log', wrap(async (req, res) => {
    const paging = parsePaging(req.query);
    const { rows, total } = await ticketService.getStatusLog(req.user, parseId(req.params.id), paging);
    res.json(toApi({ data: rows, page: paging.page, size: paging.size, total }));
  }));

  // QT-13: không có endpoint DELETE; "xóa" là xóa mềm
  router.post('/:id/soft-delete', wrap(async (req, res) => {
    res.json(toApi(await ticketService.softDeleteTicket(req.user, parseId(req.params.id))));
  }));

  return router;
};
