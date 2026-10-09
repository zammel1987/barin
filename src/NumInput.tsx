import { useState } from 'react'

// 数字输入：保留用户输入的原始文本，避免受控 number 输入框把空值变成 0 后出现“07”
export default function NumInput({ value, onChange, decimal, ...rest }: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  decimal?: boolean
  placeholder?: string
  required?: boolean
}) {
  const [text, setText] = useState(value == null ? '' : String(value))
  return (
    <input
      {...rest}
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      value={text}
      onChange={e => {
        const t = e.target.value.replace(decimal ? /[^\d.]/g : /\D/g, '').replace(/^0+(?=\d)/, '')
        setText(t)
        onChange(t === '' || t === '.' ? undefined : Number(t))
      }}
    />
  )
}
