console.log('popup.js 正常加载！')

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


document.querySelector('button#start').addEventListener('click', function(){
    sendMessageToContentScript({cmd:'action', value:'start'});
    // 保存状态
    chrome.storage.local.set({status: 'start'}, function() {
        console.log('保存成功！');
    });
    // 更改状态
    _changeStatus()
})


document.querySelector('button#stop').addEventListener('click', function(){
    sendMessageToContentScript({cmd:'action', value:'stop'});
    // 保存状态
    chrome.storage.local.set({status: 'stop'}, function() {
        console.log('保存成功！');
    });
    // 更改状态
    _changeStatus()
})

document.querySelector('button#manual').addEventListener('click', function(){
    sendMessageToContentScript({cmd:'action', value:'manual'});
    // 保存状态
    chrome.storage.local.set({status: 'manual'}, function() {
        console.log('保存成功！');
    });
    // 更改状态
    _changeStatus()
})