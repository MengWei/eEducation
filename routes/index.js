var mysql = require('./mysql')

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

exports.examination = function(req, res) {
    getExamination(req.param.id, function(status, rs) {
        if(200 != status) return res.send(status);
        var json = {questions:rs};
        if(req.accepts('json')) {
            res.json(json);
        }
        else {
            json.title = '课堂练习'
            res.render('examination', json)
        }
    })
};


exports.addRecord = function(req, res) {
    console.log("==add record==", req.body);
    if(req.accepts('json')) {
        var opt = { 
              table: "ee_examination_record"
            , fields: req.body.record
        };
        mysql.insert(opt, function(err, info) {
            if(err) return res.send(500);         
            res.json({insertId:info.insertId});
        })
    }
    else {
        res.send(406);
    }
};

exports.index = function(req, res){
//    res.redirect('/examinations/1');
    res.render('index', { title: 'Express' })
};
