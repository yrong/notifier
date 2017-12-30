const scirichon_cache = require('scirichon-cache')
const _ = require('lodash')
const common = require('scirichon-common')
const config = require('config')
const schema = require('redis-json-schema')
const uuid_validator = require('uuid-validate')

const notificationMapping = async function(notification){
    notification.actor = notification.user
    notification.actor.alias = notification.user.name
    notification = _.omit(notification,['notified_user','user','subscribe_user','subscribe_role','updatedAt'])
    notification.old = await notificationObjectMapping(notification.old)
    notification.new = await notificationObjectMapping(notification.new)
    notification.update = await notificationObjectMapping(notification.update)
    return notification//common.pruneEmpty(notification);
}

const referencedObjectMapper = async (val,props)=>{
    if(props.properties){
        for(let key in props.properties){
            if(val[key]&&props.properties[key].schema){
                if(uuid_validator(val[key])){
                    val[key]= await scirichon_cache.getItemByCategoryAndID(props.properties[key].schema,val[key])||val[key]
                }
            }
        }
    }
    return val
}

const resultMapperBySchema = async (val) => {
    let properties = schema.getSchemaProperties(val.category),objs,obj
    for (let key in val) {
        if (val[key] && properties[key]) {
            if(properties[key].schema){
                val[key] = await scirichon_cache.getItemByCategoryAndID(properties[key].schema,val[key]) || val[key]
            }
            else if(val[key].length&&properties[key].type==='array'&&properties[key].items.schema){
                objs = []
                for(let id of val[key]){
                    obj = await scirichon_cache.getItemByCategoryAndID(properties[key].items.schema,id)||id
                    objs.push(obj)
                }
                val[key] = objs
            }else if(properties[key].type==='object') {
                val[key] = await referencedObjectMapper(val[key], properties[key])
            }else if (properties[key].type === 'array' && properties[key].items.type === 'object') {
                for (let entry of val[key]) {
                    entry = await referencedObjectMapper(entry, properties[key].items)
                }
            }
        }
    }
    return val
}

const notificationObjectMapping = async function(obj) {
    let it_services_items = [],it_services_item,article
    if(obj){
        if(obj.it_service&&obj.it_service.length){
            for(let it_service_uuid of obj.it_service){
                it_services_item = await scirichon_cache.getItemByCategoryAndID('ITService',it_service_uuid)
                if(!_.isEmpty(it_services_item))
                    it_services_items.push(it_services_item);
            }
            obj.it_service = _.isEmpty(it_services_items)?obj.it_service:it_services_items
        }
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
            obj = await resultMapperBySchema(obj)
        }
    }
    return obj
}

module.exports = {notificationMapping}