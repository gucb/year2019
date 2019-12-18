const User_model = require('../model/user');
const logger = require('../config/log');
const axios = require('../config/axios');
/* 获得数据列表 */
/* ================================================== */
const getUserList = async (ctx) => {
  let params = ctx.request.body;
  let or = {};
  let count = await User_model.countDocuments();//总数量
  let sign_count = await User_model.countDocuments({sign: true});//签到的总塑料
  let nosign_count = await User_model.countDocuments({sign: false});//签到的总塑料
  if (params.signtype == "1") {//如果查看已签到
    or.sign = true;
  } else if (params.signtype == "2") {
    or.sign = false;
  }
  if (params.level !== '') {
    or.level = parseInt(params.level);
  }
  if (params.name != '') {
    let reg = new RegExp(params.name, 'i') //不区分大小写
    or.name = {$regex: reg}
  }
  let obj = await User_model.paginate(or, {
    sort: {_id: -1},
    page: parseInt(params.page),
    limit: 20
  }, (err, res) => {
    if (err) {
      logger.error(err);
      return false;
    }
    return res;
  });
  if (obj) {
    ctx.response.body = {
      status: "success",
      list: obj.docs,
      total: obj.total,
      page: obj.page,
      pages: obj.pages,
      limit: obj.limit,
      count: count,
      sign_count: sign_count,
      nosign_count: nosign_count
    }
  } else {
    ctx.response.body = {
      status: "error",
      msg: '数据请求失败'
    }
  }
}
/* 编辑用户姓名,手机号码和签到状态 */
/* ================================================== */
const editUser = async (ctx) => {
  let params = ctx.request.body;
  let formData = params.sign == 1 ? {
    name: params.name,
    tel: params.tel,
    depart: params.depart,
    sign: false,
    openId: '',
    img: ''
  } : {
    name: params.name,
    tel: params.tel,
    depart: params.depart
  };
  let status = await User_model.updateOne({_id: params.id}, formData, (err, res) => {
    if (err) {
      logger.error(err);
      return false;
    }
    if (res) {
      return res;
    }
  });
  if (status) {
    ctx.response.body = {
      status: "success",
      msg: "修改成功"
    }
  } else {
    ctx.response.body = {
      status: "error",
      msg: "修改失败"
    }
  }
}
/* 添加新的人员 */
/* ================================================== */
const addUser = async (ctx) => {
  let params = ctx.request.body;
  let user = await new Promise((resolve, reject) => {
    User_model.create([{name: params.name, tel: params.tel, depart: params.depart,}], (err, res) => {
      if (err) {
        logger.error(err);
        reject(err)
      }
      if (res) {
        resolve(res);
      }
    })
  });
  if (user) {
    ctx.response.body = {
      status: "success",
      msg: "添加成功"
    }
  }
}

/* 删除人员 */
/* ================================================== */
const delectUser = async (ctx) => {
  let params = ctx.query;
  let status = await new Promise((resolve, reject) => {
    User_model.deleteOne({_id: params.id}, (err, res) => {
      if (err) {
        logger.error(err);
        reject(err)
      }
      if (res) {
        resolve(res);
      }
    })
  })
  if (status) {
    ctx.response.body = {
      status: "success",
      msg: "删除成功"
    }
  }
}

/* 删除所有人员 */
/* ================================================== */
const delectallUser = async (ctx) => {
  let delect = await User_model.deleteMany();
  if (delect.ok) {
    ctx.response.body = {
      status: "success",
      msg: "清空成功！"
    }
  }
}

/* 重置人员 */
/* ================================================== */
const resetUser = async (ctx) => {
  let status = await User_model.updateMany({}, {sign: false, openId: '', level: 10, act:'', img:''});
  if (status) {
    ctx.response.body = {
      status: "success",
      msg: "重置成功"
    }
  } else {
    ctx.response.body = {
      status: "error",
      msg: "重置失败"
    }
  }
}

/* 获取签到并未中奖名单放入抽奖池 */
/* ================================================== */
const getPool = async (ctx) => {
  // let list = await User_model.find({level:10});//调试
  let list = await User_model.find({level:10,sign:true});//正式
  if (list) {
    ctx.body = {
      status: "success",
      list: list
    }
  } else {
    ctx.body = {
      status: "error",
      list: list
    }
  }
}

/* 保存中奖信息 */
/* ================================================== */
const setLucky = async (ctx) => {
  const params = ctx.request.body;
  let _ids = [];
  for (let i = 0; i < params.luckyers.length; i++) {
    _ids.push(params.luckyers[i]._id)
  }
  let saveLucky = await User_model.updateMany({_id: {$in: _ids}}, {$set: {level: parseInt(params.level)}});
  if (saveLucky) {
    ctx.response.body = {
      status: "success"
    }
    //给中奖人发送通知
    let levelmsg = '';
    let levelproduct = '';
    if (params.level == 0) {
      levelmsg = '幸运奖';
      levelproduct = '华为Mate20X'
    } else if (params.level == 1) {
      levelmsg = '一等奖';
      levelproduct = '华为Mate20pro'
    } else if (params.level == 2) {
      levelmsg = '二等奖';
      levelproduct = '华为荣耀8X max'
    } else if (params.level == 2) {
      levelmsg = '三等奖';
      levelproduct = '凌美商务套装钢笔'
    }

    for (let i = 0; i < params.luckyers.length; i++) {
      axios.post(`/cgi-bin/message/template/send?access_token=${TOKEN}`, {
        "touser": params.luckyers[i].openId,
        "template_id": "fOdE31xTXIPlwNBQWFQmGDJ8He1uMX5NBf7BrR0sd1g",
        "data": {
          first: {
            value: `${params.luckyers[i].name},恭喜你获得${levelmsg}!`,
            color: '#237bff'
          },
          keyword1: {
            value: '创蓝253年会幸运抽奖'
          },
          keyword2: {
            value: `${levelmsg}（${levelproduct}）`
          },
          remark: {
            value: '请尽快到舞台上领取奖品',
            color: '#9a9a9a'
          }

        }
      }).then(res => {
        logger.error(res)
      })
    }
  }else{
    ctx.response.body = {
      status: "error"
    }
  }
}

/* 重置抽奖数据 */
/* ================================================== */
const resetLucky = async (ctx) => {
  let status = await User_model.updateMany({}, {level: 10,act: ''});
  if (status) {
    ctx.response.body = {
      status: "success",
      msg: "重置成功"
    }
  } else {
    ctx.response.body = {
      status: "error",
      msg: "重置失败"
    }
  }
}

/* 用户权限登录登录 */
/* ================================================== */
const Login = async (ctx) => {
  if(ctx.request.body.name!='admin'||ctx.request.body.passwd!='admin@253.com'){
    ctx.response.body={
      status:'error',
      msg:'用户名或者密码不对'
    }
  }else{
    ctx.session.loginuser=ctx.request.body.name;
    ctx.response.body={
      status:'success',
      msg:'登录成功！'
    }
  }
}

module.exports = {
  getUserList,
  editUser,
  addUser,
  delectUser,
  resetUser,
  delectallUser,
  getPool,
  setLucky,
  resetLucky,
  Login
}
