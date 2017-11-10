const scirichon_cache = require('scirichon-cache')
const _ = require('lodash')
const common = require('scirichon-common')
const config = require('config')

const notificationMapping = async function(notification){
    notification.old = await notificationObjectMapping(notification.old)
    notification.new = await notificationObjectMapping(notification.new)
    notification.update = await notificationObjectMapping(notification.update)
    return common.pruneEmpty(notification);
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
    return obj
}

module.exports = {notificationMapping}