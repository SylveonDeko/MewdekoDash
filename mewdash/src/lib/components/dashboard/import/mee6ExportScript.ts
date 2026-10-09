/**
 * The script members run on MEE6's own dashboard to download their settings. It reads the server ID from the page
 * address and signs requests with the session MEE6 already keeps in the browser, so nothing leaves their browser
 * except the downloaded file, and the file never contains their login.
 */
const script = `(async()=>{
const m=location.pathname.match(/dashboard\\/(\\d{15,21})/);
if(!location.hostname.endsWith("mee6.xyz")||!m){alert("Open your server's MEE6 dashboard first, then run this again.");return;}
const g=m[1];const t=JSON.parse(localStorage.getItem("token")||"null");
if(!t){alert("Log in to the MEE6 dashboard first.");return;}
const p=["welcome","levels","birthdays","moderator","twitch","economy"].map(x=>"plugins/"+x+"/config/"+g).concat([
"plugins/commands/guilds/"+g+"/commands","plugins/reaction_roles/guilds/"+g+"/messages",
"plugins/twitch/guilds/"+g+"/streamers","plugins/economy/guilds/"+g+"/wares"]);
const o={guildId:g,exportedAt:new Date().toISOString(),responses:{}};
for(const x of p){try{const r=await fetch("/api/"+x,{headers:{Authorization:t}});const s=await r.text();
let b;try{b=JSON.parse(s)}catch{b=s.slice(0,200)}o.responses[x]={status:r.status,body:b}}catch(e){o.responses[x]={status:0,body:String(e)}}
await new Promise(r=>setTimeout(r,250))}
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:"application/json"}));
a.download="mee6-settings-"+g+".json";a.click();})();`;

/** The script as pasted into the browser console. */
export const mee6ExportSnippet = script;

/** The script as a bookmark address, to drag onto the bookmarks bar. */
export const mee6ExportBookmarklet = `javascript:${encodeURIComponent(script.replace(/\n/g, ""))}`;
