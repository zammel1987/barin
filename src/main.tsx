import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// 申请持久化存储，减少浏览器自动清理数据的可能
navigator.storage?.persist?.().catch(() => {})

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
