import { useRef, useEffect } from 'react'

// Campo di testo basato su contenteditable invece di <input>, per evitare che la
// tastiera Android agganci la barra di autofill/suggerimenti sopra il campo.
// Drop-in per input di testo controllati (value/onChange). I campi numero/data
// restano <input> nativi (il tastierino numerico non mostra quella barra).
//
// Props: value, onChange(text), onEnter?, placeholder, inputMode, enterKeyHint,
//        disabled, autoFocus, className (classi layout del consumer), ariaLabel.
export default function CEInput({
  value = '',
  onChange,
  onEnter,
  onEscape,
  placeholder = '',
  inputMode = 'text',
  enterKeyHint = 'done',
  disabled = false,
  autoFocus = false,
  className = '',
  ariaLabel,
  onFocus,
  onBlur,
}) {
  const ref = useRef(null)

  // Sincronizza il DOM col valore quando cambia dall'esterno (reset/programmatico),
  // senza disturbare la digitazione (niente salto del cursore).
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (value === '') {
      if (el.innerHTML !== '') el.innerHTML = ''
      return
    }
    if (el.textContent !== value && document.activeElement !== el) {
      el.textContent = value
    }
  }, [value])

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  return (
    <div
      ref={ref}
      role="textbox"
      contentEditable={!disabled}
      suppressContentEditableWarning
      inputMode={inputMode}
      enterKeyHint={enterKeyHint}
      spellCheck={false}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-placeholder={placeholder}
      onInput={(e) => {
        const text = e.currentTarget.textContent || ''
        if (text === '') e.currentTarget.innerHTML = ''
        onChange?.(text)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onEnter?.()
        } else if (e.key === 'Escape') {
          onEscape?.()
        }
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`ce-input whitespace-nowrap overflow-x-auto scrollbar-hide cursor-text leading-tight focus:outline-none ${className}`}
    />
  )
}
