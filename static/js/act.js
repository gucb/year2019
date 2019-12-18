;(function (w, d, $) {
  /* 获得节目列表*/

  /* ================================================== */
  function getActList() {
    $.ajax({
      url: '/api/actlist',
      type: 'get',
      dataType: 'json',
    }).done(res => {
      if (res.status == 'success') {
        let html = '';
        for (let i = 0; i < res.list.length; i++) {
          html += `<li><label>${res.list[i].order}、${res.list[i].name}</label><div class="bar"><div class="press" style="width:0;"><span>0</span></div></div></li>`
        }
        $('.js-actlist').html(html);
      }
    });
  }

  getActList();

  /* 获得节目数据 */
  /* ================================================== */
  let actIndex = 0;

  function getData(type) {
    $.ajax({
      url: '/api/actresult',
      type: 'post',
      dataType: 'json',
      data: {
        type: type
      }
    }).done(res => {
      if (res.status == 'success') {
        setScoll(res.ydata,type)
      }
    });
    if (type == 1) {
      actIndex = setTimeout(function () {
        getData(1)
      }, 2000);
    }else{
      clearInterval(actIndex);
    }
  }

  /* 设置显示 */
  /* ================================================== */
  let max = 3;//设置最大投票量，预估，多了就自增50;

  function sortNumber(a, b) {
    return a - b
  }

  function setScoll(data,type) {
    let newarr = data.concat([]);
    newarr.sort();
    if (newarr[11] > max) {
      max = newarr[11] + 20;
    }
    for (let i = 0; i < data.length; i++) {
      let cat = parseInt((parseInt(data[i]) / max) * 100);
      $('.js-actlist').find('li').eq(i).find('.press').css('width', cat + '%');
      $('.js-actlist').find('li').eq(i).find('.press').find('span').html(data[i]);
    }
    if(type==2){//计算前三名
      let hasarr=[];
      for(var i=0;i<newarr.length;i++){
        if(hasarr.indexOf(newarr[i])<0){
          hasarr.push(newarr[i]);
        }
      }
      let len=hasarr.length;
      $('.js-actlist').find('li').each(function (e) {
       let nub=$(this).find('.press').find('span').text();
        if(nub==hasarr[len-1]){
          $(this).find('.press').addClass('first');
        }else if(nub==hasarr[len-2]){
          $(this).find('.press').addClass('second');
        }else if(nub==hasarr[len-3]){
          $(this).find('.press').addClass('three');
        }
      })
    }
  }


  /* 点击开始 */
  /* ================================================== */
  $('.js-start').click(function (e) {
    getData(1);
  });

  /* 点击结束 */
  /* ================================================== */
  $('.js-stop').click(function (e) {
    getData(2);
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
  $(w).resize(function (event) {
    getSize();
  });
})(window, document, jQuery);
