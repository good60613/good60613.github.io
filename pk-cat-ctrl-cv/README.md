# PK 貓貓 · Ctrl+C. Ctrl+V. Ctrl+V. Then Ctrl+Z.

依「Ctrl+C / Ctrl+V prompt pack」製作的 14 秒無縫循環動畫，主角換成 PK 貓貓（金吉拉橘虎斑、青綠項圈、金色「PK」圓牌）。

- `pk-cat-ctrl-cv.mp4`：成品，1920×1080、60 fps、14.0 秒 = 840 幀、H.264 High、含合成音效（AAC 192k，約 −14 LUFS）
- `index.html`：單一 HTML（three.js 0.160，importmap 從 CDN 載入），在 Chrome 開啟即可即時播放，點一下開始並出聲
  - `?t=秒數`：凍結在某一刻（`window.renderAt(t)` 是 t 的純函式，只用種子隨機）
  - `?render=1`：把畫格迴圈交給工具
- `tools/`：逐幀渲染（`render.cjs`，150 幀一塊、`.ok` 標記可續跑）、量測（`measure.cjs`、`loop.cjs`）、編碼與母帶（`encode.sh`、`master.sh`）

## 做法摘要

- 畫面、按鍵、鏡頭、聲音讀同一條時間軸；74 個音效都比對應的畫面事件晚 1 幀
- 每次落地都會按下腳下的按鍵（4 mm，彈回）；Ctrl 在組合鍵時鎖定並發光
- 16 隻貓：1 + 1 + 2 + 4 + 8，每波錯開 2–4 幀；9.0–9.6 秒同時看向鏡頭；Ctrl+Z 時 15 隻依出現的相反順序消失，越來越快
- 無縫循環：t=14 與 t=0 的姿勢相同、速度差 ≤ 0.01（`tools/loop.cjs`）
- 渲染：1080p，MSAA 4× 加 2 個抖動子幀（動態模糊、景深、抗鋸齒），景深為自寫的散景收集；Node 端用 ffmpeg 做壓縮、增益與前瞻限幅

## 自行重現

```
npm i three@0.160.0 playwright
node tools/render.cjs frames 0 3 2     # 三個程序：0 1 2
bash tools/encode.sh
```
（渲染使用 SwiftShader 軟體 WebGL；本片在 4 核心 CPU 上約需 1.5 小時）
