import React from "react"
export function Select({children,...p}:React.SelectHTMLAttributes<HTMLSelectElement>){
  return <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"{...p}>{children}</select>
}
export const SelectTrigger=Select
export function SelectContent({children,...p}:any){return<>{children}</>}
export function SelectItem({value,children,...p}:any){return<option value={value}{...p}>{children}</option>}
export function SelectValue({placeholder,...p}:any){return<>{placeholder}</>}
