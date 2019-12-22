console.log('popup.js 正常加载！')

var bg = chrome.extension.getBackgroundPage();

// 发送信息
function sendMessageToContentScript(message, callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		chrome.tabs.sendMessage(tabs[0].id, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}

// 更新状态
function _changeStatus(){
    chrome.storage.local.get({status: 'stop'}, function(e) {
        document.querySelector('span#status').textContent = e.status;
    });
}

// 初始化
_changeStatus();

// 点击开始时
document.querySelector('button#start').addEventListener('click', function(){
    sendMessageToContentScript({cmd:'action', value:'start'});
    // 保存状态
    chrome.storage.local.set({status: 'start'}, function() {
        console.log('保存成功！');
    });
    // 更改状态
    _changeStatus()
})
// 点击停止时
document.querySelector('button#stop').addEventListener('click', function(){
    sendMessageToContentScript({cmd:'action', value:'stop'});
    // 保存状态
    chrome.storage.local.set({status: 'stop'}, function() {
        console.log('保存成功！');
    });
    // 更改状态
    _changeStatus()
})
// 点击手动操作时
document.querySelector('button#manual').addEventListener('click', function(){
    sendMessageToContentScript({cmd:'action', value:'manual'});
    // 保存状态
    chrome.storage.local.set({status: 'manual'}, function() {
        console.log('保存成功！');
    });
    // 更改状态
    _changeStatus()
})
// 点击获取数据时
document.querySelector('button#getData').addEventListener('click', function(){
    document.querySelector('#page_list').textContent = JSON.stringify(bg.all_data);
    // detail_list 
    var detail_list = [];
    bg.detail_list.forEach(element => {
        detail_list.push(JSON.parse(element))
    });
    document.querySelector('#page_detail').textContent = JSON.stringify(detail_list)
})