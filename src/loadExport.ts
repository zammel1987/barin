type ExportModule = typeof import('./exportData')

// 按需加载导出模块。应用更新后旧页面可能加载不到新版本的模块，此时提示刷新
export async function withExport(fn: (m: ExportModule) => void, onError: (msg: string) => void) {
  let m: ExportModule
  try {
    m = await import('./exportData')
  } catch {
    if (confirm('应用刚更新，需要刷新页面后才能导出。现在刷新？')) location.reload()
    return
  }
  try {
    fn(m)
  } catch (err) {
    onError(`导出失败：${(err as Error).message}`)
  }
}
