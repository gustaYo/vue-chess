var mongoose = require('mongoose'); 
var async = require('async');
var Puzzle = mongoose.model('puzzles');
var userController= require('./user.server.controller');

exports.add = (req, res) => {
	if (req.body.mode === 'add') {
		var newPuzzle= new Puzzle(req.body);
		newPuzzle.save(function(err, board) {
			if(err){
				return res.send(500, err.message);       
			}
			res.status(200).send(board)
		});
	} else {
		Puzzle.update(
			{_id: req.body.mode},
			{$set: req.body
			}, function(err) {
				if (err)
					return res.send(500, err.message);
				else
					res.status(200).send(req.body)
			});
	}
}
exports.get = (req, res) => {
	Puzzle.find(req.body)
	.sort({created: 1})
	.exec(function(err, puzzles) {
		res.status(200).send(puzzles)
	})
}

exports.resolve = (req, res) => {
	Puzzle.update(
		{_id: req.body._id},
		{$inc: {
			corrects: req.body.resolve,
			intents: 1
		}
	}, function(err) {
		if (err)
			console.log(err)
		res.status(200).send('ok')		
	});
}

exports.count = (req, res) => {
	async.parallel({
		MateIn1: function(callback) {
			Puzzle.count({
				type: 'MateIn1',
			}, function(err, count) {
				callback(null, count);
			})
		},
		MateIn2: function(callback) {
			Puzzle.count({
				type: 'MateIn2',
			}, function(err, count) {
				callback(null, count);
			})
		},
		MateIn3: function(callback) {
			Puzzle.count({
				type: 'MateIn3',
			}, function(err, count) {
				callback(null, count);
			})
		},		
		FindFork: function(callback) {
			Puzzle.count({
				type: 'FindFork',
			}, function(err, count) {
				callback(null, count);
			})
		},
		TakePiece: function(callback) {
			Puzzle.count({
				type: 'TakePiece',
			}, function(err, count) {
				callback(null, count);
			})
		}		
	},
	function(e,data){
		if (e){
			return res.send(500, e); 
		}
		return res.status(200).send(data)
	});
}


exports.deletePuzzle = (req, res) => {
	// validar si usuario es propietario en realidad del puzzle
	userController.getToken(req,function(err, token){
		if (err){
			return res.status(403).send(err)
		}
		var idPuzzle = req.params.parms
		Puzzle.remove({_id: idPuzzle}, function(error) {
			if (error) {
				return res.send(500, error.message);
			} else {
				res.status(200).send('ok')
			}
		});			
	})
}

var InitPuzzles = () => {
	setTimeout(function() {
		Puzzle.count({}, function(err, count) {
			if (count === 0) {
				for (var i in puzzlesInitDefault) {
					var newPuzzle = new Puzzle(puzzlesInitDefault[i]);
					newPuzzle.save(function(err, puzzle) {
						// console.log(puzzle)
					});
				}
			} else {
				// console.log('ya hay puzzles por defecto')
			}
		})
	}, 3000);
}
InitPuzzles()

var puzzlesInitDefault = [
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "4Q2N/4q2k/2b4r/2pPBP2/2P3p1/5n2/1K4p1/7R",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "3K4/8/8/p1P1rn2/2kP1p2/3p1B2/1Q6/N4R2",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "8/5rBp/8/1N3Bpp/P7/2R1P1q1/k3n1P1/b6K",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "4NQ2/2Pnp2k/K5r1/3q3B/2P1p3/3b4/8/6R1",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "4Q1Br/1N1P2k1/2n2qp1/3pB1b1/2PP2p1/7R/8/4K3",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "1K6/8/2p5/6PQ/q2b1nN1/6Pr/4pPk1/1B5R",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "7R/8/8/8/6pq/7k/4Np1r/5KbQ",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "N5Q1/nkPP4/8/8/4K3/8/8/8",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "2R5/8/3k4/3N2p1/4K1Q1/8/8/8",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "5R2/6kn/2p4R/2Q5/7K/8/8/8",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "nN5K/8/8/1Npk4/5Q2/8/8/8",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "FindFork",
	"createby" : "ibis",
	"feninit" : "2r5/8/8/8/8/P6k/8/KB6",
	"fenfinish" : "2r5/8/8/5B2/8/P6k/8/K7",
	"nummoves" : "1"
},
{
	"type" : "FindFork",
	"createby" : "ibis",
	"feninit" : "r2k4/8/8/8/1b1N4/8/8/1K3R2",
	"fenfinish" : "r2k4/8/2N5/8/1b6/8/8/1K3R2",
	"nummoves" : "1"
},
{
	"type" : "FindFork",
	"createby" : "ibis",
	"feninit" : "r4k2/8/8/8/4n3/nB2B3/7K/8",
	"fenfinish" : "r4k2/8/8/3B4/4n3/n3B3/7K/8",
	"nummoves" : "1"
},
{
	"type" : "FindFork",
	"createby" : "ibis",
	"feninit" : "R7/4p3/2Nn4/3r4/8/b7/k5PP/5B1K",
	"fenfinish" : "R7/4p3/3n4/3r4/1N6/b7/k5PP/5B1K",
	"nummoves" : "1"
},
{
	"type" : "FindFork",
	"createby" : "ibis",
	"feninit" : "2k4r/8/8/3b4/8/8/8/R2KQ3",
	"fenfinish" : "2k4r/8/8/3b4/8/2Q5/8/R2K4",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "k7/2b5/8/3p4/7b/5pB1/5q1r/K7",
	"fenfinish" : "k7/2B5/8/3p4/7b/5p2/5q1r/K7",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "k3r3/5q2/3Nb3/8/2n1r3/8/8/K7",
	"fenfinish" : "k3r3/5q2/4b3/8/2n1N3/8/8/K7",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "r1bqk2r/pp1n2p1/2p1p2p/3p4/3P4/B1PB1N2/P1P2PPP/R2Q2K1",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "r2q1b1r/pppb2pp/2np1n2/3N1p2/4k3/5N2/PPP2PPP/R1B1K2R",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "kr6/1p4pp/8/8/3n4/6P1/KP4BP/R7",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "1kr5/p1p5/p7/6q1/8/1B6/6PP/1R4K1",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "6rk/6pp/8/6N1/8/8/8/7K",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "r1bqkb1r/pp1pnppp/2p5/5N2/8/8/PPP1QPPP/R1B1KB1R",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "1r5k/6pp/7N/8/2Q5/8/8/6K1",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "5rk1/5ppp/8/8/2B4q/6bP/5QP1/4R1K1",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "q4nk1/6pp/8/8/2R5/8/1B6/1K4R1",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "2r3k1/5pb1/5B2/8/8/7R/r7/6KR",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "r1bqk2r/pp1n2p1/2p1p2p/3p4/3P4/B1PB1N2/P1P2PPP/R2Q2K1",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "8/qQ5p/3pN2K/3pp1R1/4k3/7N/1b1PP3/8",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "R1Nk2b1/8/2Q3p1/2P1P3/P3p3/KPB3pq/8/5n2",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "1K6/8/2p5/6PQ/q2b1nN1/6Pr/4pPk1/1B5R",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "1nkbB3/2p2P2/7Q/6P1/p1N3q1/2R2rP1/2p5/4K3",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "5K2/8/bpP1N2p/1k1P4/2NR2P1/r1Bp4/6q1/1n6",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "3BQ3/k4bnp/2R5/1pN2q2/2rP4/6pP/6P1/6K1",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "7K/Q7/4B3/4k3/5N2/4Bn2/8/8",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "8/8/8/1n1Q4/8/8/1PN4K/nkBR4",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "8/8/8/8/1p6/2p4Q/2k5/R3K3",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "8/8/8/8/3Q4/8/p1N1p1p1/r1k1rbK1",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn2",
	"createby" : "ibis",
	"feninit" : "8/6K1/1p1B1RB1/8/2Q5/2n1kP1N/3b4/4n3",
	"fenfinish" : "",
	"nummoves" : "2"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "8/q1p5/3b4/pP3Qn1/3k4/NP2r3/7P/1N1K4",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "r2q1b1r/pppb2pp/2np1n2/3N1p2/4k3/5N2/PPP2PPP/R1B1K2R",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "MateIn1",
	"createby" : "ibis",
	"feninit" : "kr6/1p4pp/8/8/3n4/6P1/KP4BP/R7",
	"fenfinish" : "",
	"nummoves" : "1"
},
{
	"type" : "FindFork",
	"createby" : "ibis",
	"feninit" : "4r1k1/6pp/8/8/4N3/8/1P6/1K4R1",
	"fenfinish" : "4r1k1/6pp/5N2/8/8/8/1P6/1K4R1",
	"nummoves" : "1"
},
{
	"type" : "FindFork",
	"createby" : "ibis",
	"feninit" : "R4q1k/6p1/7p/2b4N/8/2B5/1PP2r2/1K5R",
	"fenfinish" : "R4q1k/6B1/7p/2b4N/8/8/1PP2r2/1K5R",
	"nummoves" : "1"
},
{
	"type" : "FindFork",
	"createby" : "ibis",
	"feninit" : "5r1k/6p1/2b4p/8/8/2B5/1PP5/1K5R",
	"fenfinish" : "5r1k/6p1/2b4R/8/8/2B5/1PP5/1K6",
	"nummoves" : "1"
},
{
	"type" : "FindFork",
	"createby" : "ibis",
	"feninit" : "r3k3/5p2/5n2/8/3n4/8/P7/2Q4K",
	"fenfinish" : "r3k3/5p2/5n2/8/3n1Q2/8/P7/7K",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "8/8/3b4/8/p2R1n2/3q4/8/K6k",
	"fenfinish" : "8/8/3b4/8/R4n2/3q4/8/K6k",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "8/1b6/q7/2N5/4r3/1r1n4/8/k6K",
	"fenfinish" : "8/1b6/q7/8/4r3/1N1n4/8/k6K",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "6q1/1b6/8/3B4/8/1n6/6r1/1K1k4",
	"fenfinish" : "6q1/1B6/8/8/8/1n6/6r1/1K1k4",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "2r4k/8/r7/3b4/1N6/6K1/2q5/5b2",
	"fenfinish" : "2r4k/8/r7/3N4/8/6K1/2q5/5b2",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "5r2/8/8/2Q3b1/8/8/5q2/k1n4K",
	"fenfinish" : "5r2/8/8/6Q1/8/8/5q2/k1n4K",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "5r2/1r3R1n/8/8/8/3b4/5q2/K6k",
	"fenfinish" : "5r2/1R5n/8/8/8/3b4/5q2/K6k",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "3q4/1r3b2/8/r2Q2n1/8/8/3r4/k6K",
	"fenfinish" : "3q4/1Q3b2/8/r5n1/8/8/3r4/k6K",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "k7/2b5/8/3p4/7b/5pB1/5q1r/K7",
	"fenfinish" : "k7/2B5/8/3p4/7b/5p2/5q1r/K7",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "k3r3/5q2/3Nb3/8/2n1r3/8/8/K7",
	"fenfinish" : "k3r3/5q2/4b3/8/2n1N3/8/8/K7",
	"nummoves" : "1"
},
{
	"type" : "TakePiece",
	"createby" : "ibis",
	"feninit" : "2b5/7n/8/5B2/8/7r/8/Kb3q1k",
	"fenfinish" : "2B5/7n/8/8/8/7r/8/Kb3q1k",
	"nummoves" : "1"
}

]