# SillyDev
在 Silly 上部署 ```Node服务``` 自动获取```Silly Development```积分、并通过telegram bot管理信息、兑换资源及服务器续期。如果本项目对你有所帮助的话，不妨点个Star⭐️

### 一、准备材料 

1. 一枚邮箱，不建议使用qq邮箱。

### 二、部署服务。
1. 打开 Silly 的网站：https://panel.sillydev.co.uk/auth/login ，然后点击里面的“Signup with email”进行注册。如有账户直接登录即可。

<img width="600px" src="https://pic2.ziyuan.wang/user/tistzach/2024/05/截屏2024-05-21 20.40.25_0cb4c50ce38c4.png" alt="kkk.png" title="kkk.png" />

2. 打开自己的邮件，然后点击“Verify email”验证邮箱.

<img width="600px" src="https://pic2.ziyuan.wang/user/tistzach/2024/05/wcc_aa8e475e02d63.png" alt="wcc.png" title="wcc.png" />

3. 点击左侧栏的编辑按钮，然后点击“Create”进行创建

<img width="600px" src="https://pic2.ziyuan.wang/user/tistzach/2024/05/cvv_e7402ddef25e9.png" alt="cvv.png" title="cvv.png" />

4. 可以使用最小配置（Cpu选择50，RAM选择512，Storage选择512），选择地区随意选择，然后 Nest 选择“Code Languages”，Egg 选择“Node.js”，最后点击“Create”按钮，创建服务器。

<img width="600px" src="https://pic2.ziyuan.wang/user/tistzach/2024/05/csc_4752753430e82.png" alt="csc.png" title="csc.png" />

<img width="600px" src="https://pic2.ziyuan.wang/user/tistzach/2024/05/cscs_7af98b9c3de65.png" alt="cscs.png" title="cscs.png" />

5. 等待服务器安装的时候，可以将本仓库的内容下载项目文件下来。

<img width="600px" src="https://pic2.ziyuan.wang/user/tistzach/2024/05/xaa_61e0582615189.png" alt="xaa.png" title="xaa.png" />

6. 将除了 ```README.md``` 和 ```LICENSE``` 文件外的所有文件，上传至服务器上

<img width="600px" src="https://pic2.ziyuan.wang/user/tistzach/2024/05/rgrg_addca11d29d2c.png" alt="rgrg.png" title="rgrg.png" />

7. 根据下面表格信息，修改```conf.json```内容

|  变量名        | 是否必须 | 默认 |  备注          |
| :----:        | :--:     |:--:  | -------:       | 
| tgBotToken    |  Yes      |      | 可以通过bot来管理面板  |
| X-XSRF-Token  |  Yes     |      | 自行通过抓包获取 |
| Cookie        |  Yes     |      | 自行通过抓包获取 |

> Bot指令如下：

|  命令        | 说明 |
| :----:        | :--:     |
| ```/start```    |  开始      |
| ```/help```  |  查看菜单     |
| ```/info```        |  查看Silly个人信息     |
| ```/server```  |  查看当前服务器信息     |
| ```/renew```  |  服务器续期     |
| ```/resources```  |  兑换服务器资源     |


8. 转到“Console”页面，点击“Start”按钮，即可食用。

