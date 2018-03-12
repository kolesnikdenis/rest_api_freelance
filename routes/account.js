var config = require('../config.json');
var auth_token = require('./auth_refresh');


function gen_token(){
    var uuidv4 = require('uuid/v4');
    return uuidv4();
}


exports.update_info = function (req, res, next) {
    var out = {err: [],};
    console.log("body:",req.body);

    auth_token.test_auth(req,res,next).then(result => { update_info_user(result.mail,result.token);}, error => {console.log(error); });
    var out={err:[]};

    res.status(200);
    console.log("photos:",req.body.photos);
    update_info_user= function(mail, token) {
        out['status'] = "ok";
        var update_data = {
            address: req.body.address,
            apartment: req.body.apartment,
            city: req.body.city,
            description: req.body.description,
            firstname: req.body.firstname,
            geo: req.body.geo,
            house: req.body.house,
            patronymic: req.body.patronymic,
            phone: req.body.phone,
            //photos: (req.body.photos?req.body.photos:"[]"),
            surname: req.body.surname,
        };
        console.log(update_data);
        if (req.body.password) {
            console.log("update + password");
            query_set("UPDATE user set password  = PASSWORD('" + req.body.password + "'),  ? WHERE   `mail` = ? and `token` = ? ")
        } else {
            console.log("update + didn't password");
            query_set("UPDATE user set ? WHERE `mail` = ? ")
        }
        function query_set(query_in) {
            console.log(query_in);
            req.getConnection(function(err,conn) {
                query = conn.query(query_in, [update_data, mail, token], function (err, rows) {
                    if (err) {
                        out['user_profile'] = "";
                        out['status'] = "err";
                        out['err'].push("err, update user");
                        res.send(out);
                        next(out.msg);
                        //return next("Mysql error, check your query");
                    } else {
                        out['status'] = "ok";
                        out['user_profile'] = update_data;
                        console.log(out);
                        res.send(out);
                    }
                })
                console.log(query.sql);
            })
        }



    }
}
exports.all= function(req, res, next){
    console.log("all");
    next();
};

exports.info= function(req, res, next){
    console.log("body: ",req.body);
    console.log("params: ",req.params);
    auth_token.test_auth(req,res,next).then(result => { show_info_accout(result.mail,result.token);}, error => {console.log(error); });
    var out={err:[]};
    console.log(req.body);

    show_info_accout = function(mail,token){
        req.getConnection(function(err,conn) {
            var query = conn.query("SELECT user.* FROM `user`,`arr_token` WHERE `user`.`mail` = ? and `arr_token`.`token` = ? ", [mail,token], function (err, rows) {
                if (err) {
                    res.sendStatus(200).send(out);
                }
                if (rows.length < 1) {
                    console.log("err:",query.sql)
                    out['err'].push("error, user not found " + err );
                    out['status'] = "err";
                    res.send(out);
                }
                else {
                    out['status']='ok';
                    out['user_profile']=rows[0];
                    res.send(out);
                }
            })
        })
    }

};