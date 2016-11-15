(() => {
	'use strict';
	const ENV = process.env.NODE_ENV || 'development';
	let express = require('express'),
	cluster = require('cluster'),
	moment = require('moment'),
	app = express(),
	bodyParser = require('body-parser'),
	socket_io = require("socket.io"),
	fs = require('fs'),
	compression = require('compression'),
	morgan = require("morgan"),
	jwt = require("jsonwebtoken"),
	http = require("http"),
	https = require('https');
	let io = socket_io();
	let
		// Local ip address that we're trying to calculate
		address
		// Provides a few basic operating-system related utility functions (built-in)
		, os = require('os')
		// Network interfaces
		, ifaces = os.networkInterfaces();
// Iterate over interfaces ...
for (var dev in ifaces) {
	// ... and find the one that matches the criteria
	let iface = ifaces[dev].filter(function(details) {
		return details.family === 'IPv4' && details.internal === false;
	});

	if (iface.length > 0)
		address = iface[0].address;
}
if (typeof address == 'undefined') {
	address = '127.0.0.1';
}

module.exports = (appdir,config, cb) => {
	app.dir = appdir;
	// Setup HTTPS
	let options = {
		key: fs.readFileSync(__dirname+'/../ssl/private.key'),
		cert: fs.readFileSync(__dirname+'/../ssl/certificate.pem')
	};
	// things to do on each request
	app.use((req, res, next) => {
	  // log each request in development/staging ENVironment
	  if (config.debug) {
	  	console.log(moment().format('HH:MM'), req.method, req.url,
	  		req.socket.bytesRead, 'process:', process.pid);	  	
	  }
	  next();
	});
	// Standard error handling
	app.use((err, req, res, next) => {
		console.error(err.stack);
		res.status(500).send('Something broke!');
		next();
	});
	// to support JSON-encoded bodies
	app.use(bodyParser.json());
	// to support URL-encoded bodies
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	if (config.debug) {
		app.use(morgan("dev"));	
	}

// Set view engine
app.set('views', __dirname + '/../views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// Setting the app router and static folder
//app.use(compression());
let oneYear = 365 * 86400000;
app.use(express.static(__dirname + '/../public', {maxAge: oneYear}));
app.set('ipaddr', address);
app.set('port', config.porthttp);
require('../routers')(app, express, io);
var server = https.createServer(options,app);

if (config.multicore){
// use node socket clouster
var redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));	
}
io.attach(server);

server.on('listening', function(){
	console.log('Server running at '+ (config.https?'https':'http')+'://' + app.get('ipaddr') + ':' + app.get('port'));
});
cb(server);
};
})();
