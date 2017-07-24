const _ = require('lodash')
const Router = require('koa-router')
const notifications = require('./notification')
const router = new Router();
router.use(`/api/notifications`, notifications.routes(),notifications.allowedMethods())

module.exports = router
