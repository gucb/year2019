const mongoose = require('../config/db.js');
const Schema = new mongoose.Schema({
  name: {type: String, default: ''},//节目名称
  depart: {type: String, default: '10'},//获得的奖项，10表示未获奖，1表示一等奖，2表示二等奖，3表示三等奖
  order: {type: Number, default: 0},//节目序号
  leader: {type: String, default: ''},//负责人
  numb: {type: Number, default: 0},//投票数
});
const Acts = mongoose.model('acts', Schema);
module.exports = Acts;
