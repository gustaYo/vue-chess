module.exports = function(app, express, controllers) {
  var user = express.Router();
    user.route('/authenticate')
            .post(controllers.user.authenticate)

    user.route('/signin')
            .post(controllers.user.signin)
    app.use('/user', user);
};