var mysql = require('./mysql')

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

var getExamination = function(gid, cb) {
    var sql = "SELECT t1.*, t2.number, t3.type_name, t4.username as teacher "+
              "FROM `eEducation`.`ee_question` as t1, "+
              "`eEducation`.`ee_examination_question` as t2, "+
              "`eEducation`.`ee_question_type` as t3, `eEducation`.`ee_user` as t4 "+
              "WHERE t2.examination = 1 and t1.gid=t2.question "+
              "and t3.gid=t1.type and t1.creator=t4.gid"
    mysql.query(sql, cb);
}

exports.examination = function(req, res) {
    getExamination(1, function(err, rs) {
        if(err) return res.send(500);
        if(rs.length == 0) return res.send(204);
        var json = {question:rs};
        if(req.accepts('json')) {
                res.json(json);
        }
        else {
            json.title = '课堂练习'
            res.render('examination', json)
        }
    })
};