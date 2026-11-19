# billow-website

麦浪 / Billow 的官网。纯静态，没有构建步骤，没有外部依赖（不引 CDN、不引在线字体，国内外都能直接打开）。

## 文件

```
index.html          页面结构和中文文案
site.config.js      下载地址、表单地址、微信、邮箱、演示视频（改这一个文件就能接上）
assets/i18n.js      英文文案（中英各写各的，不互为翻译）
assets/styles.css   样式，颜色沿用 billow/client/src/tokens.css
assets/site.js      语言切换、表单、首屏麦田动画
favicon.svg, assets/app-icon.svg   品牌图标，拷自 billow/client/public
assets/cards/       官方角色卡形象，裁自 billow/client/public/samples（3:4，720×960）
assets/console.jpg  直播中的控制台实拍（2026-11-19 本地开发版截图，裁掉了侧栏）
```

## 本地预览

```
python3 -m http.server 8000
```

然后打开 http://localhost:8000 。直接双击 index.html 也能看。

## 上线前要填的（site.config.js）

| 项 | 不填会怎样 |
|---|---|
| `formEndpoint` 或 `email` | 内测申请提交不出去，页面会提示表单没接上 |
| `downloads.mac` / `downloads.win` | 下载按钮跳到内测申请，并提示「安装包随内测名额一起发」 |
| `wechat.id` / `wechat.qr` | 「直接聊」这一块不显示 |
| `demoVideo` | 「看她播一段」这一节不显示 |

## 语言

默认按浏览器语言选中文或英文，右上角可切换，选择会记住。也可以用链接指定：`?lang=zh`、`?lang=en`。
改中文文案改 `index.html`，改英文文案改 `assets/i18n.js` 里同名的 key。

## 部署

GitHub Pages：仓库 Settings → Pages → Source 选 `main` 分支根目录。
Vercel、Cloudflare Pages、任何静态托管也一样，根目录就是站点。
