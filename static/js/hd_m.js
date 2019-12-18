;(function (w, d, $) {
  function getParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = decodeURI(window.location.search).substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  };
  let userinfo={};
  // if (getParam('code')) {//如果不存在就通过微信获取信息
  //   $.ajax({
  //     url: '/api/get_wx_access_token',
  //     type: 'get',
  //     async:false,
  //     dataType: 'json',
  //     data:{
  //       code:getParam('code')
  //     }
  //   }).done(res => {
  //     if(res.name){
  //      userinfo=res;
  //     }else{
  //       alert('获取微信接口错误，先检查网络是否连接，然后联系bobo！')
  //     }
  //   });
  if(getParam('user_name')){
    userinfo.name=getParam('user_name');
    userinfo.img=getParam('user_img');
  }else{
    location.href='/wx_login';
  }
  const socket = io.connect('http://120.253.136.198:19253');

  $(function () {//除了用户信息其他的都等页面渲染完成处理
    socket.emit('online',userinfo.name);
    /* 记录提醒事件 */
    socket.on('online', (name) => {
      if (!name) {
        return;
      }
      $('.js-content').append(`<li class="online"><p>${name}加入互动</p></li>`);
    });
    // 接收群聊消息
    socket.on('receiveGroupMsg', data => {
      let html=`<li><div class="head"><img src="${data.img}"/></div><div class="cont_info"><div class="detail"><s></s>`;
      html+=`<p class="name">${data.name}<span>${data.date}</span></p><p class="info">${data.content}</p></div></div></li>`
      $('.js-content').append(html);
      if($('.js-content').find('li').length>30){
        $('.js-content').find('li').eq(10).prevAll().remove();
      }
    });

    /* 提交发送的信息 */
    /* ================================================== */
    $('.sub_btn').click(function (e) {
      let content=$('.edit_input').val();
      if(!/^.{1,30}$/.test(content)){
        alert('发送的消息必须1-30个字之间！');
        return false;
      }
      e.preventDefault();
      socket.emit('sendGroupMsg', {
        date: moment().format(' HH:mm:ss'),
        name: userinfo.name,
        img:userinfo.img,
        content: content
      });
      let html=`<li class="my"><div class="cont_info"><div class="detail"> <s></s><p class="name"><span>${moment().format(' HH:mm:ss')}</span> ${userinfo.name}</p>`;
      html+=`<p class="info">${content}</p></div></div><div class="head"><img src="${userinfo.img}"/></div></li>`;
      $('.js-content').append(html);
    });

    /* 没有抽过的嘉宾池 */

    /* ================================================== */
    function getSize() {
      const win_w = $(w).width();
      const win_h = $(w).height();
      const proportion = 1920 / 1080;
      let wrapper_w = 0;
      let wrapper_h = 0;
      if (win_w / win_h >= proportion) {
        wrapper_w = win_w;
      } else {
        wrapper_w = win_h * proportion;
      }
      $('html').css({
        'font-size': wrapper_w / (1920 / 100) + 'px'
      });
    }

    getSize();
  });

})(window, document, jQuery);
