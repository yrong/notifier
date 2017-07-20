const _ = require('lodash')
const Router = require('koa-router')
const notifications = require('./notification')
const router = new Router();
router.use(`/notifications`,  notifications.routes(),notifications.allowedMethods())

module.exports = router
