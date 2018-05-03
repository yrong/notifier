const Router = require('koa-router')
const notifications = new Router()
const _ = require('lodash')
const models = require('sequelize-wrapper-advanced').models
const db_helper = require('../helper/db_helper')
const resultMapping = require('../helper/resultMapping')
const common = require('scirichon-common')
const NotificationType = 'Notification'

const search_processor = async function(ctx) {
    let user_id = ctx[common.TokenUserName].uuid,roles = ctx[common.TokenUserName].roles,
        params =_.assign({},ctx.params,ctx.query,ctx.request.body),query,
        model = models[NotificationType],result,row,rows = [],notification
    if(params.read == false){
        params.filter = _.merge(params.filter,{$not:{notified_user:{$contains:[user_id]}}})
    }
    if(params.subscribe == true){
        params.filter = _.merge(params.filter,{$or:[{subscribe_user:{$contains:[user_id]}},{subscribe_role:{$contains:roles}}]})
    }
    query = common.buildQueryCondition(params)
    query.attributes = params.attributes||{}
    result = await model.findAndCountAll(query)
    if(result&&result.rows){
        for(row of result.rows){
            try{
                notification = await resultMapping.notificationMapping(row,params)
            }catch(err){
                console.log(err.stack||err)
            }
            rows.push(notification||row)
        }
        result.rows = rows
    }
    ctx.body = result
}

const post_processor = async function(ctx) {
    let notification = ctx.request.body
    if(!notification.user){
        notification.user = ctx[common.TokenUserName]
    }
    notification = await models[NotificationType].create(notification);
    ctx.app[NotificationType].broadcast(NotificationType,notification)
    ctx.body = {uuid: notification.uuid}
}

const update_processor = async function(ctx) {
    let user_id = ctx[common.TokenUserName].uuid,notified_user,obj,model=models[NotificationType],update_obj = ctx.request.body
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
    let user_id = ctx[common.TokenUserName].uuid,update_obj = ctx.request.body
    if(update_obj.read){
        await db_helper.executeSql(`update "Notifications" set notified_user = notified_user || '{${user_id}}'` )
    }
    ctx.body = {}
}


notifications.post('/',post_processor)
notifications.put('/:uuid',update_processor)
notifications.post('/search',search_processor)
notifications.put('/',batch_update_notified_user)
if(process.env.NODE_ENV === 'development') {
    notifications.del('/hidden', async (ctx) => {
        await db_helper.executeSql(`delete from "Notifications"`)
        ctx.body = {}
    })
}


module.exports = notifications
