


update_token = function(in_data,conn) {
    //return new Promise(resolve,reject => { })
    var query = conn.query('SELECT * FROM `arr_token` WHERE ? > datetime and user_id=?', [from_day(), in_data.id_user], function (err, rows) {
        if (err) {
            console.log(err);
            out['status'] = "err";
            out['err'].push("SQL: find user in base error");
            //res.send(out);
        } else {
            console.log("token date update!");
            console.log(query.sql);
            console.log(rows);
            if (rows.length>0)
                var query1 = conn.query('UPDATE arr_token set datetime=NOW() WHERE `id` = ? ', [rows[0].id], function (err, rows) {
                    if (err){ console.log(err); }
                    console.log("sql:",query1.sql);
                })
        }
    });
    console.log("delete:")
    var query2 = conn.query('DELETE FROM `web_freelancer`.`arr_token`  WHERE DATE(?) > DATE(datetime) and user_id=?', [from_day(), in_data.id_user], function (err, rows) {
        if (err){ console.log(err); }
        console.log("DELETE: ",query2.sql);
    })
};

from_day = function()
{
    var today = new Date();
    today.setDate(today.getDate() - 7);
    today.setYear(1900 + today.getYear());
    return today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
}


test_auth = function(req,res,next){

 return new Promise((resolve, reject) => {
     var out = {err: []};
     var json = {};

     send_error = function (msg) {
         console.log(msg);
         out.err.push(msg)
         res.status(401).send(out);
     };

     if (req.headers && req.headers.auth) {
         json = JSON.parse(req.headers.auth);
         if (json.username && json.token) {
             console.log("ok auth");
         } else {
             console.log("ttt")
             send_error("user Unauthorized, send status 401");
             reject({status:'err', out_out: out});
         }
     } else {
         console.log("ttt1111")
         send_error("user Unauthorized, send status 401");
         reject({status:'err', out_out: out});
     }

     if (req.headers && req.headers.auth && json.username && json.token) {
         req.getConnection(function (err, conn) {
             var q = conn.query("SELECT * FROM `user`,`arr_token` WHERE `user`.`mail` = ? and `arr_token`.`token` = ? and `arr_token`.`datetime` > ?", [json.username, json.token, from_day()], function (err, rows) {
                 if (err) {
                     console.log(error);
                     out.err.push("error SQL")
                     res.status(200).send(out);
                     reject({status:'err', out_out: out});
                 }
                 if (rows.length == 1) {
                     console.log("login ok");
                     update_token({id_user: rows[0].id}, conn);
                     resolve({status:'ok',mail:json.username,token:json.token});
                 } else {
                     send_error("user Unauthorized, send status 401");
                     reject({status:'err', out_out: out});
                 }

             });
             console.log(q.sql)
         });
     }
 });
};




test_auth_not_hard = function(req,res,next){

    return new Promise((resolve, reject) => {
        var out = {err: []};
        var json = {};

        if (req.headers && req.headers.auth) {
            json = JSON.parse(req.headers.auth);
            if (json.username && json.token) {
            } else {
                reject({status:'no_auth', out_out: out});
            }
        } else {
            reject({status:'no_auth', out_out: out});
        };

        if (req.headers && req.headers.auth && json.username && json.token) {
            req.getConnection(function (err, conn) {
                var q = conn.query("SELECT * FROM `user`,`arr_token` WHERE `user`.`mail` = ? and `arr_token`.`token` = ? and `arr_token`.`datetime` > ?", [json.username, json.token, from_day()], function (err, rows) {
                    if (err) {
                        console.log(error);
                        out.err.push("error SQL")
                        reject({status:'no_auth', out_out: out});
                    }
                    if (rows.length == 1) {
                        update_token({id_user: rows[0].id}, conn);
                        resolve({status:'ok',mail:json.username,token:json.token});
                    } else {
                        reject({status:'no_auth', out_out: out});
                    }

                });
                console.log(q.sql)
            });
        }
    });
};

module.exports = {  test_auth,from_day,update_token,test_auth_not_hard  };