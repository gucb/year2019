const mongoose = require('../config/db.js');
const mongoosePaginate =require('mongoose-paginate');
const Schema = new mongoose.Schema({
  name: {type: String},//用户姓名
  level:{type: Number,default: 10},//获得的奖项，10表示未获奖，1表示一等奖，2表示二等奖，3表示三等奖
  sign:{type:Boolean,default:false},//是否已经签到
  settime: {type: Date,default:''},//签到时间
  tel: {type: String,default:''},//用户手机号码
  img: {type: String,default:''},//用户头像
  depart:{type: String,default:''},//depart部门不能为空
  openId:{type: String,default:''},//微信唯一标识
  act:{type: String,default:''}//节目投票内容
});
Schema.plugin(mongoosePaginate);
const Users=mongoose.model('users', Schema);
module.exports=Users;
