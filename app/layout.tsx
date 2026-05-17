import type { Metadata } from "next"
export const metadata: Metadata = { title: "Javari Admin", description: "CR AudioViz AI Administration" }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body style={{margin:0,padding:0,background:"#0a0a0f",color:"white"}}>{children}</body></html>)
}
