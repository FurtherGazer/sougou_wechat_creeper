console.log('背景页加载！')

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

// 初始化 all_data
all_data = [];

// pageIndex list 用于检索是否已经爬取过该页
page_list = [];

// 当前页面已点击索引值
// 换一个思路，反正点击链接后跳转页面也有数据抓取，那何必费事非要做当前页面跳转呢
detail_list = new Set();

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	console.log('收到来自content-script的消息：');
    console.log(request, sender, sendResponse);
    
    if(request.key == 'from_list'){
        console.log('request from list')
        if(request.data.pageIndex in page_list){
            console.log('数据已获取')
        }else{
            console.log('新数据')
            all_data = all_data.concat(request.data.items)
            page_list.push(request.data.pageIndex)
        };
        
        sendResponse(`
            后台已收录当前页面数据，收到的数据页码为: ${request.data.pageIndex}
            现有总数据行数为：${all_data.length}
        `);
    };

    if(request.key == 'from_detail'){
        console.log('request from detail')
        if(request.data.item){
            detail_list.add(JSON.stringify(request.data.item))
        }
        
        sendResponse(`
            后台已收录当前<详情页>页面数据
            现有总数据行数为：${detail_list.size}
        `);

        // 然后 1s 后关闭当前 tab 页
        if(request.if_sougou){
            setTimeout(function(){
                chrome.tabs.remove(sender.tab.id)
            },1000)
        }        
    }

    if(request.key == 'getStatus'){
        sendResponse('wait a moment!');

        // 获取状态
        chrome.storage.local.get({status: 'stop'}, function(e) {
            sendMessageToContentScript({cmd:'action', value:e.status}, function(response)
            {
                console.log('来自content的回复：'+ response);
            });
        });

    }

});