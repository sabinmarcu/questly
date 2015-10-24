_ = require "lodash"
module.exports = (state = require("./initialState"), action) -> _.clone(state)
