const Router = require('koa-router')();
const Ctrl = require('../controller');
const fs = require('fs');
const isLogin = (page, ctx) => {
  if (!ctx.session.loginuser || ctx.session.loginuser != 'admin') {
    ctx.response.redirect('/login');
  } else {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream(`./${page}.html`);
  }
}
Router.get('/', ctx => {
  isLogin('index', ctx);
});

Router.get('/act', ctx => {
  isLogin('act', ctx);
});

Router.get('/actlist', ctx => {
  isLogin('actlist', ctx);
});

Router.get('/ctrl', ctx => {
  isLogin('ctrl', ctx);
});

Router.get('/lucky', ctx => {
  isLogin('lucky', ctx);
});

Router.get('/hd', ctx => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream(`./hd.html`);
});

Router.get('/hd_m', ctx => {
  if (!ctx.session.name) {//如果会话为空就跳转到微信授权接口
    ctx.response.redirect('/wx_login');
  } else {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream(`./hd_m.html`);
  }
});
Router.get('/login', ctx => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream(`./login.html`);
});


Router.get('/weixin', Ctrl.WeiXin);
Router.post('/weixin', Ctrl.GetMsg);
Router.post('/api/getuser', Ctrl.User.getUserList);
Router.post('/api/edituser', Ctrl.User.editUser);
Router.post('/api/adduser', Ctrl.User.addUser);
Router.get('/api/delectuser', Ctrl.User.delectUser);
Router.get('/api/resetuser', Ctrl.User.resetUser);
Router.get('/api/getSign', Ctrl.OpenSign.getSign);
Router.get('/api/setSign', Ctrl.OpenSign.setSign);
Router.get('/api/deletall_user', Ctrl.User.delectallUser);
Router.get('/api/pooluser', Ctrl.User.getPool);
Router.get('/api/restlucky', Ctrl.User.resetLucky);
Router.get('/api/importall', Ctrl.ImportUser);
Router.get('/api/sendactnotice', Ctrl.LickAct.sendNotice);
Router.post('/api/luckyuser', Ctrl.User.setLucky);
Router.post('/api/actresult', Ctrl.LickAct.getActResult);
Router.get('/api/actlist', Ctrl.LickAct.getList);
Router.get('/api/caidan', Ctrl.LickAct.CaiDan);
Router.get('/wx_login', Ctrl.WebWx.getCode);
Router.get('/api/get_wx_access_token', Ctrl.WebWx.getToken);
Router.post('/api/login', Ctrl.User.Login);
// Router.use('/api',Router.routes());
module.exports = Router;
