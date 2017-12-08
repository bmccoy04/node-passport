var _users = require('./user-list');

var get = function(){
    return _users.data;
}

module.exports = {
    get:  get
};