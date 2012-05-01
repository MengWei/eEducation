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

exports.insert = function(opt, cb) {
    var sql = 'insert into '+opt.table+' set ';
    var values = [];
    var len = opt.fields.length;
        for(var k in opt.fields) {
                var value = opt.fields[k];
                if(typeof value != 'object' &&
                   typeof value != 'array') {
                        sql += opt.table+'.'+k+' = ?, ';
                        values.push(value);
                }
        }
        sql = sql.slice(0,-2);
        console.log(sql);
        console.log(values);
        client.query(sql, values, function(err, info) {
                if(err) throw err;
                var a=opt.cbParam;
                console.log(info.insertId,a);
                cb(info.insertId,a);
        });
}