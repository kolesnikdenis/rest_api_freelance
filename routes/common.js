var config = require('../config.json');
var fs = require('fs');

/*
var multer  = require('multer');
var upload1 = multer({ dest: __dirname+"/"+config.path_upload });
*/

exports.delete_img = function(req, res, next){

        auth_token.test_auth(req,res,next).then(result => { del_img_fung();}, error => {console.log(error); });
        console.log("del file");
        var out={err:[]};
        console.log(req.body);


        del_img_fung = function () {
        req.getConnection(function (err, conn) {
            query = conn.query("SELECT * FROM " + req.body.table + " WHERE `id` =?", [req.body.id], function (err, rows1) {
                if (err) {
                    console.log(err);
                    out['user_profile'] = "";
                    out['status'] = "err";
                    out['err'].push("err read table and file list");
                    res.send(out);
                    next(out.msg);
                } else {
                    console.log("rows1:", rows1);
                    out['status'] = "ok"
                    //out[''] = update_data;
                    if (rows1[0] && rows1[0].photos) {
                        var pl = JSON.parse(rows1[0].photos);
                        out['err'].push("pl: " + pl.length);
                        if (pl.length >= 1) {
                            for (var index in pl) {
                                if (pl[index].filename == req.body.del_file) {
                                    console.log("del del_file:", req.body.del_file, "arr file:", pl[index].filename, " index:", index);
                                    out['status'] = "ok"
                                    out['del_file'] = req.body.del_file;
                                    pl.splice(index, 1);

                                    try {
                                        fs.unlinkSync(config.path_upload + req.body.del_file);
                                    } catch (err) {
                                        console.log("error del file");
                                    }
                                    ;

                                    pl = JSON.stringify(pl);
                                    query = conn.query("UPDATE " + req.body.table + " SET `photos` = ?  WHERE `blog`.`id` = ?", [pl, req.body.id], function (err, rows) {
                                        if (err) {
                                            console.log(err);
                                            out['status'] = "err";
                                            out['err'].push("err, update photo tables");
                                            res.send(out);
                                            next(out.msg);
                                        } else {
                                            out['del_index'] = index;
                                            out['status'] = "ok";
                                            console.log(out);
                                            res.send(out);
                                        }
                                    });
                                    console.log("SQL:", query.sql);
                                }
                                ;
                            }
                            ;
                        } else {
                            out['status'] = "err";
                            out['err'].push("file empty");
                        }
                    } else {
                        out['status'] = "err";
                        out['err'].push("some mistake ");
                        res.send(out);
                    }

                }
            })
        });
    }
};

exports.uploadImage1 = function(req, res, next){
	console.log("post upload stream");
	console.log(req.files);
    var arr = req.body.photos_arr;
	console.log(arr);

    //UPDATE `web_freelancer`.`blog` SET `photos` = '[{"filename":"5cca4e806e6e2251393d4fe55ecbab67","alt":"IMG-9b703ae7b772812f89675794f4c193af-V.jpg"},{"filename":"5cca4e806e6e2251393d4fe55ecbab67","alt":"IMG-9b703ae7b772812f89675794f4c193af-V.jpg"}]' WHERE `blog`.`id` = 19;
    /*req.getConnection(function (err, conn) {
        query = conn.query("UPDATE `web_freelancer`.`blog` SET `photos` = ?  WHERE `blog`.`id` = 19", data_mysql, function (err, rows1) {
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
        })
    });*/

	var out={err:[],photos:[]};
	for ( var i in req.files ){
		var buffer = req.files[i].buffer;
		var magic = buffer.toString('hex', 0, 8)+"_"+i;
		console.log(magic);
        var f= req.files[i].originalname;
        f = f.split(".")[f.split(".").length-1]
		if (f.length>5) {f="";} else { f="."+f;}
		var filename =  magic +"--"+Date.now() +f;
		out.photos.push(filename);
		fs.writeFile(config.path_upload + filename, buffer, 'binary', function (err) {
		if (err) throw err;
			//next('File is uploaded');
			console.log("file ", filename,"save to ",config.path_upload );
		});
	}
	out['status']="ok";
	res.send(out);

		
};

exports.uploadImage = function(req, res, next){
    //console.log("files:",req.files);
    if ( req.files.length >0 ){
        for (var i in req.files) {
            console.log('file info: ', req.files[i].originalname);
            res.send("<img src='"+config.www_upload_img+req.files[i].filename+"' width=200px'><br>");
        }
        console.log("send 200");
        //res.send(200);
        //res.send({data:"333", out: req.files});

    } else {
        res.send("error in file");
    }
};


exports.uploadImageGet = function (req, res, next) {
    //res.send(req.method + " " +req.url+ " <br>Сan not do it because it needs to do POST");
    res.send("<form method=\"post\" enctype=\"multipart/form-data\" action=\"upload\">" +
        "<input type=\"file\" name=\"files\" >" +
        "<input type='text' name='title'>" +

        "<input type=\"submit\">" +
        "</form>");
    console.log(req.method, req.url);
}
