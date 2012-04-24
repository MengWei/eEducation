var request = require('./support/http');

describe('examination ', function(){
    describe('GET /examination', function(){
    it('should accept to application/json', function(done){
        request()
        .get('/examinations/1')
        .set('Accept', 'application/json')
        .end(function(res){
            console.log(res.body);
            done();
        })
    })
    
    it('should accept to text/html', function(done) {
        request()
        .get('/examinations/1')
        .set('Accept', 'text/html')
        .end(function(res){
            console.log(res.body);
            done();
        })
    })
    })
})