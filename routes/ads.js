var config = require('../config.json');
var auth_token = require('./auth_refresh');


function gen_token(){
    var uuidv4 = require('uuid/v4');
    return uuidv4();
}

exports.ads_user = function (req, res, next) {
    var out={err:[]}
    console.log("update, params: ",req.params);
    if ( +req.params.id>0 )
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT `ads`.*,`categories`.`name` as categories_name FROM `ads` LEFT JOIN categories on `ads`.`category`=`categories`.`id`   WHERE `user_id` = ?",[req.params.id], function (err, rows) {
            if (err) {
                res.sendStatus(200).send(out);
            } else {
                out['status'] = "ok";
                out['select_id'] = req.body.id;
                out['ads_rows']=rows;
                res.send(out);
            }
        })
    });
    else {
        out.err.push("incorrect argument");
        out.status='err';
        res.send(out);
    }
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
    console.log("body:", req.body);
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT `ads`.*,`categories`.`name` as categories_name FROM `ads` LEFT JOIN categories on `ads`.`category`=`categories`.`id`  ", function (err, rows) {
            if (err) {
                res.sendStatus(200).send(out);
            } else {
		if (rows.length > 0 ) {
		 out['ads_rows']=[];
		 var my_coord={ lat: req.body.lat, lng: req.body.lng };
		 for ( var i=0; rows.length > i; i++){
                    var geo={};
                    try { geo = JSON.parse(rows[i].geo); }
                    catch (err) { geo={} }

                    ads_coord = JSON.parse(rows[i].geo);
                    if  ( Math.pow((my_coord.lat-ads_coord.lat),2) + Math.pow((my_coord.lng-ads_coord.lng),2) <= (Math.pow((ads_coord.radius/50     ),2)) ) {
			out['ads_rows'].push(rows[i]);
                    }
                 }
		}
		out['status'] = "ok";
		out['select_coord'] = req.body;
		//out['ads_rows']=rows;
		res.send(out);
	    }
        })
    });
}

exports.ads_add = function (req, res, next){
    var out={err:[]};
    console.log("body:", req.body);
    //INSERT INTO `web_freelancer`.`ads` set `date`=NOW(),title="",description="",category="81", phone=""
    var data_mysql = {
        title: (req.body.title?req.body.title:""),
        description: (req.body.description?req.body.description:""),
        category: (req.body.category?req.body.category:"11"),
        price:  (req.body.price?(+req.body.price>=0?req.body.price:0):0),
        experience: (req.body.experience?req.body.experience:0),
        adType: (req.body.adType?req.body.adType:'lookForWorker'),
        phone: (req.body.phone?req.body.phone:"+3"),
        user_id: "",
        geo: (req.body.geo?req.body.geo:'{"title":"-","desc":"-","lat":50.1182182402667,"lng":"36.264760007690484","radius":"0.5"}'),
    };
    auth_token.test_auth(req,res,next).then(result => {
        console.log("msg: ", result);
        save_to_ads(result.mail,result.token,result.id);
    }, error => {
        console.log(error);
    });

    //INSERT INTO `web_freelancer`.`ads` set `date`=NOW(), `title` = 'заголовок', `description` = '87654', `category` = '81', `price` = '9', `experience` = '2', `adType` = 'lookForWorker', `phone` = '+380675808808', `user_id` = 60, `geo` = '{\"lat\":\"1\",\"lng\":\"1\",\"radius\":\"1\"}'

        var save_to_ads = function (mail,token, id) {
        data_mysql.user_id = id+"";
        req.getConnection(function(err,conn) {
            var query = conn.query("INSERT INTO `web_freelancer`.`ads` set `date`=NOW(), ?",data_mysql, function (err, rows) {
                if (err) {
                    console.log(err);
                    console.log(query.sql);
                    res.sendStatus(200).send(out);
                }else {
                    out['status'] = "ok";
                    res.send(out);
                }
            });
            console.log("insert ads:", query.sql);
        })

    }
};
exports.show_all= function(req, res, next){
    var out={err:[]};
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT `ads`.*,`categories`.`name` as categories_name FROM `ads` LEFT JOIN categories on `ads`.`category`=`categories`.`id`", function (err, rows) {
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
