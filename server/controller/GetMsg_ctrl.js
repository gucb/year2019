const getRawBody = require('raw-body')
const util = require('../config/util')
const User_model = require('../model/user');
const Config_model = require('../model/config');
const logger = require('../config/log');
const LickAct=require('./LickAct');
const axios = require('../config/axios');
/* 根据当前微信用户状态，回复不同的语句 */
/* ================================================== */
const sentMsg = (name, type) => {//type=1表示已经签到过，0表示未签订。2表示未查询到，3表示自己的姓名被其他人签到
  let screen_url = 'http://weixin.253.com/wx_login';
  if (type == 0) {
    return `/:rose${name}/:rose，恭喜您签到成功! 您的姓名和微信号将参与创蓝年会抽奖[發]。还可以参加屏幕互动：<a href="${screen_url}">点击这里互动</a>`;
  } else if (type == 1) {
    return `/:rose${name}/:rose，您已经使用该微信号签到过，如有问题可联系负责人（黄春霞：<a href="tel:17855869957">17855869957</a>）。`;
  } else if (type == 2) {
    return `您好/:rose${name}/:rose，很抱歉！/::~/::~嘉宾名单没有查询到您的姓名。如需添加请联系（黄春霞：<a href="tel:17855869957">17855869957</a>）`;
  } else if (type == 3) {
    return `您好/:rose${name}/:rose，很抱歉！/::~/::~您的姓名被其他人签到。请确保自己的姓名是否正确，如有问题可联系（黄春霞：<a href="tel:17855869957">17855869957</a>）`;
  }else if (type == 4) {
    return `/:rose${name}/:rose，签到系统关闭中！`
  }
}
/* 如果用户准备签到，把用户信息和头像保存到数据表里 */
/* ================================================== */
const saveUserInfo=async (user_name,openID,id)=>{
  axios.get(`/cgi-bin/user/info`,{
    params:{
      access_token:TOKEN,
      openid:openID,
      lang:'zh_CN'
    }
  }).then(res=>{
    User_model.updateOne({_id:id}, {
      sign: true,
      openId: openID,
      img:res.headimgurl,
      settime: new Date()
    }, (err, res) => {
      if (err) {
        logger.error(err);
        return false;
      }
    });
  })

}

/* 根据微信唯一ID判断是否该微信是否已经签到过 */
/* ================================================== */
const hasSign = async (user_name, openID) => {
  return User_model.findOne({openId: openID}, (err, res) => {
    if (err) {
      logger.error(err);
      return false;
    }
    return res;
  })
}

/* 先判断填写的姓名是否在号码池中 */
/* ================================================== */
const inAllusers = async (user_name, openID) => {
  return User_model.find({name: user_name}, async (err, res) => {
    if (err) {
      logger.error(err);
      return false;
    }
    return res;
  })
}

//获得微信发送过来的微信
module.exports = async (ctx) => {
  let xml = await getRawBody(ctx.req, {
    length: ctx.request.length,
    limit: '1mb',
    encoding: ctx.request.charset || 'utf-8'
  });
  // 将xml数据转化为json格式的数据
  let result = await util.parseXML(xml);
  // 格式化数据
  let formatted = await util.formatMessage(result.xml);
  let openID = formatted.FromUserName;
  if (formatted.MsgType == 'text') {
    if (/^(创蓝|签到人|嘉宾)[\:\s\+：\=]*.+/.test(formatted.Content)) {//如果以创蓝人开头的就表示参加年会的人员准备前端
      let msg = formatted.Content;
      const reg = /^(创蓝|签到人|嘉宾)[\:\s\+：\=]*/ig;
      let user_name = msg.replace(reg, '');
      user_name = user_name.replace(/\s/ig, '');
      let openSign=await Config_model.findOne({auther:'bobo'});
      if(!openSign.opensign){
        formatted.Content = sentMsg(user_name, 4);
        ctx.body = util.answer(formatted);
        return false;
      }
      let issign = await hasSign(user_name, openID);
      if (issign) {//如果有记录签到过
        formatted.Content = sentMsg(user_name, 1);
        ctx.body = util.answer(formatted);
      } else {//如果没有记录签到过，先判断是否存在要邀请池中
        let isin = await inAllusers(user_name, openID);
        if (isin.length == 0) {//如果再号码池中没有找到对应的姓名
          formatted.Content = sentMsg(user_name, 2);
          ctx.body = util.answer(formatted)
        } else {
          let hassing = true;//判断虽然找到匹配签名但匹配姓名被其他人签到
          for (let i = 0; i < isin.length; i++) {
            if (!isin[i].sign) {//如果查找到一个未签到的匹配姓名，就让他签到
              hassing = false;
              formatted.Content = sentMsg(user_name, 0);
              ctx.body = util.answer(formatted);
              saveUserInfo(user_name,openID,isin[i]._id);//保存用户信息
              break;
            }
          }
          if (hassing) {//如果找到的姓名都被签到过，那就提示
            formatted.Content = sentMsg(user_name, 3);
            ctx.body = util.answer(formatted);
          }
        }
      }
    }else if(/^((1[0-2]|[1-9])[,，\.]){1,2}(1[0-2]|[1-9])[,，\.]*$/.test(formatted.Content)){//如果满足投票的规则统计
      let openact=await Config_model.findOne({auther:'bobo'});
      if(!openact.openact){
        formatted.Content='投票系统已关闭！';
        ctx.body = util.answer(formatted);
      }else{
        const msg=await LickAct.saveTp(formatted.Content,openID);//保存用户存放的信息
        formatted.Content=msg;
        ctx.body = util.answer(formatted);
      }
    }else if(/^(节目互动|互动|互动屏)$/.test(formatted.Content)){
        formatted.Content=`节目互动地址：<a href="http://weixin.253.com/wx_login">点击这里互动</a>；公众号回复“创蓝+姓名”完成签到可参与抽奖哦。`;
        ctx.body = util.answer(formatted);
    }else {
      formatted.Content='客服正在接通中，请稍后……';
      ctx.body = util.answer(formatted);
    }
  } else {
    formatted.Content='客服正在接通中，请稍后……';
      ctx.body = util.answer(formatted);
  }
}
