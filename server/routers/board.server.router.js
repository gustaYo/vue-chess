module.exports = function(app, express, controllers) {
	var board = express.Router();
	board.route('/filter')
	.post(controllers.board.filterViews)

	app.use('/board', board);            
};