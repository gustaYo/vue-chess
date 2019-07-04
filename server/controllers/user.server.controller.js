var jwt = require("jsonwebtoken");
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
var async = require('async');
var mongoose = require('mongoose');
var User = mongoose.model('users');
var requestIp = require('request-ip');
var SECRET_TOKEN = "GUSTA_O0000"

exports.authenticate = function (req, res) {
  User.findOne({
    username: req.body.username
  }, function (err, user) {
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

exports.get = function (req, res) {
  User.findOne({
    username: req.params.username
  }, function (err, user) {
    if (err) {
      res.status(500).send('internal_server_error');
    } else {
      if (user) {
        res.status(200).send(user)
      } else {
        res.status(500).send('user_not_found');
      }
    }
  });
}
exports.test = function (req, res) {
  getToken(req, function (err, token) {
    if (err) {
      return res.status(403).send(err);
    }
    User.findOne({
      _id: token.id_user
    }, function (err, user) {
      if (user) {
        return res.status(200).send(user);
      } else {
        return res.status(403).send(err);
      }
    });
  })
}
exports.edit = function (req, res) {
  var data = req.body;
  var id = ''
  if (data._id) {
    // editando usuario
    id = data._id;
    delete data['_id'];
    // actualizando nuevo pass el usuario admin agrego al formulario editar la contrasenna
    if (data.password !== "") {
      console.log('password edit')
      data.password = bcrypt.hashSync(data.password);
    } else {
      delete data['password'];
    }
    console.log(data)
    User.update({
      _id: id
    }, {
      $set: data
    }, function (err, user) {
      if (err) {
        return res.send(500, err.message);
      } else {
        console.log(user)
        res.status(200).jsonp('ok');
      }
    });
  }
}
exports.signin = function (req, res) {
  var data = req.body;
  //Adicionando usuario 
  var userModel = new User(data);
  userModel.email = data.email;
  userModel.password = bcrypt.hashSync(data.password);
  userModel.save(function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      user.password = null
      res.status(200).send({
        type: true,
        data: user,
        token: generaTokenUser(user._id, req)
      })
    }
  });
}
var generaTokenUser = function (id_user, req) {
  var newToken = {
    id_user: id_user,
    iat: moment().unix(),
    exp: moment().add(3, "days").unix(),
    host: requestIp.getClientIp(req)
  };
  //console.log(newToken)
  return jwt.sign(newToken, SECRET_TOKEN);
}

var getToken = function (req, next) {
  var bearerToken;
  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    var token = jwt.decode(bearerToken, {
      complete: true
    });
    try {
      if ((token.payload.exp <= moment().unix())) {
        next('token_expire')
      } else {
        //verificando mismo host de usuario
        if (token.payload.host !== requestIp.getClientIp(req)) {
          next('token_host_invalid')
        } else {
          next(null, token.payload)
        }
      }
    } catch (e) {
      next('token_host_invalid')
    }

  } else {
    return next('token_not_found')
  }
}
exports.getToken = getToken
exports.UserAccess = function (perm) {
  return function (req, res, next) {
    getToken(req, function (err, token) {
      if (err) {
        return res.status(403).send(err);
      }
      // asegurando permiso de usuario en servidor
      if (!perm) {
        return next();
      }
      User.findOne({
        _id: token.id_user,
        role: perm
      }, function (err, user) {
        if (user) {
          next();
        } else {
          return res.status(403).send(err);
        }
      });
    })
  }
}
var InstallInit = function () {
  setTimeout(function () {
    User.count({}, function (err, count) {
      if (count == 0) {
        console.log('instalando usuario root')
        // install user root admin
        var data = {
          name: 'Admin',
          username: 'admin',
          password: 'yoyo',
          email: 'gustayocs@gmail.com',
          firstName: 'si',
          lastName: 'si',
          role: 'Admin',
          age: 25,
          sexo: 'm'
        }
        var userModel = new User(data);
        userModel.password = bcrypt.hashSync(data.password);
        userModel.save(function (err, user) {
          // console.log(user);
        })

        // instalando usuarios por efecto
        var insert = new Array();
        var pass = bcrypt.hashSync('asdfg')
        for (var i = 20 - 1; i >= 0; i--) {
          var data = {
            name: 'user' + i,
            username: 'user' + i,
            password: pass,
            email: 'user' + i + '@gmail.com',
            firstName: 'user' + i,
            lastName: 'asd',
            role: 'asd',
            age: 25,
            sexo: 'f'
          }
          insert.push(new User(data));
        };
        async.mapLimit(insert, 10, function (document, next) {
          document.save(next);
        }, function () {
          console.log('instalados usuarios default')
        });
      }
    })
  }, 3000);
}
InstallInit();
