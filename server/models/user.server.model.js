

var uniqueValidator = require('mongoose-unique-validator');
exports = module.exports = function(mongoose) {
    Schema = mongoose.Schema;
    var UserSchema = new Schema({
        email: {
            type: String,
            match: [/.+\@.+\..+/, "Please fill a valid email address"],
            unique: true,
        },
        name: String,
        fistlastname: String,
        secondlastname: String,
        username: {
            type: String,
            unique: true,
            required: 'Username is required',
            trim: true
        },
        password: String,
        created: {
            type: Date,
            default: Date.now
        },
        role: String,
        convAbiertas: {
            type: Array,
        },
    });
    UserSchema.plugin(uniqueValidator,{ message: 'error_unique_{PATH}' });
    module.exports = mongoose.model('users', UserSchema);
}