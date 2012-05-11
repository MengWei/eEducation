var mysql = require('./mysql')
var EventProxy = require('../lib/eventproxy.js').EventProxy;

function ArrayCB(size, OKValue, cb) {
    this.size = size;
    this.cb = cb;
    this.OK = OKValue;
}

ArrayCB.prototype.count = 0;
ArrayCB.prototype.Done = false;
ArrayCB.prototype.cbOnce = function(status) {
    if(!this.Done && 
        (++this.count == this.size || this.OK != status)) {
        this.cb(status);
        this.Done = true;
    }
};

var getExamination = function(gid, cb) {
    var sql = "SELECT t1.*, t2.number, t3.type_name, t4.username as teacher "+
              "FROM `ee_question` as t1, `ee_examination_question` as t2, "+
              "`ee_question_type` as t3, `ee_user` as t4 "+
              "WHERE t2.examination = 1 and t1.gid=t2.question "+
              "and t3.gid=t1.type and t1.creator=t4.gid"
    mysql.query(sql, function(err, rs) {
        if(err) return cb(500);
        if(rs.length == 0) return cb(204);
        var acb = new ArrayCB(rs.length, 200, function(status) {
            cb(status, rs);
        });
        rs.forEach(function(question) {
            sql = "SELECT * FROM `ee_question_option` WHERE question="+
                  question.gid+" Order by number";
            var kThis = this;
            mysql.query(sql, function(err, options) {
                if(err) {
                    kThis.cbOnce(500);
                }
                else {
                    question.options = options;
                    kThis.cbOnce(200);
                }
            })
        }, acb)
    })
}

var examination = function(req, res) {
    getExamination(req.param.id, function(status, rs) {
        if(200 != status) return res.send(status);
        var json = {questions:rs};
        if(req.accepts('json')) {
            res.json(json);
        }
        else {
            json.title = '课堂练习';
            res.render('examination', json);
        }
    });
};

var addRecord = function(req, res) {
    console.log("==add record==", req.body);
    var record = req.body.record;
    record.examinee = req.session.auth.gid;
    var success = function() {res.json(record);};
    var error = function(status) {res.send(status);};
    
    var proxy = new EventProxy();
    proxy.assign("error", error);
    var insertOR = function(qr) {
        if(qr.options) {
        qr.options.forEach(function(choice) {
            var or = {
                  question_record:qr.gid
                , choice:choice
            };
            var opt = {
                  table: 'ee_question_option_record'
                , fields: or
            };
            mysql.insert(opt, function(err, info) {
                if(err) proxy.trigger("error", 500);
                else {
                    or.gid = info.insertId;
                    proxy.trigger("ORDone", or);                        
                }
            });
        });
        }
    };
    
    var insertQR = function(record) {
        record.question_records.forEach(function(qr) {
            qr.examination_record = record.gid;
            var opt = {
                  table: 'ee_question_record'
                , fields: qr
            };
            mysql.insert(opt, function(err, info) {
                if(err) proxy.trigger("error", 500);
                else {
                    qr.gid = info.insertId;
                    var times = qr.options?qr.options.length:0;
                    proxy.after("ORDone", times, function() {
                        proxy.trigger("QRDone", qr);                        
                    });
                    insertOR(qr);
                }
            });
        });
    }; 
    
    if(req.accepts('json')) {
        var opt = { 
              table: "ee_examination_record"
            , fields: record
        };
        mysql.insert(opt, function(err, info) {
            if(err) proxy.trigger("error", 500);
            else {
                record.gid = info.insertId;
                var times = record.question_records?record.question_records.length:0;
                proxy.after("L2Done", times, success);
                insertQR(record);
            }
        });
    }
    else {
        proxy.trigger("error", 406);
    }
};

exports.index = function(req, res){
//    res.redirect('/examinations/1');
    res.render('index', { title: 'Express' })
};

var homepage = function(req, res) {
    res.render('index', { title: 'gbo'})
};

function andRestrictAuth(req, res, next) {
    if(req.session.auth) next();
    else res.send(401);
}

var login = function(req, res) {
    console.log('login==',req.body);
    var auth = req.body;
    var sql = "select * from ee_user where email='"+auth.email+"'";
    mysql.query(sql, function(err, rs) {
        if(err) return res.send(500);
        if(!rs.length) return res.send(404);
        if(rs[0].password != auth.password) return res.send(401);
        req.session.regenerate(function() {
            req.session.auth = rs[0];
            res.json(rs[0]);
        });
    });
};

function loadRoutes(app) {
    app.get('/', homepage);
    app.post('/login', login);
    app.get('/examinations/:id', examination);
    app.post('/records', andRestrictAuth, addRecord);
}

exports = module.exports = loadRoutes;
