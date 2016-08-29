module.exports = function(app, express, controllers) {
  var chat = express.Router();
    chat.route('/upload')
            .post(controllers.chat.uploadFile)
    app.use('/chat', chat);
};