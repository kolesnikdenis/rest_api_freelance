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
        var query = conn.query("SELECT `blog`.*,`categories`.`name` as categories_name FROM `blog` LEFT JOIN categories on `blog`.`categories`=`categories`.`id` ", function (err, rows) {
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
        var query = conn.query("SELECT `blog`.*,`categories`.`name` as categories_name FROM `blog` LEFT JOIN categories on`blog`.`categories`=`categories`.`id`  where `blog`.`id`=? ",[req.params.id], function (err, rows) {
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

    function read_comment_blog(conn,work_index,blog_id,count) {
        return new Promise((resolve, reject) => {
            var query = conn.query("SELECT count(*) as 'length' FROM blog_commnet where `blog_commnet`.`blog_id`= ? and `blog_commnet`.`user_id` = ? order by `blog_commnet`.`id` desc limit 1", [blog_id.blog_id,req.params.autor], function (err, rows) {
                if (err) {
                    res.sendStatus(200).send(out);
                } else {
                    out.blog_array[work_index]['length'] = rows[0].length;
                    if ((work_index + 1) >= count)
                        resolve({status: "ok", sql: query.sql, return_sql: rows[0].id, finish: 1});
                    else
                        resolve({status: "ok", sql: query.sql, return_sql: rows[0].id, finish: 0});
                }
                console.log(query)
            });
        });
    }
    req.getConnection(function(err,conn) {
        var query = conn.query("SELECT `blog`.*,`categories`.`name` as categories_name FROM `blog` LEFT JOIN categories on`blog`.`categories`=`categories`.`id` where autor=? ",[req.params.autor], function (err, rows) {
            if (err) {
                console.log(err);
                res.sendStatus(200).send(out);
            }
            if (rows.length < 1) {
                out['err'].push("user did not write to blog" + err);
                out['status'] = "ok";
                res.send(out);
            } else {
                out['status'] = "ok";
                out['blog_array'] = rows;
                for ( var ii=0; ii<out.blog_array.length; ii++) {
                    read_comment_blog(conn,ii,{ blog_id: out.blog_array[ii].id},out.blog_array.length).then(result => {
                        if ( result.finish == 1 ){
                            res.send(out)
                        }
                    });
                };
                //res.send(out);
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


exports.blog_comment_save = function (req, res, next){
    console.log("save comment: ",req.body);
    var out={err:[]};
    auth_token.test_auth(req,res,next).then(
        result => {
            console.log("msg result: ", result, "id:", result.id);
            save_message(result.mail,result.token, result.id);
        },
        error => {
            console.log(error);
        }
    );

    var save_message = function (mail, token, id) {
        req.getConnection(function (err, conn) {
            if ( req.body.msg && req.body.blog_id ) {
                var data_mysql = {
                    user_id: id,
                    blog_id: req.body.blog_id,
                    msg: req.body.msg,
                };
                query = conn.query("INSERT INTO `blog_commnet`  set ?  ", data_mysql, function (err, rows1) {
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
                        res.send(out);
                    }
                });
            }else {
                out['status'] = "err";
                out['err'].push("less attributes");
                res.send(out);
            }
        })
    }
    
};

exports.blog_comment_get = function ( req, res, next){
    console.log("update, params: ",req.params);
    var out={err:[]};
    req.getConnection(function(err,conn) {
        query_sql("SELECT `blog_commnet`.*, `user`.`firstname`, `user`.`surname`,`user`.`photos` FROM `blog_commnet`  LEFT JOIN user on `blog_commnet`.`user_id`=`user`.`id`  WHERE blog_id = ?", [req.params.id], conn).then(
            result => {
                out['status']='ok';
                out['comment_blog']= result;
                res.send(out);
            },
            error => {
                out['status']='err';
                out['err'].push("error sql query");
                console.log(out);
                res.send(out);
            }
        );
    });
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
    auth_token.test_auth(req,res,next).then(result => { console.log("msg: ", result); save_to_blog(result.mail,result.token,result.id);}, error => {console.log(error); });
    var save_to_blog = function (mail, token, id) {
        //console.log(req.body);
        req.getConnection(function (err, conn) {
            //var from_day = auth_token.from_day();
            if (req.files && req.files.length > 0) {
                for (var i in req.files) {
                    data_mysql.photos.push({filename: req.files[i].filename, alt: req.files[i].originalname});
                };
            };
                data_mysql.title = req.body.title;
                data_mysql.content = req.body.content;
                data_mysql.categories = req.body.categories;
                data_mysql.autor = id;
                data_mysql.photos = JSON.stringify(data_mysql.photos);
                //data_mysql.photos = data_mysql.photos;
                //auth_token.update_token( {date: from_day, id_user: data_mysql.autor}, conn);//upDATE TOKEN
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
                        res.send(out);
                    }
                });
        })

    }
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