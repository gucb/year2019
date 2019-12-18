;(function (w, d, $) {
  const socket = io.connect('http://120.253.136.198:19253');
  // 接收群聊消息
  socket.on('receiveGroupMsg', data => {
    sendDanmu(data);
  });

  /* 发送一个弹幕 */

  /* ================================================== */
  let ran_top= Math.floor(Math.random() * $(window).height() + 40);
  function sendDanmu(item) {
    let opt = {
      img: '',//绑定的微信头像
      content: '',//发送的消息
      color: '#fae6cd',//文字内容颜色
    }
    let option = $.extend(true, {}.opt, item);
    let move = $(window).width() + 20;
    let speed = 10;
    if(ran_top+200<$(window).height()){
      ran_top=ran_top+70;
    }else{
      ran_top= Math.floor(Math.random() * $(window).height() + 40);
    }
    let text_w=option.content.length*0.45+0.8;//一个文字的宽度//大概，控制显示条的长度

    let $dm = $(`<div class="dmitem" style="left:${move}px; top:${ran_top}px; width:${text_w}rem; " ><div class="item_info"><img src="${option.img ? option.img : 'images/logo.png'}" class="headimg"/><p class="content">${option.content}</p></div></div>`).appendTo('.js-dm');
    let index = setInterval(function () {
      $dm.css({left: move});
      if (move < -700) {

        $dm.remove();
        clearInterval(index);
      } else {

        move--;
      }
    }, speed);
  }

  /* 显示互动屏信息 */
  /* ================================================== */
  let showIndex=setInterval(function(){
    if($('.dmitem').length<5){
      $('.dm_sm').show();
    }else{
      $('.dm_sm').hide();
    }
  },1000*30);//每分钟检查当前屏幕是否有留言互动


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
  $(w).resize(function (event) {
    getSize();
  });

})(window, document, jQuery);
