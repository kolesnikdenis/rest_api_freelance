var config = require('../config.json');
var auth_token = require('./auth_refresh');


function gen_token(){
    var uuidv4 = require('uuid/v4');
    return uuidv4();
}

exports.show_unique = function(req, res, next){
    var out={err:[],arr_msg:[]};
 //   auth_token.test_auth
	auth_token.test_auth_not_hard(req,res,next).then(result => { console.log("msg result: ", result, "id:", result.id); show_msg_user(result.mail,result.token, result.id);}, error => {console.log(error); });

    function last_read_msg(conn,work_index,from_user_id,count) {
        return new Promise((resolve, reject) => {

            var query = conn.query("SELECT id FROM msg where `msg`.`to_id`= ? and `msg`.`from_id`=? order by `msg`.`id` desc limit 1 ", [from_user_id,out.arr_msg[work_index].from_id], function (err, rows) {
                if (err) {
                    console.log("error count msg dialog");
                    res.sendStatus(200).send(out);
                }else {
                    console.log("last_read_msg sql:", query.sql);
                    out.arr_msg[work_index]['last_msg_id']=rows[0].id;
                    if ((work_index+1) >= count)
                        resolve({status: "ok", sql: query.sql, return_sql: rows[0].id, finish: 1});
                    else
                        resolve({status: "ok", sql: query.sql, return_sql: rows[0].id, finish: 0});
                }
            });
            //console.log(query.sql)
    });
}

    function count_msg_dialog(conn,rows_in,work_index,from_user_id) {
        return new Promise((resolve, reject) => {
                //SELECT count(*) from msg where `msg`.`from_id`in(select DISTINCT `msg`.`from_id` FROM msg where`msg`.`to_id`=60) and to_id=60

            var query = conn.query("SELECT count(*) as 'count_sql' FROM msg where `msg`.`to_id`= ? and `msg`.`from_id`=?", [from_user_id,rows_in[work_index].from_id], function (err, rows) {
                    if (err) {
                        console.log("error count msg dialog");
                        res.sendStatus(200).send(out);
                    }else {
                        rows_in[work_index]['count_msg']=rows[0].count_sql;
                        resolve({status: "ok", sql: query.sql, return_sql: rows_in[work_index] });
                    }
                });
        });
    }


    function show_msg_user(mail,token,id){
        req.getConnection(function(err,conn) {
            var query = conn.query("SELECT DISTINCT `msg`.`from_id`, `user`.`mail`,`user`.`surname`,`user`.`firstname`\n" +
                "FROM msg \n" +
                "LEFT JOIN user on `msg`.`from_id`=`user`.`id`\n" +
                "where `msg`.`to_id`=?", [id], function (err, rows) {
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
                    //console.log(rows,"user_id:",id);
                    for ( var i=0; i<rows.length; i++){
                        count_msg_dialog(conn,rows,i,id).then(result => {
                            if (result.status =="ok" ) {
                                out['arr_msg'].push(result.return_sql);
                            };
                            if (rows.length <= out.arr_msg.length) {
                                for ( var ii=0; ii<out.arr_msg.length; ii++) {
                                    last_read_msg(conn,ii,id,out.arr_msg.length).then(result => {
                                        //out.arr_msg[ii]['last_id_msg']=result.return_sql;
                                        if ( result.finish == 1 ){
                                            res.send(out)
                                        }
                                    });
                                };
                            }
                        });
                    }
                }
            });
            console.log(query.sql);
        })
    }
}
exports.msg_last_update = function (req,res,next) {
    var out ={err:[]};
    auth_token.test_auth(req,res,next).then(result => {
            console.log("msg: ", result);
            if ( req.params.id && +req.params.id>0)
                update_last_read_msg(result.mail,result.token, result.id);
            else
                res.send({err:["few atributes"],status:"err"})
        },
        error => {
            console.log(error);
        });

    function update_last_read_msg(mail, token, id) {
        var data ={last_read_msg: req.params.id}
        req.getConnection(function(err,conn) {
            var query = conn.query("UPDATE user set ? WHERE `mail` = ? and id=?", [data, mail,id], function (err, rows) {
                if (err) {
                    out['err'].push("error update user set.... " + err);
                    out['status'] = "err";
                    res.send(out);
                }else {
                    out['status'] = "ok";
                    res.send(out);
                }
                console.log(query.sql)
            });
        })

    }
}
exports.show_all= function(req, res, next){
    console.log("msg: all");
    next();
};

exports.show_dialog= function (req, res, next) {
    var out={err:[]};
    auth_token.test_auth(req,res,next).then(result => { console.log("msg: ", result); show_dialog_with_user(result.mail,result.token, result.id);}, error => {console.log(error); });
    function  show_dialog_with_user(mail, token,id) {
        console.log(mail,token,id);
        console.log("read: ",req.params);
        req.getConnection(function(err,conn) {
            var query = conn.query("SELECT `msg`.*,`user`.`mail`,`user`.`surname`,`user`.`firstname`,`user`.`photos` FROM msg LEFT JOIN  user on `msg`.`from_id` = `user`.`id` where ( `msg`.`to_id`= ? and `msg`.`from_id`=? ) or (`msg`.`to_id`= ? and `msg`.`from_id`=?) \n" +
                "ORDER BY `msg`.`id`  ASC", [id, req.params.id,req.params.id,id], function (err, rows) {
                if (err) {
                    out['status']='err';
                    console.log("error count msg dialog");
                    res.sendStatus(200).send(out);
                } else {
                    out['status']='ok';
                    if (req.params.id ==0){
                        for (var t=0; t < rows.length; t++){
                            rows[t].mail = "anon@uwork.pp.ua";
                            rows[t].firstname= "незарегистрированный";
                            rows[t].surname= "пользователь";
                            rows[t].photos= "[]";
                        }
                    }
                    out['arr_msg'] = rows;
                    res.send(out);
                }
                console.log(query.sql);
            });
        })
    }

}
exports.msg_send = function (req, res, next) {
    var out = {err: []};
    auth_token.test_auth_not_hard(req,res,next).then(result => {
        out['from_id'] = req.params.id;
        out['show_status'] = 'all';
        save_message(out,req.body);
    }, error => {
        out['err'].push("user did'nt auth");
        req.body.from_id="0";
        save_message(out,req.body);
    });

    var save_message = function (date_user,body) {
        req.getConnection(function (err, conn) {
	    console.log(body);
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
    auth_token.test_auth(req,res,next).then(result => { show_msg_user(result.mail,result.token); }, error => {console.log(error); });

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
    auth_token.test_auth(req,res,next).then(result => { show_msg_user(result.mail,result.token);}, error => {console.log(error); });

    function show_msg_user(mail,token){
        req.getConnection(function(err,conn) {
            var query = conn.query("SELECT `msg`.`msg` FROM `user`,`arr_token`,`msg` WHERE `user`.`mail` = ? and `arr_token`.`token` = ? and `msg`.`to_id`=`user`.`id` and `user`.`last_read_msg` < `msg`.`id`", [mail,token], function (err, rows) {
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
            //console.log("sql:",query.sql);
        })
    }
};
