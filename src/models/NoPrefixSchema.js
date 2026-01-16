const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  key: { type: String, required: true },   // Unique Premium Key
  userId: { type: String, default: null },  // User redeems → yaha save
  expireAt: { type: Number, default: null },// Expiry time
  permanent: { type: Boolean, default: false } // Lifetime support
});

module.exports = mongoose.model("NoPrefix", schema);