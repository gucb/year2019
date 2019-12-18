const xlsx=require('node-xlsx').default;
const User_model = require('../model/user');
const importUser=async(ctx)=>{
  let sheelt= await xlsx.parse(`${__dirname}/all.xlsx`);
  const len=sheelt[0].data.length;
  const data=sheelt[0].data;
  let arr_user=[];
  for(let i=0;i<len;i++){
      if(data[i].length>0){
        arr_user.push({
          name:data[i][1],
          depart:data[i][0],
          tel:data[i][2]
        })
      }
  }
  let importuser=await User_model.insertMany(arr_user);
  console.log(importuser);
  if(importuser){
    ctx.response.body={status:'success'}
  }else{
    ctx.response.body={status:'error'}
  }
}
module.exports=importUser;
