var config = require('../config.json');



function restruct(in_data,def,add_data) {
    var out = [];
    for (key in in_data) {
        if (in_data[key].subsections == 0) {
            out.push({id: in_data[key].id, icon: in_data[key].icon, name: in_data[key].name, subb: []});
        }
        else {
            for (kk in out) {
                if (out[kk].id == in_data[key].subsections) {
                    out[kk].subb.push({id: in_data[key].id, icon: in_data[key].icon, name: in_data[key].name, subb: []});
                } else {
                    for (kkk in out[kk].subb) {
                        if (out[kk].subb[kkk].id == in_data[key].subsections) {
                            out[kk].subb[kkk].subb.push({id: in_data[key].id, icon: in_data[key].icon, name: in_data[key].name, subb: []});
                        }
                    }
                }
            }
        }
    }
    return (out);
}


exports.all= function(req, res, next){
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

};
exports.show_root = function(req, res, next){
    req.getConnection(function(err,conn) {
        if (err) return next("Cannot Connect");
        var query = conn.query("SELECT * FROM `categories` WHERE `subsections` = 0", function (err, rows) {
            console.log("len:", rows.length);
            if (err) {
                console.log(err);
                out['status'] = "err";
                res.send(out);
            }else {
                var out = {response: []};
                out['response']=rows;
		out.lenth;
		try {
                 	res.send(out); 
		}
		catch (err) { 
			console.log( "erro category send error");
			console.log(err);
		}
		
		}
        });
    })
};

exports.show_all1 = function(req, res, next){
    req.getConnection(function(err,conn) {
        if (err) return next("Cannot Connect");
        var query = conn.query("SELECT * FROM `categories`", function (err, rows) {
            console.log("len:", rows.length);
            if (err) {
                console.log(err);
                out['status'] = "err";
                res.send(out);
            }
            var out = {response: []};
            out['response'] =restruct(rows)
            res.send(out);
        });
    })
};
exports.show_all = function(req, res, next){
    req.getConnection(function(err,conn) {
        if (err) return next("Cannot Connect");
        var query = conn.query("SELECT * FROM  `categories` ", function (err, rows) {
            if (err) {
                console.log(err);
                out['status'] = "err";
                res.send(out);
            }
                var out = {response: []};
                out['response']=rows;
                res.send(out);
        });
    })
};


exports.show_tree = function (req, res, next) {
    req.getConnection(function(err,conn) {
        if (err) return next("Cannot Connect");
        var query = conn.query("SELECT * FROM  `categories` ", function (err, rows) {
            console.log("len:", rows.length);
            if (err) {
                console.log(err);
                out['status'] = "err";
                res.send(out);
            }
            var out = {response: []};
            if (req.params.id && req.params.id > 0) {
                out['response'] = restruct(rows).filter(function (item) {
                    if (item.id == req.params.id) return item;
                });
                if (out['response'].length == 0) {
                    out['status'] = "err";
                    res.send(out);
                } else {
                    res.send(out);
                }
            }
            else {
                out['status'] = "err";
                res.send(out);
            }
        });
    })
}
