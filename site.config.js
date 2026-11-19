/* 官网的可配置项。只改这个文件就能接上下载、表单、联系方式和演示视频。
   留空的项目，页面上对应的入口会自动隐藏或显示「随内测发放」。 */
window.BILLOW_SITE = {
  // 安装包下载地址。留空 = 按钮指向内测申请，并提示「随内测名额一起发」
  downloads: {
    mac: "",
    win: ""
  },

  // 内测申请表单的提交地址（POST JSON：email / role / note / lang）。
  // 纯静态站没有后端，可以用 Formspree、Getform、飞书多维表格的 webhook 等。
  // 例： "https://formspree.io/f/xxxxxxx"
  formEndpoint: "",

  // 英文版的内测申请：填 Google 表单的链接（表单右上角「发送」→ 链接）。
  // 填了之后，英文版的申请入口变成一个打开这份表单的按钮
  googleFormUrl: "",

  // 对外联系邮箱。formEndpoint 留空时，表单会改成打开访客的邮件客户端发到这个地址
  email: "",

  // 中文版的内测申请：填微信号，或放一张二维码图片（例 "assets/wechat-qr.png"），两个都填也行。
  // 填了之后，中文版的申请入口变成加微信
  wechat: {
    id: "",
    qr: ""
  },

  // 演示视频。填 mp4 地址（例 "assets/demo.mp4"）或 B 站 / YouTube 的嵌入地址。留空 = 不显示这一节
  demoVideo: "",
  demoPoster: ""
};
