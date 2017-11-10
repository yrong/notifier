var Pool = require('pg-pool')
var config = require('config')
var pg_config=config.get('postgres-notification')
var pool = new Pool(pg_config)

const executeSql = async (sql)=>{
    console.log('execute sql:'+sql)
    let result = await pool.query(sql)
    return result
}

module.exports = {executeSql}



