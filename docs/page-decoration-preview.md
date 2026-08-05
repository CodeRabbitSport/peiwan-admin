# 客户端页面装修与手机端预览

## 配置键

页面装修继续使用 `gamer/system-config` 的通用配置接口，旧配置键保持不变：

- `decorationConfigThemeColor`：兼容旧客户端的主色。
- `decorationConfigHomeBackground`、`decorationConfigMineBackground`、`decorationConfigOrderBackground`、`decorationConfigRankBackground`、`decorationConfigApplyBackground`、`decorationConfigApplyButton`：页面背景/按钮图片。
- `decorationConfigThemeTokens`：新的主题色系 JSON。后台页面会以颜色选择器编辑并用 `createOrUpdate` 保存。
- `decorationConfigTheme`：早期工作台使用的兼容别名，后台保存时与 `decorationConfigThemeTokens` 保持相同内容。

`decorationConfigThemeTokens`（以及兼容别名 `decorationConfigTheme`）当前结构如下（新增字段应保持可选，客户端会回退默认值）：

```json
{
  "primaryColor": "#FEC328",
  "accentColor": "#FEC328",
  "primaryTextColor": "#48371E",
  "textColor": "#48371E",
  "textSecondaryColor": "#806D4E",
  "textMutedColor": "#9C8C71",
  "textPlaceholderColor": "#B8AD9C",
  "pageBackgroundColor": "#FDFDFB",
  "surfaceColor": "#FFFDF8",
  "surfaceMutedColor": "#FBF5E5",
  "surfaceDeepColor": "#F5E5BB",
  "surfaceWarmColor": "#FDFAF2",
  "surfaceHighlightColor": "#FFF7DF",
  "surfaceCoolColor": "#D9FBFF",
  "borderColor": "#FFE8B8",
  "borderStrongColor": "#F2C55D",
  "darkColor": "#48371E",
  "lightTextColor": "#FFFAF2",
  "headerGradientStartColor": "#FDE081",
  "headerGradientEndColor": "rgb(253 224 129 / 0%)",
  "shadowColor": "rgb(72 55 30 / 16%)",
  "overlayColor": "rgb(72 55 30 / 62%)",
  "successColor": "#25A969",
  "warningColor": "#FB7F18",
  "dangerColor": "#E65A4F",
  "genderFemaleColor": "#F287C0",
  "buttonPrimaryColor": "#FEC328",
  "buttonPrimaryTextColor": "#48371E",
  "buttonHighlightColor": "rgb(255 255 255 / 35%)",
  "buttonHighlightSubtleColor": "rgb(255 255 255 / 12%)",
  "buttonOutlineColor": "#FFFDF8",
  "buttonDarkColor": "#48371E",
  "buttonDarkTextColor": "#FFFAF2",
  "popupBackgroundColor": "#FFF8E6",
  "navbarTextColor": "#48371E",
  "navbarBackgroundColor": "transparent",
  "navbarBorderColor": "#FFE8B8",
  "pageBackgroundImage": "",
  "headerBackgroundImage": "/static/ui-v2/header-bg.png",
  "loginBackgroundImage": "/static/ui-v2/login/login-bg.png",
  "popupBackgroundImage": ""
}
```

后台保存主题时同时保存 `decorationConfigThemeColor`，因此老版本客户端仍能读取主色。

## 手机端实时预览

后台优先调用 `GET /gamer/system-config/getPageDecorationPreview` 获取当前租户的 `previewUrl`；接口不可用时，页面会回退到系统配置中的 `siteConfigHtmlH5Key`（微信防红链接）和当前租户第一个 `websites` 域名，生成：

```text
https://{tenantWebsite}/html/{siteConfigHtmlH5Key}?decorationPreview=1
```

服务端 `previewUrl` 还会附带 `__preview=1`，两个参数都应保留，客户端只在预览标记存在时接受临时 `postMessage` 主题覆盖。

该地址放入 375 × 667 的手机视口 iframe。iframe 加载后，后台通过 `postMessage` 发送：

```ts
{
  type: 'peiwan-decoration-preview',
  payload: {
    themeColor: string,
    colors: Record<string, string>,
    primaryColor: string,
    accentColor: string,
    // ...其他主题色
    homeBackground: string,
    mineBackground: string,
    orderBackground: string,
    rankBackground: string,
    applyBackground: string,
    applyButton: string,
    navigationTexts: { escort: string, companion: string, rank: string }
  }
}
```

客户端 H5 在 `decorationPreview=1` 模式下监听该消息，使用统一的 `applyPageTheme`/CSS 变量入口更新颜色和背景。预览消息只用于当前 iframe，不会写入服务端；点击“保存当前分组”后配置才持久化。

后续页面应复用移动端的 `RedesignPageBackground`、`RedesignNavbar` 和上述主题变量，不在页面内重新定义固定的紫牛颜色。
