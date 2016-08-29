exports = module.exports = function(mongoose) {
    Schema = mongoose.Schema;
    var BoardSchema = new Schema({
        wins:String,
        motiv:String,
        u1:String,
        u2:String,
        time: String,
        created: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            default:"public"
        },
        pgn: {
            type: String,
            default:"none"
        },
    });
    module.exports = mongoose.model('boards', BoardSchema);
}