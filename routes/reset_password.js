var config = require('../config.json');


function gen_token(){
    var uuidv4 = require('uuid/v4');
    return uuidv4();
}


exports.all= function(req, res, next){
    console.log("all");
    next();
};

exports.new_password = function (req,res,next) {
    //req.body.username
    //:username/:token/:new_password
    var out={err:[]};
    if ( !req.body.email ) { req.body.email = req.params.email }
    if ( !req.body.token ) { req.body.token = req.params.token }
    if ( !req.body.new_pass ) { req.body.new_pass = req.params.new_pass }

    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT * FROM `user` WHERE mail = ? and token = ? ", [req.body.email,req.body.token], function (err, rows) {
            if (err) {
                console.log(err);
                res.sendStatus(200).send(out);
                //return next("err token or user");
            }
            if (rows.length < 1) {
                out['err'].push("error, user not found " + err );
                out['status'] = "err";
                //console.log(out);
                //console.log(rows.length);
                res.send(out);
            }
            else {
                //res.sendStatus(200);
                //console.log("update");
                console.log("pass:",req.body.new_pass);
                var query = conn.query("UPDATE user  set `password`=PASSWORD('"+req.body.new_pass+"'), token='"+gen_token()+"' where mail = ? and token =?",[req.body.email,req.body.token], function(err, rows){
                    if(err){
                        console.log(err);
                        out['err'].push("error update password" + err );
                        out['status'] = "err";
                        res.send(out);
                    }
                    out['status'] = "ok";
                    res.send(out);
                });
                console.log("sql:",query.sql);
            }
        })
    })

}
exports.reset_pwd = function (req,res,next) {
    var tmp_token=gen_token();
	console.log(req.body, req);
    var out={err:[]};
    req.getConnection(function(err,conn) {
        if (err) return next("Cannot Connect");
        var query = conn.query("SELECT * FROM `user` WHERE mail = ? ", [req.body.email], function (err, rows) {
            if (err) {
                console.log(err);
                return next("user not found");
            }

            if (rows.length < 1) {
                console.log("User Not found");
                return next("user not found");
            }
            else {
                console.log(rows, req.body.email);
                var user_id=rows[0].id;
                var query = conn.query("DELETE FROM `web_freelancer`.`arr_token` WHERE `arr_token`.`user_id` = ?", [user_id], function (err, rows) {
                    if(err){
                        //console.log(err);
                        out['err'].push("error del arr token in user arr_token.... " + err );
                        out['status'] = "err";
                        res.send(out);
                    }
                    out['status']='ok';
                    //return next(rows);
                    var query = conn.query("UPDATE user set token=? WHERE `mail` = ?",[tmp_token,req.body.email ], function(err, rows){
                        if(err){
                            //out['err'].push("error set null token in user table.... " + err );
                            console.log(err);
                            out['status'] = "err";
                            res.send(out);
                        }
                        out['status']='ok';
                        var send = require('gmail-send')({
                            //var send = require('../index.js')({
                            user: 'freelance@kolesnikdenis.com',
                            pass: 'freelance321',
                            to: req.body.email,
                            subject: 'RESET PASSWORD '+config.host_to_mail,
                            html: '<b>Для сброса пароля нажми >></b> <a href="http://freelance.kolesnikdenis.com/forget_password/'+req.body.email+'/'+tmp_token+'">тут</a> <<<br>' +
                            '<br>Если вы не пробовали сбросить пароль то просто переавторизируйтесь в свой аккаунт и поменяйте пароль входа, спасибо' +
                            '<hr>' +
                            'from <i>' +
                            '<a target=new href="http://freelance.kolesnikdenis.com">GEO Freelance WebSite</a></i>'
                        });
                        //var filepath = './pengbrew_160x160.png';  // File to attach
                        send({ // Overriding default parameters
                            subject: 'attached ',//filepath,         // Override value set as default
                            //  files: [ filepath ],
                        }, function (err, res1) {
                            out['status']="ok";
                            out['send_mail']="ok";
                            //res.render('json',{data:JSON.stringify(out)});
                            console.log(out);
                            res.send(out);
                            console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
                        });
                    });
                });
            }

        });
    })



}
