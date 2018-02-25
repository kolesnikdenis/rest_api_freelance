var config = require('../config.json');
var auth_token = require('./auth_refresh');


function gen_token(){
    var uuidv4 = require('uuid/v4');
    return uuidv4();
}

exports.show_all= function(req, res, next){
    console.log("msg: all");
    next();
};

exports.msg_send = function (req, res, next) {
    var out = {err: []};
    auth_token.test_auth_not_hard(req,res,next).then(result => {
        out['from_user_id'] = req.params.id;
        out['show_status'] = 'all';
        save_message(out,req.body);
    }, error => {
        out['err'].push("user did'nt auth");
        req.body.from_id="0";
        save_message(out,req.body);
    });

    var save_message = function (date_user,body) {
        req.getConnection(function (err, conn) {
            var save_data={
                from_id: body.from_id,
                to_id: body.to_user_id,
                msg: body.msg,
            };
            query = conn.query("INSERT INTO `msg`  set datetime=NOW(), ?", save_data, function (err, rows1) {
                if (err) {
                    console.log(err);
                    out['user_profile'] = "";
                    out['status'] = "err";
                    out['err'].push("err, send msg");
                    res.send(out);
                } else {
                    out['status'] = "ok";
                    //out[''] = update_data;
                    res.send(out);
                }
            });
            console.log(query.sql);
        });
    };
};

exports.show_all_msg = function (req,res,next){
    var out = {err: []};
    auth_token.test_auth(req,res,next).then(result => { console.log("msg: ", result); show_msg_user(result.mail,result.token);}, error => {console.log(error); });
    function show_msg_user(mail,token){
        req.getConnection(function(err,conn) {
            var query = conn.query("SELECT `msg`.`msg` FROM `user`,`arr_token`,`msg` WHERE `user`.`mail` = ? and `arr_token`.`token` = ? and `msg`.`to_id`=`user`.`id`", [mail,token], function (err, rows) {
                if (err) {
                    res.sendStatus(200).send(out);
                }
                if (rows.length < 1) {
                    out['err'].push("error, user not found " + err );
                    out['status'] = "err";
                    res.send(out);
                }
                else {
                    out['status']='ok';
                    out['arr_msg']=rows;
                    res.send(out);
                }
            });
        })
    }
}

exports.msg_all_count = function (req,res,next){
    var out = {err: []};
    auth_token.test_auth(req,res,next).then(result => { console.log("msg: ", result); show_msg_user(result.mail,result.token);}, error => {console.log(error); });

    function show_msg_user(mail,token){
        req.getConnection(function(err,conn) {
            var query = conn.query("SELECT `msg`.`msg` FROM `user`,`arr_token`,`msg` WHERE `user`.`mail` = ? and `arr_token`.`token` = ? and `msg`.`to_id`=`user`.`id`", [mail,token], function (err, rows) {
                if (err) {
                    res.sendStatus(200).send(out);
                }
                if (rows.length < 1) {
                    out['err'].push("error, user not found " + err );
                    out['status'] = "err";
                    res.send(out);
                }
                else {
                    out['status']='ok';
                    out['count_all_msg']=rows.length;
                    res.send(out);
                }
            });
        })
        }
}
exports.show_last_msg_to_user= function(req, res, next) {
    var out = {err: []};
    auth_token.test_auth(req,res,next).then(result => { console.log("msg: ", result); show_msg_user(result.mail,result.token);}, error => {console.log(error); });

    function show_msg_user(mail,token){
        req.getConnection(function(err,conn) {
            var query = conn.query("SELECT `msg`.`msg` FROM `user`,`arr_token`,`msg` WHERE `user`.`mail` = ? and `arr_token`.`token` = ? and `msg`.`to_id`=`user`.`id` and `user`.`last_read` < `msg`.`id`", [mail,token], function (err, rows) {
                if (err) {
                    res.sendStatus(200).send(out);
                }
                if (rows.length < 1) {
                    out['err'].push("error, user not found " + err );
                    out['status'] = "err";
                    res.send(out);
                }
                else {
                    out['status']='ok';
                    out['new_msg']=rows;
                    res.send(out);
                }
            });
            console.log("sql:",query.sql);
        })
    }
};
