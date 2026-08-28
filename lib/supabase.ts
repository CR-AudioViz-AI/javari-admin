// lib/supabase.ts May 16 2026
import{createClient as _c}from "@supabase/supabase-js"
import { secretKey, publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";
const URL=supabaseUrl()
const ANON=publishableKey()
const SVC=secretKey()??ANON
export const supabase=_c(URL,ANON)
export const supabaseAdmin=_c(URL,SVC,{auth:{persistSession:false}})
export const createClient=()=>_c(URL,ANON)
export const createClientComponentClient=()=>_c(URL,ANON)
export const createServerComponentClient=()=>_c(URL,ANON)
export async function getUser(c?:ReturnType<typeof createClient>){try{const{data:{user}}=await(c??supabase).auth.getUser();return user}catch{return null}}
export function shouldChargeCredits(e?:string|null){return!["royhenderson@craudiovizai.com"].includes(e??"")}
export function isAdmin(e?:string|null){return!shouldChargeCredits(e)}
