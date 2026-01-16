const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
  },
  genres: [{ type: String }],
});

const transformacion = {
  transform: (doc, retObj) => {
    retObj.id = retObj._id.toString();
    retObj.author = retObj.author.toString();
    delete retObj._id;
    delete retObj.__v;
    return retObj;
  }
}

schema.set('toJSON', transformacion);
schema.set('toObject', transformacion);

module.exports = mongoose.model("Book", schema);