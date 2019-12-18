// 引入mongoose
var mongoose = require("mongoose");

// 连接数据库
mongoose.connect("mongodb://172.16.40.197:27017/year2019", {useNewUrlParser:true});

// 连接失败
mongoose.connection.on("error", function(err){
    console.error("数据库链接失败:"+ err);
});

// 连接成功
mongoose.connection.on("open", function(){
    console.log("数据库链接成功");
});

// 断开数据库
mongoose.connection.on("disconnected", function(){
    console.log("数据库断开");
})

// 将mongoose推出

module.exports = mongoose;
