const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  born: {
    type: Number,
  },
});

const transformacion = {
  transform: (doc, retObj) => {
    retObj.id = retObj._id.toString();
    delete retObj._id;
    delete retObj.__v;
    return retObj;
  }
}

schema.set('toJSON', transformacion);
schema.set('toObject', transformacion);

module.exports = mongoose.model("Author", schema);