import React,{useState} from "react"
export function Tabs({defaultValue,children,...p}:any){
  const[active,setActive]=useState(defaultValue)
  return <div data-active={active} {...p}>{React.Children.map(children,c=>React.cloneElement(c,{active,setActive}))}</div>
}
export function TabsList({children,active,setActive,...p}:any){
  return <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"{...p}>{React.Children.map(children,c=>React.cloneElement(c,{active,setActive}))}</div>
}
export function TabsTrigger({value,children,active,setActive,...p}:any){
  return <button onClick={()=>setActive(value)} data-state={active===value?"active":"inactive"} className={"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"}{...p}>{children}</button>
}
export function TabsContent({value,children,active,...p}:any){
  return active===value?<div{...p}>{children}</div>:null
}
