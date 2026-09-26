import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '../common/Button'

export function SuccessState({
  title = 'Operation Completed',
  message,
  details,
  onClose,
  closeLabel = 'Done',
}) {
  return (
    <div className="py-6 px-4 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
      <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3.5 shadow-2xs">
        <CheckCircle2 className="h-6 w-6" />
      </div>

      <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
      {message && <p className="text-xs text-slate-500 mt-1 max-w-sm">{message}</p>}

      {details && (
        <div className="mt-4 w-full rounded-md border border-slate-200 bg-slate-50/70 p-3 text-left text-xs text-slate-700 space-y-1">
          {details}
        </div>
      )}

      <div className="mt-6 w-full flex justify-center">
        <Button variant="primary" size="md" onClick={onClose} className="w-full sm:w-auto px-6">
          {closeLabel}
        </Button>
      </div>
    </div>
  )
}
