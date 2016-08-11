// grab the things we need
var mongoose = require('./mongoose.js');
var Schema = mongoose.Schema;

// create a schema
var deviceSchema = new Schema({
  macAddr: { type: String},
  data: { type: String},
  temperature1:{type: Number},
  temperature2:{type: Number},
  humidity1:{type: Number},
  humidity2:{type: Number},
  voltage:{type: Number},
  recv_at: { type: Date},
  created_at: { type: Date},
  time: { type: Schema.Types.Mixed},
});

// the schema is useless so far
// we need to create a model using it
var Device = mongoose.model('Device', deviceSchema);

// make this available to our users in our Node applications
module.exports = Device;
