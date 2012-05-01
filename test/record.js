var request = require('./support/http');

describe('record ', function(){
    describe('POST /records', function() {
        it('should return the insert id', function(done) {
            var postJson = { 
                record: {
                examination:1
                , examinee:2
                , examine_date:'2012-05-04'
                , object_score:6
                , subject_score:7
                , total_score:13
//                , question_records: this.question_records
                }
            };
            request()
            .post('/records')
            .set('content-type', 'application/json')
            .write(JSON.stringify(postJson))
            .end(function(res) {
                res.should.be.json;
                console.log(res.body);
                res.body.should.have.property('insertId');
                done();
            })
        })
    })
})