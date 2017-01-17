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
        },
        corrects: {
            type: Number,
            default: 0
        },
        intents: {
            type: Number,
            default: 0
        }        
    });
    module.exports = mongoose.model('puzzles', PuzzleSchema);
}