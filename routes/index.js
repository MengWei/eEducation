var mysql = require('./mysql')

function ArrayCB(size, OKValue, cb) {
    this.size = size;
    this.cb = cb;
    this.OK = OKValue;
}

ArrayCB.prototype.count = 0;
ArrayCB.prototype.Done = false;
ArrayCB.prototype.cbDone = function(status) {
    if(!this.Done && 
        (++this.count == this.size || this.OK != status)) {
        this.cb(status);
        this.Done = true;
    }
};

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

var getExamination = function(gid, cb) {
    var sql = "SELECT t1.*, t2.number, t3.type_name, t4.username as teacher "+
              "FROM `ee_question` as t1, `ee_examination_question` as t2, "+
              "`ee_question_type` as t3, `ee_user` as t4 "+
              "WHERE t2.examination = 1 and t1.gid=t2.question "+
              "and t3.gid=t1.type and t1.creator=t4.gid"
    mysql.query(sql, function(err, rs) {
        var acb = new ArrayCB(rs.length, 200, cb);
        rs.forEach(function(question) {
            sql = "SELECT * FROM `ee_question_option` WHERE question="+
                  question.gid+"Order by number";
            var kThis = this;
            mysql.query(sql, function(err, options) {
                if(err) {
                    console.log(err.stack);
                    kThis.cb(500);
                }
                else {
                    kThis.cb(200);
                }
            })
        }, acb)
    })
}

exports.examination = function(req, res) {
    getExamination(1, function(err, rs) {
        if(err) return res.send(500);
        if(rs.length == 0) return res.send(204);
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