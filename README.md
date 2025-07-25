# Hacker Terminal

一个基于Web的黑客风格终端模拟器，具有矩阵雨效果、交互式命令和动态IP显示功能。

## 🚀 业务流程

该项目实现了一个完整的黑客风格终端模拟器，主要业务流程如下：

1. **系统启动**：页面加载时显示开机动画，模拟真实系统的启动过程
2. **终端初始化**：启动完成后显示终端界面，包含命令提示符和输入框
3. **命令处理**：用户输入命令后，系统根据配置文件解析并执行相应操作
4. **动态效果**：支持矩阵雨效果、打字机音效等增强用户体验
5. **网络信息**：实时显示用户IP地址、地理位置和系统运行时间

## 📁 代码结构

```
hacker-terminal/
├── index.html          # 主页面HTML文件
├── config.json         # 命令配置文件
├── css/
│   └── terminal.css    # 终端样式文件
├── js/
│   ├── terminal.js     # 核心终端逻辑
│   ├── matrix.js       # 矩阵雨效果实现
│   ├── network.js      # 网络信息获取
│   └── audio.js        # 音频效果控制
├── debug.bat           # 调试脚本
├── image.png           # 项目截图
└── README.md           # 项目说明文档
```

### 核心模块说明

- **terminal.js**: 终端核心功能，包括命令解析、历史记录、自动补全等
- **matrix.js**: 实现黑客帝国风格的矩阵雨背景效果
- **network.js**: 获取并显示用户IP地址和地理位置信息
- **audio.js**: 控制打字机音效的播放和停止
- **config.json**: 定义所有可用命令及其行为，支持函数调用和URL跳转

## 📸 截图
![主页面](./image.png)  

## 🌐 在线演示
在线演示: https://www.zhangkai.life/

## ⚙️ 配置说明

### 站点配置

项目支持通过`config.json`文件进行站点级别的配置：

```json
{
  "site": "zhangkai.life"
}
```

- **site**: 站点域名，用于动态生成页面标题和显示文本
  - 页面标题将显示为 "WELCOME TO [SITE_NAME]"
  - 开机动画中的标题将显示为 "[SITE_NAME]"（大写）
  - HTML的title标签将显示为 "[SITE_NAME]"

### 命令配置

可通过配置文件管理命令。具体格式参考config.json，支持以下命令类型：

- **function**: 内置功能命令（如help、clear、sound等）
- **redirect**: 外部链接跳转命令（如news、github、todo等）

每个命令可配置描述信息、跳转URL和提示消息。

### 配置示例

```json
{
  "site": "zhangkai.life",
  "commands": {
    "help": {
      "type": "function",
      "description": "Show available commands and their descriptions"
    },
    "github": {
      "type": "redirect",
      "url": "https://github.com/ZKGameDev",
      "description": "Open GitHub profile in new tab",
      "message": "Redirecting to GitHub..."
    }
  }
}
```