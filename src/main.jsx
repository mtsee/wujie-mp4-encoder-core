// src/main.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // 导入根组件
import "./index.css"; // 全局样式（可选）

// 创建根容器
const root = ReactDOM.createRoot(document.getElementById("root"));

// 渲染应用
root.render(<App />);