"use client"
import * as React from "react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={["flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className].join(" ")}
      {...props}
    >
      {children}
    </select>
  )
}

export const SelectTrigger = Select
export function SelectContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>
}
export function SelectItem({ value, children, ...props }: { value: string; children: React.ReactNode } & React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option value={value} {...props}>{children}</option>
}
export function SelectValue({ placeholder, ...props }: { placeholder?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props}>{placeholder}</span>
}
