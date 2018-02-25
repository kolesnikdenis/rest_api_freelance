var config = require('../config.json');
var auth_token = require('./auth_refresh');


function gen_token(){
    var uuidv4 = require('uuid/v4');
    return uuidv4();
}

exports.all= function(req, res, next){
    next();
};

exports.update_blog = function (req,res,next) {
    var out={err:[]};
    res.send(out);

};

exports.del_blog_content = function (req,res,next) {
    console.log("del blog content");
    console.log("body: ",req.body);
    console.log("params: ",req.params);
    var out={err:[]};
    //auth_token.test_auth(req,res,next); // тут будет промис авторизации....
    res.send("ok!")
};

exports.show_all = function (req,res,next) {
    var out={err:[]};
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT * FROM `blog` ", function (err, rows) {
            if (err) {
                res.sendStatus(200).send(out);
            }
            if (rows.length < 1) {
                out['err'].push("error, user not found " + err);
                out['status'] = "err";
                res.send(out);
            }
            out['status'] = "ok";
            out['blog_array']=rows;
            res.send(out);
        })
    })
};

exports.show_blog_id = function (req,res, next) {
    var out={err:[]};
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT * FROM `blog` where id=? ",[req.params.id], function (err, rows) {
            if (err) {
                res.sendStatus(200).send(out);
            }
            if (rows.length < 1) {
                out['err'].push("error, not found content" + err);
                out['status'] = "err";
                res.send(out);
            }else {
                out['status'] = "ok";
                out['blog_array'] = rows;
                res.send(out);
            }
        })
        console.log(query.sql);
    })
}

exports.show_category = function (req,res, next) {
    var out={err:[]};
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT * FROM `blog` where categories=? ",[req.params.id], function (err, rows) {
            if (err) {
                res.sendStatus(200).send(out);
            }
            if (rows.length < 1) {
                out['err'].push("error, user not found " + err);
                out['status'] = "err";
                res.send(out);
            }else {
                out['status'] = "ok";
                out['blog_array'] = rows;
                res.send(out);
            }
        })
    })
};

exports.show_user_blog = function (req,res, next) {
    var out={err:[]};
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT * FROM `blog` where autor=? ",[req.params.autor], function (err, rows) {
            if (err) {
                console.log(err);
                res.sendStatus(200).send(out);
            }
            if (rows.length < 1) {
                out['err'].push("user did not write to blog" + err);
                out['status'] = "err";
                res.send(out);
            } else {
                out['status'] = "ok";
                out['blog_array'] = rows;
                res.send(out);
            }
        })
    })
};

exports.show_blog_content = function (req,res, next) {
    var out={err:[]};
    console.log("show_blog_content: ",req.params)
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT * FROM `blog` where autor= ? and id =? ",[req.params.autor,req.params.id], function (err, rows) {
            if (err) {
                console.log(err);
                res.sendStatus(200).send(out);
            }
            if (rows.length < 1) {
                out['err'].push("user did not write to blog" + err);
                out['status'] = "err";
                res.send(out);
            } else {
                out['status'] = "ok";
                out['blog_array'] = rows;
                res.send(out);
            }
        })
    })
};


exports.blog_to_add = function (req,res, next) {
    var out={err:[]};
    var data_mysql = {
        title: "",
        content: "",
        categories: 0,
        autor:  0,
        photos: [],
    };
    if ( req.headers && req.headers.auth ) {
        var json = JSON.parse(JSON.stringify(req.headers.auth));
        json = JSON.parse(json);
        if (json.username && json.token) {
            console.log("ok auth");
        } else {
            res.status(401).send('err');
        }
    }
    req.getConnection(function (err, conn) {
        var from_day = auth_token.from_day();
        if ( req.files && req.files.length >0 ){
            for (var i in req.files) {
                data_mysql.photos.push({filename: req.files[i].filename, alt:  req.files[i].originalname} );
            }
        };
        var query = conn.query("SELECT user.*, arr_token.id as id_token FROM user,arr_token WHERE `mail` = ? and  arr_token.token=? and  ?  < arr_token.datetime ", [json.username,json.token,from_day], function (err, rows) {
            if (err) {
                console.log(err);
                out['status'] = "err";
                out['err'].push("SQL: find user in base error");
                res.send(out);
            } else {
                console.log(rows);
                if (rows[0] && rows[0].id) {
                    data_mysql.title = req.body.title;
                    data_mysql.content = req.body.content;
                    data_mysql.categories = req.body.categories;
                    data_mysql.autor = rows[0].id;
                    data_mysql.photos = JSON.stringify(data_mysql.photos);
                    //data_mysql.photos = data_mysql.photos;
                    auth_token.update_token({date: from_day, id_user: data_mysql.autor}, conn);//upDATE TOKEN
                    query = conn.query("INSERT INTO `web_freelancer`.`blog`  set ?  ", data_mysql, function (err, rows1) {
                        if (err) {
                            console.log(err);
                            out['user_profile'] = "";
                            out['status'] = "err";
                            out['err'].push("err, update user");
                            res.send(out);
                            next(out.msg);
                        } else {
                            out['status'] = "ok";
                            //out[''] = update_data;
                            console.log(rows1);
                            res.send(out);
                        }
                    });
                }else {
                    out['user_profile'] = "";
                    out['status'] = "err";
                    out['err'].push("user not auth..");
                    res.send(out);
                }
            }
        })
    })

}


var  query_sql = (sql_query_in,data_in,conn) =>{
    return new Promise(function(resolve, reject) {
        conn.query(sql_query_in,data_in, function (err, rows) {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};


exports.update_user_blog = function (req,res, next) {
    console.log("update, body: ",req.body);
    console.log("update, params: ",req.params);
    var out={err:[]};
    if ( req.headers && req.headers.auth ) {
        //console.log( "headers.auth.auth:", req.headers.auth);
        var json = JSON.parse(req.headers.auth);
        console.log("auth:", json);
        if (json.username && json.token) {
            console.log("ok auth");
            //res.status(200).send("Ok");
        } else {
            console.log("status 401")
            res.status(401).send('err');
        }
    }
    req.getConnection(function(err,conn) {
        query_sql("SELECT * FROM `user` WHERE mail = ? ", [json.username], conn).then(
            result => {
                out.err.push("id user:", result[0].id);
                query_sql("SELECT * FROM `arr_token` WHERE user_id = ? ", [result[0].id],conn).then(
                    result1 => {
                        out.err.push("len arr token:", result1.length);
                        res.send(out);
                    },
                    err => {
                        console.log(err);
                    }
                );
            },
            error => console.log(error)
        );
    });

    /*var update_data={
        address: req.body.address,
        apartment : req.body.apartment,
        city :req.body.city,
        description:req.body.description,
        firstname:req.body.firstname,
        geo:req.body.geo,
        house:req.body.house,
        patronymic:req.body.patronymic,
        phone:req.body.phone,
        photo:req.body.photo,
        surname:req.body.surname,
    };
    query = conn.query("UPDATE blog set ? WHERE `id` = '1'  and `author` = ? and `token` = ? ",[update_data,in_auth_header.body.username,in_auth_header.token], function(err, rows){
        if (err) {
            console.log(err);
            out['user_profile']="";
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
    })*/
}