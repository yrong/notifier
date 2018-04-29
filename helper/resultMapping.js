const _ = require('lodash')
const common = require('scirichon-common')
const config = require('config')
const scirichon_response_mapper = require('scirichon-response-mapper')

const notificationMapping = async function(notification){
    notification.actor = _.omit(notification.user,'token')
    notification = _.omit(notification,['notified_user','user','subscribe_user','subscribe_role','updatedAt'])
    notification.old = await notificationObjectMapping(notification.old)
    notification.new = await notificationObjectMapping(notification.new)
    notification.update = await notificationObjectMapping(notification.update)
    return notification//common.pruneEmpty(notification);
}


const notificationObjectMapping = async function(obj) {
    let article
    if(obj){
        if(obj.article_id){
            try {
                article = await common.apiInvoker('GET', `http://${config.get('privateIP')||'localhost'}:${config.get('kb.port')}`, `/KB/API/v1/articles/${obj.article_id}`)
                article = article.data || article
                if (article) {
                    obj.article = article
                    delete obj.article_id
                }
            }catch(err){
                console.log(err.stack||err)
            }
        }
        if(obj.category) {
            try{
                obj = await scirichon_response_mapper.referencedObjectMapper(obj)
                if(obj.subscriber)
                    obj.subscriber = _.omit(obj.subscriber,'token')
            }catch(err){
                console.log(err.stack||err)
            }
        }
    }
    return obj
}

module.exports = {notificationMapping}