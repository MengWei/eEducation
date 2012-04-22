var request = require('./support/http');

describe('examination ', function(){
    describe('GET /examination', function(){
    it('should accept to application/json', function(done){
        request()
        .get('/examination')
        .set('Accept', 'application/json')
        .end(function(res){
            console.log(res.body);
            done();
        })
    })
  })
})