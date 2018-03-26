var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Review schema
var ReviewSchema = new Schema({
    Movie: { type: String, required: true },
    Reviewer: { type: String, required: true },
    Review: { type: String, required: true },
    Rating: { type: Number, min: 1, max: 5, required: true }
});


ReviewSchema.pre('save', function(next) {
    var review = this;
    next();
});

module.exports = mongoose.model('Review', ReviewSchema);
