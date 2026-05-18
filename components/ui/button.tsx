import React from "react"
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{variant?:string;size?:string;asChild?:boolean}
export function Button({className="",children,...p}:ButtonProps){return<button className={"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 "+className}{...p}>{children}</button>}
