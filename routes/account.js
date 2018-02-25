var config = require('../config.json');
var auth_token = require('./auth_refresh');


function gen_token(){
    var uuidv4 = require('uuid/v4');
    return uuidv4();
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
            var query = conn.query("SELECT * FROM `user` WHERE mail = ? and token = ? ", [mail,token], function (err, rows) {
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
                    out['user_profile']=rows[0];
                    res.send(out);
                }
            })
        })
    }

};