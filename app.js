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
db.init(config.get('postgres-'+process.env['NODE_NAME']))
const redisOption = {host:`${process.env['REDIS_HOST']||config.get('redis.host')}`,port:config.get('redis.port')}

/**
 * init middlewares
 */
const Koa = require('koa')
const cors = require('kcors')
const bodyParser = require('koa-bodyparser')
const scirichonCache = require('scirichon-cache')
const scirichonResponseMapper = require('scirichon-response-mapper')
const responseWrapper = require('scirichon-response-wrapper')
const check_token = require('scirichon-token-checker')
const acl_checker = require('scirichon-acl-checker')
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
const notification_io = new IO('Notification')
notification_io.attach(app)

/**
 * start server
 */
const initializeComponents = async ()=>{
    let schema_option = {redisOption,prefix:process.env['SCHEMA_TYPE']}
    await scirichonCache.initialize(schema_option)
    await scirichonResponseMapper.initialize(schema_option)
}
initializeComponents().then(()=>{
    app.listen(config.get('notifier.port'), () => {
        logger.info('App started')
    })
})

process.on('uncaughtException', (err) => {
    logger.error(`Caught exception: ${err}`)
})

