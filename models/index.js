"use strict";

const fs        = require("fs");
const path      = require("path");
const Sequelize = require("sequelize-fulltext-search");
const config = require('config');
const Log = require('log4js_wrapper')
const logger = Log.getLogger()
const pg_config = config.get('postgres-notification')
const sequelize = new Sequelize(pg_config.database, pg_config.user, pg_config.password, {
    host: pg_config.host,
    port: pg_config.port,
    dialect: 'postgres',
    pool: {
        max: pg_config.max,
        min: 0,
        idle: pg_config.idleTimeoutMillis
    },
    logging: logger.debug.bind(logger),
    regconfig:pg_config.zhparser
});

let db  = {},model;

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        model = sequelize.import(path.join(__dirname, file))
        db[model.name] = model
    });

db.sequelize = sequelize;

db.dbInit = async function(){
    for(let key in db){
        if (db[key].initsql) {
            await db.sequelize.query(db[key].initsql);
        }
    }
}

db.NotificationName = 'Notification'

module.exports = db;
