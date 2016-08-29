var jwt = require("jsonwebtoken");
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
var async = require('async');
var mongoose = require('mongoose');
var User = mongoose.model('users');
var requestIp = require('request-ip');
var SECRET_TOKEN= "GUSTA_O0000"

exports.authenticate = function(req, res) {
    User.findOne({username: req.body.username}, function(err, user) {
        if (err) {            
            res.status(500).send('internal_server_error');
        } else {
            if (user) {
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    var token = generaTokenUser(user._id, req);
                    user["password"] = null;
                    res.json({
                        type: true,
                        data: user,
                        token: token
                    });
                } else {
                    res.status(500).send('passw_incorrect');
                }
            } else {
                res.status(500).send('user_not_found');
            }
        }
    });
}

exports.signin = function(req, res) {
    var data = req.body;
//Adicionando usuario 
var userModel = new User(data);
userModel.email = data.email;
userModel.password = bcrypt.hashSync(data.password);
userModel.save(function(err, user) {
    if(err){
        res.status(500).send(err);
    }else{
        user.password = null
        res.status(200).send({
            type: true,
            data: user,
            token: generaTokenUser(user._id, req)
        })
    }    
});
}
var generaTokenUser = function(id_user, req) {
    var newToken = {
        id_user: id_user,
        iat: moment().unix(),
        exp: moment().add(3, "days").unix(),
        host: requestIp.getClientIp(req)
    };
    console.log(newToken)
    return jwt.sign(newToken, SECRET_TOKEN);
}

var getToken = function(req, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        var token = jwt.decode(bearerToken, {complete: true});
            //verificando validez del token en el tiempo
            if ((token.payload.exp <= moment().unix())) {
                next('token_expire')
            } else {
                //verificando mismo host de usuario
                console.log(token.payload.host,requestIp.getClientIp(req))
                if (token.payload.host !== requestIp.getClientIp(req)) {
                    next('token_host_invalid')
                } else {
                    next(null, token.payload)
                }
            }
        } else {
            return next('token_not_found')
        }    
    }
    exports.getToken = getToken
    
    exports.UserAccess = function(perm) {
        return function(req, res, next) {
            getToken (req, function(err,token){
                if (err){
                    return res.status(403).send(err);
                }
                // asegurando permiso de usuario en servidor
                User.findOne({_id: token.id_user, role: perm}, function(err, user) {
                    if (user) {
                        next();
                    } else {
                        return res.status(403).send(err);
                    }
                });                
            })            
        }
    }