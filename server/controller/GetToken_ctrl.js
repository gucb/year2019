const Config_model = require('../model/config');
const config = require('../config/index');
const axios = require('../config/axios');
const log=require('../config/log');
/* 从微信获取accesstoken */
/* ================================================== */
const getWexinToken = async function () {
    await axios.get('/cgi-bin/token?grant_type=client_credential', {
        params: {
            appid: config.appID,
            secret: config.appsecret
        }
    }).then(res => {
        if (res.access_token) {
            TOKEN = res.access_token;
            Config_model.updateOne({'auther': 'bobo'}, {'token':res.access_token, 'uptime': new Date()}, function (err, res) {
                console.log('更新TOkEN成功');
            });
            setTimeout(getWexinToken, 3600 * 1000 * 1.5);
        }else{
          log.error('error:'+res+'url:/cgi-bin/token?grant_type=client_credential')
        }
    })
}
/* 先从数据库查看是否存放token,且判断是否过期 */
/* ================================================== */
module.exports=()=>{
    return new Promise(resolve => {
      Config_model.findOne({'auther': 'bobo'}, function (err, res) {
        if (res.token) {
          let lasttime = new Date(res.uptime);
          let nowtime = new Date();
          if (nowtime.getTime() - 3600 * 1000 * 1.5 > lasttime.getTime()) {
            getWexinToken().then(()=>{
              resolve();
            });
          } else {
            TOKEN = res.token;
            resolve();
          }
        } else {
          getWexinToken().then(()=>{
            resolve();
          });
        }
      })
    })
}

