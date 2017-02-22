var mongoose = require('mongoose');
var child_process = require('child_process');
var Board = mongoose.model('boards');
var boards= {};
var async = require('async');
var userController= require('./chat.server.controller');
var useFork = false

var userIsPlayed = (user) => {
	for (var i in boards) {
		if ((boards[i].u1 === user) || (boards[i].u2 === user)) {
			return true
		}
	};
	return false
}

var changeBoards = (someBoard, method) => {
	var send = {
		name: 'boards',
		method: method,
		data: someBoard
	}
	process.send(send)
}

exports.confirmGame = (io,socket,dta,next) => {
	// usuario invitado confirma que quiere juegar la partida indicada
	var nicknames = userController.getNicknames(io)
	var otherUser = dta.u1 === socket.nickname.nickname ? dta.u2 : dta.u1
	if(nicknames[otherUser]){
		dta.event = 'confirmGame'
		dta.confirm = true
		io.sockets.connected[nicknames[otherUser].socket].emit("event", dta);
	}
	nicknames = {}
}

exports.addBoard = (io,socket,dta,next) => {
	// crear nuevo tablero
	// verificar que usuarios no tienen un tablero abierto
	var nicknames = userController.getNicknames(io)
	var otherUser = dta.u1 === socket.nickname.nickname ? dta.u2 : dta.u1
	// usuario actual tiene un juego abierto
	if (userIsPlayed(socket.nickname.nickname)) {
		return next('user_played')
	}
	// el otro usuario esta conectado
	if (otherUser !== 'PC' && !nicknames[otherUser]) {
		return next('user_desconect')
	}
	// el otro usuario esta jugando
	if (otherUser !== 'PC' && userIsPlayed(otherUser)){
		return next('another_user_played')
	}
	var newBoard= new Board(dta);
	newBoard.save(function(err, board) {
		if(err){
			next(err.message)
		}
		socket.boardr = board._id;
		board.times = {}
		boards[board._id]=board;
		// actualizar listado de juegos activos
		var data= {
			event: 'boards',
			data: {
				boards: boards
			}
		}
		io.sockets.emit('event', data);
		var nicknames = userController.getNicknames(io);
		// unir ambos usuarios a la nueva sala
		if (dta.u1 !== 'PC' && nicknames[dta.u1]) {
			io.sockets.connected[nicknames[dta.u1].socket].join(board._id);
		}
		if (dta.u2 !== 'PC' && nicknames[dta.u2]) {
			io.sockets.connected[nicknames[dta.u2].socket].join(board._id);
		}
		socket.join(board._id)
		// iniciar juego de sala
		var data= {
			event: 'initGame',
			data: board
		}
		io.sockets.in(board._id).emit('event', data);
		nicknames = {}
		return next(null,board)
	});
}

exports.inviteGame = (io,socket,dta,next) => {
	var nicknames = userController.getNicknames(io)
	if(nicknames[dta.data.recibe]){
		io.sockets.connected[nicknames[dta.data.recibe].socket].emit("event", dta);
	}
	nicknames = {}
}

var closeGame = (io, dta, next) => {
	if (boards[dta.idBoard]) {
		var thisBoard = boards[dta.idBoard]
		Board.update(
			{_id: dta.idBoard},
			{$set: {
				wins:dta.result.color,
				motiv:dta.result.motiv,
				pgn: thisBoard.pgn ? thisBoard.pgn : ''
			}
		}, function(err, user) {
			if (err) {
				console.log(err.message)
			} else {
				console.log("partida guardada")
			}
		});
	// actualizar a salas de este tablero
	var data= {
		event: 'gameFinish',
		data: {
			result: dta.result,
			board: thisBoard
		}
	}
	io.sockets.in(dta.idBoard).emit('event', data);
	// guardar para la historia partida en db
	delete boards[dta.idBoard]
	timesBoards[dta.idBoard].events.send({type: 'finish'});
	// eliminar process fork countDown
	delete timesBoards[dta.idBoard]
	var data= {
		event: 'boards',
		data: {
			boards: boards
		}
	}
	io.sockets.emit('event', data);
	// eliminar sala del socket pendiente		
}
next(null, {})
}

exports.gameFinish = (io,socket,dta,next) => {
	// eliminar talero activo
	closeGame(io,dta,next)
}

var isFinishTime = (idBoard, io) => {
	if (!timesBoards[idBoard]) {
		return
	}
	var times = timesBoards[idBoard].times
	if (times.black <= 0 || times.white <= 0) {
		var color = times.black === 0 ? 'white' : 'black';
		var dta = {
			idBoard: idBoard,
			result: {
				color: color,
				motiv: 'timeout'
			}
		};
		closeGame(io, dta, function(err, data) {});
	}
}
exports.move = (io,socket,board,next) => {
	// salvar estado de tablero
	if (boards[board.data.idBoard]) {
		if (board.data.pgn) {
			boards[board.data.idBoard].pgn = board.data.pgn;
		}
		board.data.times = timesBoards[board.data.idBoard].times
		timesBoards[board.data.idBoard].events.send({type: 'contDown', data: board.data.turn});
		isFinishTime(board.data.idBoard, io);
		io.sockets.in(board.data.idBoard).emit("event", board);
	}
}

exports.getBoards = () => {
	return boards
}
var getTimesBoard = (idBoard) => {
	timesBoards[idBoard].events.send({type: 'getTimes'})
}

var timesBoards = {}
exports.getBoard = (io,socket,board,next) => {
	if (!boards[board._id]){
		return next('not_found')
	}
	// en el servidor se llevan los tiempos reales de cada partida
	if (!timesBoards[board._id]){
		// inicializacion de tiempos de juego
		timesBoards[board._id] = 
		{
			turn: 1,
			events: child_process.fork(__dirname + '/utils/forkContDown'),
			times: {
				white: parseInt(board.time) * 60,
				black: parseInt(board.time) * 60
			}
		}
		if(timesBoards[board._id].turn===1){
			var someData = {
				'type': 'setTimes',
				data: timesBoards[board._id].times
			}
			timesBoards[board._id].events.send(someData)
			timesBoards[board._id].events.on('message',function(data){
				timesBoards[board._id].times = data
			})
		}
		// empiezan siempre las blancas
		getTimesBoard(board._id)
		timesBoards[board._id].events.send({type: 'contDown', data: 'white'})
	}else {
		getTimesBoard(board._id)
	}
	// subcripcion de usuario a la sala sino esta
	if (socket.gameShow) {
		if (socket.gameShow !== board._id) {
			socket.leave(socket.gameShow);
			socket.gameShow = null;
		}
	}
	socket.gameShow = board._id;
	socket.join(board._id)
	next(null,{board:boards[board._id] ,times: timesBoards[board._id].times})
	setTimeout(function() {
		isFinishTime(board._id, io);
	},1000)
}

exports.filterViews = (req, res) => {
	var query = {u1: new RegExp(req.body.filters.u1, "i"),u2: new RegExp(req.body.filters.u2, "i"),wins: {$exists: true}};
	async.parallel({
		total: function(callback) {
			Board.count(query, function(err, count) {
				callback(null, count);
			})
		},
		documents: function (callback) {
			Board.find(query)
			.sort({created: -1})
			.limit(req.body.limit)
			.skip(req.body.skip * req.body.limit)
			.exec(function(err, boards) {
				callback(null, boards);
			})        	
		}
	},
	function(err, results){
		if (err) {
			return res.status(500).send(err);
		} else {
			return res.status(200).send(results)
		}
	});
}

exports.stats = (req, res) => {
	var parms = req.query;
	getStaticticsUser(parms.user, (err,results) => {
		// dar formato al resultado
		results = formatResultStatis(results)
		if (err) {
			return res.status(500).send(err);
		} else {
			return res.status(200).send(results)
		}
	})


}

var getStaticticsUser = (user,next) => {
	async.parallel({
		whitevsPC: function(callback) {
			Board.count(
			{
				u1: user,
				u2: 'PC',
				wins: 'white'
			}
			, function(err, count) {
				callback(null, count);
			})
		},
		blackvsPC: function(callback) {
			Board.count(
			{
				u2: user,
				u1: 'PC',
				wins: 'black'
			}
			, function(err, count) {
				callback(null, count);
			})
		},		
		totalWhitevsPC: function(callback) {
			Board.count(
			{
				u1: user,
				u2: 'PC'
			}
			, function(err, count) {
				callback(null, count);
			})
		},		
		totalvsPC: function(callback) {
			Board.count(
			{
				u1: {$in: ['PC',user]},
				u2: {$in: ['PC',user]}
			}
			, function(err, count) {
				callback(null, count);
			})
		},

 // vs user no pc
 whitevsOthersUsers: function(callback) {
 	Board.count(
 	{
 		u1: user,
 		u2: {$nin: ['PC']},
 		wins: 'white'
 	}
 	, function(err, count) {
 		callback(null, count);
 	})
 },
 blackvsOthersUsers: function(callback) {
 	Board.count(
 	{
 		u2: user,
 		u1: {$nin: ['PC']},
 		wins: 'black'
 	}
 	, function(err, count) {
 		callback(null, count);
 	})
 }, 
 totalvsOthersUsers: function(callback) {
 	Board.count(
 		{$or: 
 			[{u1: user, u2: {$nin: ['PC']}},
 			{u1: {$nin: ['PC']}, u2: user}]
 		}
 		, function(err, count) {
 			callback(null, count);
 		})
 },
 totalWhitevsOthersUsers: function(callback) {
 	Board.count(
 	{
 		u1: user,
 		u2: {$nin: ['PC']}
 	}
 	, function(err, count) {
 		callback(null, count);
 	})
 }
},
function(err, results){
	if (err) {
		return next(err);
	} else {
		return next(null,results)
	}
});
}

var formatResultStatis = (results) => {
	var result= {}
	for(var key in results) {
		if (Array.isArray(results[key])) {
			for(var n in results[key]) {
				result[key] = {}
				result[key][results[key][n]._id]=results[key][n].nums
			}
		}else {
			result[key] = results[key]
		}
	}
	return result
}
