function record() {
    this.examination=1;
    this.examinee=2;
    this.examine_date='2012-04-24';
    this.object_score=0;
    this.subject_score=0;
    this.total_score = 0
};

record.prototype.submit = function() {

};

record.prototype.correct = function() {
    this.question_records = questions.map(function(question) {
            var qr = {question:question.gid, score:0};
            switch(question.type) {
                case 1: {  //single choice
                    var choice = $('input[name='+question.gid+']').filter(':checked').val();
                    if(choice) {
                        qr.choice = parseInt(choice);
                        if(question.options[choice-1].right) {
                            qr.score = parseInt(question.point);
                            this.object_score += qr.score;
                        }
                    }
                } break;
                default: break;
            }
            this.total_score += qr.score;
            return qr;
    }, this);
    alert(JSON.stringify(this));
};

$(function(){
	$('#go').click(function(){
        var theRecord = new record();
        theRecord.correct();
	});
	$('#go2').click(function(){
		$('input[name="testradio"]').each(function(){
			alert(this.value);
		});
	})
	$('#go3').click(function(){
		alert($('input[name="testradio"]:eq(1)').val());
	})
})

