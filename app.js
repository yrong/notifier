/**
 * init logger
 */
const config = require('config')
const Logger = require('log4js_wrapper')
Logger.initialize(config.get('logger'))
const logger = Logger.getLogger()

/**
 * init db schema
 */
const db = require('sequelize-wrapper-advanced')
db.init(config.get('postgres-notification'))
db.NotificationName = 'Notification'

/**
 * init middlewares
 */
const Koa = require('koa')
const cors = require('kcors')
const bodyParser = require('koa-bodyparser')
const schema = require('redis-json-schema')
const scirichon_cache = require('scirichon-cache')
const responseWrapper = require('scirichon-response-wrapper')
const check_token = require('scirichon-token-checker')
const acl_checker = require('scirichon-acl-checker')
const redisOption = {host:`${process.env['REDIS_HOST']||config.get('redis.host')}`,port:config.get('redis.port'),dbname:'cmdb'}
const cache_loadUrl = {cmdb_url:`http://${config.get('privateIP') || 'localhost'}:${config.get('cmdb.port')}/api`}
const app = new Koa();
app.use(cors({ credentials: true }))
app.use(bodyParser())
app.use(responseWrapper())
app.use(check_token({check_token_url:`http://${config.get('privateIP')||'localhost'}:${config.get('auth.port')}/auth/check`}))
app.use(acl_checker({redisOption}))

/**
 * init routes
 */
const router = require('./routes')
app.use(router.routes())
const IO = require( 'koa-socket' )
const notification_io = new IO(db.NotificationName)
notification_io.attach(app)

/**
 * start server
 */
schema.loadSchemas({redisOption}).then((schemas)=>{
    if (schemas && schemas.length) {
        scirichon_cache.initialize({loadUrl: cache_loadUrl,redisOption})
        app.listen(config.get('notifier.port'), () => {
            logger.info('App started')
        })
    }else{
        logger.fatal(`no schemas found,npm run init first!`)
        process.exit(-2)
    }
})

process.on('uncaughtException', (err) => {
    logger.error(`Caught exception: ${err}`)
})

