const config = require('../config');
const axios = require('../config/axios');
const User_model = require('../model/user');
const getCode = (ctx) => {
  ctx.status = 301;
  let return_url = encodeURIComponent('http://weixin.253.com/api/get_wx_access_token');
  if (ctx.session.name) { //如果已经授权并保存了session会话
    ctx.response.redirect(encodeURI(`/hd_m?user_name=${ctx.session.name}&user_img=${ctx.session.img}`));
  } else {
    let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appID}&redirect_uri=${return_url}&response_type=code&scope=snsapi_userinfo&state=253#wechat_redirect`;
    ctx.response.redirect(url);
  }
}
const getToken = async (ctx) => {
  // 第二步：通过code换取网页授权access_token
  const data = await axios.get('/sns/oauth2/access_token', {
    params: {
      appid: config.appID,
      secret: config.appsecret,
      grant_type: 'authorization_code',
      code: ctx.query.code
    }
  });
  if (data.access_token) { //如果获取到token和openID
    let sqluser = await User_model.findOne({ openId: data.openid });
    if (sqluser) { //如果存在签到的姓名，直接用数据库里的数据
      ctx.session.name = sqluser.name;
      ctx.session.img = sqluser.img;
      ctx.response.redirect(encodeURI(`/hd_m?user_name=${sqluser.name}&user_img=${sqluser.img}`));
    } else { //否的从微信拉取
      let userinfo = await axios.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${data.access_token}&openid=${data.openid}&lang=zh_CN`);
      ctx.session.name = userinfo.nickname;
      ctx.session.img = userinfo.headimgurl;
      ctx.response.redirect(encodeURI(`/hd_m?user_name=${userinfo.nickname}&user_img=${userinfo.headimgurl}`));
    }
  } else { //如果code失败跳到微信登录页继续获取权限
    ctx.response.redirect('/wx_login');
  }
}
module.exports = {
  getCode,
  getToken
}
