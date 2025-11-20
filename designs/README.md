# 设计目录

此目录包含独立的设计展示案例。每个设计都应包含在自己的文件夹中，保持独立。

## 标准结构

每个设计文件夹（例如 `earth/`）应遵循以下结构：

-   **`index.html`**: 设计的入口文件。
    -   应链接到 `../../css/style.css`（可选，如果使用全局样式）或其自己的 `style.css`。
    -   应包含指向 `../../index.html` 的“返回主页”链接。
-   **`style.css`**: 该设计的特定样式。
    -   保持样式隔离，以避免移动时发生冲突。
-   **`app.js`**: 设计的 JavaScript 逻辑。
-   **`assets/`**:（可选）用于存放该设计特定的图像、模型或其他静态资源的文件夹。

## 添加新设计

1.  在 `designs/` 中创建一个新文件夹（例如 `designs/my-new-design`）。
2.  创建 `index.html`、`style.css` 和 `app.js`。
3.  在主页 `../../index.html` 的“精选设计”部分添加一张卡片。

## 示例：地球设计 (Earth Design)

`earth` 文件夹展示了这种结构：
-   `index.html`: 主要结构。
-   `style.css`: 暗色主题、玻璃拟态样式和滚动条自定义。
-   `app.js`: Three.js/Globe.gl 逻辑和 UI 交互。
