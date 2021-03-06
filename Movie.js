var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Thriller", "Western"];

mongoose.connect(process.env.DB);


//*************
var ActorSchema = new Schema({
    ActorName: { type: String, required: true},
    CharacterName: { type: String, required: true}
});
//**************

// Movie schema
var MovieSchema = new Schema({
    // name: String,
    // username: { type: String, required: true, index: { unique: true }},
    // password: { type: String, required: true, select: false }
    Title: { type: String, required: true},
    Year: { type: String, required: true},
    Genre: { type: String, required: true, enum: GENRES},
    imageUrl: { type: String, required: true},
    // Actors: [
    //     {
    //         ActorName: String,
    //         CharacterName: String
    //     }
    // ]
    Actors: [ActorSchema]
});


MovieSchema.pre('save', function(next) {
    var movie = this;
    next();
});

module.exports = mongoose.model('Movie', MovieSchema);
