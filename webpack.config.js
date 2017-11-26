const webpack_config = require('webpack-builder-advanced')

let entry = {server:'./app.js'}
const packages = [
    {from:'models',to:'models',ignore:['index.js']}
]

module.exports = webpack_config(entry,packages)


