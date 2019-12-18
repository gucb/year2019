const Koa = require('koa');
const app = new Koa();
const Koabody = require('koa-body')();
const Router = require('./server/router');
const Compose = require('koa-compose');
const path = require('path')
const static = require('koa-static');
const getToken = require('./server/controller/GetToken_ctrl');
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);
const session = require('koa-session');
global.TOKEN = null;
app.keys = ['some secret hurr'];   /*cookie的签名*/
const CONFIG = {
  key: 'koa:sess',
  maxAge: 1000*60*60*24,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: true, //在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false） 【需要修改】 */
  renew: false, //(boolean) renew session when session is nearly expired      【需要修改】*/
};


app.use(Compose([session(CONFIG, app),Koabody, Router.routes(), static(path.join(__dirname, './static'))]));

/* 获得Access_Token后开始启动服务 */
/* ================================================== */
getToken().then(() => {
  server.listen(3000, function () {
    let address = server.address().address;
    let port = server.address().port;
    console.log('后台服务启动：%s:%s', address, port);
  });
});

/* 互动屏事件监听 */
io.on('connection', (socket) => {
  // 群聊
  socket.on('sendGroupMsg', function (data) {
    socket.broadcast.emit('receiveGroupMsg', data);
  });
  // 上线
  socket.on('online', name => {
    socket.broadcast.emit('online', name)
  });

})

