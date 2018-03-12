var express  = require('express'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    util     = require('util'),
    app = express(),
    expressValidator = require('express-validator');
    multer          = require('multer');

common          = require('./routes/common');
category        = require('./routes/category');
reset_password  = require('./routes/reset_password');
adv_find        = require('./routes/advanced_find');
blog            = require('./routes/blog');
auth_token      = require('./routes/auth_refresh');
work_img_list   = require('./routes/img_list');
ads_route_ex    = require('./routes/ads');
msg             = require('./routes/msg');
account_ex      = require('./routes/account');
user_profile_ex = require('./routes/show_user_profile')
var config = require('./config.json');
var upload1 = multer({ dest: __dirname+"/"+config.path_upload });

app.set('views','./views');
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'public','upload')));
app.use(bodyParser.urlencoded({ extended: true, uploadDir: __dirname +"/"+ config.path_upload })); //support x-www-form-urlencoded
app.use(bodyParser.json());
app.use(expressValidator());
//app.use(allowCrossDomain);

// Add headers
app.use(function (req, res, next) {
	app.disable( 'x-powered-by' );
	res.setHeader( 'X-Powered-By', 'Best of the Best of the best fe2 :D ' );
    res.header('Access-Control-Allow-Origin', req.headers.origin);
       if(req.headers['access-control-request-method']) {
           res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
       }
       if(req.headers['access-control-request-headers']) {
           res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
       }
       res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
       if ( req.method == 'OPTIONS') {
           res.send(200);
       }
       next();
});


function gen_token(){
    var uuidv4 = require('uuid/v4');
    return uuidv4();
}

var connection  = require('express-myconnection'),
    mysql = require('mysql');

app.use(
    connection(mysql,{
        host     : 'localhost',
        user     : 'darilana',
        password : 'DaRiLaNa',
        database : 'web_freelancer',
        debug    : false //set true if you wanna see debug logger
    },'request')
);

app.get('/',function(req,res){
    res.send('Welcome to Api Geo Freelance');
});
var router = express.Router();

router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

var curlt11 = router.route('/test');
curlt11.all(function(req,res,next){
    //res.header('Access-Control-Allow-Origin', req.headers.origin);
    /*
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    }
    res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    console.log(req.method, req.url);*/
    if ( req.method == 'OPTIONS') {
        console.log(req.method);
        res.send(200);
    }
    var out={err:[]};
    req.getConnection(function (err, conn) {
        query = conn.query("SELECT * FROM `blog` WHERE `id` = 19", function (err, rows1) {
            if (err) {
                console.log(err);
                out['db'] = "";
                out['status'] = "err";
                out['err'].push("err, update user");
                res.send(out);
            } else {
                out['status'] = "ok";
                out['db'] = rows1;
                res.send(out);
            }
        })
    });
})

var curut = router.route('/user');
//show the CRUD interface | GET
curut.get(function(req,res,next){
    req.getConnection(function(err,conn){
        if (err) return next("Cannot Connect");
        var query = conn.query('SELECT * FROM t_user',function(err,rows){
            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }
            res.render('user',{title:"RESTful Crud Example",data:rows});
        });
    });
});
curut.post(function(req,res,next){
    //validation
    req.assert('name','Name is required').notEmpty();
    req.assert('email','A valid email is required').isEmail();
    req.assert('password','Enter a password 6 - 20').len(6,20);

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }
    //get data
    var data = {
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
     };
    //inserting into mysql
    req.getConnection(function (err, conn){
        if (err) return next("Cannot Connect");
        var query = conn.query("INSERT INTO t_user set ? ",data, function(err, rows){
           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }
          res.sendStatus(200);
        });
    });
});

var account_info_router = router.route('/account/info');
account_info_router.all(account_ex.all)
account_info_router.post(account_ex.info);


var validation = router.route("/validation/");
validation.all(function(req,res,next){
    next();
});
validation.post(function(req,res,next) {
    var out = {err: [],};
    if (req.body.username  && req.body.token) {
        var where_data={
            mail: req.body.username,
            token: req.body.token
        }
        req.getConnection(function (err, conn) {
            var query = conn.query("SELECT * FROM user WHERE `mail` =? and `token` =? ", [where_data.mail, where_data.token], function (err, rows) {
                if (err) {
                    console.log(err);
                    out['status'] = "err";
                    out['err'].push("SQL: find user in base error");
                    res.send(out);
                }else {
                    if (rows.length == 1) {
                        var data={
                            validation: '1'
                        }
                        var query = conn.query("UPDATE user set ? WHERE `mail` = ? and `token` =? ",[data,where_data.mail,where_data.token], function(err, rows){
                            if(err){
                                out['err'].push("error update user set.... " + err );
                                out['status'] = "err";
                                res.send(out);
                            }
                            out['status'] = "ok";
                            res.send(out);
                        });
                    }
                }
            })
        })
    }else {
        out['status']="err";
        out['err'].push("input data error")
        console.log(out);
        res.send(out);
    }
});



var category_router= router.route("/category/");
category_router.all(category.all);
category_router.get(category.show_all);


var category_tree= router.route("/category/tree/:id");
category_tree.all(category.all);
category_tree.get(category.show_tree);

var reset_password_rest =   router.route("/user/reset_pwd_email/");
reset_password_rest.all(reset_password.all);
reset_password_rest.post(reset_password.reset_pwd);

var reset_password_rest1 =   router.route("/user/reset_pwd/");
reset_password_rest1.all(reset_password.all);
reset_password_rest1.post(reset_password.new_password);

var advanced_find =   router.route("/advanced_find/");
advanced_find.all(adv_find.all);
advanced_find.post(adv_find.find);


var category_root= router.route("/category/root");
category_root.all(category.show_root);

var category_router1 = router.route("/category1");
category_router1.all(category.show_all1);

var registration = router.route("/registration/");
registration.all(function(req,res,next){
 console.log("reg");
 next();
 console.log(req.method, req.url);
});
registration.post(function(req,res,next){
    console.log("registration post",req.body);
    var out={err:[],};
    if (req.body.username  && req.body.password) {
        console.log(req.body);
        req.getConnection(function (err, conn) {
            var query = conn.query("SELECT * FROM user WHERE mail = ? ", [req.body.username], function (err, rows) {
                console.log("len:",rows.length);
                if (err) {
                    console.log(err);
                    out['status'] = "err";
                    out['err'].push("SQL: find user in base error");
                    //res.render('json',{data:JSON.stringify(out)});
		            res.send(out);
                    next(out.msg);
                }
                if (rows.length == 1) {
                    out['status'] = "err";
                    out['err'].push("user exist");
                    //res.render('json',{data:JSON.stringify(out)});
		            res.send(out);

                    next(out.msg);
                } else {
                    var query = "";
                    req.getConnection(function (err, conn) {
                        if (err) return next("Cannot Connect");
                        var token=gen_token();
                        var data =
                            {
                                "mail": req.body.username,
                                "validation": "0",
                                "token": token,
				"geo": "{}",
				"photos": "[]"
                            };
                        query = conn.query("INSERT INTO `web_freelancer`.`user`   set password  = PASSWORD('"+req.body.password+"'),  ? ", data, function (err, rows) {
                            if (err) {
                                console.log(err);
                                out['status'] = "err";
                                out['err'].push("err sql add user");
                                //res.render('json',{data:JSON.stringify(out)});
				                res.send(out);
                                next(out.msg);
                                //return next("Mysql error, check your query");
                            } else {
                                out['status'] = "ok";
                                out['err'].push("insert to base ok");
                                var send = require('gmail-send')({
                                    //var send = require('../index.js')({
                                    user: 'freelance@kolesnikdenis.com',
                                    pass: 'freelance321',
                                    to: req.body.username,
                                    subject: 'validation mail from geo freelancer',
                                    html: '<b>submit you mail</b> click <a href="http://freelance.kolesnikdenis.com/validation/' + token + '/'+req.body.username+'">there</a><br>' +
                                    '<br>' +
                                    '<hr>' +
                                    'from <i>' +
                                    '<img src="http://aboutislam.net/wp-content/uploads/2016/11/Is-Freelance-Work-Permissible.jpg"><br>' +
                                    '<a target=new href="http://uwork.pp.ua/">GEO Freelance WebSite</a></i>'
                                });
                                //var filepath = './pengbrew_160x160.png';  // File to attach
                                send({
                                    subject: 'Validation mail from  '+config.host_to_mail,
                                }, function (err, res1) {
                                    out['status']="ok";
                                    out['send_mail']="ok";
					                res.send(out);
                                });
                            }
                            //res.sendStatus(200);
                        });

                    });
                }
            });
            console.log(out);
        });
    }else {
        out['status']="err";
        out['err'].push("input data error")
        console.log(out);
        res.send(out);
    }
    console.log(out['msg'])
    //res.render('set',{title:"Edit user",data:[1,2,3,4,5]});
});

var blog_router = router.route("/blog/");
blog_router.all(blog.all);
blog_router.get(blog.show_all);
blog_router.delete(blog.del_blog_content);

var show_blog_id = router.route("/show_blog_id/:id");
show_blog_id.all(blog.all);
show_blog_id.get(blog.show_blog_id);


var del_blog_content = router.route("/blog_del_content");
del_blog_content.get(blog.show_all);
del_blog_content.post(blog.del_blog_content);

var update_blog_content = router.route("/blog_update_content");
update_blog_content.get(blog.show_all);
blog_router.post(blog.update_blog);

var work_msg=router.route("/msg_last");
work_msg.all(msg.show_all);
work_msg.get(msg.show_last_msg_to_user);

var work_msg=router.route("/msg_user_message");
work_msg.all(msg.show_all);
work_msg.get(msg.show_last_msg_to_user);

var msg_dialog=router.route("/msg_dialog/:id");
msg_dialog.all(msg.show_all);
msg_dialog.get(msg.show_dialog);

var work_msg_all_cont=router.route("/msg_all_count");
work_msg_all_cont.all(msg.show_all);
work_msg_all_cont.get(msg.msg_all_count);

var work_msg_all=router.route("/msg_unique_sender");
work_msg_all.all(msg.show_all);
work_msg_all.get(msg.show_unique);

var work_msg_all=router.route("/msg_send");
work_msg_all.all(msg.show_all);
work_msg_all.post(msg.msg_send);

var msg_last_update = router.route("/msg_last_update/:id");
msg_last_update.all(msg.show_all);
msg_last_update.get(msg.msg_last_update);

var update_blog_content = router.route("/blog_update_content");
update_blog_content.get(blog.show_all);
blog_router.post(blog.update_blog);
var blog_category_router = router.route("/blog/:id");
blog_category_router.all(blog.all);
blog_category_router.get(blog.show_category);
var blog_category_user = router.route("/blog_user/:autor");
blog_category_user.all(blog.all);
blog_category_user.get(blog.show_user_blog);
var blog_category_user_show_edit = router.route("/blog_user/:autor/:id");
blog_category_user_show_edit.all(blog.all);
blog_category_user_show_edit.get(blog.show_blog_content);
blog_category_user_show_edit.post(blog.update_user_blog);
var blog_add = router.route("/blog_add/");
blog_add.all(blog.all);
blog_add.post(upload1.array('files', 12),blog.blog_to_add);
//02.03.18
var blog_comment_save=router.route("/blog_comment");
blog_comment_save.all(blog.all);
blog_comment_save.post(blog.blog_comment_save);
var blog_comment_get=router.route("/blog_comment/:id");
blog_comment_get.all(blog.all);
blog_comment_get.get(blog.blog_comment_get);

var account = router.route("/account/");
account.all(function(req,res,next){
    console.log(req.method, req.url);
    if ( req.method == 'OPTIONS') {
        if ( req.headers && req.headers.auth ) {
            //console.log( "headers.auth.auth:", req.headers.auth);
            var json = JSON.parse(req.headers.auth);
            console.log("auth:", json);
            if (json.username && json.token) {
                console.log("ok auth");
            } else {
                console.log("status 401")
                res.status(401).send('err');
            }
        }
    }
    next();
});
account.post(function(req,res,next) {
    var out = {err: [],};
    console.log(req.body);
    if (req.body.username  && req.body.password) {
        req.getConnection(function (err, conn) {
            var query = conn.query("SELECT * FROM user WHERE `mail` = ? and `password`=PASSWORD('"+req.body.password+"') ", [req.body.username], function (err, rows) {
                if (err) {
                    console.log(err);
                    out['status'] = "err";
                    out['err'].push("SQL: find user in base error");
                    res.send(out);
                }else {
                    if (rows.length == 1) {
                        if ( rows[0].validation==1 ) {
                            rows[0].token=gen_token();
                            out['user_profile'] = rows[0];
                            out['status'] = "ok";
                            console.log(out);

                            var query = conn.query("UPDATE user set token=? WHERE `mail` = ? and `password`=PASSWORD('"+req.body.password+"')",[rows[0].token,req.body.username], function(err, rows){
                                if(err){
                                    //console.log(err);
                                    out['err'].push("error update user set.... " + err );
                                    out['status'] = "err";
                                    res.send(out);
                                }
                            });

                            var token_table = { token: rows[0].token, user_id: rows[0].id};
                            var query1 = conn.query("INSERT INTO `web_freelancer`.`arr_token` set ? ;",[token_table], function(err, rows){
                                if(err){
                                    console.log('add new token');
                                }
                            });
                            console.log(rows);
                            console.log(query1.sql);


                            res.send(out);
                        }else {
                            out['user_profile']="";
                            out['status'] = "err";
                            out['err'].push("not validated");
                            console.log(out);
                            res.send(out);
                        }
                    }else {
                        out['status'] = "err";
                        out['err'].push("user not found");
                        console.log(out);
                        res.send(out);
                    }
                }
            })
        })
    }else {
        out['status']="err";
        out['err'].push("input data error")
        console.log(out);
        res.send(out);
    }
});


var account_update = router.route("/account/update");
/*
account_update.all(function(req,res,next){
    console.log(req.method, req.url);
    if ( req.method == 'OPTIONS') {
        if ( req.headers && req.headers.auth ) {
            //console.log( "headers.auth.auth:", req.headers.auth);
            var json = JSON.parse(req.headers.auth);
            console.log("auth:", json);
            if (json.username && json.token) {
                console.log("ok auth");
            } else {
                console.log("status 401")
                res.status(401).send('err');
            }
        }

    }
    next();
});
*/
account_update.all(account_ex.all);
account_update.post(account_ex.update_info)

var list_img = router.route("/save_list_img");
list_img.all(work_img_list.all );
list_img.post( work_img_list.save_img_list);

var ads = router.route("/a_d_s");
ads.all(ads_route_ex.all );
ads.get( ads_route_ex.show_all);

var ads_geo = router.route("/a_d_s_geo");
ads_geo.all(ads_route_ex.all );
ads_geo.post( ads_route_ex.show_geo_all);

var ads_geo_last = router.route("/a_d_s_last");
ads_geo_last.all(ads_route_ex.all );
ads_geo_last.get( ads_route_ex.ads_last);

var ads_geo_last_ads = router.route("/a_d_s_add");
ads_geo_last_ads.all(ads_route_ex.all );
ads_geo_last_ads.post( ads_route_ex.ads_add);

var ads_geo_last_ads_user = router.route("/a_d_s_user/:id");
ads_geo_last_ads_user.all(ads_route_ex.all );
ads_geo_last_ads_user.get( ads_route_ex.ads_user);

var user_profile_router = router.route("/get_user_profile/:id");
user_profile_router.all( user_profile_ex.all );
user_profile_router.get( user_profile_ex.get_user_profile);

var upload_file = router.route("/upload");
upload_file.all(function(req,res,next){
    console.log(req.method, req.url);
    if ( req.method == 'OPTIONS') {
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

    }
    next();

})

upload_file.post(upload1.array('files', 12),common.uploadImage);
upload_file.get(common.uploadImageGet);

var delete_file = router.route("/delete_file");
delete_file.all(function(req,res,next){
    console.log("delete_file - all");
    console.log(req.method, req.url);
    if ( req.method == 'OPTIONS') {
        res.status(200);
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

    }
    next();
});
delete_file.post(common.delete_img);

var upload_file1 = router.route("/upload_stream");
upload_file1.all(function(req,res,next){
 console.log("all");
 console.log(req.method, req.url);
    //router.bodyParser({ uploadDir: __dirname +"/"+ config.path_upload});
 console.log(req.files)
    if ( req.method == 'OPTIONS') {
        res.send(200);
        //доп п�~@ове�~@ка
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

    }
    next();
});

var uploaded = multer().any()
upload_file1.post(uploaded,common.uploadImage1);
/*curut2.delete(function(req,res,next){
    var user_id = req.params.user_id;
     req.getConnection(function (err, conn) {
        if (err) return next("Cannot Connect");
        var query = conn.query("DELETE FROM t_user  WHERE user_id = ? ",[user_id], function(err, rows){
             if(err){
                console.log(err);
                return next("Mysql error, check your query");
             }
             res.sendStatus(200);
        });
        //console.log(query.sql);
     });
});
*/

app.use('/api', router);
var server = app.listen(3033,function(){
   console.log("Listening to port %s",server.address().port);
});
