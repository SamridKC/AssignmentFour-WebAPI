var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Thriller", "Western"];

mongoose.connect(process.env.DB);

// Movie schema
var MovieSchema = new Schema({
    // name: String,
    // username: { type: String, required: true, index: { unique: true }},
    // password: { type: String, required: true, select: false }
    Title: { type: String, required: true},
    Year: { type: String, required: true},
    Genre: { type: String, required: true, enum: GENRES},
    Actors: [
        {
            ActorName: String,
            CharacterName: String
        }
    ]

});


MovieSchema.pre('save', function(next) {
    var movie = this;
    next();
});

module.exports = mongoose.model('Movie', MovieSchema);
