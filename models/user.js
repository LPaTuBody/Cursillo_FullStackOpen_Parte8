const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: {
    type: "String",
    required: true,
    unique: true,
    minlength: 5,
  },
  favGenre: {
    type: "String",
    required: true,
  },
});

const transformacion = {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
}

schema.set('toJSON', transformacion);
schema.set('toObject', transformacion);

module.exports = mongoose.model("User", schema);