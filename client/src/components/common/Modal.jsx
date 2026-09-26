import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}) {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
      document.body.style.overflow = 'hidden'

      // Focus first focusable element inside modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus()
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        if (previousFocusRef.current) {
          previousFocusRef.current.focus()
        }
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} rounded-lg border border-slate-200 bg-white shadow-xl transition-all z-10 overflow-hidden my-8 ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-150 px-5 py-4 bg-white">
          <div className="min-w-0 pr-4">
            {title && (
              <h2 id="modal-title" className="text-base font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
