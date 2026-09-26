export function Table({
  headers = [],
  children,
  emptyMessage = 'No records found',
  className = '',
}) {
  return (
    <div className={`overflow-x-auto w-full border-t sm:border border-slate-200 sm:rounded-lg bg-white shadow-2xs ${className}`}>
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            {headers.map((header, idx) => {
              const isObj = typeof header === 'object' && header !== null
              const label = isObj ? header.label : header
              const align = isObj ? header.align || 'left' : 'left'
              const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
              const extraClass = isObj ? header.className || '' : ''

              return (
                <th
                  key={idx}
                  scope="col"
                  className={`px-3.5 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap ${alignClass} ${extraClass}`}
                >
                  {label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {children || (
            <tr>
              <td colSpan={headers.length || 1} className="px-4 py-10 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
