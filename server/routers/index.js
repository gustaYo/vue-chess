module.exports = function(app, express, io) {
    var controllers = require('../controllers');
    app.route('/').get(function(req, res) {
        res.render('client');
    });

    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        if ('OPTIONS' == req.method) {
            return res.sendStatus(200);
        }
        if (req.secure) {
            return next();
        };
    });
    var fs = require('fs')
    var walk = function(path) {
        fs.readdirSync(path).forEach(function(file) {
            var newPath = path + '/' + file;
            var stat = fs.statSync(newPath);
            if (stat.isFile()) {
                if (/(.*)\.(js|coffee)/.test(file)) {
                    if (file != 'index.js') {
                        require(newPath)(app, express, controllers);
                    }
                }
            } else if (stat.isDirectory()) {
                // walk(newPath);
            }
        });
    };
    var models_path = __dirname;
    walk(models_path);
    io.use(function(socket, next) {
        if (!io.nicknames){
            io.nicknames = {}
        }
        if (controllers.chat.IsValidSocketToken(socket)) {
            next();
        } else {
            next(new Error("not authorized"));
        }
    });
    // socket events
    io.on('connection', function (socket) {
        var headers = socket.handshake.headers;
        //console.log(headers);
        socket.on('event', function(data, fn) {
            controllers[data.c][data.f](io,socket,data.data,fn);
        });
        socket.on('disconnect', function () {
            var data={
                c:'chat',
                f:'disconnect'
            }
            controllers[data.c][data.f](io,socket);
        });
    });
};