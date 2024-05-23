const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { "X-XSRF-Token": token, Cookie: ck,tgBotToken } = require('./conf.json');
const SERVER = process.env.SERVER_IP;
const PORT = process.env.SERVER_PORT;
const app = express();

const bot = new TelegramBot(tgBotToken, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to Silly Bot. Use /help to see available commands.");
});

// Listen for /help command
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        "Available commands:\n" +
        "/info - 查看Silly个人信息\n" +
        "/server - 查看当前服务器信息\n" +
        "/renew - 服务器续期\n"+
        "/resources - 兑换服务器资源"
    );
});

bot.onText(/\/info/, async (msg) => {
    try {
        const escapeMarkdown = (text) => {
            return text.toString().replace(/([\_\*\[\]\(\)\~\`\>\#\+\-\=\|\{\}\.\!])/g, '\\$1');
        };
        // 计算每列的最大宽度
        const calculateColumnWidths = (keys, values) => {
            let keyWidth = Math.max(...keys.map(key => key.length));
            let valueWidth = Math.max(...values.map(value => value.toString().length));
            return [keyWidth, valueWidth];
        };

        // 格式化 JSON 为两列多行 Markdown 表格
        const formatJsonToTable = (data) => {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const [keyWidth, valueWidth] = calculateColumnWidths(keys, values);

            let formattedTable = '';

            // 打印表头
            formattedTable += `| ${'Key'.padEnd(keyWidth)} | ${'Value'.padEnd(valueWidth)} |\n`;
            formattedTable += `| ${'-'.repeat(keyWidth)} | ${'-'.repeat(valueWidth)} |\n`; // 表头分隔线

            // 打印数据行
            keys.forEach((key, index) => {
                const escapedKey = escapeMarkdown(key).padEnd(keyWidth);
                const escapedValue = escapeMarkdown(values[index].toString()).padEnd(valueWidth);
                formattedTable += `| ${escapedKey} | ${escapedValue} |\n`;
            });

            return formattedTable;
        };
        let response = await get("/api/client/store");
        const chatId = msg.chat.id;
        const tableMessage = formatJsonToTable(response?.attributes);

        bot.sendMessage(chatId, "查询成功！当前可用资源如下：\n" + `\`\`\`\n${tableMessage}\n\`\`\``, { parse_mode: 'MarkdownV2' });
    } catch (e) {
        bot.sendMessage(msg.chat.id, `Error:${e}`);
    }
});

bot.onText(/\/server/, async (msg) => {
    try {
        let response = await get("/api/client?page=1");
        let total = response.meta.pagination.total;
        let serverList = response?.data?.map(e => {
            let o = e.attributes;
            return {
                "name": o.name,
                "serverId": o.uuid,
                "renewal": o.renewal,
                "status": o.status
            }
        }).filter(e => e.status != "suspended");
        Promise.all(serverList.map(e => {
            const text = `*${e.name}*\nUUID:${e.serverId}\n到期天数:${e.renewal}`;
            return bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
        }))
        bot.sendMessage(
            msg.chat.id, `共${total}台服务器，可用数量:${serverList.length}`
        );
    } catch (e) {
        bot.sendMessage(msg.chat.id, `Error:${e}`);
    }
});

bot.onText(/\/renew/, async (msg) => {
    try {
        let response = await get("/api/client?page=1");
        let arr = [[{ text: "全部", callback_data: 'all' }]];
        response?.data?.map(e => {
            let o = e.attributes;
            if (o.status != "suspended") arr.push([{ text: o.name, callback_data: o.name }])
        });
        const options = {
            reply_markup: {
                inline_keyboard: arr
            }
        };
        bot.sendMessage(msg.chat.id, '请选择要续期的服务器:', options);
    } catch (e) {
        bot.sendMessage(msg.chat.id, `Error:${e}`);
    }
});


bot.onText(/\/resources/, async (msg) => {
    try {
        let arr = [
            [
                { text: "balance", callback_data: 'balance' },
                { text: "cpu", callback_data: 'cpu' }
            ],
            [
                { text: "memory", callback_data: 'memory' },
                { text: "disk", callback_data: 'disk' }
            ],
            [
                { text: "slots", callback_data: 'slots' },
                { text: "ports", callback_data: 'ports' }
            ],
            [
                { text: "backups", callback_data: 'backups' },
                { text: "databases", callback_data: 'databases' }
            ]
        ];
        const options = {
            reply_markup: {
                inline_keyboard: arr
            }
        };
        bot.sendMessage(msg.chat.id, '请选择要兑换的资源:', options);
    } catch (e) {
        bot.sendMessage(msg.chat.id, `Error:${e}`);
    }
});

// 处理按钮点击事件
bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    let response = await get("/api/client?page=1");
    let serverList = response?.data?.map(e => {
        let o = e.attributes;
        return {
            "name": o.name,
            "serverId": o.uuid,
            "renewal": o.renewal,
            "status": o.status
        }
    }).filter(e => e.status != "suspended");
    switch (data) {
        case 'all':
            await Promise.all(serverList.map(e => post(`/api/client/servers/${e.serverId}/renew`)));
            let message = []
            serverList.map(e => message.push(`*${e.name}*`));
            bot.sendMessage(
                msg.chat.id,
                `${message.join("、")}续期成功🎉🎉🎉`,
                { parse_mode: 'Markdown' }
            );
            break;
        case 'balance':
        case 'cpu':
        case 'memory':
        case 'disk':
        case 'slots':
        case 'ports':
        case 'backups':
        case 'databases':
            await post(`/api/client/store/resources`, { resource: data });
            bot.sendMessage(
                msg.chat.id,
                `兑换*${data}*资源成功🎉🎉🎉`,
                { parse_mode: 'Markdown' }
            );
            break;
        default:
            let server = serverList.find(e => e.name == data);
            await post(`/api/client/servers/${server.serverId}/renew`)
            bot.sendMessage(
                msg.chat.id,
                `*${server.name}*续期成功🎉🎉🎉`,
                { parse_mode: 'Markdown' }
            );
            break;
    }
});

//首页显示内容
app.get("/", function (req, res) {
    res.send("hello world");
});

app.get("/test", async function (req, res) {
    let response = await get("/api/client?page=1");
    res.send(response);
});

// keepalive begin
async function keep_web_alive() {
    try {
        const response = await fetch(`http://${SERVER}:${PORT}`);
        const body = await response.text();
        if (!response.ok) {
            throw new Error(`保活-请求主页-命令行执行错误: ${response.status}`);
        }
        console.log(`保活-请求主页-命令行执行成功，响应报文: ${body}`);
    } catch (error) {
        console.error(`保活-请求主页-命令行执行错误: ${error.message}`);
    }
}

async function getEarn() {
    console.log(`开始执行服务器获取积分任务...`);
    await post(`/api/client/store/earn`);
}

//--—-----------------任务定时配置---—--------------
//定时自动保活，每10秒执行一次
setInterval(keep_web_alive, 10e3);
//定时自动获取积分,每分钟执行一次
setInterval(getEarn, 6e4);

//--—-----------------辅助函数区域---—--------------
//封装请求方法
async function get(api) {
    const res = await fetch(`https://panel.sillydev.co.uk${api}`, {
        headers: {
            'accept': 'application/json',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'cache-control': 'no-cache',
            'cookie': ck,
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'referer': 'https://panel.sillydev.co.uk/store',
            'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest',
            'x-xsrf-token': token
        }
    }).then(res => res.json());
    return res;
}

async function post(api, data = {}) {
    const url = `https://panel.sillydev.co.uk${api}`;
    const headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-Fetch-Dest': 'empty',
        'Connection': 'keep-alive',
        'X-XSRF-TOKEN': token, // 确保这个 token 在函数作用域中定义
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Fetch-Site': 'same-origin',
        'Origin': 'https://panel.sillydev.co.uk',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        'Sec-Fetch-Mode': 'cors',
        'Cookie': ck, // 确保这个 ck 在函数作用域中定义
        'Host': 'panel.sillydev.co.uk',
        'Referer': 'https://panel.sillydev.co.uk/store/resources',
        'Accept': 'application/json',
        'Content-Type': 'application/json' // 确保发送的数据格式正确
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        if (response.status === 204) {
            console.log(`Request successful: ${response.status} => 调用成功！`);
        } else if (response.status === 429) {
            console.error(`Error: ${response.status} => 请求过于频繁，请稍后再试！`);
        } else {
            console.error(`Error: ${response.status} => 调用失败！`);
        }
    } catch (error) {
        console.error(`Fetch error: ${error.message}`);
    }
}

//--—-----------------服务器启动配置---—--------------
// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is listening on http://${SERVER}:${PORT}`);
});
