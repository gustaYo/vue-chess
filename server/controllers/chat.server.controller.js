var nicknames = {};
var async = require('async');
var mongoose = require('mongoose');
var Mensajes = mongoose.model('mensajes');
var jwt = require("jsonwebtoken");
var User = mongoose.model('users');
var boardController= require('./board.server.controller');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var config = require('../config.js');
// var emitter = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });

// http://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients
exports.username = (io,socket,dta,next) => {
    var user=dta.user;
    if (dta.board) {
        socket.join(dta.board);
    }
    var _user = {
        nickname: user.username,
        name: user.name,
        image: user.image,        
        id: user._id,
        socket:socket.id
    }
    nicknames[_user.nickname] = _user
    socket.nickname=_user;
    nicknames = UsersConnect(io)
    var data= {
        event: 'users',
        data: {
            nicknames: nicknames
        }
    }
    // console.log(nicknames)
    //console.log(io.sockets.adapter.rooms)
    io.sockets.emit('event', data);
    next(null,nicknames);
}

var UsersConnect = function(io) {
    if (!config.multicore){
        return nicknames
    }
    var usersCon = {}
    for (var i in io.sockets.sockets) {
        usersCon[i] = io.sockets.sockets[i].nickname
    }
    // console.log(usersCon, process.pid)
    return usersCon
}
var getUserConnect = function(io,username) {
    if (!config.multicore){
        return nicknames[username]
    }
    for (var i in io.sockets.sockets) {
        if (io.sockets.sockets[i].nickname.nickname)
            if (io.sockets.sockets[i].nickname.nickname === username) {
                return io.sockets.sockets[i].nickname
            }
        }
        return false
    }

    var disconnectUser = function (io,user) {
        if (!config.multicore){
            try {
                if (nicknames[user.nickname])
                    delete nicknames[user.nickname]
                return
            } catch (e) {
                // some
            }

        }
    // multicore logic
}

function findClientsSocketByRoomId(roomId) {
    var res = []
    , room = io.sockets.adapter.rooms[roomId];
    if (room) {
        for (var id in room) {
            res.push(io.sockets.adapter.nsp.connected[id]);
        }
    }
    return res;
}

exports.IsValidSocketToken = (socket) => {
    var token = socket.request._query.token;
    var bearer = token.split(" ");
    bearerToken = bearer[1];
    var token = jwt.decode(bearerToken, {complete: true});
    if (token) {
        var headers = socket.handshake.headers;
  // seguridad basica mismo ip
  return token.payload.host===socket.handshake.address
}
return false
}

var validMensaje=function(string){
    // stripTags
    // badWords validate   
    return string;
}

exports.mensaje = (io,socket,dta,next) => {
   if (dta.men.type === 'text') {
    dta.men.body = validMensaje(dta.men.body);
}
var data= {
    event: 'mensaje',
    data: {
        men: dta.men
    }
}
if (dta.men.public) {
    io.sockets.in(dta.men.recibe).emit("event", data);
} else {
    var someUser = getUserConnect(io, dta.men.recibe)
    if(someUser){
        io.sockets.connected[someUser.socket].emit("event", data);
    }
    socket.emit("event", data);
}
var newMEn= new Mensajes(dta.men);
newMEn.save(function(err, mens) {
        // console.log(mens)
    })
addConverToUser(dta.men.recibe,dta.men.send);
addConverToUser(dta.men.send,dta.men.recibe);
next(null,{});
}

var loadConver = (user1, user2, range, next) => {
    Mensajes.find({$or: [{send: user1, recibe: user2}, {send: user2, recibe: user1}]})
    .sort({created: -1})
    .limit(range.limit)
    .skip(range.skip)
    .exec(function(err, mens) {
        next(err,mens)
    })
}

exports.loadUserConvert = (io,socket,dta,next) => {
    if (socket.nickname)
        loadConver(socket.nickname.nickname, dta.user, dta.range, function (err,log) {
            next(err,log)
        })
}

var userLog = (user, next) => {
    var losgs_retorn = new Array();
    var conversaciones_abiertas = new Array();
    User.findOne({username: user.username}, function(e, o) {
        if (o) {
            conversaciones_abiertas = o.convAbiertas;
            next(conversaciones_abiertas)
        }
    });
}

/**
 * addLog
 */

 var addConverToUser = (user1,user2) => {
    User.update(
        {username: user1},
        {$addToSet: {convAbiertas: user2}}, function(err) {
            if (err)
                console.log(err);
        });
}
/**
 * addLog
 */
 exports.removeConversation = (io,socket,dta,next) => {
    User.update(
        {username: dta.user},
        {$pull: {convAbiertas: dta.conver}}, function(err) {
            if (err)
                next(err);
            else
                next(null,'ok');
        });
};
exports.disconnect = (io,socket) => {
    disconnectUser(io,socket.nickname)
    var data= {
        event: 'users',
        data: {
            nicknames: UsersConnect(io)
        }
    }
    io.sockets.emit('event', data);
}
exports.getDataChat = (io,socket,dta,next) => {
    // usuarios conectados
    userLog(dta.user,function(logUser){
        next(null,{
            users: UsersConnect(io),
            boards: boardController.getBoards(),
            logUser:logUser
        })
    })  
}
exports.getNicknames = (io) => {
    return UsersConnect(io)
}

exports.uploadFile = (req, res) => {
  // create an incoming form object
  var form = new formidable.IncomingForm();
  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;
  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '../public/uploads');
  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  var curTime = new Date();
  var curTime = curTime.getTime();
  fileName = "filename";
  form.on('file', function(field, file) {
    var fileName = curTime + '__' +file.name    
    fs.rename(file.path, path.join(form.uploadDir, fileName), function(err) {
        if (!err) {
            return res.send(fileName);
        }
    });     
  });
  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });
  // parse the incoming request containing the form data
  form.parse(req);  
}

exports.deleteImage = function(req, res) {
    var parms = req.body    
    var dir = path.join(__dirname, '../public/uploads')
    fs.unlink(dir+'/'+parms.name, function(err){
        if(err){
            console.log(err)
            return res.send(500, err);
        }
        console.log('eliminando', parms)
        return res.status(200).send('ok')
    })
}