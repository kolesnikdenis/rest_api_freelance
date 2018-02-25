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


exports.get_user_profile = function (req, res, next) {
    console.log("msg body: ", req.body);
    console.log("msg params: ", req.params);
    var out = {err: []};
    var sql="";


    ////
    function get_rate_user(id) {
        return new Promise((resolve, reject) => {
            req.getConnection(function (err, conn) {
                var q = conn.query("SELECT * FROM `rating`  WHERE `user_id` = ?", [id], function (err, rows) {
                    if (err) {
                        resolve({rating: 0});
                    }else {
                        var summ = 0;
                        var count = 0;
                        if (rows.length > 0) {
                            for (var i = 0; i < rows.length; i++) {
                                summ += +rows[i].rating;
                                count++;
                            }
                        } else {
                            summ: 0;
                            count:1;
                        }
                        resolve({rating: Math.round((summ / count) / 6 * 100)});
                    }
                });
            })
        })
    }

    auth_token.test_auth_not_hard(req,res,next).then(result => {
        out['from_user_id'] = result.id;
        out['show_status'] = 'all';
        get_rate_user(req.params.id).then( rate_r => run(req.params.id,rate_r.rating), err=>run(req.params.id,err.rating) );
    }, error => {
        out['show_status'] = 'hidden';
        out['from_user_id'] = "0";
        get_rate_user(req.params.id).then( rate_r => run(req.params.id,rate_r.rating), err=>run(req.params.id,err.rating) );
    });

    var crop_text = function(in_text) {
        if ( !in_text ) { return in_text } else
        return in_text.split(" ").map(function (v, i) {
            var text = "";
            for (var ii = 0; v.length > ii; ii++) {

                if (ii <= 1) {
                    text += v[ii];
                } else {
                    if (v.length > 5) {
                        if ((v.length - ii) <= 1) {
                            text += v[ii];
                        } else {
                            text += "X";
                        }
                    } else {
                        text += "X";
                    }

                }
            }
            return text;
        }).join(' ');
    }


    var run = function(id_find_user,rating) {
         req.getConnection(function (err, conn) {
                var q = conn.query("SELECT * FROM `user`  WHERE `user`.`id` = ?", [id_find_user], function (err, rows) {
                    if (err) {
                        console.log(error);
                        out.err.push("error SQL")
                        res.status(200).send(out);
                    }
                    rows[0]['password'] = '';
                    rows[0]['token'] = '';
                    rows[0]['geo'] = '';
                    console.log("ration:",rating)
                    rows[0]['rating'] = rating;
                    console.log(rows.length);
                    if (rows.length == 1) {
                        if ( out.show_status=='hidden' ) {
                            rows[0]['surname'] = crop_text(rows[0]['surname']);
                            rows[0]['firstname']= crop_text(rows[0]['firstname']);
                            rows[0]['phone']= crop_text(rows[0]['phone']);
                            rows[0]['city']= crop_text(rows[0]['city']);
                            rows[0]['address']= crop_text(rows[0]['address']);
                            rows[0]['description']= crop_text(rows[0]['description']);
                            rows[0]['mail']=  crop_text(rows[0]['mail']);
                        }
                        out['user_find'] = rows[0];
                    }
                    res.send(out);
                });
                console.log(q.sql)
            });



    }
}