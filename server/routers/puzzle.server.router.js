module.exports = function(app, express, controllers) {
	var puzzle = express.Router();
	puzzle.route('/')
	.post(controllers.puzzle.add)

	puzzle.route('/get')
	.post(controllers.puzzle.get)

	puzzle.route('/del/:parms')
	.delete(controllers.puzzle.deletePuzzle);
	app.use('/puzzle', puzzle);            
};