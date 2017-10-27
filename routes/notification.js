const Router = require('koa-router')
const notifications = new Router();
const _ = require('lodash')
const models = require('../models');
const db_helper = require('../helper/db_helper')
const Notification = models.NotificationName
const resultMapping = require('../helper/resultMapping')
const common = require('scirichon-common')

const search_processor = async function(ctx) {
    let user_id = ctx[common.TokenUserName].userid,
        query =_.assign({},ctx.params,ctx.query,ctx.request.body),
        model = models[Notification], result,mapped_rows = []
    if(query.read == false){
        query.filter = _.merge(query.filter,{$not:{notified_user:{$contains:[user_id]}}})
    }
    query = db_helper.buildQueryCondition(query)
    result = await model.findAndCountAll(query)
    for (let row of result.rows){
        row = _.omit(row,['notified_user'])
        row.actor = row.user
        delete row.user
        row = await resultMapping.notificationMapping(row)
        mapped_rows.push(row)
    }
    result.rows = mapped_rows
    ctx.body = result
}

const post_processor = async function(ctx) {
    let notification = ctx.request.body
    notification = await models[Notification].create(notification);
    ctx.app[Notification].broadcast(Notification,notification)
    ctx.body = {uuid: notification.uuid}
}

const update_processor = async function(ctx) {
    let user_id = ctx[common.TokenUserName].userid,notified_user,obj,model=models[Notification],update_obj = ctx.request.body
    obj = await model.findOne({
        where: {
            uuid: ctx.params.uuid
        }
    })
    if(update_obj.read){
        notified_user = _.clone(obj.notified_user)||[]
        notified_user = _.uniq(_.concat(notified_user,[user_id]))
        update_obj.notified_user = notified_user
    }
    await(obj.update(update_obj))
    ctx.body = {}
}

const batch_update_notified_user = async function(ctx) {
    let user_id = ctx[common.TokenUserName].userid,update_obj = ctx.request.body
    if(update_obj.read){
        await db_helper.executeSql(`update "Notifications" set notified_user = notified_user || ${user_id}` )
    }
    ctx.body = {}
}


notifications.post('/',post_processor)
notifications.put('/:uuid',update_processor)
notifications.post('/search',search_processor)
notifications.put('/',batch_update_notified_user)


module.exports = notifications
