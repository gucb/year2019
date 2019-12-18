const xml2js = require('xml2js');
const ejs = require('ejs')
const messageTpl = '<xml>\n' +
  '<ToUserName><![CDATA[<%-toUserName%>]]></ToUserName>' +
  '<FromUserName><![CDATA[<%-fromUserName%>]]></FromUserName>' +
  '<CreateTime><%=createTime%></CreateTime>' +
  '<MsgType><![CDATA[<%=msgType%>]]></MsgType>' +
  '<Content><![CDATA[<%-content%>]]></Content>' +
  '</xml>';
module.exports = {
  parseXML: async (xml) => {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, {trim: true}, function (err, obj) {
        if (err) {
          return reject(err);
        }
        resolve(obj);
      });
    });
  },
  formatMessage: (result) => {
    let message = {};
    if (typeof result == 'object') {
      for (let key in result) {
        if (!(result[key] instanceof Array) || result[key].length === 0) {
          continue;
        }
        if (result[key].length === 1) {
          let val = result[key][0];
          if (typeof val === 'object') {
            message[key] = formatMessage(val);
          } else {
            message[key] = (val || '').trim();
          }
        } else {
          message[key] = result[key].map(function (item) {
            return formatMessage(item);
          });
        }
      }
    }
    return message;
  },
  answer: (message) => {
    let reply = {
      toUserName: message.FromUserName,
      fromUserName: message.ToUserName,
      createTime: new Date().getTime(),
      msgType: 'text',
      content:message.Content
    };
    let output = ejs.render(messageTpl, reply);
    return output;
  }
};


