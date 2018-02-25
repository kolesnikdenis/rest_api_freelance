var config = require('../config.json');


function gen_token(){
    var uuidv4 = require('uuid/v4');
    return uuidv4();
}

exports.all= function(req, res, next){
    console.log("all");
    next();
};


exports.find = function (req,res,next) {
    console.log("body: ",req.body);
    console.log("params: ",req.params);
};