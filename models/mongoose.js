var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/demo');
module.exports = mongoose;