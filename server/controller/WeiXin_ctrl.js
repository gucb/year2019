const crypto =  require('crypto');//引入加密模块
module.exports =(ctx) => {
    //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
    const signature = ctx.query.signature,//微信加密签名
        timestamp = ctx.query.timestamp,//时间戳
        nonce = ctx.query.nonce,//随机数
        echostr = ctx.query.echostr;//随机字符串

    //2.将token、timestamp、nonce三个参数进行字典序排序
    let array = ['253com',timestamp,nonce];
    array.sort();

    //3.将三个参数字符串拼接成一个字符串进行sha1加密
    const tempStr = array.join('');
    const hashCode = crypto.createHash('sha1'); //创建加密类型
    const resultCode = hashCode.update(tempStr,'utf8').digest('hex'); //对传入的字符串进行加密

    //4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if(resultCode === signature){
        ctx.body=echostr;
    }else{
        ctx.body='mismatch';
    }
}
