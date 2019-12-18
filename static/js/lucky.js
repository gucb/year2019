;(function (w, d, $) {
  let isscrolling = false,
    current_level = 3,//当前抽几等奖
    pool = []; //当前奖券池
  let scollIndex = 0;//滚动的索引
  let luckyers=[];//存放每轮的获奖者
  let currenterall=[];//存放当前奖的所有获奖者
  var prizeList = [{name: "华为Mate20X", price: "9688", levelname: "幸运奖", chuck: 1,numb:1},
    {name: "华为Mate20Pro", price: "6799", levelname: "一等奖", chuck: 1,numb:1},
    {name: "华为荣耀8X", price: "1499", levelname: "二等奖", chuck: 5,numb:15},
    {name: "凌美商务钢笔套装", price: "517", levelname: "三等奖", chuck: 10,numb:30},
  ];

  /* 没有抽过的嘉宾池 */
  /* ================================================== */
  let inx=0;//隐藏显示，为了跟着错误状态
  const getPool = () => {
    inx++;
    $.ajax({
      url: '/api/pooluser',
      type: 'get',
      async: false,
      dataType: 'json',
    }).done(res => {
      if (res.status == "success") {
        pool = res.list;
        $(".js-status").html(inx)
      }else{
        $(".js-status").html('error')
      }
    });
  }
  getPool();//进入页面先拉取一次

  /* 每次抽奖钱就重新洗牌 */

  /* ================================================== */
  function Shuffle() {
    //抽牌法(这种算法最快)
    let arr = new Array();
    let pool_len = pool.length;
    for (var i = pool_len; i > 0;) {
      var rnd = Math.floor(Math.random() * i); //从奖券池中随机抽一个号
      arr.push(pool[rnd]); //放到临时堆里
      pool[rnd] = pool[--i];
    }
    pool = arr; //把打乱的奖券重新赋值给池子
  }

  /* 滚动抽奖 */
  /* ================================================== */
  function ScollLucky() {
    if(isscrolling){
      return false;
    }
    Shuffle()//滚动之前先洗牌
    let chuck = prizeList[current_level].chuck;
    let chuckarrs = [];
    let len = pool.length;
    var floor = Math.floor(len / chuck);
    for (let i = 0; i < chuck; i++) {
      var start = i * floor;
      if (i + 1 == chuck) {
        chuckarrs.push(pool.slice(start));
      } else {
        chuckarrs.push(pool.slice(start, start + floor));
      }
    }
    isscrolling=true;
    scollIndex = setInterval(function () {
      luckyers = []
      for (let i = 0; i < chuckarrs.length; i++) {
        const rnd = Math.floor(Math.random() * chuckarrs[i].length);
        luckyers.push(chuckarrs[i][rnd]);
      }
      showLucky()
    }, 30);
  }

  /* 中奖显示 */

  /* ================================================== */
  function showLucky() {
      let html='';
      for(let i=0; i<luckyers.length; i++){
        html+='<li><img src="'+luckyers[i].img+'"/><h3>'+luckyers[i].name+'</h3></li>'
      }
      $('.js-scoll').html(html);
  }

  /* 点击某个奖项时先模拟显示相应的数据 */
  /* ================================================== */
  function ModelShow(){
    luckyers=[];
    let len = pool.length;
    for(let i=0; i<prizeList[current_level].chuck;i++){
      let obj={
        img:'images/logo.png',
        name:'创蓝253'
      }
      luckyers.push(obj);
    }
    showLucky();
  }

  /* 把详细的名单放到左边或者右边 */
  /* ================================================== */
  function showAllers() {
    if(current_level==0||current_level==1){
      return false;
    }
    for(let y=0; y<luckyers.length; y++){
      currenterall.push(luckyers[y]);//保存获奖者(所有的)
    }
    let leftnubm=current_level==2?8:15;
    let html_left='';
    let html_right='';
    for(let i=0; i<currenterall.length; i++){
      if(i<leftnubm){
        html_left+='<p>'+currenterall[i].name+'</p>';
      }else{
        html_right+='<p>'+currenterall[i].name+'</p>';
      }
    }
    $('.js-aller_left').html(html_left);
    $('.js-aller_right').html(html_right);
  }

  /* 发送消息给中奖者，通过微信公众号提醒 */

  /* ================================================== */
  function sendLucky() {
    $.ajax({
      url: '/api/luckyuser',
      type: 'post',
      dataType: 'json',
      data: {
        level: current_level,
        luckyers: luckyers
      }
    }).done(res => {
      if(res.status=='success'){
        getPool();
      }else{
        $(".js-status").html('error')
      }
    });
  }

  /* 没有抽过的嘉宾池 */

  /* ================================================== */
  function getSize() {
    const win_w = $(w).width();
    const win_h = $(w).height();
    const proportion = 1366 / 768;
    let wrapper_w = 0;
    let wrapper_h = 0;
    if (win_w / win_h >= proportion) {
      wrapper_w = win_h * proportion;
      wrapper_h = win_h;
    } else {
      wrapper_w = win_w;
      wrapper_h = win_w * 768 / 1366;
      $(".wrapper").css({
        "margin-top": (win_h - wrapper_h) / 2 + 'px'
      });
    }
    $('html').css({
      'font-size': wrapper_w / (1366 / 100) + 'px'
    });
  }

  getSize();
  $(w).resize(function (event) {
    getSize();
  });

  /* 选择当前抽奖号码 */
  /* ================================================== */
  $('.js-current').click(function (e) {
    e.preventDefault();
    current_level= $(this).text();
    ModelShow();
    $('.js-scoll').removeClass('lucky_0').removeClass('lucky_1').removeClass('lucky_2').removeClass('lucky_3')
    $('.js-scoll').addClass('lucky_'+current_level);
    $('.js-winner_show').find('h2').html(prizeList[current_level].levelname);
    $('.js-winner_show').find('p').html(prizeList[current_level].numb+'人');
    $('.js-winner_show').find('dd').hide();
    $('.js-winner_show').find('dd.winner_'+current_level).show();
    if(current_level==2){
      $('.aller').removeClass('aller_3').show();
    }else if(current_level==3){
      $('.aller').addClass('aller_3').show();
    }else{
      $('.aller').removeClass('aller_3').hide();
    }
  });

  /* 开始摇奖 */
  /* ================================================== */
  $('.js-start').click(function (e) {
    e.preventDefault();
    ScollLucky();//开始滚动
  });

  /* 结束抽奖 */
  /* ================================================== */
  $('.js-stop').click(function (e) {
    e.preventDefault();
    isscrolling=false;//先清除滚动
    clearInterval(scollIndex);
    showAllers();//把所有获奖者显示出来
    sendLucky();//给中奖者发送通知
  });

})(window, document, jQuery);
