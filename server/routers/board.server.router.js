module.exports = function(app, express, controllers) {
	var board = express.Router();
	board.route('/filter')
	.post(controllers.board.filterViews)

	board.route('/stats')
	 .get(controllers.board.stats)

	app.use('/board', board);            
};