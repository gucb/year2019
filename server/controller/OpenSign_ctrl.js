const Config_model = require('../model/config');
const getSign= async (ctx) => {
  let opensign=await Config_model.findOne({auther:'bobo'});
  ctx.body={sign:opensign.opensign,status:'success'}
}
const setSign=async (ctx)=>{
  let query=ctx.query;
  let sign=await Config_model.updateOne({auther:'bobo'},{opensign:query.sign==1?true:false});
  if(sign){
    ctx.body={sign:query.sign==1?true:false,status:'success'};
  }
}

module.exports={
  getSign,
  setSign
}

