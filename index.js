const express = require('express');
const request = require('request');
const { BarkApi: bark, "X-XSRF-Token": token, Cookie: ck, ServerIDList, renewflag } = require('./conf.json');
const SERVER = process.env.SERVER_IP;
const PORT = process.env.SERVER_PORT;

const app = express();

//首页显示内容
app.get("/", function (req, res) {
    res.send("hello world");
});

// keepalive begin
function keep_web_alive() {
    // 1.请求主页，保持唤醒
    request("http://" + SERVER + ":" + PORT, function (error, response, body) {
        if (!error) {
            console.log("保活-请求主页-命令行执行成功，响应报文:" + body);
        }
        else {
            console.log("保活-请求主页-命令行执行错误: " + error);
        }
    });
}
//--—-----------------主要方法区域---—--------------
//服务器获取积分
function getEarn() {
    console.log(`开始执行服务器获取积分任务...`);
    post(`/api/client/store/earn`);
}
//服务器兑换资源
function getResources() {
    let resouceList = ["cpu", "memory", "disk", "slots"];
    for (let data of resouceList) {
        console.log(`开始执行服务器兑换${data}资源任务...`);
        post(`/api/client/store/resources`, { resource: data });
    }
}
//服务器自动续期
function renewServer() {
    if(!ServerIDList?.length) return console.log(`未填写ServerIDList，跳过执行服务器自动续期任务`);
    for (let data of ServerIDList) {
        console.log(`开始执行服务器自动续期:${data}...`);
        post(`/api/client/servers/${data}/renew`);
    }
}
//--—-----------------辅助函数区域---—--------------
//封装请求方法
function post(api, data = {}) {
    const url = `https://panel.sillydev.co.uk${api}`;
    const headers = {
        'X-Requested-With': `XMLHttpRequest`,
        'Sec-Fetch-Dest': `empty`,
        'Connection': `keep-alive`,
        'X-XSRF-TOKEN': token,
        'Accept-Encoding': `gzip, deflate, br`,
        'Sec-Fetch-Site': `same-origin`,
        'Origin': `https://panel.sillydev.co.uk`,
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15`,
        'Sec-Fetch-Mode': `cors`,
        'Cookie': ck,
        'Host': `panel.sillydev.co.uk`,
        'Referer': `https://panel.sillydev.co.uk/store/resources`,
        'Accept': `application/json`
    };
    const options = {
        url: url,
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    };
    request(options, (error, response, body) => {
        if (!error && response.statusCode === 204) {
            console.log(`Request successful:${response.statusCode} => 调用成功！`); // 响应体
        } else {
            const errorMessage = response.statusCode === 429
                ? `Error: ${response.statusCode} => 请求过于频繁，请稍后再试！`
                : `Error: ${response.statusCode} => 调用失败！`;

            console.error(errorMessage);
        }
    });
}

//--—-----------------任务定时配置---—--------------
//定时自动保活，每10秒执行一次
setInterval(keep_web_alive, 10e3);
//定时自动获取积分,每分钟执行一次
setInterval(getEarn, 6e4);
//定时自动兑换,每8小时执行一次
setInterval(getResources, 2.88e7);
//定时自动续期,每5天执行一次
setInterval(renewServer, 4.32e8);

//--—-----------------服务器启动配置---—--------------
// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is listening on http://${SERVER}:${PORT}`);
    console.log(`服务器续期列表:${ServerIDList}`);
    console.log(`是否开启服务器自动续期:${renewflag}`);
});