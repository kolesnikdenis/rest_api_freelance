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


exports.get = function (req,res,next) {

};



exports.save_img_list = function (req,res,next) {
    console.log("post img list");
    console.log("body 111 : ",req.body);
    console.log("params: ",req.params);
    //req.body.filelist)
    var out={err:[]};
    var save_date={photos:JSON.stringify( req.body.filelist) };
    if (req.body.filelist.length>0) {
        req.getConnection(function (err, conn) {
            var query = conn.query("UPDATE " + req.body.table + " set ? where id=? ", [save_date, req.body.id], function (err, rows) {
                if (err) {
                    out['err'].push("error mysql" + err);
                    out['status'] = "err";
                    res.send(out);
		    console.log("erro", err);
                    //return next("err token or user");
                }
		console.log(rows);
		console.log(query.sql);
                if (rows.length >0) {
                    out['err'].push("save file list error:" + err);
                    out['status'] = "err";
                    res.send(out);
                }else { 
			out['status'] = "ok";
			res.send(out);
		}
            })
        })
    }else {

        out['status'] = "ok";
        res.send(out);
    }
};
