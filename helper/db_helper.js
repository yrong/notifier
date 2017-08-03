var Pool = require('pg-pool')
var config = require('config')
var pg_config=config.get('postgres');//pg的连接参数
var pool = new Pool(pg_config);
var _ = require('lodash');
const PageSize = config.get('perPageSize');

var pruneEmpty = function(obj) {
    return function prune(current) {
        _.forOwn(current, function (value, key) {
            if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) ||
                (_.isString(value) && _.isEmpty(value)) ||
                (_.isObject(value) && _.isEmpty(prune(value)))) {

                delete current[key];
            }
        });
        if (_.isArray(current)) _.pull(current, undefined);
        return current;

    }(_.cloneDeep(obj));
}

const buildQueryCondition = (querys) =>{
    let sortby = querys.sortby?querys.sortby:'createdAt';
    let order = querys.order?querys.order:'DESC';
    let page = querys.page?querys.page:1;
    let per_page = querys.per_page?querys.per_page:PageSize;
    let offset = (parseInt(page)-1)*parseInt(per_page);
    querys.filter = querys.filter?pruneEmpty(querys.filter):{}
    return {where:querys.filter,order:[[sortby,order]],offset:offset,limit:per_page,raw:true};
}

const executeSql = async (sql)=>{
    console.log('execute sql:'+sql)
    let result = await pool.query(sql)
    return result
}

module.exports = {buildQueryCondition,executeSql}



