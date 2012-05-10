// Login Form

$(function() {
    var button = $('#loginButton');
    var box = $('#loginBox');
    var form = $('#loginForm');
    button.removeAttr('href');
    button.mouseup(function(login) {
        box.toggle();
        button.toggleClass('active');
    });
    form.mouseup(function() { 
        return false;
    });
    $(this).mouseup(function(login) {
        if(!($(login.target).parent('#loginButton').length > 0)) {
            button.removeClass('active');
            box.hide();
        }
    });
    
    $('#login').click(function() {
        var json = {
            //  email: form.email.val()
            //, password: form.password.val()
              email: 'gbo@expro.com'
            , password: '123456'
        };
        $.post("/login", json, function(data) {
           $("#screenText").html(data.name);
           console.log(data);
       });
    });
});
