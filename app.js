const _ = require('lodash')
const config = require('config')
const logger = require('log4js_wrapper')
const scirichon_cache = require('scirichon-cache')
/**
 * init logger
 */

logger.initialize(config.get('logger'))


const Koa = require('koa')
const convert = require('koa-convert')
const cors = require('kcors')
const Static = require('koa-static')
const mount = require('koa-mount')
const bodyParser = require('koa-bodyparser')
const responseWrapper = require('scirichon-response-wrapper')
const models = require('./models')
const router = require('./routes')


/**
 * init middlewares
 */

const app = new Koa();
app.use(cors({ credentials: true }))
app.use(bodyParser())
app.use(mount("/", convert(Static(__dirname + '/public'))))
app.use(responseWrapper())
/**
 * init orm
 */

if(process.env.RebuildSchema){
    models.sequelize.sync({force: true}).then(function(){
        models.dbInit();
    })
}else if(process.env.upgradeSchema){
    models.sequelize.sync({force: false}).then(function(){
        models.dbInit();
    })
}


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
app.listen(config.get('port'), () => {
    console.log('server started')
    scirichon_cache.loadAll(config.get('cmdb.base_url')+'/api')
})

