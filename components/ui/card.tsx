import React from "react"
export function Card({className="",children,...p}:React.HTMLAttributes<HTMLDivElement>){
  return <div className={"rounded-lg border bg-card text-card-foreground shadow-sm "+className}{...p}>{children}</div>
}
export function CardHeader({className="",children,...p}:React.HTMLAttributes<HTMLDivElement>){
  return <div className={"flex flex-col space-y-1.5 p-6 "+className}{...p}>{children}</div>
}
export function CardTitle({className="",children,...p}:React.HTMLAttributes<HTMLHeadingElement>){
  return <h3 className={"text-2xl font-semibold leading-none tracking-tight "+className}{...p}>{children}</h3>
}
export function CardContent({className="",children,...p}:React.HTMLAttributes<HTMLDivElement>){
  return <div className={"p-6 pt-0 "+className}{...p}>{children}</div>
}
export function CardDescription({className="",children,...p}:React.HTMLAttributes<HTMLParagraphElement>){
  return <p className={"text-sm text-muted-foreground "+className}{...p}>{children}</p>
}
export function CardFooter({className="",children,...p}:React.HTMLAttributes<HTMLDivElement>){
  return <div className={"flex items-center p-6 pt-0 "+className}{...p}>{children}</div>
}
