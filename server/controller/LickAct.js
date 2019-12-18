const User_model = require('../model/user');
const Acts = require('../model/act');
const Config_model = require('../model/config');
const logger = require('../config/log');
const axios = require('../config/axios');
let Act_count=[0];//每个节目的投票总计，先不保存数据库，临时存放变量；
for(let i=0; i<13; i++){
  Act_count[i]=0;
}
/* 发送节目投票通知 */
/* ================================================== */
const sendNotice=async (ctx)=>{
    let signUser=await User_model.find({'sign':true},'openId name');
    // let signUser=await User_model.find({'name':'顾长波'},'openId name');
    let actlist=await Acts.find({}).sort({order:1});
    let openact=await Config_model.updateOne({'auther':'bobo'},{openact:true});
    if(openact){
      ctx.response.body={
        status: 'success'
      }
    }
    let msg1='';
    for(let i=0; i<actlist.length; i++){
      Act_count[i]=0;
      if(i%2==1){
        msg1+=`${actlist[i].order}、${actlist[i].name}\n`
      }else{
        msg1+=`${actlist[i].order}、${actlist[i].name}    `
      }
    }
    if(signUser){
      for (let i = 0; i < signUser.length; i++) {
        axios.post(`/cgi-bin/message/template/send?access_token=${TOKEN}`, {
          "touser": signUser[i].openId,
          "template_id": "gQ73Hk9q6IKarSckJ37PSlEniS_zPpsCak5_hGJ9mb4",
          "data": {
            first: {
              value: `${signUser[i].name}，欣赏完所有的节目，给您喜欢的3个节目投票吧，格式如：1，2，3`
            },
            keyword1: {
              value: '回复节目对应的序号进行投票'
            },
            keyword2: {
              value: `2019-1-26`
            },
            remark: {
              value: msg1,
              color: '#237bff'
            }

          }
        }).then(res => {

        });

      }
    }
}
/* 发送技术部彩蛋 */
/* ================================================== */
const CaiDan=async(ctx)=>{
  let signUser=await User_model.find({'sign':true},'openId name');
  // let signUser=await User_model.find({'name':'顾长波'},'openId name');
  if(signUser){
    ctx.response.body={
      status: 'success'
    }
    for (let i = 0; i < signUser.length; i++) {
      axios.post(`/cgi-bin/message/template/send?access_token=${TOKEN}`, {
        "touser": signUser[i].openId,
        "template_id": "gQ73Hk9q6IKarSckJ37PSlEniS_zPpsCak5_hGJ9mb4",
        "data": {
          first: {
            value: `亲爱的${signUser[i].name}，记得给技术中心-9号，《相扑舞》，投上一票。黄总会发红包哦！！`,
            color: '#ffb005'
          },
          keyword1: {
            value: '亲！记得是：9号哦！'
          },
          keyword2: {
            value: `2019-1-26`
          },
          remark: {
            value: '',
          }

        }
      }).then(res => {
      });
    }
  }
}

/* 获得节目列表 */
/* ================================================== */
const getList=async (ctx)=>{
  let list=await Acts.find({}).sort({order:1});
  if(list){
    ctx.response.body={
      status:'success',
      list:list
    }
  }
}

/* 保存投票的信息 */
/* ================================================== */
const saveTp=async (content,openId)=>{
  let count=content.replace(/[,，\.]/ig,',');
  count=count.replace(/,$/,'');
  let ishas=await User_model.findOne({openId:openId});
  if(ishas){
    let iscan=await User_model.findOne({openId:openId,act:''});
    if(iscan){
      let hasarr=[];
      let countarr=count.split(',')

      for(let i=0; i<countarr.length; i++){
        if(hasarr.indexOf(countarr[i])<0){
          hasarr.push(countarr[i]);
        }
      }
      for(let y=0;y<hasarr.length;y++){
        Act_count[parseInt(hasarr[y])]=parseInt(Act_count[parseInt(hasarr[y])])+1;
      }
      let setact=await User_model.updateOne({openId:openId},{act:hasarr.join(',')});
      if(setact){
        if(/9/.test(count)){
          return '恭喜你投票成功！同时感谢你投技术部一票/:rose/:rose，创蓝技术中心所有成员祝你一帆风顺，二龙腾飞，三羊开泰，四季平安，五福临门，六六大顺，七星高照，八方来财，九九同心，十全十美。';
        }else{
          return`恭喜你投票成功！`;
        }
      }
    }else{
      return `很抱歉，你已经投票过不能重复签到。`
    }
  }else{
    return `/::~很抱歉，你还未签到不能投票`
  }
}

/* 获得投票结果 */
/* ================================================== */
const getActResult=async (ctx)=>{
  let params=ctx.request.body;
  let count=Act_count.concat([]);
  count.shift();
  if(params.type==1){//如果是直接查询
    ctx.response.body={
      status:'success',
      ydata:count
    }
  }else{//如果type==2，表示停止不在记录更新
    await Config_model.updateOne({auther:'bobo'},{openact:false})
    for(let i=0; i<count.length; i++){
      Acts.updateOne({order:i+1},{numb:count[i]});
    }
    ctx.response.body={
      status:'success',
      ydata:count
    }
  }
}

module.exports={
  sendNotice,
  getList,
  CaiDan,
  saveTp,
  getActResult
}

