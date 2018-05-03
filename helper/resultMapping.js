const _ = require('lodash')
const scirichon_response_mapper = require('scirichon-response-mapper')

const notificationMapping = async function(notification,params){
    notification.actor = _.omit(notification.user,'token')
    notification = _.omit(notification,['notified_user','user','subscribe_user','subscribe_role','updatedAt'])
    notification.old = await notificationObjectMapping(notification.old,params)
    notification.new = await notificationObjectMapping(notification.new,params)
    notification.update = await notificationObjectMapping(notification.update,params)
    return notification
}


const notificationObjectMapping = async function(obj,params) {
    if(obj&&obj.category){
        obj = await scirichon_response_mapper.responseMapper(obj,params)
        if(_.isObject(obj.subscriber))
            obj.subscriber = _.omit(obj.subscriber,['token'])
    }
    return obj
}

module.exports = {notificationMapping}