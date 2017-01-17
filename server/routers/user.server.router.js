module.exports = function(app, express, controllers) {
  var user = express.Router();
    user.route('/authenticate')
            .post(controllers.user.authenticate)
    user.route('/test')
            .post(controllers.user.test)            
    user.route('/signin')
            .post(controllers.user.signin)
            .put(controllers.user.UserAccess(false),controllers.user.edit)
    user.route('/:username')
            .get(controllers.user.get)
    app.use('/user', user);
};