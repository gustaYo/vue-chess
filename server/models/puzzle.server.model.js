exports = module.exports = function(mongoose) {
    Schema = mongoose.Schema;
    var PuzzleSchema = new Schema({
        type:String,
        createby:String,
        feninit:String,
        fenfinish:String,
        nummoves:String,
        created: {
            type: Date,
            default: Date.now
        }
    });
    module.exports = mongoose.model('puzzles', PuzzleSchema);
}