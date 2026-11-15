'use client';
import {useState} from "react";
import {supabase} from "@/lib/supabase";
import {whatsappUrl} from "@/lib/whatsapp";
export default function EnquiryForm({divisionId,divisionName,whatsapp,productName=""}:{divisionId:"mobiles"|"jewellery"|"digital";divisionName:string;whatsapp:string;productName?:string}){
 const [name,setName]=useState("");const [phone,setPhone]=useState("");const [message,setMessage]=useState(productName?`I would like to enquire about: ${productName}`:"");const [busy,setBusy]=useState(false);const [notice,setNotice]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setNotice("");const payload={division_id:divisionId,customer_name:name,phone,message,source:"website",status:"new"};
  if(supabase){const {error}=await supabase.from("enquiries").insert(payload);if(error){setNotice("We couldn't save this enquiry. Please contact us directly on WhatsApp.");setBusy(false);return;}}
  else {setNotice("Opening WhatsApp. Connect Supabase to save enquiries in the central admin.");}
  const text=`YAGA GROUP — ${divisionName} ENQUIRY\nName: ${name}\nMobile: ${phone}\n${message}`;
  window.open(whatsappUrl(whatsapp,text),"_blank","noopener,noreferrer");setBusy(false);
 }
 return <form className="form" onSubmit={submit}><input required placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/><input required inputMode="tel" pattern="[0-9+() -]{8,18}" placeholder="Mobile number" value={phone} onChange={e=>setPhone(e.target.value)}/><textarea required placeholder="What would you like to enquire about?" value={message} onChange={e=>setMessage(e.target.value)}/><button className="btn gold" disabled={busy}>{busy?"Please wait…":"Submit enquiry on WhatsApp"}</button>{notice&&<p className="muted">{notice}</p>}</form>
}
