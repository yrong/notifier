/**
 * init logger
 */
const config = require('config')
const Logger = require('log4js-wrapper-advanced')
Logger.initialize(config.get('logger'))
const logger = Logger.getLogger()

/**
 * init db schema
 */
const db = require('sequelize-wrapper-advanced')
db.init(config.get('postgres-'+process.env['NODE_NAME']))
const redisOption = config.get('redis')

/**
 * init middlewares
 */
const Koa = require('koa')
const cors = require('kcors')
const bodyParser = require('koa-bodyparser')
const common = require('scirichon-common')
const scirichonCache = require('scirichon-cache')
const responseWrapper = require('scirichon-response-wrapper')
const authenticator = require('scirichon-authenticator')
const app = new Koa();
app.use(cors({ credentials: true }))
app.use(bodyParser())
app.use(responseWrapper())
app.use(authenticator.checkToken({check_token_url:`${common.getServiceApiUrl('auth')}/auth/check`}))
app.use(authenticator.checkAcl({redisOption}))

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
}
initializeComponents().then(()=>{
    app.listen(config.get('notifier.port'), () => {
        logger.info('App started')
    })
})

process.on('uncaughtException', (err) => {
    logger.error(`Caught exception: ${err}`)
})

