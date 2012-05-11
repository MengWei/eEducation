function record() {
    this.examination=1;
    this.examine_date='2012-04-24';
    this.object_score=0;
    this.subject_score=0;
    this.total_score = 0
};

record.prototype.submit = function() {
    var json = { 
        record: {
              examination:this.examination
            , examine_date:this.examine_date
            , object_score:this.object_score
            , subject_score:this.subject_score
            , total_score:this.total_score
            , question_records: this.question_records
        }
    }
//    console.log(JSON.stringify(json));
    $.post("/records", json, function(data) {
        $("#result").html("考试记录号："+data.gid);
        console.log(data);
    });
};

record.prototype.correct = function() {
    this.question_records = questions.map(function(question) {
            var qr = {question:question.gid, score:0};
            switch(question.type) {
                case 1: {  //single choice
                    var choice = $('input[name='+question.gid+']').filter(':checked').val();
                    if(choice) {
                        qr.options = [];
                        qr.options.push(parseInt(choice));
                        if(question.options[choice-1].right) {
                            qr.score = parseInt(question.point);
                            this.object_score += qr.score;
                        }
                    }
                } break;
                case 2: { //multi-option choice
                    qr.options = [];
                    qr.score = question.point;
                    $('input[name='+question.gid+']').each(function() {
                        var number = parseInt($(this).val());
                        var option = question.options[number-1];
                        if(this.checked) {
                            qr.options.push(number);
                            if(!option.right) return qr.score = 0;
                        }
                        else {
                            if(option.right) return qr.score = 0;
                        }
                    });
                    if(qr.options.length <= 0) delete qr.options;
                } break;
                default: break;
            }
            this.total_score += qr.score;
//            console.log(qr);
            return qr;
    }, this);
    console.log(JSON.stringify(this));
};

$(function(){
	$('#go').click(function(){
        var theRecord = new record();
        theRecord.correct();
        theRecord.submit();
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

