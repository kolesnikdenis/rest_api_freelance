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

exports.ads_last = function(req, res, next){
    var out={err:[]}
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT * FROM `ads` where geo !='' and geo !='{}' LIMIT 10 " , function (err, rows) {
            if (err) {
                console.log(err);
                res.sendStatus(200).send(out);
            }
            if (rows.length < 1) {
                out['err'].push("error, user not found " + err);
                out['status'] = "err";
                res.send(out);
            } else {
                out['status'] = "ok";
                out['ads_rows']=rows;
                res.send(out);
            }
        })
    });
}


exports.show_geo_all= function(req, res, next){
    var out={err:[]}
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT * FROM `ads` ", function (err, rows) {
            if (err) {
                console.log(err);
                res.sendStatus(200).send(out);
            }
            if (rows.length < 1) {
                out['err'].push("error, user not found " + err);
                out['status'] = "err";
                res.send(out);
            } else { 
		out['status'] = "ok";
		out['ads_rows']=rows;
		res.send(out);
	    }
        })
    });
}

exports.show_all= function(req, res, next){
    var out={err:[]};
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT * FROM `ads` ", function (err, rows) {
            if (err) {
                console.log(err);
                res.sendStatus(200).send(out);
            }
            if (rows.length < 1) {
                out['err'].push("error, user not found " + err);
                out['status'] = "err";
                res.send(out);
            }
            out['status'] = "ok";
            out['ads_rows']=rows;
            res.send(out);
        })
    })
};
