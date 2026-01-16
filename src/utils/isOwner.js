const config = require("../config/config.js");

module.exports = function isOwner(userId) {
    return userId === config.ownerIDS;
}