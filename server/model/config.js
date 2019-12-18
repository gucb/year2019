const mongoose = require('../config/db.js');
const Schema = new mongoose.Schema({
  token: {type: String},//微信得到的accesToken
  auther:{type: String,default: 'bobo'},
  uptime: {type: Date},//签名更新时间
  isstart: {type: Boolean, default: true},//活动是否开始
  opensign:{type: Boolean, default: true},//开发签到系统
  openact:{type: Boolean, default: true}//开启投票系统
});
module.exports=mongoose.model('config', Schema);
