const express = require('express');
const wrap = require('./async');
const { toApi } = require('./presenter');
const { validateLogin } = require('../validators/ticket.validator');

module.exports = function authRoutes(authService) {
  const router = express.Router();
  router.post('/login', wrap(async (req, res) => {
    res.json(toApi(await authService.login(validateLogin(req.body))));
  }));
  return router;
};
