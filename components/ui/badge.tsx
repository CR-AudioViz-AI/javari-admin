import React from "react"
export function Badge({className="",variant="default",children,...p}:any){
  return <span className={"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors "+className}{...p}>{children}</span>
}
