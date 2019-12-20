console.log('插件已加载')

// load完毕
function _addLoadEvent(func) {
    var oldonload = window.onload;//得到上一个onload事件的函数
    if (typeof window.onload != 'function') {//判断类型是否为'function',注意typeof返回的是字符串
        window.onload = func;
    } else {  
        window.onload = function() {
            oldonload();//调用之前覆盖的onload事件的函数---->由于我对js了解不多,这里我暂时理解为通过覆盖onload事件的函数来实现加载多个函数
            func();//调用当前事件函数
        }
    }
}

// 获取字符串日期
function _gDate(a){
    let b = parseInt(a)*1000
    let c = new Date(b);
    return c.toLocaleString();
}

// 字符串压缩
function _trim(str,is_global){
    try{
        var is_global = is_global || 'g';
        var result;
        result = str.replace(/(^\s+)|(\s+$)/g,"");
        if(is_global.toLowerCase()=="g"){result = result.replace(/\s/g,"")}
        return result;
    }catch(err){return 'TrimError'}
}

// 开始/停止标识，默认为 false
var _flag_if_continue = false;

// 0. 从 background 中获取状态
function _getStatusFromBackground(){
    console.log('_getStatusFromBackground')
    // 向 background 通信，发送数据，让他给返回一下状态
    chrome.runtime.sendMessage({key:'getStatus'}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
}

// 初始化
if(document.location.hostname=='weixin.sogou.com'){
    _addLoadEvent( // 延迟1s
        setTimeout(() => {
            _getStatusFromBackground()
        }, 1000));
}
if(document.location.hostname=='mp.weixin.qq.com'){ // 当处于微信详情页时，就简单粗暴一点
    _addLoadEvent(_getDetail());
}


// 是否正在运行中
var _flag_if_ing = false;

// interval_id
var _interval_id = NaN; 

// 通信监听
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.cmd == 'action'){
        sendResponse('我收到了你的消息！' + request.value);
    }
    if(request.value == 'start'){
        console.log('request.value == start')
        _flag_if_continue = true;
        if(_flag_if_ing == false){
            _getWeixinList();
            _interval_id = _clickUrlOneByOne(); // 获取 _interval_id
            console.log(_interval_id)
            _flag_if_ing = true
        }else{
            console.log('_flag_if_ing == true')
        }
    }
    if(request.value == 'stop'){
        console.log('request.value == stop')
        _flag_if_continue = false;
        console.log('_interval_id == ', _interval_id)
        clearInterval(_interval_id);
    }
    if(request.value == 'manual'){
        console.log('request.value == manual')
        _flag_if_continue = false;
        clearInterval(_interval_id);
        // 手动模式，没有 _clickUrlOneByOne
        _getWeixinList();
    }
});


// 1. 在 weixin.sogou.com 下执行，获取新闻列表内容
function _getWeixinList(){
    if(_flag_if_continue){
        // 初始化一个列表
        let weixin_li_content = []
        document.querySelectorAll('ul.news-list li').forEach(function(e){
            let title = e.querySelector('div.txt-box h3 a').textContent;
            let digest = e.querySelector('div.txt-box p.txt-info').textContent;
            let date = _gDate(e.querySelector('div.txt-box div.s-p').getAttribute('t'));
            let account = e.querySelector('div.txt-box div.s-p a.account').textContent;
            let item = {
                'title': title,
                'digest': digest,
                'date': date,
                'account': account
            }
            weixin_li_content.push(item);
        })
        
        // 抓取当前页面页码
        if(document.querySelector('div#pagebar_container span')){ // 有页码
            let pageIndex = document.querySelector('div#pagebar_container span').textContent;
        
            let send_data = {
                'pageIndex' : pageIndex,
                'items': weixin_li_content
            }
        
            // 抓取完毕，向 background 通信，发送数据
            chrome.runtime.sendMessage({data: send_data, key:'from_list'}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
        };
    }else{
        console.log('_flag_if_continue == false')
    }
}


// 2. 逐个打开链接
function _clickUrlOneByOne(){
    // 抓取数据长度
    let node_length = document.querySelectorAll('ul.news-list li').length;
    
    // 当前抓取到的 index
    let cur_index = 0;

    // 每2秒抓取一下
    let interval = setInterval(() => {
        clickLink(interval)
    }, 2000);

    function clickLink(){
        _getStatusFromBackground() // 检查一下状态
        if(_flag_if_continue){
            if(cur_index < node_length){
                console.log('正在执行：' + cur_index);
                try{
                    document.querySelectorAll('ul.news-list li')[cur_index].querySelector('div.txt-box h3 a').click();
                }catch(err){}finally{
                    cur_index = cur_index + 1;
                }
            }else{
                // 清除循环
                clearInterval(interval)
    
                // 点击进入下一页
                document.querySelector('a#sogou_next').click();
            }
        }
    }
    
    return interval
}


// 3. 在 https://mp.weixin.qq.com/ 下执行，获取新闻详情内容
function _getDetail(){
    // 抓取数据
    let _title = _trim(document.querySelector('h2#activity-name').textContent);
    let _account = _trim(document.querySelector('a#js_name').textContent);
    let _content = _trim(document.querySelector('div#js_content').textContent);
    let _account_id = _trim(document.querySelector('span.profile_meta_value').textContent);
    let _dr = document.referrer.match('weixin.sogou.com') ? true:false;
    
    let item = {
        'title': _title,
        'account': _account,
        'content': _content,
        'account_id': _account_id,
    }
    
    let send_data = {
        'item': item
    }

    // 抓取完毕，向 background 通信，发送数据
    chrome.runtime.sendMessage({data: send_data, key: 'from_detail', if_sougou: _dr}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
}



