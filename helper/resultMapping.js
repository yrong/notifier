const scirichon_cache = require('scirichon-cache')
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
    let it_services_items = [],it_services_item,article
    if(obj&&obj.it_service&&obj.it_service.length){
        for(let it_service_uuid of obj.it_service){
            it_services_item = await scirichon_cache.getItemByCategoryAndID('ITService',it_service_uuid)
            if(it_services_item)
                it_services_items.push(it_services_item);
        }
        obj.it_service = _.isEmpty(it_services_items)?obj.it_service:it_services_items
    }
    if(obj&&obj.article_id){
        try {
            article = await common.apiInvoker('GET', kb_api_config.base_url, `/articles/${obj.article_id}`)
            if (article && article.data) {
                obj.article = article.data
                delete obj.article_id
            }
        }catch(err){
            //just ignore the error
        }
    }
    return obj
}

module.exports = {notificationMapping: notificationMapping}