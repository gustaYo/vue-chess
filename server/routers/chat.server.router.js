module.exports = function(app, express, controllers) {
  var chat = express.Router();
    chat.route('/upload')
            .post(controllers.chat.uploadFile)
            .put(controllers.chat.deleteImage)
    app.use('/chat', chat);
};