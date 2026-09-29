# 大学四年人生实验室

一套面向大学新生的交互式网页课件，以中国计量大学计量测试与仪器学院、测控技术与仪器专业为例，通过校园活动和专业项目，引导学生理解大学经历与个人成长的关系。

**33 页课件 · 7 处互动 · 2 段体验 · 建议授课 22 分钟**

课程由教师投影展示，全班讨论，教师记录一条共同的体验路线。最终生成的是本次课堂的模拟简历样本，不是学生个人真实履历。

## 课程内容

- **进入大学**：认识校园生活，探索参与活动的不同方式。
- **校园活动体验**：选择角色、确定优先事项、处理现场突发情况。
- **专业项目体验**：从停车雷达切入，体验基础任务与问题解决。
- **经历与简历**：根据课堂选择生成校园经历和项目经历。
- **回到当下**：放下提前决定未来的焦虑，以未来 30 天的四件小事收尾。

时间主线为 2026 年入学、2027—2028 年项目体验、2029 年秋招、2030 届毕业，结尾回到入学起点。“1460 天”和剩余天数均为教学约数。

## 功能

- 支持鼠标与键盘操作，支持全屏投影。
- 四种校园参与路径均可继续体验并生成对应简历。
- 七处互动会影响简历文案；修改某题时保留其他答案。
- 根据选择展示能力关键词与体验进度，不对学生能力评分。
- 提供讲师提示、计时器和快捷键帮助。
- 在当前浏览器自动保存页面、答案、未确认草稿和计时时间。
- 刷新后可继续上次课程；恢复后计时暂停，重置需再次确认。

项目为纯前端应用，不依赖数据库或 API 服务，不包含学生扫码、在线投票、学生账号或教师后台。进度不会在不同电脑、浏览器或网址之间同步。

## 本地运行

维护项目需要 **Node.js 24 或更高版本**，以及 npm。推荐使用 Chrome 或 Edge。

下载源码后，在包含 `package.json` 的项目目录打开终端，执行：

```sh
npm ci
npm run dev
```

打开终端显示的网址，通常为 `http://localhost:5173`。如果端口被占用，以实际输出为准。

推荐投影分辨率为 1920×1080，已检查 1366×768 下的主要授课页面。

## 构建与部署

```sh
npm run build
```

构建结果在 `dist/`：

```text
dist/
├── index.html
└── assets/
    ├── index-….js
    └── index-….css
```

**源码仓库与网页部署文件是两回事：**

- 上传 GitHub 保存和维护项目时，上传完整源码，包括 `src/`、`package.json` 和 `package-lock.json`。
- 部署已构建网页时，上传 `dist/` 内的全部内容，保持 `index.html` 与 `assets/` 的相对位置。
- 只上传源码到 GitHub 仓库，不会自动得到可访问的课程网页；还需配置静态网站发布。
- 若托管服务从源码构建，安装命令使用 `npm ci`，构建命令使用 `npm run build`，发布目录填写 `dist`。

构建采用相对资源路径，可用于网站根目录或子目录。部署后，教师通过网站链接访问，无需安装 Node.js。

本地检查构建效果：

```sh
npm run preview
```

通常打开 `http://localhost:4173`。请通过本地服务或网站访问，不要直接双击 `dist/index.html`。

## 上传 GitHub

将本项目目录中的文件上传到仓库根目录，让 `README.md`、`package.json`、`index.html` 与 `src/` 处于同一级。

应保留：

```text
src/                 课程与界面源码
scripts/             验证、预览、导出与发布脚本
docs/                教师使用说明
README.md            项目说明
package.json         依赖与运行命令
package-lock.json    依赖版本锁定文件
index.html           网页入口模板
vite.config.ts       构建配置
tsconfig*.json       TypeScript 配置
eslint.config.js     代码检查配置
.gitignore           Git 忽略规则
```

不要上传 `node_modules/`、旧 ZIP、临时截图或历史 PDF。`dist/` 可以随时从源码重新生成，默认不纳入源码仓库。

## 授课操作

| 操作 | 按键或按钮 |
| --- | --- |
| 下一页 / 上一页 | Space、→ / ← |
| 选择选项 | 鼠标，或数字 1—6，对应 A—F |
| 确认多选 | 选满指定数量后按 Enter 或点击确认 |
| 修改答案 | 点击“重新选择” |
| 讲师提示 | P；提示会显示在当前投影画面上 |
| 计时器 | T 显示；显示时按 T 开始或暂停 |
| 隐藏计时器 | 点击 ×，保持当前计时状态 |
| 全屏 | F |
| 帮助 | H；Esc 关闭 |
| 重新开始 | R，随后确认 |

第一次启用计时器会开始计时；恢复存档后保持暂停。浏览器禁止存储时仍能授课，但无法在刷新后恢复。建议每堂课只打开一个授课标签页。

完整说明见 [教师使用说明](docs/教师使用说明.md)。

## 项目结构

| 文件 | 用途 |
| --- | --- |
| `src/data/course.ts` | 页面内容、互动、时间线与讲师提示 |
| `src/data/activityCrisis.ts` | 活动故障情境、反馈与简历文案 |
| `src/components/CourseShell.tsx` | 主界面、互动与翻页控件 |
| `src/components/Resume.tsx` | 模拟简历排版 |
| `src/components/ProjectJourney.tsx` | 项目行动路线与教师参考方法 |
| `src/components/SessionDialog.tsx` | 恢复与重置确认 |
| `src/store/courseStore.ts` | 选择、进度、计时与状态派生 |
| `src/store/progressStorage.ts` | 本机存档校验与恢复 |
| `src/utils/resume.ts` | 按课堂选择生成简历 |
| `src/utils/growth.ts` | 能力关键词与体验进度 |
| `src/styles/global.css` | 页面与响应式样式 |

技术栈：React、TypeScript、Vite、Zustand、Framer Motion、Lucide React。

## 验证

```sh
npm run lint
npm run test:smoke
npm run test:storage
npm run build
```

先保持开发服务运行，再在另一终端执行：

```sh
npm run test:presenter
npm run test:session
```

浏览器测试默认访问 `http://127.0.0.1:5173`，可通过 `COURSE_URL` 环境变量覆盖。测试使用 Playwright Chromium，或本机 Chrome。

验证包括 1600 种校园选择组合、900 种项目选择组合、改选、键鼠操作、翻页状态同步、进度恢复、重置保护，以及主要页面的两种投影尺寸检查。

## 可选：PDF 导出与发布包

日常修改和网页部署不需要执行此步骤。

先运行 `npm run build`，再保持 `npm run preview` 运行，在另一终端执行：

```sh
npm run export:pdf
```

PDF 写入 `output/pdf/`。它是固定示例路线的静态预览，不能互动，不包含全部选择分支。只有重新导出的 PDF 才与当前源码一致。

需要正式压缩分发时再执行：

```sh
npm run release
```

脚本校验 PDF 与当前构建一致后，生成教学、网页部署与源码三类发布包及校验清单。已有同版本发布目录时需先归档。macOS/Linux 打包使用系统 `zip`，Windows 使用 PowerShell。

## 教学使用说明

课程中的经历、项目结果及竞赛奖项均为课堂情境推演。教师参考方法是讨论素材，不会自动作为本次已选行动写入简历。课件的目标是帮助学生理解成长来自真实经历，不用于能力测评或生成真实求职履历。
