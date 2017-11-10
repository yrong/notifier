const config = require('config')
const scirichon_cache = require('scirichon-cache')
/**
 * init logger
 */
const Logger = require('log4js_wrapper')
Logger.initialize(config.get('logger'))
const logger = Logger.getLogger()


const Koa = require('koa')
const cors = require('kcors')
const bodyParser = require('koa-bodyparser')
const responseWrapper = require('scirichon-response-wrapper')
const check_token = require('scirichon-token-checker')
const acl_checker = require('scirichon-acl-checker')
const models = require('./models')
const router = require('./routes')


/**
 * init middlewares
 */

const app = new Koa();
app.use(cors({ credentials: true }))
app.use(bodyParser())
app.use(responseWrapper())
app.use(check_token({check_token_url:`http://${config.get('privateIP')||'localhost'}:${config.get('auth.port')}/auth/check`}))
app.use(acl_checker.middleware)

/**
 * init routes
 */
app.use(router.routes())

const IO = require( 'koa-socket' )
const notification_io = new IO(models.NotificationName)
notification_io.attach(app)

/**
 * start server
 */
scirichon_cache.initialize({cmdb_url: `http://${config.get('privateIP') || 'localhost'}:${config.get('cmdb.port')}/api`}).then((schemas)=>{
    if (schemas && schemas.length) {
        app.listen(config.get('notifier.port'), () => {
            console.log('app started')
        })
    }else{
        logger.fatal(`no schemas found,npm run init in cmdb first!`)
        process.exit(-2)
    }
})

