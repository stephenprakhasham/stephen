export function whatsappUrl(number:string,message:string){
  const clean=String(number||"").replace(/\D/g,"");
  if(clean.length<10&&process.env.NODE_ENV!=="production")console.warn(`[YAGA GROUP] WhatsApp number "${number}" is not valid. Set NEXT_PUBLIC_YAGA_WHATSAPP in .env.local.`);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}