import React, { createContext, useContext, useState, useEffect, useRef } from "react";
const SUPABASE_URL = "https://txjymslgjgltafiiedhc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4anltc2xnamdsdGFmaWllZGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMDYzNTcsImV4cCI6MjA5OTc4MjM1N30.VLgNNJ5YqXwbbu7oQkjjnHk3f445wkxSfbbty4usVd4";
const sb = {
  h: {"apikey":SUPABASE_KEY,"Authorization":"Bearer "+SUPABASE_KEY,"Content-Type":"application/json","Prefer":"return=representation"},
  async get(t,q=""){const r=await fetch(SUPABASE_URL+"/rest/v1/"+t+q,{headers:this.h});if(r.ok)return r.json();const errText=await r.text().catch(()=>"");console.error("[sb.get fail]",t,q,r.status,errText);throw new Error(errText.slice(0,150)||("HTTP "+r.status));},
  async post(t,d){const r=await fetch(SUPABASE_URL+"/rest/v1/"+t,{method:"POST",headers:this.h,body:JSON.stringify(d)});if(r.ok)return r.json();const errText=await r.text().catch(()=>"");console.error("[sb.post fail]",t,r.status,errText,JSON.stringify(d));showToast("Ошибка сохранения: "+errText.slice(0,120));return null;},
  async patch(t,id,d){const r=await fetch(SUPABASE_URL+"/rest/v1/"+t+"?id=eq."+id,{method:"PATCH",headers:this.h,body:JSON.stringify(d)});if(!r.ok){const errText=await r.text().catch(()=>"");console.error("[sb.patch fail]",t,id,r.status,errText);throw new Error(errText.slice(0,150)||("HTTP "+r.status));}},
  async del(t,id){await fetch(SUPABASE_URL+"/rest/v1/"+t+"?id=eq."+id,{method:"DELETE",headers:this.h});},
  async upload(bucket,path,file){
    const r=await fetch(SUPABASE_URL+"/storage/v1/object/"+bucket+"/"+path,{
      method:"POST",
      headers:{"apikey":SUPABASE_KEY,"Authorization":"Bearer "+SUPABASE_KEY,"Content-Type":file.type,"Cache-Control":"3600","x-upsert":"true"},
      body:file
    });
    if(r.ok) return SUPABASE_URL+"/storage/v1/object/public/"+bucket+"/"+path;
    return null;
  }
};
const AppContext = createContext(null);
let _toastSetter = null;
function showToast(msg, dur=2200){
  if(_toastSetter) _toastSetter(msg);
  setTimeout(()=>{ if(_toastSetter) _toastSetter(null); }, dur);
}
function ToastHost(){
  const [msg,setMsg]=useState(null);
  useEffect(()=>{ _toastSetter=setMsg; return ()=>{_toastSetter=null;}; },[]);
  if(!msg) return null;
  return (
    <div style={{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",background:"#2D2D2D",color:"#fff",padding:"10px 18px",borderRadius:12,fontSize:13,fontWeight:600,zIndex:99999,whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
      {msg}
    </div>
  );
}
const PROMOS_DB={"VFES10":{label:"Скидка 10%",type:"pct",val:10},"TALAS50":{label:"-50 сом",type:"fixed",val:50}};
function haptic(type="light"){
  try{
    if(navigator.vibrate) navigator.vibrate(type==="light"?10:type==="medium"?20:40);
  }catch(e){}
}
const CATEGORY_GRADIENTS={
  "Пицца":"linear-gradient(135deg,#FF8A50,#FF5252)",
  "Фастфуд":"linear-gradient(135deg,#42A5F5,#7C4DFF)",
  "Суши":"linear-gradient(135deg,#26C6DA,#00897B)",
  "Гриль":"linear-gradient(135deg,#FF7043,#D84315)",
  "Азия":"linear-gradient(135deg,#AB47BC,#7B1FA2)",
  "Кофе":"linear-gradient(135deg,#8D6E63,#5D4037)",
  "Кофейня":"linear-gradient(135deg,#6D4C41,#3E2723)",
  "Десерты":"linear-gradient(135deg,#EC407A,#AD1457)",
  "Кыргызская кухня":"linear-gradient(135deg,#FF8F00,#BF360C)",
  "Шашлык":"linear-gradient(135deg,#C62828,#870000)",
  "Бургеры":"linear-gradient(135deg,#1565C0,#4A148C)",
  "Шаурма":"linear-gradient(135deg,#2E7D32,#1B5E20)",
  "Снэки":"linear-gradient(135deg,#F9A825,#E65100)",
  "Гарниры":"linear-gradient(135deg,#558B2F,#33691E)",
  "Выпечка":"linear-gradient(135deg,#EF6C00,#BF360C)",
  "Напитки":"linear-gradient(135deg,#0277BD,#01579B)",
  "Супы":"linear-gradient(135deg,#00838F,#006064)",
  "Нигири":"linear-gradient(135deg,#26C6DA,#00897B)",
  "Роллы":"linear-gradient(135deg,#26A69A,#004D40)",
  "Главные блюда":"linear-gradient(135deg,#D84315,#BF360C)",
  "Еда":"linear-gradient(135deg,#558B2F,#33691E)",
};
const getGradient=(r)=>r.gradient||CATEGORY_GRADIENTS[r.category]||"linear-gradient(135deg,#90A4AE,#546E7A)";
function isRestOpen(r){
  if(!r.hours) return r.status==="open";
  const now=new Date();
  const [oh,om]=r.hours.open.split(":").map(Number);
  const [ch,cm]=r.hours.close.split(":").map(Number);
  const cur=now.getHours()*60+now.getMinutes();
  const open=oh*60+om, close=ch*60+cm;
  return cur>=open && cur<close;
}
function getScheduleLabel(r){
  if(!r.hours) return r.status==="open"?"Открыто":"Закрыто";
  const open=isRestOpen(r);
  return open?`Открыто до ${r.hours.close}`:`Откроется в ${r.hours.open}`;
}
const RESTAURANTS_DATA = [];
const ORDERS_INIT = [];
const HISTORY_INIT = [
  {id:1039,restName:"Sushi Bar",restEmoji:"🍣",items:"Ролл Калифорния × 2",total:640,date:"27.06.2026",status:"done"},
  {id:1038,restName:"Burger Kings",restEmoji:"🍔",items:"Классик бургер × 1, Фри × 1",total:370,date:"25.06.2026",status:"done"},
  {id:1037,restName:"Pizza House",restEmoji:"🍕",items:"Маргарита × 2",total:640,date:"22.06.2026",status:"done"},
];
async function sendTelegram(token, chatId, text){
  if(!token||!chatId) return false;
  try{
    const res=await fetch("https://api.telegram.org/bot"+token+"/sendMessage",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({chat_id:chatId,text,parse_mode:"HTML"})
    });
    const data=await res.json();
    return data.ok;
  }catch(e){
    return false;
  }
}
async function sendAdminLog(tgConfig, action, details=""){
  if(!tgConfig?.adminToken||!tgConfig?.adminChatId) return;
  const now=new Date().toLocaleString("ru",{timeZone:"Asia/Bishkek"});
  const text=`📋 <b>Лог VFES</b>\n`+
    `🕐 ${now}\n`+
    `⚡ <b>${action}</b>${details?"\n"+details:""}`;
  sendTelegram(tgConfig.adminToken, tgConfig.adminChatId, text);
}
function AppProvider({children}){
  const [cart,setCart]=useState([]);
  const [restaurants,setRestaurants]=useState([]);
  const [adminRests,setAdminRests]=useState([]);
  useEffect(()=>{
    Promise.all([
      sb.get("restaurants","?order=created_at.asc"),
      sb.get("menu_items","?order=created_at.asc")
    ]).then(([restData,itemsData])=>{
      if(!Array.isArray(restData)) return;
      const items=Array.isArray(itemsData)?itemsData:[];
      const map=d=>{
        const menu=items.filter(m=>m.restaurant_id===d.id).map(m=>({
          id:m.id,name:m.name,desc:m.description||"",price:m.price,
          emoji:m.emoji||"🍽",category:m.category||"Меню",
          inStock:m.in_stock!==false,image_url:m.image_url||null
        }));
        return{id:d.id,name:d.name,category:d.category,emoji:d.emoji,
        gradient:d.gradient||"linear-gradient(135deg,#FF6B2B,#ff8c5a)",
        phone:d.phone,time:d.time||"30-40 мин",deliveryFee:d.delivery_fee||0,
        hours:{open:d.hours_open||"08:00",close:d.hours_close||"22:00"},
        status:d.status||"pending",bizPassword:d.biz_password,menu};
      };
      setAdminRests(restData.map(map));
      setRestaurants(restData.filter(d=>d.status==="open").map(map));
    }).catch(()=>{});
  },[]);
  const [orders,setOrders]=useState([]);
  useEffect(()=>{
    const loadOrders=()=>sb.get("orders","?order=created_at.desc&limit=100").then(data=>{
      if(!Array.isArray(data)) return;
      setOrders(data.map(o=>({id:o.id,restName:o.restaurant_name,restEmoji:o.restaurant_emoji,
        items:o.items,total:o.total,status:o.status,payMethod:o.pay_method,
        address:o.address,phone:o.phone,note:o.note,receiptImage:o.receipt_image,
        customer:o.customer,time:new Date(o.created_at).toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"})})));
    }).catch(()=>{});
    loadOrders();
    const interval=setInterval(loadOrders,8000);
    return()=>clearInterval(interval);
  },[]);
  const [tgConfig,setTgConfig]=useState({
    courierToken:"",
    courierChatId:"",
    supportToken:"",
    supportChatId:"",
    adminToken:"",
    adminChatId:"",
  });
  const [profile,setProfile]=useState({name:"",phone:"",address:"",firstVisit:true});
  const [darkMode,setDarkMode]=useState(false);
  const toggleDark=()=>setDarkMode(v=>!v);
  const [orderHistory,setOrderHistory]=useState(()=>{
    try{const saved=localStorage.getItem("vfes_order_history");return saved?JSON.parse(saved):HISTORY_INIT;}catch(e){return HISTORY_INIT;}
  });
  useEffect(()=>{
    try{localStorage.setItem("vfes_order_history",JSON.stringify(orderHistory));}catch(e){}
  },[orderHistory]);
  const [notifications,setNotifications]=useState([
    {id:1,text:"Ваш заказ #1041 готовится 🍳",time:"14:20",read:false},
    {id:2,text:"Pizza House: скидка 15% до конца дня!",time:"13:00",read:false},
    {id:3,text:"Заказ #1040 доставлен. Приятного аппетита! 🎉",time:"13:58",read:true},
  ]);
  const [favs,setFavs]=useState([1,3]);
  const [clientUser,setClientUser]=useState(null);
  const addToCart=(item,restaurantId)=>setCart(prev=>{
    const existingRest=prev[0]?.restaurantId;
    if(existingRest&&existingRest!==restaurantId&&prev.length>0){
      showToast("Корзина очищена — новый ресторан 🔄");
      return [{...item,qty:1,restaurantId}];
    }
    const ex=prev.find(i=>i.id===item.id);
    if(ex)return prev.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i);
    return[...prev,{...item,qty:1,restaurantId}];
  });
  const removeFromCart=(itemId)=>setCart(prev=>{const ex=prev.find(i=>i.id===itemId);if(ex?.qty===1)return prev.filter(i=>i.id!==itemId);return prev.map(i=>i.id===itemId?{...i,qty:i.qty-1}:i);});
  const clearCart=()=>setCart([]);
  const cartCount=cart.reduce((s,i)=>s+i.qty,0);
  const cartTotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const toggleStopList=(rid,iid)=>setRestaurants(prev=>prev.map(r=>r.id===rid?{...r,menu:r.menu.map(m=>m.id===iid?{...m,inStock:!m.inStock}:m)}:r));
  const updateOrderStatus=(oid,status)=>{
    setOrders(prev=>prev.map(o=>o.id===oid?{...o,status}:o));
    sb.patch("orders",oid,{status}).catch(e=>showToast("Ошибка обновления статуса: "+e.message));
    const msgs={cooking:"🍳 Ваш заказ готовится!",delivery:"🚴 Курьер уже едет к вам!",done:"✅ Заказ доставлен! Приятного аппетита!",cancelled:"❌ Заказ отменён"};
    if(msgs[status]){
      setNotifications(prev=>[{id:Date.now(),text:msgs[status],time:new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}),read:false},...prev]);
      showToast(msgs[status]);
    }
  };
  const addAdminRest=async(rest)=>{
    const newRest={...rest,id:Date.now(),menu:[],rating:0,reviews:0,promos:[]};
    setAdminRests(prev=>[...prev,newRest]);
    try{
      const res=await sb.post("restaurants",{
        name:rest.name, category:rest.category||"", emoji:rest.emoji||"🍕",
        gradient:rest.gradient||"linear-gradient(135deg,#FF6B2B,#ff8c5a)",
        phone:rest.phone||"", time:rest.time||"30-40 мин",
        delivery_fee:rest.deliveryFee||0,
        hours_open:rest.hours?.open||"08:00",
        hours_close:rest.hours?.close||"22:00",
        status:"pending", biz_password:rest.bizPassword||rest.pass||""
      });
      if(res&&res[0]){
        const savedId=res[0].id;
        setAdminRests(p=>p.map(r=>r.id===newRest.id?{...r,id:savedId}:r));
        showToast("Заведение сохранено в БД ✅");
      }
    }catch(e){showToast("Ошибка сохранения");}
  };
  const deleteAdminRest=(id)=>{
    setAdminRests(prev=>prev.filter(r=>r.id!==id));
    setRestaurants(prev=>prev.filter(r=>r.id!==id));
    sb.del("restaurants",id).catch(()=>{});
  };
  const toggleAdminStatus=(id)=>{
    setAdminRests(prev=>{
      const updated=prev.map(r=>r.id===id?{...r,status:r.status==="open"?"closed":"open"}:r);
      const r=updated.find(r=>r.id===id);
      if(r) sb.patch("restaurants",id,{status:r.status}).catch(()=>{});
      return updated;
    });
    setRestaurants(prev=>prev.map(r=>r.id===id?{...r,status:r.status==="open"?"closed":"open"}:r));
  };
  const toggleFav=(id)=>setFavs(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const markNotifRead=(id)=>setNotifications(prev=>prev.map(n=>n.id===id?{...n,read:true}:n));
  const markAllRead=()=>setNotifications(prev=>prev.map(n=>({...n,read:true})));
  const unreadCount=notifications.filter(n=>!n.read).length;
  const pushNotif=(text)=>setNotifications(prev=>[{id:Date.now(),text,time:new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}),read:false},...prev]);
  const addToHistory=(o)=>setOrderHistory(prev=>[o,...prev]);
  return <AppContext.Provider value={{
    cart,addToCart,removeFromCart,clearCart,cartCount,cartTotal,
    restaurants,toggleStopList,
    orders,updateOrderStatus,
    tgConfig,setTgConfig,
    adminRests,addAdminRest,deleteAdminRest,toggleAdminStatus,
    profile,setProfile,orderHistory,addToHistory,
    darkMode,toggleDark,
    notifications,markNotifRead,markAllRead,unreadCount,pushNotif,
    favs,toggleFav,
    clientUser,setClientUser,
  }}>{children}</AppContext.Provider>;
}
const useApp=()=>useContext(AppContext);
const O="#FF6B2B",OL="#FFF0E8",OD="#E55A1E",SL="#2D2D2D",W="#FFFFFF",GR="#F7F7F5",BD="#E0E0DC",TX="#1A1A1A",TX2="#6B6B6B",GN="#22C55E",RD="#EF4444",DARK="#1A1A2E";
const DK={
  W:"#1E1E2E",GR:"#181825",BD:"#313244",TX:"#CDD6F4",TX2:"#6C7086",
  card:"#24273A",nav:"#11111B",header:"#1E1E2E",
};
function useTheme(){
  const {darkMode}=useApp();
  return {
    W:darkMode?DK.W:W, GR:darkMode?DK.GR:GR, BD:darkMode?DK.BD:BD,
    TX:darkMode?DK.TX:TX, TX2:darkMode?DK.TX2:TX2,
    card:darkMode?DK.card:W, nav:darkMode?DK.nav:DARK,
    header:darkMode?DK.header:W, isDark:darkMode,
  };
}
function Toggle({on,onChange,label}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={onChange}>
      {label&&<span style={{fontSize:11,color:on?GN:RD,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>}
      <div style={{width:36,height:20,background:on?GN:"#D1D5DB",borderRadius:10,position:"relative",transition:"background .2s",flexShrink:0}}>
        <div style={{position:"absolute",width:16,height:16,background:"#fff",borderRadius:8,top:2,left:on?18:2,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
      </div>
    </div>
  );
}
function ClientHome({navigate}){
  const {restaurants,cartCount,orders,clientUser,darkMode,orderHistory}=useApp();
  const activeOrder=orders.find(o=>o.status==="cooking"||o.status==="new"||o.status==="delivery");
  const [cat,setCat]=useState("Все");
  const [sortBy,setSortBy]=useState("default");
  const SORTS=[{id:"default",l:"По умолчанию"},{id:"rating",l:"По рейтингу"},{id:"time",l:"По времени"},{id:"price",l:"По доставке"}];
  const dynCats=["Все",...[...new Set(restaurants.map(r=>r.category))].filter(Boolean)];
  const [search,setSearch]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  const [searchHistory,setSearchHistory]=useState(["лагман","шашлык","капучино"]);
  const doSearch=(q)=>{
    setSearch(q);
    if(q.trim()&&!searchHistory.includes(q)){
      setSearchHistory(prev=>[q,...prev].slice(0,5));
    }
  };
  const q=search.trim().toLowerCase();
  const matchesSearch=(r)=>{
    if(!q) return true;
    if(r.name.toLowerCase().includes(q)) return true;
    return r.menu.some(m=>m.name.toLowerCase().includes(q)||m.desc.toLowerCase().includes(q));
  };
  const matchedDish=(r)=>q?r.menu.find(m=>m.name.toLowerCase().includes(q)):null;
  let filtered=restaurants.filter(r=>{
    const mCat=cat==="Все"||r.category===cat.replace(/^[^\s]+\s/,"");
    return mCat&&matchesSearch(r);
  });
  if(sortBy==="rating") filtered=[...filtered].sort((a,b)=>b.rating-a.rating);
  if(sortBy==="time") filtered=[...filtered].sort((a,b)=>parseInt(a.time)-parseInt(b.time));
  if(sortBy==="price") filtered=[...filtered].sort((a,b)=>a.deliveryFee-b.deliveryFee);
    return(
    <div style={{paddingBottom:80}}>
      <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${darkMode?DK.BD:BD}`,padding:"0 14px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,position:"sticky",top:0,zIndex:100}}>
        <div style={{fontSize:22,fontWeight:900,letterSpacing:-1}}><span style={{color:O}}>V</span><span style={{color:SL}}>FES</span></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{fontSize:12,color:TX2,border:`1px solid ${BD}`,padding:"4px 9px",borderRadius:7}}>📍 Талас</div>
          <button onClick={()=>setShowSearch(s=>!s)} style={{width:34,height:34,background:showSearch?OL:GR,border:`1px solid ${showSearch?O:BD}`,borderRadius:8,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🔍</button>
          {cartCount>0&&<button onClick={()=>navigate("cart")} style={{background:O,color:"#fff",border:"none",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>🛒{cartCount}</button>}
          <button onClick={()=>navigate("login")} style={{background:darkMode?"rgba(255,255,255,0.08)":"rgba(45,45,45,0.06)",border:`1px solid ${darkMode?DK.BD:BD}`,borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,color:darkMode?"#aaa":"#888",cursor:"pointer"}}>🏪</button>
        </div>
      </div>
      {showSearch&&(
        <div style={{background:darkMode?DK.header:W,padding:"10px 14px",borderBottom:`1px solid ${darkMode?DK.BD:BD}`}}>
          <input autoFocus value={search} onChange={e=>doSearch(e.target.value)}
            placeholder="Ресторан, блюдо..." style={{width:"100%",border:`1px solid ${BD}`,borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none",background:darkMode?DK.card:GR,color:darkMode?DK.TX:TX,boxSizing:"border-box"}}/>
          {!search&&searchHistory.length>0&&(
            <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
              {searchHistory.map((h,i)=>(
                <button key={i} onClick={()=>doSearch(h)} style={{background:darkMode?DK.card:W,border:`1px solid ${darkMode?DK.BD:BD}`,borderRadius:20,padding:"3px 10px",fontSize:11,color:darkMode?DK.TX2:TX2,cursor:"pointer"}}>
                  🕐 {h}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!showSearch&&(
        <div style={{background:darkMode?"#0f0f1a":`linear-gradient(135deg,${SL},#3d3d3d)`,padding:"22px 16px",color:"#fff"}}>
          <div style={{fontSize:10,color:O,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Доставка еды {"—"} Талас</div>
          <h1 style={{fontSize:20,fontWeight:800,marginBottom:4,lineHeight:1.2}}>
            {(()=>{const h=new Date().getHours();return h<12?"Доброе утро! ☀️":h<17?"Добрый день! 🌤":h<21?"Добрый вечер! 🌆":"Доброй ночи! 🌙";})()}{clientUser?` ${clientUser.name}`:""}<br/>
            <span style={{fontSize:17,fontWeight:700}}>Еда без наценок {"—"} прямо домой</span>
          </h1>
          <p style={{fontSize:12,color:"#bbb",marginBottom:0}}>
            {clientUser?"🎁 "+orderHistory.length+" заказов  ·  ":""}Цены как в ресторане  ·  Талас
          </p>
        </div>
      )}
      <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${darkMode?DK.BD:BD}`,padding:"10px 14px",position:"sticky",top:56,zIndex:99}}>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
          { dynCats.map(dc=><button key={dc} onClick={()=>setCat(dc)} style={{padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",border:`1px solid ${cat===dc?O:BD}`,background:cat===dc?O:W,color:cat===dc?"#fff":TX2,transition:"all .15s"}}>{dc}</button>)}
        </div>
      </div>
      {}
      {activeOrder&&!search&&(
        <div onClick={()=>navigate("tracker",{orderId:activeOrder.id})} style={{margin:"12px 14px 0",background:`linear-gradient(135deg,#1a1a2e,#2d3a5a)`,borderRadius:14,padding:"13px 16px",color:"#fff",display:"flex",alignItems:"center",gap:12,cursor:"pointer",border:"1.5px solid rgba(255,107,43,0.4)"}}>
          <div style={{width:40,height:40,background:"rgba(255,107,43,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
            {activeOrder.status==="new"?"✅":activeOrder.status==="cooking"?"🍳":"🚴"}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:800,marginBottom:3}}>Заказ {"#"}{activeOrder.id}{" · "}{activeOrder.status==="new"?"Принят":activeOrder.status==="cooking"?"Готовится":"В пути"}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:5}}>{activeOrder.restName}</div>
            <div style={{background:"rgba(255,255,255,0.15)",borderRadius:4,height:3,overflow:"hidden"}}>
              <div style={{background:O,height:3,borderRadius:4,width:activeOrder.status==="new"?"25%":activeOrder.status==="cooking"?"60%":"90%",transition:"width .5s"}}/>
            </div>
          </div>
          <div style={{fontSize:18,flexShrink:0}}>{"›"}</div>
        </div>
      )}
      <div style={{padding:"0 14px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:15,fontWeight:800}}>
          {search?`Найдено по "${search}"`:cat==="Все"?"Все заведения":cat}
          <span style={{fontSize:12,color:darkMode?DK.TX2:TX2,fontWeight:400,marginLeft:6}}>({filtered.length})</span>
        </div>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{fontSize:11,color:TX2,border:`1px solid ${BD}`,borderRadius:7,padding:"4px 8px",outline:"none",background:W}}>
          {SORTS.map(s=><option key={s.id} value={s.id}>{s.l}</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 14px 16px"}}>
        {filtered.map(r=>{
          const dish=matchedDish(r);
          return(
            <div key={r.id}>
              <RestCard r={r} onClick={()=>navigate("restaurant",{restaurant:r})}/>
              {dish&&<div style={{fontSize:10,color:TX2,marginTop:4,padding:"0 2px"}}>Нашли: <strong style={{color:O}}>{dish.name}</strong></div>}
            </div>
          );
        })}
        {!filtered.length&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"40px 20px",color:TX2}}><div style={{fontSize:40,marginBottom:10}}>🔍</div><div style={{fontWeight:600}}>Ничего не найдено</div></div>}
      </div>
    </div>
  );
}
function RestCard({r,onClick}){
  const [hov,setHov]=useState(false);
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:W,borderRadius:14,overflow:"hidden",border:`1px solid ${BD}`,cursor:"pointer",transform:hov?"translateY(-2px)":"",boxShadow:hov?"0 4px 14px rgba(0,0,0,0.09)":"",transition:"all .15s",position:"relative"}}>
      {!isRestOpen(r)&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",zIndex:2,borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#fff",gap:2}}>
        <span style={{fontWeight:800,fontSize:12}}>Закрыто</span>
        <span style={{fontSize:10,opacity:.75}}>{getScheduleLabel(r)}</span>
      </div>}
      <div onClick={onClick} style={{height:88,background:getGradient(r),display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 30% 20%,rgba(255,255,255,0.25),transparent 60%)"}}/>
        <span style={{position:"relative",filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.25))"}}>{r.emoji}</span>
        <span style={{position:"absolute",top:6,left:8,background:"rgba(255,255,255,0.25)",color:"#fff",padding:"2px 8px",borderRadius:20,fontSize:9,fontWeight:700,backdropFilter:"blur(2px)"}}>{r.category}</span>
      </div>
      <div onClick={onClick} style={{padding:"9px 11px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
          <div style={{fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{r.name}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,marginBottom:5}}>
          <span style={{color:isRestOpen(r)?GN:RD,fontWeight:600}}>{isRestOpen(r)?"● Открыто":"● Закрыто"}</span>
          <span style={{color:TX2}}>{" · "}{r.time}</span>
        </div>
      </div>
    </div>
  );
}
function RestaurantPage({navigate,restaurant}){
  const {addToCart,removeFromCart,cart,cartCount,cartTotal,restaurants,favs,toggleFav,darkMode}=useApp();
  const r=restaurants.find(x=>x.id===restaurant?.id)||restaurants[0];
  const cats=[...new Set(r.menu.map(m=>m.category))];
  const [activeCat,setActiveCat]=useState(cats[0]);
  const [menuSearch,setMenuSearch]=useState("");
  const [selectedDish,setSelectedDish]=useState(null);
  const getQty=id=>cart.find(i=>i.id===id)?.qty||0;
  const displayMenu=menuSearch
    ? r.menu.filter(m=>m.name.toLowerCase().includes(menuSearch.toLowerCase())||m.desc.toLowerCase().includes(menuSearch.toLowerCase()))
    : r.menu.filter(m=>m.category===activeCat);
  return(
    <div style={{paddingBottom:cartCount>0?130:80,background:darkMode?DK.GR:GR}}>
      {selectedDish&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:500,display:"flex",alignItems:"flex-end"}} onClick={()=>setSelectedDish(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:W,borderRadius:"20px 20px 0 0",padding:"0 0 24px",width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{height:180,background:selectedDish.inStock?selectedDish.bgColor||"#FFF0E8":"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:80,position:"relative",borderRadius:"20px 20px 0 0"}}>
              {selectedDish.emoji}
              <button onClick={()=>setSelectedDish(null)} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.9)",border:"none",borderRadius:"50%",width:32,height:32,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{"✕"}</button>
              {!selectedDish.inStock&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",borderRadius:"20px 20px 0 0",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{background:RD,color:"#fff",padding:"6px 16px",borderRadius:20,fontSize:14,fontWeight:800}}>СТОП-ЛИСТ</span></div>}
            </div>
            <div style={{padding:"18px 18px 0"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>{selectedDish.name}</div>
                  <div style={{fontSize:13,color:TX2,lineHeight:1.5}}>{selectedDish.desc}</div>
                <AIDishDesc dish={selectedDish}/>
                </div>
                <div style={{fontSize:22,fontWeight:900,color:O,marginLeft:12,whiteSpace:"nowrap"}}>{selectedDish.price} сом</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,margin:"14px 0",background:GR,borderRadius:12,padding:"12px 10px"}}>
                {[{l:"Калории",v:"320 ккал"},{l:"Белки",v:"14г"},{l:"Жиры",v:"12г"},{l:"Углеводы",v:"38г"}].map((n,i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700}}>{n.v}</div>
                    <div style={{fontSize:10,color:TX2,marginTop:2}}>{n.l}</div>
                  </div>
                ))}
              </div>
              {selectedDish.inStock?(
                getQty(selectedDish.id)===0?(
                  <button onClick={()=>{addToCart(selectedDish,r.id);setSelectedDish(null);}} style={{width:"100%",background:O,color:"#fff",border:"none",padding:"14px",borderRadius:12,fontSize:15,fontWeight:800,cursor:"pointer"}}>
                    Добавить в корзину — {selectedDish.price} сом
                  </button>
                ):(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:GR,borderRadius:12,padding:"8px 12px"}}>
                    <button onClick={()=>removeFromCart(selectedDish.id)} style={{width:36,height:36,background:W,border:`1px solid ${BD}`,borderRadius:9,fontSize:18,fontWeight:700,cursor:"pointer"}}>-</button>
                    <span style={{fontSize:16,fontWeight:800}}>{getQty(selectedDish.id)}{" × "}{selectedDish.price} = {getQty(selectedDish.id)*selectedDish.price} сом</span>
                    <button onClick={()=>addToCart(selectedDish,r.id)} style={{width:36,height:36,background:O,border:"none",borderRadius:9,fontSize:18,fontWeight:700,color:"#fff",cursor:"pointer"}}>+</button>
                  </div>
                )
              ):(
                <div style={{background:"#FEE2E2",borderRadius:12,padding:14,textAlign:"center",color:RD,fontWeight:600}}>Временно недоступно</div>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={{height:160,background:getGradient(r),display:"flex",alignItems:"center",justifyContent:"center",fontSize:70,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 25% 20%,rgba(255,255,255,0.3),transparent 55%)"}}/>
        <span style={{position:"relative",filter:"drop-shadow(0 3px 10px rgba(0,0,0,0.3))"}}>{r.emoji}</span>
        <button onClick={()=>navigate("client")} style={{position:"absolute",top:12,left:12,background:"rgba(255,255,255,0.92)",border:"none",borderRadius:9,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{"←"} Назад</button>
        {cartCount>0&&<button onClick={()=>navigate("cart")} style={{position:"absolute",top:12,right:12,background:O,border:"none",borderRadius:9,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff"}}>🛒{cartCount}{" · "}{cartTotal}с</button>}
        {r.status==="closed"&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:800}}>Закрыто</div>}
      </div>
      <div style={{background:W,padding:"14px 16px",borderBottom:`1px solid ${BD}`}}>
        <div style={{fontSize:20,fontWeight:800,marginBottom:5}}>{r.name}</div>
        <div style={{fontSize:12,color:TX2,marginBottom:8}}>{r.description}</div>
        <div style={{display:"flex",gap:12,fontSize:12,flexWrap:"wrap",marginBottom:8,alignItems:"center"}}>
          <span style={{color:isRestOpen(r)?GN:RD,fontWeight:700}}>{isRestOpen(r)?"🟢 Открыто":"🔴 Закрыто"}{" · "}  до {r.hours?.close||"22:00"}</span>
          <span style={{color:TX2}}>🕐{r.time}</span>
        </div>
        <div style={{display:"flex",gap:8}}>
        </div>
      </div>
      <div style={{background:W,borderBottom:`1px solid ${BD}`,padding:"10px 16px",position:"sticky",top:0,zIndex:99}}>
        <input value={menuSearch} onChange={e=>setMenuSearch(e.target.value)} placeholder="🔍 Поиск по меню..."
          style={{width:"100%",border:`1px solid ${BD}`,borderRadius:9,padding:"8px 12px",fontSize:13,outline:"none",background:GR,boxSizing:"border-box",marginBottom:8}}/>
        {!menuSearch&&<div style={{display:"flex",gap:6,overflowX:"auto"}}>
          {cats.map(c=><button key={c} onClick={()=>setActiveCat(c)} style={{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",border:"none",background:activeCat===c?O:GR,color:activeCat===c?"#fff":TX2,transition:"all .15s"}}>{c}</button>)}
        </div>}
      </div>
      <div style={{padding:"14px 16px"}}>
        {!menuSearch&&<div style={{fontSize:15,fontWeight:800,marginBottom:12}}>{activeCat}</div>}
        {menuSearch&&displayMenu.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:TX2}}>Ничего не найдено</div>}
        {displayMenu.map(item=>{
          const qty=getQty(item.id);
          const disabled=r.status==="closed"||!item.inStock;
          return(
            <div key={item.id} style={{background:W,borderRadius:12,border:`1px solid ${BD}`,padding:"11px 13px",display:"flex",gap:10,alignItems:"center",marginBottom:9,opacity:disabled?.65:1}}>
              <div onClick={()=>setSelectedDish({...item,bgColor:r.bgColor})} style={{width:62,height:62,borderRadius:9,flexShrink:0,background:GR,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,cursor:"pointer"}}>{item.emoji}</div>
              <div onClick={()=>setSelectedDish({...item,bgColor:r.bgColor})} style={{flex:1,minWidth:0,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:13,fontWeight:700}}>{item.name}</span>
                  {!item.inStock&&<span style={{background:"#FEE2E2",color:RD,padding:"1px 6px",borderRadius:5,fontSize:10,fontWeight:700}}>СТОП</span>}
                </div>
                <div style={{fontSize:11,color:TX2,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.desc}</div>
                <div style={{fontSize:15,fontWeight:800,color:item.inStock?O:TX2}}>{item.price}с</div>
              </div>
              <div style={{flexShrink:0}}>
                {qty===0?<button onClick={()=>{if(!disabled){addToCart(item,r.id);haptic("light");}}} style={{width:34,height:34,background:disabled?"#E0E0DC":O,border:"none",borderRadius:9,color:"#fff",fontSize:19,fontWeight:700,cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                :<div style={{display:"flex",alignItems:"center",gap:7}}>
                  <button onClick={()=>removeFromCart(item.id)} style={{width:28,height:28,background:GR,border:`1px solid ${BD}`,borderRadius:7,fontSize:15,fontWeight:700,cursor:"pointer"}}>-</button>
                  <span style={{fontSize:14,fontWeight:700,minWidth:14,textAlign:"center"}}>{qty}</span>
                  <button onClick={()=>{addToCart(item,r.id);haptic("light");}} style={{width:28,height:28,background:O,border:"none",borderRadius:7,fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer"}}>+</button>
                </div>}
              </div>
            </div>
          );
        })}
      </div>
      {cartCount>0&&(
        <div style={{position:"fixed",bottom:56,left:0,right:0,padding:"10px 16px",background:W,borderTop:`1px solid ${BD}`,zIndex:98}}>
          <button onClick={()=>navigate("cart")} style={{width:"100%",background:O,color:"#fff",border:"none",padding:"13px",borderRadius:11,fontSize:14,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span>🛒 {cartCount} товара</span><span>Оформить {"—"} {cartTotal}с {"→"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
const LOYALTY_LEVELS=[
  {name:"Новичок",min:0,max:200,color:"#94A3B8",icon:"🌱",cashback:1},
  {name:"Гурман",min:200,max:600,color:"#F59E0B",icon:"⭐",cashback:3},
  {name:"Постоянный",min:600,max:1500,color:O,icon:"🔥",cashback:5},
  {name:"VIP",min:1500,max:99999,color:"#8B5CF6",icon:"👑",cashback:8},
];
function getLoyaltyLevel(pts){
  return LOYALTY_LEVELS.find(l=>pts>=l.min&&pts<l.max)||LOYALTY_LEVELS[LOYALTY_LEVELS.length-1];
}
const TALAS_STREETS=[
  "ул. Ленина 1","ул. Ленина 5","ул. Ленина 12","ул. Ленина 20","ул. Ленина 45",
  "пр. Манаса 1","пр. Манаса 5","пр. Манаса 12","пр. Манаса 20",
  "ул. Токтогула 1","ул. Токтогула 5","ул. Токтогула 8","ул. Токтогула 15",
  "пр. Жеңиш 1","пр. Жеңиш 3","пр. Жеңиш 7","пр. Жеңиш 12",
  "ул. Ыбраимова 1","ул. Ыбраимова 10","ул. Ыбраимова 22",
  "пр. Победы 1","пр. Победы 5","пр. Победы 7","пр. Победы 15",
  "ул. Фрунзе 1","ул. Фрунзе 5","ул. Фрунзе 10",
  "ул. Калинина 1","ул. Калинина 5","ул. Калинина 10",
  "мкр. Достук 1","мкр. Достук 5","мкр. Достук 10",
  "мкр. Ынтымак 1","мкр. Ынтымак 3","мкр. Ынтымак 7",
  "Базар «Таластан»","Рынок центральный","Площадь Манаса",
];
function CartPage({navigate}){
  const {cart,addToCart,removeFromCart,clearCart,cartTotal,cartCount,restaurants,profile,darkMode,addToHistory,tgConfig}=useApp();
  const [step,setStep]=useState("cart");
  const [payMethod,setPayMethod]=useState("cash");
  const [address,setAddress]=useState("");
  const [addrTouched,setAddrTouched]=useState(false);
  const [addrSuggestions,setAddrSuggestions]=useState([]);
  const [mbankConfirmed,setMbankConfirmed]=useState(false);
  const [receipt,setReceipt]=useState(null);
  const [showPayPopup,setShowPayPopup]=useState(false);
  const [orderNote,setOrderNote]=useState("");
  const [phone,setPhone]=useState("+996");
  const [phoneTouched,setPhoneTouched]=useState(false);
  const phoneValid=phone.length>=12&&phone.startsWith("+996");
  const rid=cart[0]?.restaurantId;
  const restaurant=restaurants.find(r=>r.id===rid);
  const fee=restaurant?.deliveryFee||0;
  const total=cartTotal+(fee||0);
  if(cart.length===0&&step!=="success"&&step!=="pending") return(
    <div style={{textAlign:"center",padding:"70px 20px 80px",background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
      <div style={{fontSize:72,marginBottom:16}}>🛒</div>
      <div style={{fontSize:19,fontWeight:800,marginBottom:8}}>Корзина пуста</div>
      <div style={{fontSize:13,color:TX2,marginBottom:28}}>Выберите ресторан и добавьте блюда</div>
      <button onClick={()=>navigate("client")} style={{background:O,color:"#fff",border:"none",padding:"14px 32px",borderRadius:14,fontSize:15,fontWeight:800,cursor:"pointer"}}>Выбрать блюда</button>
    </div>
  );
  if(step==="pending") return(
    <div style={{textAlign:"center",padding:"50px 20px",background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
      <div style={{fontSize:64,marginBottom:12}}>{"⏳"}</div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:8}}>Ожидаем подтверждения</div>
      <div style={{fontSize:13,color:TX2,marginBottom:24}}>Оператор проверяет оплату в течение 1-3 минут</div>
      <button onClick={()=>{clearCart();navigate("client");}} style={{background:O,color:"#fff",border:"none",padding:"13px",borderRadius:11,fontSize:14,fontWeight:700,cursor:"pointer",width:"100%"}}>На главную</button>
    </div>
  );
  if(step==="success") return(
    <div style={{textAlign:"center",padding:"60px 24px",background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
      <div style={{fontSize:72,marginBottom:8}}>🎉</div>
      <div style={{fontSize:22,fontWeight:900,marginBottom:8}}>Заказ оформлен!</div>
      <div style={{fontSize:13,color:TX2,marginBottom:28}}>Ресторан уже начинает готовить.</div>
      <button onClick={()=>{clearCart();navigate("client");}} style={{background:O,color:"#fff",border:"none",padding:"13px",borderRadius:11,fontSize:14,fontWeight:800,cursor:"pointer",width:"100%",marginBottom:10}}>На главную</button>
      <button onClick={()=>navigate("tracker",{orderId:1043})} style={{background:GR,color:TX,border:`1px solid ${BD}`,padding:"11px",borderRadius:11,fontSize:13,fontWeight:600,cursor:"pointer",width:"100%"}}>Отследить заказ</button>
    </div>
  );
  if(step==="pay"){
    const placeOrder=()=>{
      const doSave=(receiptData)=>{
        const payload={
          restaurant_name:restaurant?.name||"Ресторан",
          restaurant_emoji:restaurant?.emoji||"🍽️",
          items:cart.map(i=>({name:i.name,qty:i.qty,price:i.price})),
          total,status:"new",pay_method:payMethod,
          address:address||"",phone:phone||"",note:orderNote||"",
          receipt_image:receiptData||null,customer:profile?.name||"Клиент"
        };
        sb.post("orders",payload).then(res=>{
          const savedOrder=Array.isArray(res)&&res[0];
          const id=savedOrder?.id||(Date.now()%10000+1044);
          sendAdminLog(tgConfig,"🆕 Новый заказ",`${restaurant?.name} · ${total}с · ${address} · ${phone}`);
          addToHistory({id,restName:restaurant?.name||"Ресторан",restEmoji:restaurant?.emoji||"🍽️",
            items:cart.map(i=>i.name+" x"+i.qty).join(", "),total,
            date:new Date().toLocaleDateString("ru"),status:"new",
            note:orderNote||"",payMethod,address,phone,
            receiptImage:receiptData||null,customer:"Клиент",
            time:new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"})});
          clearCart();
          if(payMethod==="omoney"){setStep("pending");}
          else{showToast("Заказ принят!");navigate("tracker",{orderId:id});}
        }).catch(e=>{showToast("Не удалось отправить заказ: "+e.message);});
      };
      if(receipt&&payMethod==="omoney"){
        const reader=new FileReader();
        reader.onload=e=>doSave(e.target.result);
        reader.readAsDataURL(receipt);
      } else { doSave(null); }
    };
    return(
      <div style={{paddingBottom:80,background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
        <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",display:"flex",alignItems:"center",height:52,gap:12,position:"sticky",top:0,zIndex:100}}>
          <button onClick={()=>setStep("cart")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
          <div style={{fontSize:16,fontWeight:800}}>Оплата</div>
        </div>
        <div style={{padding:16}}>
          {showPayPopup&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9000,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowPayPopup(false)}>
              <div onClick={e=>e.stopPropagation()} style={{background:W,borderRadius:"20px 20px 0 0",padding:24,paddingBottom:80,width:"100%",boxSizing:"border-box"}}>
                <div style={{fontWeight:800,fontSize:17,marginBottom:14}}>Как оплатить?</div>
                <div style={{background:GR,borderRadius:12,padding:20,marginBottom:16,textAlign:"center"}}>
                  <div style={{fontSize:12,color:TX2,marginBottom:8}}>Переведите на номер</div>
                  <div style={{fontSize:32,fontWeight:900,letterSpacing:2,marginBottom:8}}>507 777 358</div>
                  <div style={{fontSize:13,color:TX2,marginBottom:14}}>O!Деньги или Mbank</div>
                  <button onClick={()=>{if(navigator.clipboard)navigator.clipboard.writeText("507777358");showToast("Скопировано");}} style={{background:O,color:"#fff",border:"none",borderRadius:10,padding:"10px 22px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Копировать</button>
                </div>
                <button onClick={()=>setShowPayPopup(false)} style={{width:"100%",background:O,color:"#fff",border:"none",padding:"13px",borderRadius:12,fontSize:14,fontWeight:800,cursor:"pointer"}}>Понятно</button>
              </div>
            </div>
          )}
          <div style={{fontWeight:700,marginBottom:10}}>Способ оплаты</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:16}}>
            {[{id:"cash",icon:"💵",label:"Наличными",sub:"При получении"},{id:"omoney",icon:"📲",label:"Онлайн",sub:"O!Деньги / Mbank"}].map(m=>(
              <button key={m.id} onClick={()=>{setPayMethod(m.id);if(m.id==="omoney")setShowPayPopup(true);}} style={{padding:"12px 8px",borderRadius:12,border:`2px solid ${payMethod===m.id?O:BD}`,background:payMethod===m.id?OL:W,cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:26,marginBottom:4}}>{m.icon}</div>
                <div style={{fontSize:12,fontWeight:700,color:payMethod===m.id?O:TX}}>{m.label}</div>
                <div style={{fontSize:10,color:TX2}}>{m.sub}</div>
              </button>
            ))}
          </div>
          {payMethod==="omoney"&&(
            <div style={{background:"#EFF6FF",borderRadius:14,border:"1px solid #BFDBFE",padding:16,marginBottom:14}}>
              <div style={{fontWeight:800,color:"#1D4ED8",marginBottom:10}}>Перевод на 507 777 358</div>
              <div style={{fontSize:12,color:"#1D4ED8",marginBottom:10}}>Сумма: <strong style={{color:O}}>{total} сом</strong></div>
              {receipt?(
                <div style={{background:"#F0FFF4",border:"1px solid #86EFAC",borderRadius:9,padding:"10px",display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:18}}>🖼</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:GN}}>Чек прикреплён</div>
                    <div style={{fontSize:11,color:TX2}}>{receipt.name}</div>
                  </div>
                  <button onClick={()=>setReceipt(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16}}>x</button>
                </div>
              ):(
                <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:GR,border:`2px dashed ${BD}`,borderRadius:9,padding:"12px",cursor:"pointer",marginBottom:8}}>
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])setReceipt(e.target.files[0]);}}/>
                  <span>📸</span>
                  <span style={{fontSize:13,color:TX2}}>Прикрепить чек</span>
                </label>
              )}
              <label style={{display:"flex",gap:10,alignItems:"center",cursor:"pointer"}}>
                <input type="checkbox" checked={mbankConfirmed} onChange={e=>setMbankConfirmed(e.target.checked)} style={{width:17,height:17,accentColor:O}}/>
                <span style={{fontSize:12}}>Я перевёл и прикрепил чек</span>
              </label>
            </div>
          )}
          <div style={{background:W,borderRadius:11,border:`1px solid ${BD}`,padding:14,marginBottom:14}}>
            {cart.map(item=>(
              <div key={item.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12,borderBottom:`1px solid ${BD}`}}>
                <span>{item.emoji} {item.name} x{item.qty}</span>
                <span style={{fontWeight:600}}>{item.price*item.qty}с</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,fontSize:15,fontWeight:800}}>
              <span>Итого</span>
              <span style={{color:O}}>{total}с</span>
            </div>
          </div>
          <button onClick={placeOrder} disabled={payMethod==="omoney"&&(!mbankConfirmed||!receipt)} style={{width:"100%",background:payMethod==="omoney"&&(!mbankConfirmed||!receipt)?"#D1D5DB":O,color:"#fff",border:"none",padding:"14px",borderRadius:11,fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:8}}>
            {payMethod==="cash"?"Оформить заказ":"Отправить заказ"}
          </button>
        </div>
      </div>
    );
  }
  return(
    <div style={{paddingBottom:80,background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
      <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",display:"flex",alignItems:"center",height:52,gap:12,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>navigate(restaurant?"restaurant":"client",{restaurant})} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
        <div style={{fontSize:16,fontWeight:800}}>Корзина</div>
        {cartCount>0&&<div style={{marginLeft:"auto",fontSize:12,color:TX2}}>{cartCount} товара</div>}
      </div>
      <div style={{padding:16}}>
        {restaurant&&(
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,background:W,padding:"11px 13px",borderRadius:11,border:`1px solid ${BD}`}}>
            <div style={{width:40,height:40,background:restaurant.gradient||O,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{restaurant.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13}}>{restaurant.name}</div>
              <div style={{fontSize:11,color:TX2}}>{"🕐"} {restaurant.time}</div>
            </div>
          </div>
        )}
        {cart.map(item=>(
          <div key={item.id} style={{background:W,borderRadius:11,border:`1px solid ${BD}`,padding:"11px 13px",display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
            <div style={{width:44,height:44,background:GR,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,overflow:"hidden"}}>
              {item.imageUrl?<img src={item.imageUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:item.emoji}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{item.name}</div>
              <div style={{fontSize:13,fontWeight:800,color:O}}>{item.price}с</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>removeFromCart(item.id)} style={{width:28,height:28,borderRadius:"50%",background:GR,border:`1px solid ${BD}`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>-</button>
              <span style={{fontSize:14,fontWeight:700,minWidth:20,textAlign:"center"}}>{item.qty}</span>
              <button onClick={()=>addToCart({...item,qty:1})} style={{width:28,height:28,borderRadius:"50%",background:O,border:"none",cursor:"pointer",fontSize:16,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
          </div>
        ))}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Адрес доставки</div>
          <div style={{position:"relative",display:"flex",gap:8}}>
            <input value={address} onChange={e=>{
              const v=e.target.value; setAddress(v);
              if(v.length>2){
                clearTimeout(window._addrTimer);
                window._addrTimer=setTimeout(()=>{
                  fetch("https://nominatim.openstreetmap.org/search?"+new URLSearchParams({q:v+" Талас Кыргызстан",format:"json",limit:5,addressdetails:1,"accept-language":"ru"}),{headers:{"User-Agent":"VFES/1.0"}})
                    .then(r=>r.json()).then(data=>{
                      setAddrSuggestions(data.map(d=>{const a=d.address||{};const p=[a.road||a.pedestrian,a.house_number].filter(Boolean);return p.length?p.join(", "):d.display_name.split(",")[0];}).filter((v,i,a)=>a.indexOf(v)===i));
                    }).catch(()=>{setAddrSuggestions(TALAS_STREETS.filter(s=>s.toLowerCase().includes(v.toLowerCase())).slice(0,5));});
                },400);
              } else { setAddrSuggestions([]); }
            }} onBlur={()=>{setAddrTouched(true);setTimeout(()=>setAddrSuggestions([]),200);}} placeholder="Введите улицу и дом..." style={{flex:1,border:`1px solid ${!address&&addrTouched?RD:address?O:BD}`,borderRadius:9,padding:"10px 13px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            <button onClick={()=>{
              if(!navigator.geolocation) return showToast("Геолокация недоступна");
              showToast("Определяем...");
              navigator.geolocation.getCurrentPosition(pos=>{
                fetch("https://nominatim.openstreetmap.org/reverse?"+new URLSearchParams({lat:pos.coords.latitude,lon:pos.coords.longitude,format:"json","accept-language":"ru"}),{headers:{"User-Agent":"VFES/1.0"}})
                  .then(r=>r.json()).then(d=>{const a=d.address||{};const p=[a.road||a.pedestrian,a.house_number].filter(Boolean);setAddress(p.length?p.join(", "):d.display_name.split(",")[0]);showToast("Адрес определён");}).catch(()=>showToast("Ошибка"));
              },()=>showToast("Разрешите геолокацию"),{enableHighAccuracy:true,timeout:8000});
            }} style={{background:address?O:GR,border:`1px solid ${BD}`,borderRadius:9,padding:"0 12px",fontSize:18,cursor:"pointer",flexShrink:0,color:address?"#fff":TX2}}>📍</button>
          </div>
          {!address&&addrTouched&&<div style={{fontSize:11,color:RD,marginTop:4}}>Укажите адрес доставки</div>}
          {addrSuggestions.length>0&&(
            <div style={{background:W,border:`1px solid ${BD}`,borderRadius:10,marginTop:4,overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",position:"relative",zIndex:100}}>
              {addrSuggestions.map((s,i)=>(
                <div key={i} onMouseDown={()=>{setAddress(s);setAddrSuggestions([]);}} style={{padding:"10px 13px",fontSize:13,cursor:"pointer",borderBottom:i<addrSuggestions.length-1?`1px solid ${BD}`:"none",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:O}}>📍</span><span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Номер телефона</div>
          <input value={phone} onChange={e=>{let v=e.target.value.replace(/[^\d+]/g,"");if(!v.startsWith("+996"))v="+996"+v.replace(/^\+996/,"");if(v.length>13)v=v.slice(0,13);setPhone(v);}} onBlur={()=>setPhoneTouched(true)} placeholder="+996 7__ ___ ___" style={{width:"100%",border:`1px solid ${!phoneValid&&phoneTouched?RD:phone.length===13?O:BD}`,borderRadius:9,padding:"10px 13px",fontSize:15,outline:"none",boxSizing:"border-box",fontWeight:600}}/>
          {!phoneValid&&phoneTouched&&<div style={{fontSize:11,color:RD,marginTop:4}}>Введите корректный номер +996 XXX XXX XXX</div>}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Комментарий</div>
          <textarea value={orderNote} onChange={e=>setOrderNote(e.target.value)} placeholder="Без лука, позвоните перед доставкой..." rows={2} style={{width:"100%",border:`1px solid ${BD}`,borderRadius:9,padding:"9px 12px",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{background:W,borderRadius:11,border:`1px solid ${BD}`,padding:14,marginBottom:14}}>
          {cart.map(item=>(
            <div key={item.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12,color:TX2,borderBottom:`1px solid ${BD}`}}>
              <span>{item.name} x{item.qty}</span>
              <span>{item.price*item.qty}с</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",fontSize:12,color:TX2}}>
            <span>Доставка</span>
            <span style={{color:fee===0?GN:TX}}>{fee===0?"Бесплатно":`${fee}с`}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,fontSize:16,fontWeight:800}}>
            <span>Итого</span>
            <span style={{color:O}}>{total}с</span>
          </div>
        </div>
        <button onClick={()=>{
          if(!address.trim()){setAddrTouched(true);showToast("Укажите адрес");return;}
          if(!phoneValid){setPhoneTouched(true);showToast("Укажите номер телефона");return;}
          setStep("pay");
        }} style={{width:"100%",background:O,color:"#fff",border:"none",padding:"14px",borderRadius:11,fontSize:15,fontWeight:800,cursor:"pointer"}}>
          Перейти к оплате
        </button>
      </div>
    </div>
  );
}
function BizPromosSection(){
  return(
    <div style={{padding:16}}>
      <div style={{background:"#FFF9F0",border:"1.5px solid #F59E0B",borderRadius:14,padding:18,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>🎁</div>
        <div style={{fontSize:15,fontWeight:800,marginBottom:6}}>Акции временно отключены</div>
        <div style={{fontSize:12,color:"#6B6B6B"}}>Скоро будет доступен раздел акций</div>
      </div>
    </div>
  );
}
function BizSettingsSection({r}){
  const [bizName,setBizName]=useState(r?.name||"");
  const [openTime,setOpenTime]=useState(r?.hours?.open||"08:00");
  const [closeTime,setCloseTime]=useState(r?.hours?.close||"22:00");
  const [isOpen,setIsOpen]=useState(r?.status==="open");
  const [payCash,setPayCash]=useState(true);
  const [payOnline,setPayOnline]=useState(true);
  const [logoUrl,setLogoUrl]=useState(r?.logoUrl||"");
  const [bannerUrl,setBannerUrl]=useState(r?.bannerUrl||"");
  const [uploading,setUploading]=useState("");
  const uploadFile=async(file,type)=>{
    if(!file||!r?.id) return showToast("Нет ID заведения");
    setUploading(type);
    try{
      const ext=file.name.split(".").pop();
      const path=type+"/"+r.id+"_"+Date.now()+"."+ext;
      const url=await sb.upload("images",path,file);
      setUploading("");
      if(url){
        if(type==="logo") setLogoUrl(url);
        else setBannerUrl(url);
        try{ await sb.patch("restaurants",r.id,{[type+"_url"]:url}); }catch(e){}
        showToast("Фото сохранено ✅");
      } else {
        showToast("Ошибка загрузки — проверьте Storage политики");
      }
    }catch(e){
      setUploading("");
      showToast("Ошибка: "+e.message);
    }
  };
  const saveName=async()=>{
    if(!r?.id) return showToast("Нет ID заведения");
    try{
      await sb.patch("restaurants",r.id,{name:bizName});
      showToast("Название сохранено ✅");
    }catch(e){showToast("Ошибка сохранения");}
  };
  const saveSchedule=async()=>{
    if(!r?.id) return showToast("Нет ID заведения");
    try{
      await sb.patch("restaurants",r.id,{hours_open:openTime,hours_close:closeTime,status:isOpen?"open":"closed"});
      showToast("Расписание сохранено ✅");
    }catch(e){showToast("Ошибка сохранения");}
  };
  return(
    <div style={{padding:16,paddingBottom:100}}>
      <div style={{background:"#FFF9F0",border:"1.5px solid #F59E0B",borderRadius:14,padding:14,marginBottom:12,display:"flex",gap:12,alignItems:"center"}}>
        <span style={{fontSize:28}}>{"⏳"}</span>
        <div>
          <div style={{fontWeight:800,fontSize:13,color:"#92400E"}}>Профиль на проверке</div>
          <div style={{fontSize:11,color:"#78350F"}}>Команда VFES проверяет ваше заведение</div>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16,marginBottom:12}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>Баннер заведения</div>
        {bannerUrl?(
          <div style={{position:"relative",marginBottom:8}}>
            <img src={bannerUrl} style={{width:"100%",height:140,objectFit:"cover",borderRadius:10}}/>
            <label style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.6)",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,color:"#fff",display:"block"}}>
              <input type="file" accept="image" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadFile(e.target.files[0],"banner")}/>
              {uploading==="banner"?"Загружаем...":"Изменить"}
            </label>
          </div>
        ):(
          <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"#F7F7F5",border:"2px dashed #E0E0DC",borderRadius:10,padding:"24px",cursor:"pointer",marginBottom:8}}>
            <input type="file" accept="image" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadFile(e.target.files[0],"banner")}/>
            <span style={{fontSize:28}}>🖼</span>
            <div>
              <div style={{fontSize:13,fontWeight:600}}>{uploading==="banner"?"Загружаем...":"Добавить баннер"}</div>
              <div style={{fontSize:11,color:"#6B6B6B"}}>1200x400px</div>
            </div>
          </label>
        )}
      </div>
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16,marginBottom:12}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>Логотип</div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:70,height:70,background:"#F7F7F5",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,overflow:"hidden",flexShrink:0}}>
            {logoUrl?<img src={logoUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:r?.emoji||"🍕"}
          </div>
          <label style={{background:"#FF6B2B",color:"#fff",borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer",display:"block"}}>
            <input type="file" accept="image" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadFile(e.target.files[0],"logo")}/>
            {uploading==="logo"?"Загружаем...":"Загрузить фото"}
          </label>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16,marginBottom:12}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:10}}>Название</div>
        <input value={bizName} onChange={e=>setBizName(e.target.value)} style={{width:"100%",border:"1px solid #E0E0DC",borderRadius:9,padding:"10px 13px",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
        <button onClick={saveName} style={{background:"#FF6B2B",color:"#fff",border:"none",padding:"10px 22px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer"}}>Сохранить</button>
      </div>
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16,marginBottom:12}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:14}}>Режим работы</div>
        <div style={{display:"flex",gap:12,marginBottom:14}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#6B6B6B",marginBottom:5}}>Открываемся</div>
            <input type="time" value={openTime} onChange={e=>setOpenTime(e.target.value)} style={{width:"100%",border:"1px solid #E0E0DC",borderRadius:9,padding:"10px 13px",fontSize:14,outline:"none",boxSizing:"border-box",fontWeight:700}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#6B6B6B",marginBottom:5}}>Закрываемся</div>
            <input type="time" value={closeTime} onChange={e=>setCloseTime(e.target.value)} style={{width:"100%",border:"1px solid #E0E0DC",borderRadius:9,padding:"10px 13px",fontSize:14,outline:"none",boxSizing:"border-box",fontWeight:700}}/>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,background:"#F7F7F5",borderRadius:10,padding:"10px 13px"}}>
          <div style={{fontWeight:600,fontSize:13}}>Принимаем заказы</div>
          <Toggle on={isOpen} onChange={()=>setIsOpen(v=>!v)}/>
        </div>
        <button onClick={saveSchedule} style={{background:"#FF6B2B",color:"#fff",border:"none",padding:"10px 22px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer"}}>Сохранить расписание</button>
      </div>
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:14}}>Способы оплаты</div>
        {[{icon:"💵",label:"Наличными",on:payCash,set:setPayCash},{icon:"📱",label:"Онлайн",on:payOnline,set:setPayOnline}].map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:i===0?"1px solid #E0E0DC":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>{p.icon}</span>
              <div style={{fontWeight:600,fontSize:13}}>{p.label}</div>
            </div>
            <Toggle on={p.on} onChange={()=>p.set(v=>!v)}/>
          </div>
        ))}
      </div>
    </div>
  );
}
function AdminPasswordsSection(){
  const ROLES=[
    {key:"admin",    label:"Администратор",       icon:"⚙️"},
    {key:"operator", label:"Оператор",            icon:"🎧"},
    {key:"investor", label:"Инвестор",            icon:"📊"},
  ];
  const [passes,setPasses]=useState({
    admin:"vfesadminsultan63649508",
    operator:"vfesop",
    investor:"vfesinvest",
  });
  const [show,setShow]=useState({});
  const [saved,setSaved]=useState(false);
  const save=()=>{
    setSaved(true);
    showToast("Пароли сохранены ✅");
    setTimeout(()=>setSaved(false),2000);
  };
  return(
    <div style={{padding:20}}>
      <div style={{fontWeight:800,fontSize:17,marginBottom:4}}>Управление паролями</div>
      <div style={{fontSize:12,color:"#6B6B6B",marginBottom:20}}>Меняйте пароли регулярно для безопасности</div>
      {ROLES.map(role=>(
        <div key={role.key} style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:24}}>{role.icon}</span>
            <div style={{fontWeight:700,fontSize:14}}>{role.label}</div>
          </div>
          <div style={{position:"relative"}}>
            <input
              type={show[role.key]?"text":"password"}
              value={passes[role.key]}
              onChange={e=>setPasses(p=>({...p,[role.key]:e.target.value}))}
              style={{width:"100%",border:"1px solid #E0E0DC",borderRadius:9,padding:"10px 44px 10px 13px",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"monospace",fontWeight:600}}
            />
            <button
              onClick={()=>setShow(p=>({...p,[role.key]:!p[role.key]}))}
              style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#6B6B6B"}}
            >
              {show[role.key]?"🙈":"👁"}
            </button>
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button
              onClick={()=>{
                const gen="vfes"+Math.random().toString(36).slice(2,10);
                setPasses(p=>({...p,[role.key]:gen}));
                setShow(p=>({...p,[role.key]:true}));
              }}
              style={{fontSize:11,color:"#6B6B6B",background:"#F7F7F5",border:"1px solid #E0E0DC",borderRadius:7,padding:"5px 10px",cursor:"pointer"}}
            >
              🎲 Генерировать
            </button>
            <button
              onClick={()=>{if(navigator.clipboard)navigator.clipboard.writeText(passes[role.key]);showToast("Скопировано");}}
              style={{fontSize:11,color:"#FF6B2B",background:"#FFF0E8",border:"none",borderRadius:7,padding:"5px 10px",cursor:"pointer"}}
            >
              Копировать
            </button>
          </div>
        </div>
      ))}
      <div style={{background:"#FEE2E2",borderRadius:12,padding:14,marginBottom:16,fontSize:12,color:"#991B1B"}}>
        {"⚠️"} После смены паролей обязательно сообщите новые пароли сотрудникам
      </div>
      <button onClick={save} style={{width:"100%",background:saved?"#22C55E":"#FF6B2B",color:"#fff",border:"none",padding:"14px",borderRadius:12,fontSize:15,fontWeight:800,cursor:"pointer",transition:"background .3s"}}>
        {saved?"Сохранено ✅":"Сохранить пароли"}
      </button>
    </div>
  );
}
const ADM_NAV=[
  {id:"dashboard",icon:"📊",label:"Главная"},
  {id:"restaurants",icon:"🏪",label:"Заведения"},
  {id:"orders",icon:"🧾",label:"Заказы"},
  {id:"integrations",icon:"🤖",label:"Боты"},
  {id:"passwords",icon:"🔑",label:"Пароли"},
];

function AdminPanel({onLogout}){
  const {orders,restaurants}=useApp();
  const [sec,setSec]=useState("dashboard");
  const [adminRests,setAdminRests]=useState(restaurants);
  const addAdminRest=()=>{};
  const deleteAdminRest=(id)=>setAdminRests(p=>p.filter(r=>r.id!==id));
  const toggleAdminStatus=(id)=>setAdminRests(p=>p.map(r=>r.id===id?{...r,status:r.status==="open"?"closed":"open"}:r));
  const sections={
    dashboard:(
      <div style={{padding:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
          {[{l:"Заведений",v:restaurants.length,c:"#FF6B2B"},{l:"Заказов",v:orders.length,c:"#3B82F6"},{l:"Выручка",v:orders.filter(o=>o.status==="done").reduce((s,o)=>s+o.total,0),c:"#22C55E"},{l:"Новых заказов",v:orders.filter(o=>o.status==="new").length,c:"#F59E0B"}].map((s,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
              <div style={{fontSize:11,color:"#6B6B6B",marginBottom:6}}>{s.l}</div>
              <div style={{fontSize:26,fontWeight:900,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:16}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Последние заказы</div>
          {orders.slice(0,5).map(o=>(
            <div key={o.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #F7F7F5",fontSize:13}}>
              <span>{"#"}{o.id} {o.customer}</span>
              <span style={{fontWeight:700,color:"#FF6B2B"}}>{o.total}с</span>
            </div>
          ))}
        </div>
      </div>
    ),
    restaurants:(<AdminRestSection/>),
    orders:(
      <div style={{padding:16}}>
        {orders.map(o=>(
          <div key={o.id} style={{background:"#fff",borderRadius:11,border:"1px solid #E0E0DC",padding:"12px 14px",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontWeight:700}}>{"#"}{o.id}</span>
              <span style={{color:"#FF6B2B",fontWeight:700}}>{o.total}с</span>
            </div>
            <div style={{fontSize:12,color:"#6B6B6B"}}>{o.restName}</div>
          </div>
        ))}
      </div>
    ),
    integrations:(<AdminBotsSection/>),
    passwords:(<AdminPasswordsSection/>),
  };
  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#F7F7F5",fontFamily:"'Inter',system-ui,sans-serif",flexDirection:"column"}}>
      <div style={{background:"#1A1A2E",display:"flex",flexDirection:"column",padding:"14px 0",flexShrink:0}}>
        <div style={{padding:"0 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff"}}><span style={{color:"#FF6B2B"}}>V</span>FES</div>
            <div style={{fontSize:11,color:"#888"}}>Администратор</div>
          </div>
          <button onClick={onLogout} style={{background:"rgba(239,68,68,0.15)",color:"#EF4444",border:"none",padding:"7px 14px",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600}}>Выйти</button>
        </div>
        <div style={{display:"flex",overflowX:"auto",padding:"0 8px 8px",gap:4}}>
          {ADM_NAV.map(n=>(
            <button key={n.id} onClick={()=>setSec(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 14px",border:"none",background:sec===n.id?"rgba(255,107,43,0.2)":"transparent",color:sec===n.id?"#FF6B2B":"#aaa",borderRadius:10,cursor:"pointer",whiteSpace:"nowrap",fontSize:11,fontWeight:sec===n.id?700:400,flexShrink:0}}>
              <span style={{fontSize:18}}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",background:"#F7F7F5"}}>{sections[sec]||sections.dashboard}</div>
    </div>
  );
}

function OrderTrackerPage({navigate,orderId}){
  const {orders,darkMode}=useApp();
  const order=orders.find(o=>o.id===orderId)||orders[0];
  const STEPS=[{id:"new",label:"Принят",icon:"✅"},{id:"cooking",label:"Готовится",icon:"🍳"},{id:"delivery",label:"В пути",icon:"🚴"},{id:"done",label:"Доставлен",icon:"📦"}];
  const stepIdx=STEPS.findIndex(s=>s.id===order?.status)||0;
  return(
    <div style={{paddingBottom:80,background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
      <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",display:"flex",alignItems:"center",height:52,gap:12,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>navigate("client")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
        <div style={{fontSize:16,fontWeight:800}}>Статус заказа</div>
      </div>
      <div style={{padding:16}}>
        {order&&(
          <div style={{background:W,borderRadius:14,border:`1px solid ${BD}`,padding:16,marginBottom:14}}>
            <div style={{fontSize:12,color:TX2,marginBottom:4}}>Заказ {"#"}{order.id}</div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{order.restName}</div>
            <div style={{fontSize:12,color:TX2}}>{Array.isArray(order.items)?order.items.map(i=>i.name+" x"+i.qty).join(", "):order.items}</div>
            <div style={{fontSize:18,fontWeight:900,color:O,marginTop:6}}>{order.total} сом</div>
          </div>
        )}
        <div style={{background:W,borderRadius:14,border:`1px solid ${BD}`,padding:16,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            {STEPS.map((s,i)=>(
              <div key={s.id} style={{flex:1,textAlign:"center"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:i<=stepIdx?O:GR,border:i<=stepIdx?"none":`2px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,margin:"0 auto 4px"}}>{s.icon}</div>
                <div style={{fontSize:10,color:i<=stepIdx?O:TX2,fontWeight:i===stepIdx?700:400}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{background:"#EEF5EE",borderRadius:12,height:80,display:"flex",alignItems:"center",justifyContent:"center",color:TX2,fontSize:13,textAlign:"center",padding:"0 12px"}}>
            {{new:"⏳ Ожидаем подтверждение заведения...",
              cooking:"🍳 Заведение готовит ваш заказ...",
              delivery:"🚴 Курьер в пути...",
              done:"✅ Заказ доставлен, приятного аппетита!",
              cancelled:"❌ Заказ был отменён"}[order?.status]||"⏳ Обрабатываем заказ..."}
          </div>
        </div>
        <a href="tel:+996507777358" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:O,borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,color:"#fff",textDecoration:"none",marginBottom:10}}>
          Позвонить курьеру
        </a>
        <a href="https://t.me/vfes_support_bot" target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"#229ED9",borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,color:"#fff",textDecoration:"none"}}>
          Telegram поддержка
        </a>
      </div>
    </div>
  );
}
function OrderHistoryPage({navigate}){
  const {orderHistory,orders,darkMode}=useApp();
  const sMap={new:{l:"Новый",bg:"#EFF6FF",c:"#1D4ED8"},cooking:{l:"Готовится",bg:"#FFF9F0",c:"#F59E0B"},delivery:{l:"В пути",bg:"#F0FFF4",c:"#16A34A"},done:{l:"Доставлен",bg:"#F0FFF4",c:"#16A34A"},cancelled:{l:"Отменён",bg:"#FEE2E2",c:"#EF4444"}};
  const list=orderHistory.map(h=>{
    const live=orders.find(o=>o.id===h.id);
    return{...h,status:live?.status||h.status};
  });
  return(
    <div style={{paddingBottom:80,background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
      <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",display:"flex",alignItems:"center",height:54,gap:12,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>navigate("profile")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
        <div style={{fontSize:16,fontWeight:800}}>Мои заказы</div>
      </div>
      <div style={{padding:16}}>
        {list.length===0&&(
          <div style={{textAlign:"center",padding:"50px 20px",color:TX2}}>
            <div style={{fontSize:44,marginBottom:10}}>🧾</div>
            <div>У вас пока нет заказов</div>
          </div>
        )}
        {list.map(o=>{
          const s=sMap[o.status]||sMap.new;
          return(
            <div key={o.id} onClick={()=>navigate("tracker",{orderId:o.id})} style={{background:darkMode?DK.card:W,borderRadius:14,border:`1px solid ${BD}`,padding:14,marginBottom:10,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <div style={{fontWeight:800,fontSize:14}}>{o.restEmoji} {o.restName}</div>
                  <div style={{fontSize:11,color:TX2,marginTop:2}}>Заказ {"#"}{o.id} · {o.date}</div>
                </div>
                <span style={{background:s.bg,color:s.c,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{s.l}</span>
              </div>
              <div style={{fontSize:12,color:TX2,marginBottom:6}}>{o.items}</div>
              <div style={{fontWeight:800,color:O}}>{o.total} сом</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function LoyaltyPage({navigate}){
  const {orderHistory,darkMode}=useApp();
  const pts=orderHistory.reduce((s,o)=>s+Math.floor((o.total||0)/100),0)+120;
  const lvl=getLoyaltyLevel(pts);
  return(
    <div style={{paddingBottom:80,background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
      <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",display:"flex",alignItems:"center",height:54,gap:12,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>navigate("client")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
        <div style={{fontSize:16,fontWeight:800}}>Программа лояльности</div>
      </div>
      <div style={{padding:16}}>
        <div style={{background:`linear-gradient(135deg,${lvl.color},${lvl.color}cc)`,borderRadius:16,padding:24,color:"#fff",textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:48,marginBottom:8}}>{lvl.icon}</div>
          <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>{lvl.name}</div>
          <div style={{fontSize:32,fontWeight:900,marginBottom:4}}>{pts}</div>
          <div style={{fontSize:13,opacity:.85}}>баллов</div>
        </div>
        {LOYALTY_LEVELS.map((l,i)=>(
          <div key={i} style={{background:darkMode?DK.card:W,borderRadius:12,border:`1px solid ${pts>=l.min?"#22C55E":BD}`,padding:"13px 15px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:24}}>{l.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13}}>{l.name}</div>
              <div style={{fontSize:11,color:TX2}}>от {l.min} баллов — кешбэк {l.cashback}%</div>
            </div>
            {pts>=l.min&&<span style={{color:"#22C55E",fontWeight:700,fontSize:12}}>Активен</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
function ReviewsPage({navigate,restaurant}){
  const {darkMode}=useApp();
  const [myRating,setMyRating]=useState(0);
  return(
    <div style={{paddingBottom:80,background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
      <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",display:"flex",alignItems:"center",height:54,gap:12,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>navigate("restaurant",{restaurant})} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
        <div style={{fontSize:16,fontWeight:800}}>Отзывы</div>
      </div>
      <div style={{padding:16}}>
        <div style={{background:W,borderRadius:14,border:`1px solid ${BD}`,padding:16,marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Оставить отзыв</div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {[1,2,3,4,5].map(s=>(
              <button key={s} onClick={()=>setMyRating(s)} style={{fontSize:28,background:"none",border:"none",cursor:"pointer",opacity:s<=myRating?1:.3}}>{"⭐"}</button>
            ))}
          </div>
          {myRating>0&&<button onClick={()=>showToast("Спасибо за отзыв!")} style={{background:O,color:"#fff",border:"none",padding:"10px 20px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer"}}>Отправить</button>}
        </div>
        {[{name:"Азиз М.",rating:5,text:"Очень вкусно!",date:"вчера"},{name:"Айгуль К.",rating:4,text:"Хорошее заведение",date:"3 дня назад"}].map((rv,i)=>(
          <div key={i} style={{background:W,borderRadius:12,border:`1px solid ${BD}`,padding:"13px 15px",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontWeight:700,fontSize:13}}>{rv.name}</div>
              <div style={{fontSize:11,color:TX2}}>{rv.date}</div>
            </div>
            <div style={{fontSize:12,color:"#F59E0B",marginBottom:4}}>{"★".repeat(rv.rating)}</div>
            <div style={{fontSize:13}}>{rv.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function NotifsPage({navigate}){
  const {notifications,markNotifRead,markAllRead,darkMode}=useApp();
  return(
    <div style={{paddingBottom:80,background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
      <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",display:"flex",alignItems:"center",height:54,gap:12,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>navigate("client")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
        <div style={{fontSize:16,fontWeight:800,flex:1}}>Уведомления</div>
        {notifications.length>0&&<button onClick={markAllRead} style={{background:GR,border:`1px solid ${BD}`,padding:"5px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}>Все прочитаны</button>}
      </div>
      <div style={{padding:16}}>
        {notifications.length===0&&(
          <div style={{textAlign:"center",padding:"50px 20px",color:TX2}}>
            <div style={{fontSize:40,marginBottom:8}}>🔔</div>
            <div>Уведомлений пока нет</div>
          </div>
        )}
        {notifications.map(n=>(
          <div key={n.id} onClick={()=>markNotifRead(n.id)} style={{background:n.read?W:"#FFF0E8",borderRadius:12,border:`1px solid ${BD}`,padding:"13px 15px",marginBottom:8,cursor:"pointer"}}>
            <div style={{fontSize:13,fontWeight:n.read?400:700}}>{n.text}</div>
            <div style={{fontSize:11,color:TX2,marginTop:4}}>{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function AIChatPage({navigate}){
  const {darkMode}=useApp();
  const [msgs,setMsgs]=useState([{role:"assistant",text:"Привет! Я AI-помощник VFES. Помогу выбрать блюдо или расскажу о ресторанах Таласа!"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send=async(text)=>{
    if(!text.trim()) return;
    const userMsg=text.trim();
    setMsgs(m=>[...m,{role:"user",text:userMsg}]);
    setInput(""); setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:500,
          system:"Ты AI-помощник VFES — доставка еды в Таласе, Кыргызстан. Отвечай кратко по-русски.",
          messages:[...msgs,{role:"user",content:userMsg}].map(m=>({role:m.role,content:m.text}))})
      });
      const data=await res.json();
      setMsgs(m=>[...m,{role:"assistant",text:data.content?.[0]?.text||"Попробуйте позже."}]);
    }catch(e){setMsgs(m=>[...m,{role:"assistant",text:"Нет связи."}]);}
    setLoading(false);
  };
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:darkMode?DK.GR:GR}}>
      <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",display:"flex",alignItems:"center",height:54,gap:12,flexShrink:0}}>
        <button onClick={()=>navigate("client")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
        <div style={{fontSize:16,fontWeight:800}}>AI Помощник</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:16}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
            <div style={{maxWidth:"80%",background:m.role==="user"?O:W,color:m.role==="user"?"#fff":"#1A1A1A",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",fontSize:13,lineHeight:1.5}}>{m.text}</div>
          </div>
        ))}
        {loading&&<div style={{fontSize:13,color:TX2,padding:"8px 14px"}}>...</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"8px 16px 16px",display:"flex",gap:8,flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} placeholder="Спросите что-нибудь..." style={{flex:1,border:`1px solid ${BD}`,borderRadius:24,padding:"10px 16px",fontSize:14,outline:"none"}}/>
        <button onClick={()=>send(input)} style={{background:O,color:"#fff",border:"none",width:44,height:44,borderRadius:"50%",fontSize:18,cursor:"pointer"}}>{"→"}</button>
      </div>
    </div>
  );
}
function ProfilePage({navigate}){
  const {profile,setProfile,orderHistory,darkMode,toggleDark,clientUser}=useApp();
  const pts=orderHistory.reduce((s,o)=>s+Math.floor((o.total||0)/100),0)+120;
  const lvl=getLoyaltyLevel(pts);
  return(
    <div style={{paddingBottom:80,background:darkMode?DK.GR:GR,minHeight:"100vh"}}>
      <div style={{background:darkMode?DK.header:W,borderBottom:`1px solid ${BD}`,padding:"0 16px",display:"flex",alignItems:"center",height:54,gap:12,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>navigate("client")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
        <div style={{fontSize:16,fontWeight:800}}>Профиль</div>
      </div>
      <div style={{padding:16}}>
        <div style={{background:W,borderRadius:16,border:`1px solid ${BD}`,padding:18,marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:64,height:64,background:"linear-gradient(135deg,#FF6B2B,#ff8c5a)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>
            {clientUser?.name?clientUser.name[0].toUpperCase():"👤"}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:800}}>{clientUser?.name||"Гость"}</div>
            <div style={{fontSize:13,color:TX2,marginTop:2}}>{clientUser?.phone||"Войдите в аккаунт"}</div>
          </div>
        </div>
        <div onClick={()=>navigate("loyalty")} style={{background:`linear-gradient(135deg,${lvl.color},${lvl.color}cc)`,borderRadius:14,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",color:"#fff"}}>
          <div>
            <div style={{fontSize:11,opacity:.8,marginBottom:2}}>Программа лояльности</div>
            <div style={{fontSize:16,fontWeight:800}}>{lvl.icon} {lvl.name}</div>
            <div style={{fontSize:12,opacity:.85,marginTop:2}}>{pts} баллов — кешбэк {lvl.cashback}%</div>
          </div>
          <div style={{fontSize:24}}>{"›"}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <button onClick={()=>navigate("history")} style={{background:W,border:`1px solid ${BD}`,borderRadius:12,padding:"13px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <span style={{fontSize:20}}>{"🧾"}</span>
            <div style={{textAlign:"left"}}><div style={{fontWeight:700}}>Мои заказы</div><div style={{fontSize:10,color:TX2}}>{orderHistory.length} заказов</div></div>
          </button>
          <button onClick={()=>navigate("about")} style={{background:W,border:`1px solid ${BD}`,borderRadius:12,padding:"13px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <span style={{fontSize:20}}>{"ℹ️"}</span>
            <div style={{textAlign:"left"}}><div style={{fontWeight:700}}>О нас</div><div style={{fontSize:10,color:TX2}}>Контакты</div></div>
          </button>
          <div onClick={toggleDark} style={{background:W,border:`1px solid ${BD}`,borderRadius:12,padding:"13px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <span style={{fontSize:20}}>{darkMode?"🌙":"☀️"}</span>
            <div><div style={{fontWeight:700}}>{darkMode?"Тёмная":"Светлая"}</div><div style={{fontSize:10,color:TX2}}>Тема</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
function AboutPage({navigate}){
  return(
    <div style={{paddingBottom:80}}>
      <div style={{background:"#fff",borderBottom:"1px solid #E0E0DC",padding:"0 16px",display:"flex",alignItems:"center",height:54,gap:12,position:"sticky",top:0,zIndex:100}}>
        <button onClick={()=>navigate("client")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
        <div style={{fontSize:16,fontWeight:800}}>О нас</div>
      </div>
      <div style={{background:"linear-gradient(135deg,#2D2D2D,#1a2a4a)",padding:"32px 20px",textAlign:"center",color:"#fff"}}>
        <div style={{fontSize:48,marginBottom:12}}><span style={{color:"#FF6B2B",fontWeight:900}}>V</span><span style={{fontWeight:900}}>FES</span></div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.7}}>Первый сервис доставки еды в Таласе без наценок.</div>
      </div>
      <div style={{padding:16}}>
        {[{icon:"💰",title:"Честные цены",desc:"Цены как в меню ресторана"},{icon:"⚡",title:"Быстрая доставка",desc:"Среднее время 30 минут"},{icon:"🤝",title:"Местные рестораны",desc:"Только заведения Таласа"}].map((v,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:12,border:"1px solid #E0E0DC",padding:"13px 15px",marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{fontSize:24,flexShrink:0}}>{v.icon}</span>
            <div><div style={{fontWeight:700,marginBottom:3}}>{v.title}</div><div style={{fontSize:12,color:"#6B6B6B"}}>{v.desc}</div></div>
          </div>
        ))}
        <a href="https://t.me/vfes_talas" target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:12,background:"#fff",borderRadius:11,border:"1px solid #E0E0DC",padding:"12px 14px",marginBottom:8,textDecoration:"none",color:"#1A1A1A"}}>
          <span style={{fontSize:20,flexShrink:0}}>📬</span>
          <div><div style={{color:"#6B6B6B"}}>Telegram</div><div style={{fontSize:13,fontWeight:600,color:"#FF6B2B",marginTop:1}}>@vfes_talas</div></div>
        </a>
      </div>
    </div>
  );
}
function AuthPage({navigate}){
  const {clientUser,setClientUser}=useApp();
  const [step,setStep]=useState("phone");
  const [phone,setPhone]=useState("+996 ");
  const [code,setCode]=useState("");
  const [name,setName]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const sendCode=()=>{
    if(phone.replace(/\D/g,"").length<11){setErr("Введите номер");return;}
    setLoading(true);setTimeout(()=>{setLoading(false);setStep("code");showToast("Демо-код: 1234");},900);
  };
  const verifyCode=()=>{
    if(code!=="1234"){setErr("Неверный код");return;}
    setLoading(true);setTimeout(()=>{setLoading(false);if(clientUser)navigate("profile");else setStep("name");},800);
  };
  const finish=()=>{
    if(!name.trim()){setErr("Введите имя");return;}
    setClientUser({name:name.trim(),phone});
    showToast("Добро пожаловать, "+name.trim()+"!");
    navigate("profile");
  };
  if(clientUser) return(
    <div style={{paddingBottom:80}}>
      <div style={{background:"#fff",borderBottom:"1px solid #E0E0DC",padding:"0 16px",display:"flex",alignItems:"center",height:54,gap:12}}>
        <button onClick={()=>navigate("client")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{"←"}</button>
        <div style={{fontSize:16,fontWeight:800}}>Аккаунт</div>
      </div>
      <div style={{padding:20}}>
        <div style={{background:"linear-gradient(135deg,#FF6B2B,#ff8c5a)",borderRadius:20,padding:24,color:"#fff",textAlign:"center",marginBottom:20}}>
          <div style={{width:70,height:70,background:"rgba(255,255,255,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 12px"}}>{clientUser.name[0].toUpperCase()}</div>
          <div style={{fontSize:22,fontWeight:800}}>{clientUser.name}</div>
          <div style={{fontSize:13,opacity:.85,marginTop:4}}>{clientUser.phone}</div>
        </div>
        <button onClick={()=>{setClientUser(null);showToast("Вы вышли");navigate("client");}} style={{width:"100%",background:"#FEE2E2",color:"#EF4444",border:"1px solid #FCA5A5",padding:"13px",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>Выйти из аккаунта</button>
      </div>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#2D2D2D,#1a2a4a)",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 16px 0"}}>
        <button onClick={()=>navigate("client")} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:9,width:34,height:34,fontSize:18,cursor:"pointer",color:"#fff"}}>{"←"}</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px"}}>
        <div style={{fontSize:42,marginBottom:12}}>{step==="phone"?"📱":step==="code"?"🔐":"👤"}</div>
        <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:20,textAlign:"center"}}>{step==="phone"?"Войти":step==="code"?"Введите код":"Ваше имя"}</div>
        <div style={{width:"100%",maxWidth:320}}>
          {step==="phone"&&<input value={phone} onChange={e=>{setPhone(e.target.value);setErr("");}} placeholder="+996 700 000 000" style={{width:"100%",background:"rgba(255,255,255,0.1)",border:`1.5px solid ${err?"#EF4444":"rgba(255,255,255,0.15)"}`,borderRadius:14,padding:"14px 18px",fontSize:16,color:"#fff",outline:"none",boxSizing:"border-box",marginBottom:8}}/>}
          {step==="code"&&<input value={code} onChange={e=>{setCode(e.target.value.replace(/\D/g,"").slice(0,4));setErr("");}} placeholder="1234" maxLength={4} style={{width:"100%",background:"rgba(255,255,255,0.1)",border:`1.5px solid ${err?"#EF4444":"rgba(255,255,255,0.15)"}`,borderRadius:14,padding:"14px 18px",fontSize:28,color:"#fff",outline:"none",boxSizing:"border-box",marginBottom:8,letterSpacing:8,textAlign:"center",fontWeight:800}}/>}
          {step==="name"&&<input value={name} onChange={e=>{setName(e.target.value);setErr("");}} placeholder="Ваше имя" style={{width:"100%",background:"rgba(255,255,255,0.1)",border:`1.5px solid ${err?"#EF4444":"rgba(255,255,255,0.15)"}`,borderRadius:14,padding:"14px 18px",fontSize:16,color:"#fff",outline:"none",boxSizing:"border-box",marginBottom:8}}/>}
          {err&&<div style={{fontSize:12,color:"#FCA5A5",marginBottom:8,textAlign:"center"}}>{err}</div>}
          <button onClick={step==="phone"?sendCode:step==="code"?verifyCode:finish} disabled={loading} style={{width:"100%",background:loading?"rgba(255,107,43,0.5)":"#FF6B2B",color:"#fff",border:"none",padding:"15px",borderRadius:14,fontSize:15,fontWeight:800,cursor:loading?"not-allowed":"pointer"}}>
            {loading?"...":step==="phone"?"Получить код":step==="code"?"Подтвердить":"Начать"}
          </button>
        </div>
      </div>
    </div>
  );
}
function StaffLoginPage({navigate,onSuccess}){
  const CREDS=[
    {pass:"vfes2026",   role:"biz",      label:"Кабинет заведения",    icon:"🏪"},
    {pass:"vfesadminsultan63649508",role:"admin",label:"Администратор",icon:"⚙️"},
    {pass:"vfesop",    role:"operator",  label:"Оператор",              icon:"🎧"},
    {pass:"vfesinvest",role:"investor",  label:"Инвестор",              icon:"📊"},
  ];
  const [pass,setPass]=useState("");
  const [showPass,setShowPass]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const handleLogin=async()=>{
    if(!pass.trim()){setErr("Введите пароль");return;}
    setLoading(true);setErr("");
    const match=CREDS.find(cr=>cr.pass===pass.trim());
    if(match){showToast(match.label+" ✅");onSuccess(match.role);return;}
    try{
      const data=await sb.get("restaurants","?biz_password=eq."+encodeURIComponent(pass.trim())+"&limit=1");
      if(Array.isArray(data)&&data.length>0){
        const biz=data[0];
        const r={id:biz.id,name:biz.name,category:biz.category,emoji:biz.emoji,
          gradient:biz.gradient||"linear-gradient(135deg,#FF6B2B,#ff8c5a)",
          phone:biz.phone,time:biz.time||"30-40 мин",deliveryFee:biz.delivery_fee||0,
          hours:{open:biz.hours_open||"08:00",close:biz.hours_close||"22:00"},
          status:biz.status,bizPassword:biz.biz_password,
          logoUrl:biz.logo_url||"",bannerUrl:biz.banner_url||"",menu:[]};
        showToast(biz.name+" ✅");
        onSuccess("biz",r);
      } else {
        setErr("Неверный пароль");setLoading(false);
      }
    }catch(e){setErr("Ошибка подключения");setLoading(false);}
  };
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#1a1a2e,#16213e)",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 16px 0",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>navigate("client")} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:9,width:34,height:34,fontSize:18,cursor:"pointer",color:"#fff"}}>{"←"}</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px"}}>
        <div style={{fontSize:44,fontWeight:900,marginBottom:4,letterSpacing:-2}}><span style={{color:"#FF6B2B"}}>V</span><span style={{color:"#fff"}}>FES</span></div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:32,letterSpacing:1}}>СЛУЖЕБНЫЙ ВХОД</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:24,width:"100%",maxWidth:320}}>
          {CREDS.map(cr=>(
            <div key={cr.role} style={{background:"rgba(255,255,255,0.05)",borderRadius:12,padding:"12px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{fontSize:22,marginBottom:4}}>{cr.icon}</div>
              <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.65)",lineHeight:1.3}}>{cr.label}</div>
            </div>
          ))}
        </div>
        <div style={{width:"100%",maxWidth:320}}>
          <div style={{position:"relative",marginBottom:12}}>
            <input value={pass} onChange={e=>{setPass(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handleLogin()} type={showPass?"text":"password"} placeholder="Введите пароль..." style={{width:"100%",background:"rgba(255,255,255,0.07)",border:`1.5px solid ${err?"#EF4444":pass?"rgba(255,107,43,0.5)":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:"14px 48px 14px 18px",fontSize:15,color:"#fff",outline:"none",boxSizing:"border-box"}}/>
            <button onClick={()=>setShowPass(v=>!v)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,0.35)",fontSize:18,cursor:"pointer"}}>{showPass?"🙈":"👁"}</button>
          </div>
          {err&&<div style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"8px 14px",fontSize:12,color:"#FCA5A5",marginBottom:12,textAlign:"center"}}>{err}</div>}
          <button onClick={handleLogin} disabled={loading||!pass.trim()} style={{width:"100%",background:pass.trim()&&!loading?"#FF6B2B":"rgba(255,107,43,0.25)",color:"#fff",border:"none",padding:"15px",borderRadius:14,fontSize:15,fontWeight:800,cursor:pass.trim()&&!loading?"pointer":"not-allowed"}}>
            {loading?"Проверяем...":"Войти"}
          </button>
          <div style={{marginTop:16,textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.18)"}}>Обратитесь к администратору VFES</div>
          <div style={{marginTop:12,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 14px",textAlign:"center"}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>
              Вы клиент? 🛍️<br/>
              <span style={{color:"rgba(255,107,43,0.7)",fontWeight:600}}>Скоро появится личный кабинет.</span><br/>
              <span style={{fontSize:11}}>Пока заказывайте без регистрации</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function BizOrdersSection({orders,sMap,setDetailOrder,updateOrderStatus,tgConfig}){
  const [f,setF]=useState("all");
  const fl=f==="all"?orders:orders.filter(o=>o.status===f);
  return(
    <div style={{padding:16}}>
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto"}}>
        {[{id:"all",l:"Все"},{id:"new",l:"Новые"},{id:"cooking",l:"Готовятся"},{id:"done",l:"Готово"}].map(tab=>(
          <button key={tab.id} onClick={()=>setF(tab.id)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",background:f===tab.id?"#FF6B2B":"#F7F7F5",color:f===tab.id?"#fff":"#6B6B6B",whiteSpace:"nowrap"}}>{tab.l}</button>
        ))}
      </div>
      {fl.length===0&&<div style={{textAlign:"center",padding:"30px 20px",color:"#6B6B6B"}}><div style={{fontSize:36,marginBottom:7}}>📭</div><div>Заказов нет</div></div>}
      {fl.map(o=>{
        const s=sMap[o.status]||sMap.done;
        const itemsStr=Array.isArray(o.items)?o.items.map(i=>i.name+" x"+i.qty).join(", "):o.items;
        return(
          <div key={o.id} style={{background:"#fff",borderRadius:11,border:"1px solid #E0E0DC",padding:"13px 15px",marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <div><span style={{fontWeight:800,}}>{"#"}{o.id}</span><span style={{marginLeft:8,fontSize:12,color:"#6B6B6B"}}>{o.customer}</span></div>
              <span style={{background:s.bg,color:s.c,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>{s.l}</span>
            </div>
            <div style={{fontSize:12,color:"#6B6B6B",marginBottom:6}}>{itemsStr}</div>
            {o.phone&&<div style={{fontSize:11,color:"#6B6B6B",marginBottom:4}}>{"📞"} {o.phone}</div>}
            {o.address&&<div style={{fontSize:11,color:"#6B6B6B",marginBottom:4}}>{"📍"} {o.address}</div>}
            {o.receiptImage&&(
              <div style={{display:"flex",alignItems:"center",gap:8,background:"#F0FFF4",borderRadius:7,padding:"6px 10px",marginBottom:6}}>
                <img src={o.receiptImage} alt="чек" style={{width:36,height:36,objectFit:"cover",borderRadius:5,border:"1px solid #86EFAC"}}/>
                <div style={{fontSize:11,fontWeight:700,color:"#16A34A"}}>Чек прикреплён</div>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:15,fontWeight:800,color:"#FF6B2B"}}>{o.total}с</span>
              <div style={{display:"flex",gap:7}}>
                {o.status==="new"&&<>
                  <button onClick={()=>{updateOrderStatus(o.id,"cooking");sendAdminLog(tgConfig,"🍳 Заказ принят заведением",`#${o.id} · ${o.total}с`);showToast("Принят");}} style={{background:"#22C55E",color:"#fff",border:"none",padding:"5px 12px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>Принять</button>
                  <button onClick={()=>{updateOrderStatus(o.id,"cancelled");showToast("Отклонён");}} style={{background:"#FEE2E2",color:"#EF4444",border:"none",padding:"5px 12px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>Отклонить</button>
                </>}
                {o.status==="cooking"&&<button onClick={()=>{updateOrderStatus(o.id,"done");sendAdminLog(tgConfig,"📦 Заказ готов",`#${o.id} · ${o.total}с`);showToast("Готово!");}} style={{background:"#FF6B2B",color:"#fff",border:"none",padding:"5px 12px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>Готово</button>}
                <button onClick={()=>setDetailOrder(o)} style={{background:"#F7F7F5",color:"#6B6B6B",border:"1px solid #E0E0DC",padding:"5px 10px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>Детали</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
function BizMenuSection({r}){
  const [menuItems,setMenuItems]=useState([]);
  const [activeCat,setActiveCat]=useState("Основное");
  const [menuCats,setMenuCats]=useState(["Основное"]);
  const [showForm,setShowForm]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [form,setForm]=useState({name:"",price:"",desc:"",emoji:"🍽️",category:"Основное",inStock:true,imageUrl:""});
  const [showCatForm,setShowCatForm]=useState(false);
  const [newCat,setNewCat]=useState("");
  const [uploadingImg,setUploadingImg]=useState(false);
  const EMOJIS=["🍕","🍔","🥩","☕","🍜","🍣","🍖","🌯","🥗","🍱","🥐","🍰","🍩","🌮","🥘","🍲"];
  useEffect(()=>{
    if(!r?.id) return;
    sb.get("menu_items","?restaurant_id=eq."+r.id+"&order=created_at.asc").then(data=>{
      if(!Array.isArray(data)||data.length===0) return;
      const items=data.map(d=>({id:d.id,name:d.name,price:d.price,desc:d.description||"",emoji:d.emoji||"🍽️",category:d.category||"Основное",inStock:d.in_stock!==false,imageUrl:d.image_url||""}));
      setMenuItems(items);
      const cats=[...new Set(items.map(i=>i.category))];
      if(cats.length>0){setMenuCats(cats);setActiveCat(cats[0]);}
    }).catch(()=>{});
  },[r?.id]);
  const uploadImage=async(file)=>{
    if(!file) return null;
    setUploadingImg(true);
    const ext=file.name.split(".").pop();
    const path="menu/"+Date.now()+"."+ext;
    const url=await sb.upload("images",path,file);
    setUploadingImg(false);
    return url;
  };
  const save=async()=>{
    if(!form.name.trim()||!form.price) return showToast("Заполните поля");
    let imageUrl=form.imageUrl||"";
    if(form._imageFile){
      showToast("Загружаем фото...");
      const uploaded=await uploadImage(form._imageFile);
      if(uploaded) imageUrl=uploaded;
    }
    const item={id:editItem||Date.now(),name:form.name.trim(),price:Number(form.price),desc:form.desc,emoji:form.emoji,category:form.category,inStock:form.inStock,imageUrl};
    if(editItem){
      setMenuItems(p=>p.map(m=>m.id===editItem?item:m));
      sb.patch("menu_items",editItem,{name:item.name,price:item.price,description:item.desc,emoji:item.emoji,category:item.category,in_stock:item.inStock,image_url:imageUrl}).catch(()=>{});
    } else {
      setMenuItems(p=>[...p,item]);
      sb.post("menu_items",{restaurant_id:r?.id,name:item.name,price:item.price,description:item.desc,emoji:item.emoji,category:item.category,in_stock:item.inStock,image_url:imageUrl}).then(res=>{
        if(res&&res[0]) setMenuItems(p=>p.map(m=>m.id===item.id?{...m,id:res[0].id}:m));
      }).catch(e=>{showToast("Сетевая ошибка: "+e.message);});
    }
    showToast(editItem?"Обновлено":"Добавлено");
    setShowForm(false);setEditItem(null);
    setForm({name:"",price:"",desc:"",emoji:"🍽️",category:activeCat,inStock:true,imageUrl:""});
  };
  const catItems=menuItems.filter(m=>m.category===activeCat);
  return(
    <div style={{padding:16,paddingBottom:100}}>
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:400,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowForm(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>{editItem?"Редактировать":"Новое блюдо"}</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"#6B6B6B",marginBottom:6}}>Фото блюда</div>
              {form.imageUrl?(
                <div style={{position:"relative",marginBottom:8}}>
                  <img src={form.imageUrl} style={{width:"100%",height:140,objectFit:"cover",borderRadius:10,border:"1px solid #E0E0DC"}}/>
                  <button onClick={()=>setForm(p=>({...p,imageUrl:"",_imageFile:null}))} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.5)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:14}}>x</button>
                </div>
              ):(
                <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"#F7F7F5",border:"2px dashed #E0E0DC",borderRadius:10,padding:"16px",cursor:"pointer",marginBottom:8}}>
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(file){const reader=new FileReader();reader.onload=ev=>setForm(p=>({...p,imageUrl:ev.target.result,_imageFile:file}));reader.readAsDataURL(file);}}}/>
                  <span style={{fontSize:20}}>📸</span>
                  <span style={{fontSize:13,color:"#6B6B6B"}}>{uploadingImg?"Загружаем...":"Добавить фото"}</span>
                </label>
              )}
            </div>
            <div style={{fontSize:11,color:"#6B6B6B",marginBottom:6}}>Или выбери эмодзи</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
              {EMOJIS.map(e=><button key={e} onClick={()=>setForm(p=>({...p,emoji:e}))} style={{width:36,height:36,fontSize:20,background:form.emoji===e?"#FFF0E8":"#F7F7F5",border:`1.5px solid ${form.emoji===e?"#FF6B2B":"#E0E0DC"}`,borderRadius:9,cursor:"pointer"}}>{e}</button>)}
            </div>
            {[{l:"Название *",k:"name"},{l:"Цена (сом) *",k:"price",type:"number"},{l:"Описание",k:"desc"}].map(fi=>(
              <div key={fi.k} style={{marginBottom:10}}>
                <div style={{fontSize:11,color:"#6B6B6B",marginBottom:4}}>{fi.l}</div>
                <input value={form[fi.k]} onChange={e=>setForm(p=>({...p,[fi.k]:e.target.value}))} type={fi.type||"text"} style={{width:"100%",border:"1px solid #E0E0DC",borderRadius:9,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,background:"#F7F7F5",borderRadius:10,padding:"10px 13px"}}>
              <div style={{fontWeight:600,fontSize:13}}>В наличии</div>
              <Toggle on={form.inStock} onChange={()=>setForm(p=>({...p,inStock:!p.inStock}))}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={save} style={{flex:1,background:"#FF6B2B",color:"#fff",border:"none",padding:"12px",borderRadius:11,fontSize:14,fontWeight:700,cursor:"pointer"}}>{editItem?"Сохранить":"Добавить"}</button>
              {editItem&&<button onClick={()=>{sb.del("menu_items",editItem).catch(()=>{});setMenuItems(p=>p.filter(m=>m.id!==editItem));setShowForm(false);}} style={{background:"#FEE2E2",color:"#EF4444",border:"none",padding:"12px 16px",borderRadius:11,fontSize:13,cursor:"pointer"}}>Удалить</button>}
            </div>
          </div>
        </div>
      )}
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontWeight:800,fontSize:14}}>Категории</div>
          <button onClick={()=>setShowCatForm(v=>!v)} style={{background:"#FF6B2B",color:"#fff",border:"none",padding:"5px 12px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>+</button>
        </div>
        {showCatForm&&<div style={{display:"flex",gap:8,marginBottom:10}}>
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="Название..." style={{flex:1,border:"1px solid #FF6B2B",borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none"}}/>
          <button onClick={()=>{if(newCat.trim()){setMenuCats(p=>[...p,newCat.trim()]);setNewCat("");setShowCatForm(false);}}} style={{background:"#FF6B2B",color:"#fff",border:"none",padding:"8px 14px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer"}}>OK</button>
        </div>}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {menuCats.map(cat=>(
            <button key={cat} onClick={()=>setActiveCat(cat)} style={{background:activeCat===cat?"#FF6B2B":"#F7F7F5",color:activeCat===cat?"#fff":"#6B6B6B",border:"none",borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{cat} ({menuItems.filter(m=>m.category===cat).length})</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontWeight:800,fontSize:14}}>{activeCat}</div>
        <button onClick={()=>{setForm({name:"",price:"",desc:"",emoji:"🍽️",category:activeCat,inStock:true,imageUrl:""});setEditItem(null);setShowForm(true);}} style={{background:"#FF6B2B",color:"#fff",border:"none",padding:"7px 16px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Блюдо</button>
      </div>
      {catItems.length===0&&<div style={{textAlign:"center",padding:"24px",background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",color:"#6B6B6B"}}>Нажмите "+ Блюдо"</div>}
      {catItems.map(item=>(
        <div key={item.id} style={{background:"#fff",borderRadius:12,border:"1px solid #E0E0DC",padding:"11px 13px",display:"flex",gap:10,alignItems:"center",marginBottom:8,opacity:item.inStock?1:.6}}>
          <div style={{width:56,height:56,background:"#F7F7F5",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,overflow:"hidden"}}>
            {item.imageUrl?<img src={item.imageUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:item.emoji}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,marginBottom:2}}>{item.name}{!item.inStock&&<span style={{background:"#FEE2E2",color:"#EF4444",padding:"1px 5px",borderRadius:4,fontSize:9,fontWeight:700,marginLeft:4}}>СТОП</span>}</div>
            {item.desc&&<div style={{fontSize:11,color:"#6B6B6B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.desc}</div>}
            <div style={{fontSize:14,fontWeight:800,color:"#FF6B2B",marginTop:2}}>{item.price} сом</div>
          </div>
          <button onClick={()=>{setForm({name:item.name,price:String(item.price),desc:item.desc,emoji:item.emoji,category:item.category,inStock:item.inStock,imageUrl:item.imageUrl||""});setEditItem(item.id);setShowForm(true);}} style={{width:32,height:32,border:"1px solid #E0E0DC",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:14}}>{"✏️"}</button>
        </div>
      ))}
    </div>
  );
}
const BIZ_NAV=[{id:"dashboard",icon:"📊",label:"Главная"},{id:"orders",icon:"🧾",label:"Заказы"},{id:"menu",icon:"🍽️",label:"Меню"},{id:"stoplist",icon:"🚫",label:"Стоп-лист"},{id:"settings",icon:"⚙️",label:"Настройки"}];
function BizCabinet({onLogout,bizData}){
  const {restaurants,updateOrderStatus,tgConfig}=useApp();
  const r=bizData||restaurants[0]||null;
  const [sec,setSec]=useState("dashboard");
  const [detailOrder,setDetailOrder]=useState(null);
  const [bizOrders,setBizOrders]=useState([]);
  const sMap={new:{l:"Новый",bg:"#EFF6FF",c:"#1D4ED8"},cooking:{l:"Готовится",bg:"#FFF9F0",c:"#F59E0B"},done:{l:"Готово",bg:"#F0FFF4",c:"#16A34A"},cancelled:{l:"Отменён",bg:"#FEE2E2",c:"#EF4444"},delivery:{l:"В пути",bg:"#F0FFF4",c:"#16A34A"}};
  useEffect(()=>{
    if(!r?.id) return;
    const load=()=>sb.get("orders","?restaurant_name=eq."+encodeURIComponent(r.name)+"&order=created_at.desc&limit=50").then(data=>{
      if(Array.isArray(data)) setBizOrders(data.map(o=>({id:o.id,restName:o.restaurant_name,items:o.items,total:o.total,status:o.status,payMethod:o.pay_method,address:o.address,phone:o.phone,note:o.note,receiptImage:o.receipt_image,customer:o.customer||"Клиент",time:new Date(o.created_at).toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"})})));
    }).catch(e=>showToast("Ошибка загрузки заказов: "+e.message));
    load();
    const interval=setInterval(load,15000);
    return()=>clearInterval(interval);
  },[r?.id,r?.name]);
  const sections={
    dashboard:(
      <div style={{padding:16}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:14}}>
          {[{l:"Заказов",v:bizOrders.length,c:"#FF6B2B"},{l:"Готовится",v:bizOrders.filter(o=>o.status==="cooking").length,c:"#F59E0B"},{l:"Выручка (сом)",v:bizOrders.filter(o=>o.status==="done").reduce((s,o)=>s+o.total,0),c:"#22C55E"},{l:"Отменено",v:bizOrders.filter(o=>o.status==="cancelled").length,c:"#EF4444"}].map((s,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:12,border:"1px solid #E0E0DC",padding:"14px 16px"}}>
              <div style={{fontSize:11,color:"#6B6B6B",marginBottom:4}}>{s.l}</div>
              <div style={{fontSize:24,fontWeight:900,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>Активные заказы</div>
          {bizOrders.filter(o=>o.status!=="done"&&o.status!=="cancelled").length===0&&<div style={{color:"#6B6B6B",fontSize:13}}>Нет активных заказов</div>}
          {bizOrders.filter(o=>o.status!=="done"&&o.status!=="cancelled").map(o=>(
            <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F7F7F5"}}>
              <div><div style={{fontWeight:700,}}>{"#"}{o.id} {o.customer}</div><div style={{fontSize:11,color:"#6B6B6B"}}>{o.total}с</div></div>
              <span style={{background:sMap[o.status]?.bg||"#F7F7F5",color:sMap[o.status]?.c||"#6B6B6B",padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>{sMap[o.status]?.l||o.status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    orders:(<BizOrdersSection orders={bizOrders} sMap={sMap} setDetailOrder={setDetailOrder} updateOrderStatus={updateOrderStatus} tgConfig={tgConfig}/>),
    menu:(<BizMenuSection r={r}/>),
    stoplist:(
      <div style={{padding:16}}>
        <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>Стоп-лист</div>
        <div style={{textAlign:"center",padding:"30px",color:"#6B6B6B"}}><div style={{fontSize:36,marginBottom:8}}>{"✅"}</div><div>Управляйте наличием в разделе Меню</div></div>
      </div>
    ),
    settings:(<BizSettingsSection r={r}/>),
  };
  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:"#1A1A2E",fontFamily:"'Inter',system-ui,sans-serif"}}>
      {detailOrder&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={()=>setDetailOrder(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
            <div style={{fontWeight:800,fontSize:17,marginBottom:12}}>Заказ {"#"}{detailOrder.id}</div>
            <div style={{fontSize:13,color:"#6B6B6B",marginBottom:6}}>{Array.isArray(detailOrder.items)?detailOrder.items.map(i=>i.name+" x"+i.qty).join(", "):detailOrder.items}</div>
            {detailOrder.phone&&<div style={{fontSize:13,marginBottom:4}}>{"📞"} <a href={"tel:"+detailOrder.phone} style={{color:"#FF6B2B"}}>{detailOrder.phone}</a></div>}
            {detailOrder.address&&<div style={{fontSize:12,color:"#6B6B6B",marginBottom:4}}>{"📍"} {detailOrder.address}</div>}
            <div style={{fontSize:18,fontWeight:800,color:"#FF6B2B",marginBottom:14}}>{detailOrder.total}с</div>
            {detailOrder.status==="new"&&(
              <div style={{display:"flex",gap:10,marginBottom:10}}>
                <button onClick={()=>{updateOrderStatus(detailOrder.id,"cooking");showToast("Принят");setDetailOrder(null);}} style={{flex:1,background:"#22C55E",color:"#fff",border:"none",padding:"12px",borderRadius:11,fontSize:14,fontWeight:700,cursor:"pointer"}}>Принять</button>
                <button onClick={()=>{updateOrderStatus(detailOrder.id,"cancelled");showToast("Отклонён");setDetailOrder(null);}} style={{flex:1,background:"#FEE2E2",color:"#EF4444",border:"none",padding:"12px",borderRadius:11,fontSize:14,fontWeight:700,cursor:"pointer"}}>Отклонить</button>
              </div>
            )}
            {detailOrder.status==="cooking"&&(
              <button onClick={()=>{updateOrderStatus(detailOrder.id,"done");showToast("Готово!");setDetailOrder(null);}} style={{width:"100%",background:"#FF6B2B",color:"#fff",border:"none",padding:"12px",borderRadius:11,fontSize:14,fontWeight:700,cursor:"pointer"}}>Заказ готов</button>
            )}
          </div>
        </div>
      )}
      <div style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{r?.emoji} {r?.name||"Кабинет"}</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:r?.status==="open"?"#22C55E":"#EF4444"}}/>
            <span style={{fontSize:12,color:"#aaa"}}>{r?.status==="open"?"Открыто":"Закрыто"}</span>
          </div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,color:"#aaa",cursor:"pointer"}}>Выйти</button>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:"16px 16px 0 0",minHeight:"calc(100vh - 58px)",paddingBottom:70}}>
        {sections[sec]||sections.dashboard}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#1A1A2E",display:"flex",borderTop:"1px solid rgba(255,255,255,0.1)",zIndex:200}}>
        {BIZ_NAV.map(n=>(
          <button key={n.id} onClick={()=>setSec(n.id)} style={{flex:1,padding:"10px 4px",border:"none",cursor:"pointer",fontSize:18,background:sec===n.id?"rgba(255,107,43,0.2)":"transparent",color:sec===n.id?"#FF6B2B":"#888",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}>
            <span>{n.icon}</span>
            <span style={{fontSize:9,fontWeight:600}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
function AdminRestSection(){
  const [bizAccounts,setBizAccounts]=useState([]);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",phone:"",category:"Кыргызская кухня",emoji:"🍕"});
  const [genPass,setGenPassState]=useState("");
  const [showPass,setShowPass]=useState({});
  const sMap={open:{l:"Активно",bg:"#F0FFF4",c:"#16A34A"},pending:{l:"На проверке",bg:"#FFF9F0",c:"#F59E0B"},closed:{l:"Закрыто",bg:"#FEE2E2",c:"#EF4444"}};
  const genP=()=>{const ch="abcdefghjkmnpqrstuvwxyz23456789";return Array.from({length:8},()=>ch[Math.floor(Math.random()*ch.length)]).join("");};
  useEffect(()=>{
    sb.get("restaurants","?order=created_at.asc").then(data=>{
      if(Array.isArray(data)) setBizAccounts(data.map(r=>({id:r.id,name:r.name,phone:r.phone||"",pass:r.biz_password||"",status:r.status,emoji:r.emoji||"🍕",category:r.category||""})));
    }).catch(()=>{});
  },[]);
  const addBiz=async()=>{
    if(!form.name.trim()||!form.phone.trim()) return showToast("Заполните поля");
    const pass=genPass||genP();
    const newEntry={id:Date.now(),name:form.name.trim(),phone:form.phone.trim(),pass,status:"pending",emoji:form.emoji,category:form.category};
    setBizAccounts(p=>[...p,newEntry]);
    setForm({name:"",phone:"",category:"Кыргызская кухня",emoji:"🍕"});setGenPassState("");setShowAdd(false);
    try{
      const res=await sb.post("restaurants",{name:newEntry.name,category:newEntry.category,emoji:newEntry.emoji,gradient:"linear-gradient(135deg,#FF6B2B,#ff8c5a)",phone:newEntry.phone,time:"30-40 мин",delivery_fee:0,hours_open:"08:00",hours_close:"22:00",status:"pending",biz_password:pass});
      if(res&&res[0]){setBizAccounts(p=>p.map(b=>b.id===newEntry.id?{...b,id:res[0].id}:b));showToast("Добавлено! Пароль: "+pass);}
      else showToast("Добавлено! Пароль: "+pass);
    }catch(e){showToast("Добавлено! Пароль: "+pass);}
  };
  return(
    <div style={{padding:16,paddingBottom:80}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div><div style={{fontWeight:800,}}>Заведения</div><div style={{fontSize:11,color:"#6B6B6B"}}>{bizAccounts.length} подключено</div></div>
        <button onClick={()=>setShowAdd(v=>!v)} style={{background:showAdd?"#F7F7F5":"#FF6B2B",color:showAdd?"#1A1A1A":"#fff",border:"none",padding:"8px 16px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>{showAdd?"Отмена":"+ Добавить"}</button>
      </div>
      {showAdd&&(
        <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #FF6B2B",padding:16,marginBottom:16}}>
          {[{l:"Название",k:"name"},{l:"Телефон",k:"phone"}].map(f=>(
            <div key={f.k} style={{marginBottom:10}}>
              <div style={{fontSize:11,color:"#6B6B6B",marginBottom:4}}>{f.l}</div>
              <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",border:"1px solid #E0E0DC",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:"#6B6B6B",marginBottom:4}}>Пароль</div>
            <div style={{display:"flex",gap:8}}>
              <input value={genPass} onChange={e=>setGenPassState(e.target.value)} placeholder="Авто" style={{flex:1,border:"1px solid #E0E0DC",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none",fontFamily:"monospace",fontWeight:700}}/>
              <button onClick={()=>setGenPassState(genP())} style={{background:"#2D2D2D",color:"#fff",border:"none",padding:"9px 14px",borderRadius:8,fontSize:12,cursor:"pointer"}}>🔑</button>
            </div>
          </div>
          <button onClick={addBiz} style={{background:"#FF6B2B",color:"#fff",border:"none",padding:"11px 24px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer"}}>Добавить</button>
        </div>
      )}
      {bizAccounts.map(biz=>{
        const s=sMap[biz.status]||sMap.pending;
        return(
          <div key={biz.id} style={{background:"#fff",borderRadius:12,border:"1px solid #E0E0DC",padding:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:44,height:44,background:"linear-gradient(135deg,#FF6B2B,#ff8c5a)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{biz.emoji}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,}}>{biz.name}</div><div style={{fontSize:11,color:"#6B6B6B"}}>{biz.phone}</div></div>
              <span style={{background:s.bg,color:s.c,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{s.l}</span>
            </div>
            <div style={{background:"#F7F7F5",borderRadius:9,padding:"9px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:800,fontFamily:"monospace"}}>{showPass[biz.id]?biz.pass:"••••••••"}</div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setShowPass(p=>({...p,[biz.id]:!p[biz.id]}))} style={{background:"#fff",border:"1px solid #E0E0DC",borderRadius:7,padding:"5px 10px",fontSize:12,cursor:"pointer"}}>{showPass[biz.id]?"Скрыть":"Показать"}</button>
                <button onClick={()=>{if(navigator.clipboard)navigator.clipboard.writeText(biz.pass);showToast("Скопировано");}} style={{background:"#FFF0E8",color:"#FF6B2B",border:"none",borderRadius:7,padding:"5px 10px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Копировать</button>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              {biz.status==="pending"&&<button onClick={()=>{setBizAccounts(p=>p.map(b=>b.id===biz.id?{...b,status:"open"}:b));sb.patch("restaurants",biz.id,{status:"open"}).catch(()=>{});showToast("Одобрено");}} style={{flex:1,background:"#22C55E",color:"#fff",border:"none",padding:"8px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>Одобрить</button>}
              {biz.status==="open"&&<button onClick={()=>{setBizAccounts(p=>p.map(b=>b.id===biz.id?{...b,status:"closed"}:b));sb.patch("restaurants",biz.id,{status:"closed"}).catch(()=>{});showToast("Заблокировано");}} style={{flex:1,background:"#FEE2E2",color:"#EF4444",border:"none",padding:"8px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>Заблокировать</button>}
              {biz.status==="closed"&&<button onClick={()=>{setBizAccounts(p=>p.map(b=>b.id===biz.id?{...b,status:"open"}:b));sb.patch("restaurants",biz.id,{status:"open"}).catch(()=>{});showToast("Разблокировано");}} style={{flex:1,background:"#F7F7F5",color:"#1A1A1A",border:"1px solid #E0E0DC",padding:"8px",borderRadius:8,fontSize:12,cursor:"pointer"}}>Разблокировать</button>}
              <button onClick={()=>{setBizAccounts(p=>p.filter(b=>b.id!==biz.id));sb.del("restaurants",biz.id).catch(()=>{});showToast("Удалено");}} style={{background:"#FEE2E2",color:"#EF4444",border:"none",padding:"8px 12px",borderRadius:8,fontSize:12,cursor:"pointer"}}>🗑</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
function AdminBotsSection(){
  const {tgConfig,setTgConfig}=useApp();
  const [form,setForm]=useState({...tgConfig});
  const [testing,setTesting]=useState(false);
  const save=()=>{setTgConfig(form);showToast("Настройки ботов сохранены");};
  const testBot=async(token,chatId,label)=>{
    if(!token||!chatId) return showToast("Заполните токен и chat_id");
    setTesting(true);
    const ok=await sendTelegram(token,chatId,"✅ Тест VFES Бот "+label+" подключён!");
    setTesting(false);
    showToast(ok?"Сообщение отправлено!":"Ошибка — проверьте токен и chat_id");
  };
  const BOTS=[
    {key:"admin",icon:"👁",title:"Бот логов (вам)",desc:"Все действия сотрудников",tokenKey:"adminToken",chatKey:"adminChatId",hint:"@userinfobot — узнай свой chat_id"},
    {key:"courier",icon:"🚴",title:"Бот курьеров",desc:"Новые заказы курьерам",tokenKey:"courierToken",chatKey:"courierChatId",hint:"Добавь бота в группу курьеров"},
    {key:"support",icon:"💬",title:"Бот поддержки",desc:"Чат с клиентами",tokenKey:"supportToken",chatKey:"supportChatId",hint:"Создай группу поддержки"},
  ];
  return(
    <div style={{padding:20}}>
      <div style={{fontWeight:800,fontSize:17,marginBottom:4}}>Telegram боты</div>
      <div style={{fontSize:12,color:"#6B6B6B",marginBottom:20}}>Настройте ботов через @BotFather</div>
      {BOTS.map(bot=>(
        <div key={bot.key} style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <span style={{fontSize:28}}>{bot.icon}</span>
            <div><div style={{fontWeight:800,}}>{bot.title}</div><div style={{fontSize:11,color:"#6B6B6B"}}>{bot.desc}</div></div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:"#6B6B6B",marginBottom:4}}>Токен бота</div>
            <input value={form[bot.tokenKey]||""} onChange={e=>setForm(p=>({...p,[bot.tokenKey]:e.target.value.trim()}))} placeholder="1234567890:ABC..." style={{width:"100%",border:"1px solid #E0E0DC",borderRadius:8,padding:"9px 12px",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"monospace"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"#6B6B6B",marginBottom:4}}>Chat ID</div>
            <input value={form[bot.chatKey]||""} onChange={e=>setForm(p=>({...p,[bot.chatKey]:e.target.value.trim()}))} placeholder="-1001234567890" style={{width:"100%",border:"1px solid #E0E0DC",borderRadius:8,padding:"9px 12px",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"monospace"}}/>
          </div>
          <div style={{background:"#FFFBEB",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:11,color:"#92400E"}}>{"💡"} {bot.hint}</div>
          <button onClick={()=>testBot(form[bot.tokenKey],form[bot.chatKey],bot.title)} disabled={testing} style={{background:"#1D4ED8",color:"#fff",border:"none",padding:"9px 18px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {testing?"Отправляем...":"Тест"}
          </button>
        </div>
      ))}
      <button onClick={save} style={{width:"100%",background:"#FF6B2B",color:"#fff",border:"none",padding:"14px",borderRadius:12,fontSize:15,fontWeight:800,cursor:"pointer"}}>Сохранить настройки</button>
    </div>
  );
}
function FadeIn({children,k}){
  return <div style={{opacity:1,minHeight:"100%"}}>{children}</div>;
}
const CLIENT_PAGES=["client","restaurant","cart","notifs","profile","tracker","reviews","loyalty","ai","auth","about","login"];
const STAFF_PAGES=["biz","admin","operator","investor"];
function AppInner({page,selRest,selOrderId,navigate}){
  const {cartCount,darkMode}=useApp();
  const [authedRole,setAuthedRole]=useState(null);
  const [authedBiz,setAuthedBiz]=useState(null);
  const isClient=CLIENT_PAGES.includes(page);
  if((page==="biz"||page==="admin"||page==="operator"||page==="investor")&&authedRole!==page){
    return <StaffLoginPage onSuccess={(role,bizData)=>{setAuthedRole(role);setAuthedBiz(bizData||null);navigate(role);}} navigate={navigate}/>;
  }
  return(
    <div style={{minHeight:"100vh",background:darkMode?"#181825":"#F7F7F5",fontFamily:"'Inter',system-ui,sans-serif"}}>
      {isClient&&(
        <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:darkMode?"#181825":"#F7F7F5",boxShadow:"0 0 30px rgba(0,0,0,0.08)",position:"relative"}}>
          <FadeIn k={page}>
            {page==="client"&&<ClientHome navigate={navigate}/>}
            {page==="restaurant"&&<RestaurantPage navigate={navigate} restaurant={selRest}/>}
            {page==="cart"&&<CartPage navigate={navigate}/>}
            {page==="tracker"&&<OrderTrackerPage navigate={navigate} orderId={selOrderId}/>}
            {page==="history"&&<OrderHistoryPage navigate={navigate}/>}
            {page==="loyalty"&&<LoyaltyPage navigate={navigate}/>}
            {page==="reviews"&&<ReviewsPage navigate={navigate} restaurant={selRest}/>}
            {page==="notifs"&&<NotifsPage navigate={navigate}/>}
            {page==="ai"&&<AIChatPage navigate={navigate}/>}
            {page==="profile"&&<ProfilePage navigate={navigate}/>}
            {page==="auth"&&<AuthPage navigate={navigate}/>}
            {page==="about"&&<AboutPage navigate={navigate}/>}
            {page==="login"&&<StaffLoginPage navigate={navigate} onSuccess={(role,bizData)=>{setAuthedRole(role);setAuthedBiz(bizData||null);navigate(role);}}/>}
          </FadeIn>
          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:darkMode?"#0f0f1a":"#1A1A2E",display:"flex",borderTop:"2px solid #FF6B2B",zIndex:9999}}>
            {[{p:"client",i:"🏠",l:"Главная"},{p:"cart",i:"🛒",l:"Корзина"}].map(n=>(
              <button key={n.p} onClick={()=>navigate(n.p)} style={{flex:1,padding:"10px 4px",border:"none",cursor:"pointer",fontSize:18,background:page===n.p?"rgba(255,107,43,0.2)":"transparent",color:page===n.p?"#FF6B2B":"#888",display:"flex",flexDirection:"column",alignItems:"center",gap:1,position:"relative"}}>
                <span>{n.i}</span>
                {n.p==="cart"&&cartCount>0&&<span style={{position:"absolute",top:5,right:"50%",transform:"translateX(8px)",background:"#EF4444",color:"#fff",fontSize:9,fontWeight:800,width:14,height:14,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{cartCount}</span>}
                <span style={{fontSize:9,fontWeight:600,opacity:.8}}>{n.l}</span>
              </button>
            ))}
            <button onClick={()=>navigate("login")} style={{flex:1,padding:"10px 4px",border:"none",cursor:"pointer",fontSize:14,background:"transparent",color:"#888",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
              <span>🏪</span>
              <span style={{fontSize:9,fontWeight:600,opacity:.8}}>Кабинет</span>
            </button>
          </div>
        </div>
      )}
      {page==="biz"&&<BizCabinet bizData={authedBiz} onLogout={()=>{setAuthedRole(null);setAuthedBiz(null);navigate("client");}}/>}
      {page==="admin"&&<AdminPanel onLogout={()=>{setAuthedRole(null);navigate("client");}}/>}
      {page==="operator"&&<OperatorPanel onLogout={()=>{setAuthedRole(null);navigate("client");}}/>}
      {page==="investor"&&<InvestorPanel onLogout={()=>{setAuthedRole(null);navigate("client");}}/>}
    </div>
  );
}
function OperatorPanel({onLogout}){
  const {orders,updateOrderStatus}=useApp();
  const [sec,setSec]=useState("pending");
  const [selectedOrder,setSelectedOrder]=useState(null);
  const pendingOrders=orders.filter(o=>o.payMethod==="omoney"&&o.status==="new");
  const activeOrders=orders.filter(o=>o.status==="new"&&o.payMethod==="cash");
  const doneToday=orders.filter(o=>o.status==="done");
  const {tgConfig}=useApp();
  const confirmPayment=async(orderId)=>{
    const o=orders.find(x=>x.id===orderId);
    updateOrderStatus(orderId,"cooking");
    showToast("Оплата подтверждена, заказ передан в ресторан");
    setSelectedOrder(null);
    sendAdminLog(tgConfig,"✅ Оператор подтвердил оплату",
      `Заказ #${orderId} · ${o?.restName||""} · ${o?.total||""}с · ${o?.phone||""}`);
    if(tgConfig.courierToken&&tgConfig.courierChatId&&o){
      const text=`🆕 <b>Новый заказ #${o.id}</b>\n`+
        `🏪 ${o.restName}\n`+
        `📍 ${o.address||"адрес не указан"}\n`+
        `📞 ${o.phone||"—"}\n`+
        `💰 ${o.total} сом (${o.payMethod==="omoney"?"Оплачено онлайн":"Наличные"})\n`+
        `📦 ${Array.isArray(o.items)?o.items.map(i=>i.name+" x"+i.qty).join(", "):o.items}`;
      const ok=await sendTelegram(tgConfig.courierToken,tgConfig.courierChatId,text);
      if(ok) showToast("Курьеры уведомлены в Telegram");
      else showToast("Telegram: проверьте настройки бота");
    }
  };
  const rejectOrder=(orderId)=>{
    const o=orders.find(x=>x.id===orderId);
    updateOrderStatus(orderId,"cancelled");
    showToast("Заказ отклонён");
    setSelectedOrder(null);
    sendAdminLog(tgConfig,"❌ Оператор отклонил заказ",
      `Заказ #${orderId} · ${o?.restName||""} · ${o?.total||""}с`);
  };
  const NAV=[
    {id:"pending",icon:"⏳",label:"Ожидают",count:pendingOrders.length},
    {id:"active", icon:"🔥",label:"Активные",count:activeOrders.length},
    {id:"history",icon:"📋",label:"История",count:0},
  ];
  return(
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",minHeight:"100vh",background:"#F7F7F5"}}>
      {selectedOrder&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:500,display:"flex",alignItems:"flex-end"}}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:17,fontWeight:800}}>Заказ {"#"}{selectedOrder.id}</div>
              <button onClick={()=>setSelectedOrder(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{background:"#F7F7F5",borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:12,color:"#6B6B6B",marginBottom:6}}>Ресторан</div>
              <div style={{fontWeight:700}}>{selectedOrder.restName}</div>
            </div>
            <div style={{background:"#F7F7F5",borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:12,color:"#6B6B6B",marginBottom:6}}>Состав заказа</div>
              <div style={{fontSize:13}}>{Array.isArray(selectedOrder.items)?selectedOrder.items.map(i=>i.name+" x"+i.qty).join(", "):selectedOrder.items}</div>
              <div style={{fontSize:18,fontWeight:900,color:"#FF6B2B",marginTop:8}}>{selectedOrder.total} сом</div>
            </div>
            {selectedOrder.phone&&(
              <div style={{background:"#F7F7F5",borderRadius:12,padding:14,marginBottom:14}}>
                <div style={{fontSize:12,color:"#6B6B6B",marginBottom:4}}>Телефон клиента</div>
                <a href={"tel:"+selectedOrder.phone} style={{fontSize:15,fontWeight:700,color:"#FF6B2B",textDecoration:"none"}}>{"📞"} {selectedOrder.phone}</a>
              </div>
            )}
            {selectedOrder.address&&(
              <div style={{background:"#F7F7F5",borderRadius:12,padding:14,marginBottom:14}}>
                <div style={{fontSize:12,color:"#6B6B6B",marginBottom:4}}>Адрес доставки</div>
                <div style={{fontSize:13,fontWeight:600}}>{"📍"} {selectedOrder.address}</div>
              </div>
            )}
            {selectedOrder.payMethod==="omoney"&&(
              <div style={{background:"#EFF6FF",border:"1.5px solid #BFDBFE",borderRadius:12,padding:14,marginBottom:20}}>
                <div style={{fontWeight:700,color:"#1D4ED8",marginBottom:8}}>Онлайн оплата, требует подтверждения</div>
                <div style={{fontSize:13,color:"#1E40AF",marginBottom:12}}>Проверьте поступление <strong>{selectedOrder.total} сом</strong> на счёт 507 777 358</div>
                {selectedOrder.receiptImage?(
                  <div>
                    <div style={{fontSize:12,color:"#1E40AF",marginBottom:6,fontWeight:600}}>{"📸"} Скриншот чека от клиента:</div>
                    <img src={selectedOrder.receiptImage} alt="Чек" style={{width:"100%",borderRadius:10,border:"1px solid #BFDBFE",maxHeight:300,objectFit:"contain",background:"#F0F8FF"}}/>
                    {selectedOrder.receiptName&&<div style={{fontSize:11,color:"#6B6B6B",marginTop:4}}>{selectedOrder.receiptName}</div>}
                  </div>
                ):(
                  <div style={{background:"#DBEAFE",borderRadius:9,padding:"10px 12px",fontSize:12,color:"#1E40AF"}}>
                    {"📸"} Клиент не прикрепил чек
                  </div>
                )}
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>confirmPayment(selectedOrder.id)} style={{flex:1,background:"#22C55E",color:"#fff",border:"none",padding:"14px",borderRadius:12,fontSize:15,fontWeight:800,cursor:"pointer"}}>
                {"✅"} Подтвердить
              </button>
              <button onClick={()=>rejectOrder(selectedOrder.id)} style={{flex:1,background:"#FEE2E2",color:"#EF4444",border:"none",padding:"14px",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{background:"linear-gradient(135deg,#1a1a2e,#2d3a5a)",padding:"16px 20px",color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:1,marginBottom:2}}>VFES</div>
          <div style={{fontSize:18,fontWeight:900}}>{"🎧"} Кабинет оператора</div>
        </div>
        <button onClick={onLogout} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",padding:"7px 14px",borderRadius:9,fontSize:12,cursor:"pointer"}}>Выйти</button>
      </div>
      <div style={{display:"flex",gap:10,padding:"14px 16px"}}>
        {[
          {label:"Ожидают оплаты",val:pendingOrders.length,color:"#F59E0B",bg:"#FFF9F0"},
          {label:"Наличные заказы",val:activeOrders.length,color:"#3B82F6",bg:"#EFF6FF"},
          {label:"Выполнено сегодня",val:doneToday.length,color:"#22C55E",bg:"#F0FFF4"},
        ].map((s,i)=>(
          <div key={i} style={{flex:1,background:s.bg,borderRadius:12,padding:"12px 10px",textAlign:"center",border:`1px solid ${s.color}30`}}>
            <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.val}</div>
            <div style={{fontSize:10,color:"#6B6B6B",marginTop:2,lineHeight:1.3}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #E0E0DC",padding:"0 16px"}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setSec(n.id)} style={{flex:1,padding:"12px 4px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:sec===n.id?800:400,color:sec===n.id?"#FF6B2B":"#6B6B6B",borderBottom:sec===n.id?"2px solid #FF6B2B":"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <span style={{fontSize:16}}>{n.icon}</span>
            <span>{n.label}{n.count>0?` (${n.count})`:""}</span>
          </button>
        ))}
      </div>
      <div style={{padding:16,paddingBottom:80}}>
        {sec==="pending"&&(
          <div>
            <div style={{fontSize:13,color:"#6B6B6B",marginBottom:12}}>Заказы с онлайн-оплатой, нужно проверить чек и поступление на счёт</div>
            {pendingOrders.length===0&&(
              <div style={{textAlign:"center",padding:"40px 20px",color:"#6B6B6B"}}>
                <div style={{fontSize:40,marginBottom:8}}>{"✅"}</div>
                <div style={{fontWeight:600}}>Нет ожидающих заказов</div>
              </div>
            )}
            {pendingOrders.map(o=>(
              <div key={o.id} style={{background:"#fff",borderRadius:14,border:"2px solid #F59E0B",padding:16,marginBottom:10,cursor:"pointer"}} onClick={()=>setSelectedOrder(o)}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div>
                    <span style={{fontWeight:800,fontSize:15}}>{"#"}{o.id}</span>
                    <span style={{marginLeft:8,background:"#FFF9F0",color:"#F59E0B",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>Ожидает проверки</span>
                  </div>
                  <span style={{fontSize:16,fontWeight:900,color:"#FF6B2B"}}>{o.total}с</span>
                </div>
                <div style={{fontSize:12,color:"#6B6B6B",marginBottom:4}}>{o.restName} {o.time&&("• "+o.time)}</div>
                <div style={{fontSize:12,color:"#6B6B6B",marginBottom:8}}>{Array.isArray(o.items)?o.items.map(i=>i.name+" x"+i.qty).join(", "):o.items}</div>
                {o.receiptImage?(
                  <div style={{display:"flex",alignItems:"center",gap:8,background:"#F0FFF4",borderRadius:8,padding:"7px 10px",marginBottom:10}}>
                    <img src={o.receiptImage} alt="чек" style={{width:40,height:40,objectFit:"cover",borderRadius:6,border:"1px solid #86EFAC",flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:"#16A34A"}}>Чек прикреплён</div>
                      <div style={{fontSize:10,color:"#6B6B6B"}}>Нажмите на заказ чтобы посмотреть</div>
                    </div>
                  </div>
                ):(
                  <div style={{fontSize:11,color:"#EF4444",background:"#FEE2E2",borderRadius:7,padding:"5px 10px",marginBottom:10}}>Чек не прикреплён</div>
                )}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={e=>{e.stopPropagation();confirmPayment(o.id);}} style={{flex:1,background:"#22C55E",color:"#fff",border:"none",padding:"10px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer"}}>{"✅"} Подтвердить</button>
                  <button onClick={e=>{e.stopPropagation();rejectOrder(o.id);}} style={{background:"#FEE2E2",color:"#EF4444",border:"none",padding:"10px 14px",borderRadius:9,fontSize:13,cursor:"pointer"}}>Отклонить</button>
                  <button style={{background:"#F7F7F5",color:"#6B6B6B",border:"1px solid #E0E0DC",padding:"10px 14px",borderRadius:9,fontSize:12,cursor:"pointer"}}>Детали</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {sec==="active"&&(
          <div>
            <div style={{fontSize:13,color:"#6B6B6B",marginBottom:12}}>Заказы с оплатой наличными , автоматически одобрены</div>
            {activeOrders.length===0&&(
              <div style={{textAlign:"center",padding:"40px 20px",color:"#6B6B6B"}}>
                <div style={{fontSize:40,marginBottom:8}}>🔥</div>
                <div>Нет активных заказов</div>
              </div>
            )}
            {activeOrders.map(o=>(
              <div key={o.id} style={{background:"#fff",borderRadius:12,border:"1px solid #E0E0DC",padding:14,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontWeight:800}}>{"#"}{o.id}</span>
                  <span style={{fontWeight:800,color:"#FF6B2B"}}>{o.total}с</span>
                </div>
                <div style={{fontSize:12,color:"#6B6B6B"}}>{o.restName}</div>
                <div style={{fontSize:12,color:"#6B6B6B"}}>{Array.isArray(o.items)?o.items.map(i=>i.name+" x"+i.qty).join(", "):o.items}</div>
                {o.address&&<div style={{fontSize:11,color:"#6B6B6B",marginTop:4}}>{"📍"} {o.address}</div>}
              </div>
            ))}
          </div>
        )}
        {sec==="history"&&(
          <div>
            {orders.filter(o=>o.status==="done"||o.status==="cancelled").map(o=>(
              <div key={o.id} style={{background:"#fff",borderRadius:12,border:"1px solid #E0E0DC",padding:14,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{"#"}{o.id} — {o.restName}</div>
                  <div style={{fontSize:11,color:"#6B6B6B",marginTop:2}}>{Array.isArray(o.items)?o.items.map(i=>i.name).join(", "):o.items}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:800,color:"#FF6B2B"}}>{o.total}с</div>
                  <div style={{fontSize:10,background:o.status==="done"?"#F0FFF4":"#FEE2E2",color:o.status==="done"?"#16A34A":"#EF4444",padding:"2px 7px",borderRadius:20,marginTop:4}}>{o.status==="done"?"Выполнен":"Отменён"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function InvestorPanel({onLogout}){
  const {orders,restaurants}=useApp();
  const [period,setPeriod]=useState("today");
  const done=orders.filter(o=>o.status==="done");
  const revenue=done.reduce((s,o)=>s+o.total,0);
  const avgOrder=done.length?Math.round(revenue/done.length):0;
  const cancelled=orders.filter(o=>o.status==="cancelled").length;
  const conversion=orders.length?Math.round((done.length/orders.length)*100):0;
  const totalOrders=orders.length;
  const restStats=restaurants.map(r=>{
    const rOrders=done.filter(o=>o.restName===r.name);
    return{name:r.name,emoji:r.emoji,orders:rOrders.length,revenue:rOrders.reduce((s,o)=>s+o.total,0)};
  }).sort((a,b)=>b.revenue-a.revenue);
  const dayRevenue=["Вс","Пн","Вт","Ср","Чт","Пт","Сб"].map((day,i)=>({
    day,
    val:done.filter(o=>new Date(o.created_at||Date.now()).getDay()===i).reduce((s,o)=>s+o.total,0)
  }));
  const chartData=[dayRevenue[1],dayRevenue[2],dayRevenue[3],dayRevenue[4],dayRevenue[5],dayRevenue[6],dayRevenue[0]];
  const maxVal=Math.max(...chartData.map(d=>d.val),1);
  return(
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",minHeight:"100vh",background:"#F7F7F5",paddingBottom:40}}>
      <div style={{background:"linear-gradient(135deg,#1a1a2e,#0f3460)",padding:"20px 20px 24px",color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:1,marginBottom:2}}>VFES</div>
            <div style={{fontSize:18,fontWeight:900}}>{"📊"} Кабинет инвестора</div>
          </div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",padding:"7px 14px",borderRadius:9,fontSize:12,cursor:"pointer"}}>Выйти</button>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["today","week","month"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{padding:"5px 14px",borderRadius:20,border:"none",background:period===p?"rgba(255,107,43,0.8)":"rgba(255,255,255,0.1)",color:"#fff",fontSize:12,fontWeight:period===p?700:400,cursor:"pointer"}}>
              {p==="today"?"Сегодня":p==="week"?"Неделя":"Месяц"}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[
            {label:"Выручка",val:revenue.toLocaleString("ru")+" с",color:"#FF6B2B",icon:"💰"},
            {label:"Заказов",val:totalOrders,color:"#3B82F6",icon:"📦"},
            {label:"Средний чек",val:avgOrder+" с",color:"#8B5CF6",icon:"🧾"},
            {label:"Конверсия",val:conversion+"%",color:"#22C55E",icon:"📈"},
          ].map((m,i)=>(
            <div key={"k1"+i} style={{background:"#fff",borderRadius:14,padding:16,border:"1px solid #E0E0DC"}}>
              <div style={{fontSize:20,marginBottom:6}}>{m.icon}</div>
              <div style={{fontSize:22,fontWeight:900,color:m.color,marginBottom:2}}>{m.val}</div>
              <div style={{fontSize:11,color:"#6B6B6B"}}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16,marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>Выручка за неделю</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:100,marginBottom:8}}>
            {chartData.map((d,i)=>(
              <div key={"k2"+i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontSize:9,color:"#6B6B6B"}}>{Math.round(d.val/1000)}к</div>
                <div style={{width:"100%",background:i===6?"#FF6B2B":"#FFF0E8",borderRadius:"4px 4px 0 0",height:`${Math.round((d.val/maxVal)*80)}px`,minHeight:4,transition:"height .3s"}}/>
                <div style={{fontSize:10,color:i===6?"#FF6B2B":"#6B6B6B",fontWeight:i===6?700:400}}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #E0E0DC",padding:16,marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>Рестораны по выручке</div>
          {restStats.filter(r=>r.orders>0||true).slice(0,7).map((r,i)=>(
            <div key={"k3"+i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:36,height:36,background:"#F7F7F5",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{r.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
                <div style={{background:"#F7F7F5",borderRadius:4,height:6}}>
                  <div style={{background:"#FF6B2B",borderRadius:4,height:6,width:`${revenue>0?Math.round((r.revenue/revenue)*100):0}%`,transition:"width .5s"}}/>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:13,fontWeight:700,color:"#FF6B2B"}}>{r.revenue>0?r.revenue.toLocaleString("ru"):"-"} с</div>
                <div style={{fontSize:10,color:"#6B6B6B"}}>{r.orders} зак.</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:"linear-gradient(135deg,#1a1a2e,#0f3460)",borderRadius:14,padding:20,color:"#fff"}}>
          <div style={{fontWeight:800,fontSize:11,marginBottom:12,opacity:.7,textTransform:"uppercase",letterSpacing:1}}>Итоги периода</div>
          {[
            {label:"Успешных заказов",val:done.length},
            {label:"Отменённых",val:cancelled},
            {label:"Активных ресторанов",val:restaurants.filter(r=>r.status==="open").length},
            {label:"Всего ресторанов",val:restaurants.length},
          ].map((s,i)=>(
            <div key={"k4"+i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.08)":"none"}}>
              <span style={{fontSize:13,color:"rgba(255,255,255,0.65)"}}>{s.label}</span>
              <span style={{fontSize:13,fontWeight:700}}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function App(){
  const [page,setPage]=useState("client");
  const [selRest,setSelRest]=useState(null);
  const [selOrderId,setSelOrderId]=useState(null);
  const [loading,setLoading]=useState(true);
  const navigate=(p,data=null)=>{setPage(p);if(data?.restaurant)setSelRest(data.restaurant);if(data?.orderId)setSelOrderId(data.orderId);};
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),700);return()=>clearTimeout(t);},[]);
  if(loading) return null;
  return(
    <AppProvider>
      <ToastHost/>
      <AppInner page={page} selRest={selRest} selOrderId={selOrderId} navigate={navigate}/>
    </AppProvider>
  );
}
function AppWrapper() {
  const [err, setErr] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);
  
  React.useEffect(() => {
    setLoaded(true);
  }, []);

  if (err) return (
    <div style={{padding:20,background:'#fff',minHeight:'100vh',fontFamily:'sans-serif'}}>
      <h2 style={{color:'red'}}>Ошибка</h2>
      <pre style={{fontSize:11,color:'red',whiteSpace:'pre-wrap'}}>{err}</pre>
    </div>
  );

  if (!loaded) return (
    <div style={{padding:20,background:'#fff'}}>Загружается...</div>
  );

  return <App />;
}

export default AppWrapper;