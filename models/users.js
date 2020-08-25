var mongoose = require('mongoose');

//用户模型
var UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now() }
});

var UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;