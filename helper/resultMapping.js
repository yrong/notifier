const cmdb_cache = require('cmdb-cache')
const _ = require('lodash')
const common = require('scirichon-common')
const config = require('config')
const kb_api_config = config.get('kb')

const notificationMapping = async function(notification){
    notification.old = await notificationObjectMapping(notification.old)
    notification.new = await notificationObjectMapping(notification.new)
    notification.update = await notificationObjectMapping(notification.update)
    return notification;
};

const notificationObjectMapping = async function(obj) {
    let it_services_items = [],article
    if(obj&&obj.it_service){
        _.each(obj.it_service,function(it_service_uuid){
            it_services_items.push(cmdb_cache.getItemByCategoryAndID('ITService',it_service_uuid));
        });
        obj.it_service = _.isEmpty(it_services_items)?obj.it_service:it_services_items
    }
    if(obj&&obj.article_id){
        article = await common.apiInvoker('GET',kb_api_config.base_url,`/articles/${obj.article_id}`)
        if(article&&article.data){
            obj.article = article.data
            delete obj.article_id
        }
    }
    return obj
}

module.exports = {notificationMapping: notificationMapping}