var mysql = require('mysql');
var env = require('env.json');
var client = mysql.createClient(env.mysql);

process.env.TZ = env.mysql.timezone;
client.utc=true;

exports.query = function(sql, cb) {
    console.log(sql);
    client.query(sql, function(err, rs, fields) {
        if(err) console.log(err.stack);
        cb(err, rs, fields);
    });
}