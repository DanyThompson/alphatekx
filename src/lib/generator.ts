const runtime = String.raw`
const { useState, useEffect, useMemo } = React;
`

export const CALCULATOR_CODE = runtime + String.raw`
function App(){
 const [display,setDisplay]=useState('0');
 const [expression,setExpression]=useState('');
 const [history,setHistory]=useState([]);
 const [theme,setTheme]=useState('emerald');
 const clear=()=>{setDisplay('0');setExpression('')};
 const input=(value)=>{
  if(display==='0'&&/^\d$/.test(value)) setDisplay(value);
  else setDisplay(prev=>prev+value);
  setExpression(prev=>prev+value);
 };
 const backspace=()=>{setDisplay(prev=>prev.length>1?prev.slice(0,-1):'0');setExpression(prev=>prev.slice(0,-1))};
 const evaluate=()=>{
  try{
   const result = Function('return ('+expression.replace(/÷/g,'/').replace(/×/g,'*')+')')();
   const value = Number.isFinite(result) ? String(Number(result.toFixed(10))) : 'Error';
   setHistory(prev=>[{expr:expression,result:value},...prev].slice(0,6));
   setDisplay(value);
   setExpression(value);
  }catch{
   setDisplay('Error');
   setExpression('');
  }
 };
 const buttons=['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+'];
 const accent = theme==='emerald' ? 'from-emerald-500 to-teal-500' : theme==='violet' ? 'from-violet-500 to-fuchsia-500' : 'from-sky-500 to-cyan-500';
 return <div className="min-h-screen bg-slate-950 p-6 text-slate-100"><div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"><div className={'rounded-[28px] bg-gradient-to-br '+accent+' p-6 text-white'}><p className="text-xs uppercase tracking-[.3em] opacity-80">Live Calculator</p><h1 className="mt-3 text-4xl font-black">Fast, tactile, and fully interactive.</h1><p className="mt-2 max-w-xl text-white/80">Every button updates real state, and the calculation result is stored in a live history panel.</p></div><div className="mt-6 rounded-[28px] bg-slate-900 p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.25em] text-slate-400">Expression</p><p className="mt-1 break-all text-2xl font-semibold">{expression||'0'}</p></div><div className="rounded-2xl bg-black/30 px-4 py-2 text-right"><p className="text-xs text-slate-400">Display</p><p className="text-3xl font-black">{display}</p></div></div><div className="grid grid-cols-4 gap-3">{buttons.map(btn=><button key={btn} onClick={()=>btn==='='?evaluate():input(btn)} className={'rounded-2xl px-4 py-4 text-lg font-semibold transition hover:scale-[1.02] '+(btn==='='?'bg-white text-slate-950':'+-×÷'.includes(btn)?'bg-white/10 text-white':'bg-slate-800 text-white')}>{btn}</button>)}</div><div className="mt-3 flex gap-3"><button onClick={clear} className="flex-1 rounded-2xl bg-white/10 px-4 py-3 font-semibold">Clear</button><button onClick={backspace} className="flex-1 rounded-2xl bg-white/10 px-4 py-3 font-semibold">Delete</button></div></div></section><aside className="rounded-[32px] border border-white/10 bg-white p-6 text-slate-900 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.3em] text-slate-400">Theme</p><h2 className="text-2xl font-black">Pick a skin</h2></div></div><div className="mt-4 flex gap-2">{['emerald','violet','sky'].map(name=><button key={name} onClick={()=>setTheme(name)} className={'rounded-full px-4 py-2 text-sm font-semibold capitalize '+(theme===name?'bg-slate-900 text-white':'bg-slate-100')}>{name}</button>)}</div><div className="mt-8"><p className="text-sm font-semibold text-slate-500">Recent calculations</p><div className="mt-3 space-y-3">{history.length?history.map((item,i)=><div key={i} className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{item.expr}</p><p className="mt-1 text-xl font-bold">= {item.result}</p></div>):<p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Try a few sums and results will appear here.</p>}</div></div></aside></div></div>
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
`

export const BOOKHAVEN_CODE = runtime + String.raw`
function App(){
 const [books,setBooks]=useState([
  {id:1,title:'Atomic Habits',author:'James Clear',price:24,stock:10,image:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'},
  {id:2,title:'Deep Work',author:'Cal Newport',price:28,stock:5,image:'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'},
  {id:3,title:'The Lean Startup',author:'Eric Ries',price:22,stock:8,image:'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400'},
  {id:4,title:'Zero to One',author:'Peter Thiel',price:30,stock:3,image:'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'},
  {id:5,title:'Psychology of Money',author:'Morgan Housel',price:26,stock:12,image:'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400'},
  {id:6,title:'Steal Like Artist',author:'Austin Kleon',price:18,stock:7,image:'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400'}
 ])
 const [search,setSearch]=useState('')
 const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('bookhaven_cart')||'[]')}catch{return []}})
 const [selected,setSelected]=useState(null)
 const [filters,setFilters]=useState({min:0,max:40})
 useEffect(()=>{localStorage.setItem('bookhaven_cart',JSON.stringify(cart))},[cart])
 const filtered=useMemo(()=>books.filter(b=>b.title.toLowerCase().includes(search.toLowerCase())||b.author.toLowerCase().includes(search.toLowerCase())).filter(b=>b.price>=filters.min&&b.price<=filters.max),[books,search,filters])
 const handleBuy=(id)=>{setBooks(prev=>prev.map(b=>b.id===id?{...b,stock:Math.max(0,b.stock-1)}:b)); setCart(prev=>{const ex=prev.find(i=>i.id===id); if(ex) return prev.map(i=>i.id===id?{...i,qty:i.qty+1}:i); const bk=books.find(b=>b.id===id); return [...prev,{...bk,qty:1}]})}
 const total=cart.reduce((s,i)=>s+i.price*i.qty,0)
 const cartCount=cart.reduce((s,i)=>s+i.qty,0)
 const remove=(id)=>setCart(prev=>prev.filter(i=>i.id!==id))
 return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 text-slate-900"><header className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4"><div><h1 className="text-3xl font-black tracking-tight">BookHaven</h1><p className="text-sm text-slate-500">Curated books, live inventory, real cart logic.</p></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search books or authors..." className="ml-auto w-full max-w-lg rounded-full border border-amber-200 bg-white px-5 py-3 outline-none focus:ring-2 focus:ring-amber-400"/><button onClick={()=>setSelected(null)} className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Cart {cartCount}</button></div></header><main className="mx-auto max-w-7xl px-6 py-8"><section className="mb-8 grid gap-4 rounded-[32px] bg-gradient-to-r from-amber-100 via-orange-50 to-white p-8 lg:grid-cols-[1.3fr_.7fr]"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-amber-700">Independent bookstore</p><h2 className="mt-3 max-w-2xl text-5xl font-black leading-tight">Stories that stay with you.</h2><p className="mt-4 max-w-xl text-slate-600">Use the search, filter the catalogue, and buy books with real state updates and persistence.</p></div><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"><label className="rounded-3xl bg-white p-4 shadow-sm"><span className="text-xs font-semibold uppercase text-slate-400">Min price</span><input type="range" min="0" max="40" value={filters.min} onChange={e=>setFilters(f=>({...f,min:Number(e.target.value)}))} className="mt-3 w-full"/></label><label className="rounded-3xl bg-white p-4 shadow-sm"><span className="text-xs font-semibold uppercase text-slate-400">Max price</span><input type="range" min="10" max="60" value={filters.max} onChange={e=>setFilters(f=>({...f,max:Number(e.target.value)}))} className="mt-3 w-full"/></label><div className="rounded-3xl bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-slate-400">Total</p><p className="mt-2 text-2xl font-black">${'$'}{total.toFixed(2)}</p></div></div></section><section className="grid gap-6 lg:grid-cols-[2fr_1fr]"><div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(b=><article key={b.id} className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm"><img src={b.image} className="h-56 w-full object-cover"/><div className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-bold">{b.title}</h3><p className="text-sm text-slate-500">{b.author}</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{b.stock} left</span></div><p className="mt-4 text-lg font-black">${'$'}{b.price.toFixed(2)}</p><div className="mt-4 flex gap-2"><button onClick={()=>setSelected(b)} className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 font-semibold">Details</button><button onClick={()=>handleBuy(b.id)} disabled={b.stock===0} className="flex-1 rounded-full bg-slate-900 px-4 py-2.5 font-semibold text-white disabled:bg-slate-300">{b.stock===0?'Out of stock':'Buy now'}</button></div></div></article>)}</div><aside className="space-y-4 rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-xl font-bold">Cart</h3><button onClick={()=>setCart([])} className="text-sm text-slate-500">Clear</button></div>{cart.length===0?<p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Your cart is empty.</p>:cart.map(i=><div key={i.id} className="flex items-center justify-between border-b pb-3"><div><p className="font-semibold">{i.title}</p><p className="text-sm text-slate-500">Qty {i.qty}</p></div><div className="text-right"><p className="font-bold">${'$'}{(i.price*i.qty).toFixed(2)}</p><button onClick={()=>remove(i.id)} className="text-sm text-red-500">Remove</button></div></div>)}<div className="border-t pt-4"><p className="text-sm text-slate-500">Order total</p><p className="text-2xl font-black">${'$'}{total.toFixed(2)}</p></div></aside></section>{selected&&<div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/30 p-4"><div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl"><img src={selected.image} className="h-52 w-full rounded-2xl object-cover"/><h3 className="mt-5 text-2xl font-bold">{selected.title}</h3><p className="text-slate-500">{selected.author}</p><p className="mt-3 text-sm leading-6 text-slate-600">This card is interactive and tied to live state. Buy actions reduce stock with Math.max and the cart persists in localStorage.</p><div className="mt-5 flex gap-2"><button onClick={()=>setSelected(null)} className="flex-1 rounded-full border px-4 py-3 font-semibold">Close</button><button onClick={()=>{handleBuy(selected.id);setSelected(null)}} className="flex-1 rounded-full bg-slate-900 px-4 py-3 font-semibold text-white">Buy now</button></div></div></div>}</main></div>
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
`

export const HOSPITAL_CODE = runtime + String.raw`
function App(){
 const [patients,setPatients]=useState([
  {id:1,name:'Amara Okafor',status:'Stable',room:'204',time:'09:30',age:42},
  {id:2,name:'Daniel Brooks',status:'Observation',room:'118',time:'10:15',age:31},
  {id:3,name:'Sofia Chen',status:'Critical',room:'ICU-4',time:'11:00',age:67},
  {id:4,name:'Maya Reed',status:'Stable',room:'312',time:'11:20',age:55}
 ])
 const [query,setQuery]=useState('')
 const [admitOpen,setAdmitOpen]=useState(false)
 const [name,setName]=useState('')
 const [room,setRoom]=useState('TBD')
 const [status,setStatus]=useState('Stable')
 const [beds,setBeds]=useState(24)
 useEffect(()=>{localStorage.setItem('hospital_patients',JSON.stringify(patients))},[patients])
 const visible=useMemo(()=>patients.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())||p.room.toLowerCase().includes(query.toLowerCase())||p.status.toLowerCase().includes(query.toLowerCase())),[patients,query])
 const stats=useMemo(()=>({
  total:patients.length,
  critical:patients.filter(p=>p.status==='Critical').length,
  stable:patients.filter(p=>p.status==='Stable').length,
  occupied:patients.length,
  free:Math.max(0,beds-patients.length)
 }),[patients,beds])
 const nextBeds=Math.max(0,beds-patients.length)
 const admit=()=>{if(!name.trim()) return; setPatients(prev=>[{id:Date.now(),name,status,room,time:'Now',age:0},...prev]); setName(''); setRoom('TBD'); setStatus('Stable'); setAdmitOpen(false)}
 const discharge=(id)=>setPatients(prev=>prev.filter(p=>p.id!==id))
 const toggleCritical=(id)=>setPatients(prev=>prev.map(p=>p.id===id?{...p,status:p.status==='Critical'?'Stable':'Critical'}:p))
 return <div className="min-h-screen bg-slate-50 text-slate-900"><header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4"><div><h1 className="text-3xl font-black">PulseCare OS</h1><p className="text-sm text-slate-500">Live patient management with filter, stats, and actions.</p></div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search patients, room, status..." className="ml-auto w-full max-w-lg rounded-full border border-slate-200 bg-white px-5 py-3 outline-none focus:ring-2 focus:ring-blue-400"/><button onClick={()=>setAdmitOpen(true)} className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white">+ Admit</button></div></header><main className="mx-auto max-w-7xl px-6 py-8"><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><div className="rounded-[28px] bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Patients</p><p className="mt-2 text-3xl font-black">{stats.total}</p></div><div className="rounded-[28px] bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Critical</p><p className="mt-2 text-3xl font-black text-red-600">{stats.critical}</p></div><div className="rounded-[28px] bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Beds free</p><p className="mt-2 text-3xl font-black text-emerald-600">{stats.free}</p></div><div className="rounded-[28px] bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Occupancy</p><p className="mt-2 text-3xl font-black">{Math.round((stats.occupied/Math.max(beds,1))*100)}%</p></div></section><section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]"><div className="rounded-[28px] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Patient list</h2><button onClick={()=>setPatients(prev=>prev.sort((a,b)=>a.name.localeCompare(b.name)))} className="text-sm text-slate-500">Sort A-Z</button></div><div className="space-y-3">{visible.map(p=><article key={p.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-4"><div><p className="font-bold">{p.name}</p><p className="text-sm text-slate-500">Room {p.room} • Age {p.age || 'N/A'} • {p.time}</p></div><span className={'rounded-full px-3 py-1 text-xs font-semibold '+(p.status==='Critical'?'bg-red-100 text-red-700':'bg-emerald-100 text-emerald-700')}>{p.status}</span></div><div className="mt-4 flex gap-2"><button onClick={()=>toggleCritical(p.id)} className="rounded-full border px-4 py-2 text-sm">Toggle critical</button><button onClick={()=>discharge(p.id)} className="rounded-full border px-4 py-2 text-sm text-red-600">Discharge</button></div></article>)}</div></div><aside className="rounded-[28px] bg-white p-5 shadow-sm"><h3 className="text-xl font-bold">Hospital controls</h3><p className="mt-2 text-sm text-slate-500">Beds are clamped with Math.max and data is saved locally.</p><div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Beds configured</p><p className="mt-1 text-3xl font-black">{beds}</p><input type="range" min="4" max="60" value={beds} onChange={e=>setBeds(Number(e.target.value))} className="mt-3 w-full"/></div><div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold">Quick admit</p><button onClick={()=>setAdmitOpen(true)} className="mt-3 w-full rounded-full bg-blue-600 px-4 py-3 font-semibold text-white">Admit patient</button></div></aside></section>{admitOpen&&<div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/30 p-4"><div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl"><h3 className="text-2xl font-bold">Admit patient</h3><div className="mt-4 grid gap-3"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="rounded-2xl border px-4 py-3"/><input value={room} onChange={e=>setRoom(e.target.value)} placeholder="Room" className="rounded-2xl border px-4 py-3"/><select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-2xl border px-4 py-3"><option>Stable</option><option>Observation</option><option>Critical</option></select></div><div className="mt-5 flex gap-2"><button onClick={()=>setAdmitOpen(false)} className="flex-1 rounded-full border px-4 py-3 font-semibold">Cancel</button><button onClick={admit} className="flex-1 rounded-full bg-blue-600 px-4 py-3 font-semibold text-white">Admit</button></div></div></div>}</main></div>
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
`

export const SHOP_CODE = runtime + String.raw`
function App(){
 const [products,setProducts]=useState([
  {id:1,name:'Cloud Lounge Chair',price:480,cat:'Furniture',stock:6,img:'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600'},
  {id:2,name:'Halo Table Lamp',price:120,cat:'Lighting',stock:12,img:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'},
  {id:3,name:'Form Side Table',price:210,cat:'Furniture',stock:8,img:'https://images.unsplash.com/photo-1532372320572-cda25653a694?w=600'},
  {id:4,name:'Soft Wool Throw',price:84,cat:'Textiles',stock:20,img:'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600'},
  {id:5,name:'Stone Vase',price:68,cat:'Decor',stock:15,img:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'},
  {id:6,name:'Oak Sideboard',price:920,cat:'Furniture',stock:2,img:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600'}
 ])
 const [category,setCategory]=useState('All')
 const [search,setSearch]=useState('')
 const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('shop_cart')||'[]')}catch{return []}})
 const [drawer,setDrawer]=useState(false)
 useEffect(()=>{localStorage.setItem('shop_cart',JSON.stringify(cart))},[cart])
 const shown=useMemo(()=>products.filter(p=>(category==='All'||p.cat===category)&& (p.name.toLowerCase().includes(search.toLowerCase())||p.cat.toLowerCase().includes(search.toLowerCase()))),[products,category,search])
 const addToCart=(id)=>{const item=products.find(p=>p.id===id); if(!item||item.stock<1) return; setProducts(prev=>prev.map(p=>p.id===id?{...p,stock:Math.max(0,p.stock-1)}:p)); setCart(prev=>{const hit=prev.find(i=>i.id===id); if(hit) return prev.map(i=>i.id===id?{...i,qty:i.qty+1}:i); return [...prev,{...item,qty:1}]})}
 const total=cart.reduce((s,i)=>s+i.price*i.qty,0)
 const cartCount=cart.reduce((s,i)=>s+i.qty,0)
 const clearCart=()=>setCart([])
 return <div className="min-h-screen bg-[#f6f5f0] text-stone-900"><header className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4"><div><h1 className="text-3xl font-black tracking-[.18em]">FORME</h1><p className="text-sm text-stone-500">Real ecommerce with search, stock updates, local cart persistence.</p></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="ml-auto w-full max-w-lg rounded-full border border-stone-200 bg-white px-5 py-3 outline-none focus:ring-2 focus:ring-stone-400"/><button onClick={()=>setDrawer(true)} className="rounded-full bg-stone-900 px-5 py-3 font-semibold text-white">Bag {cartCount}</button></div></header><main className="mx-auto max-w-7xl px-6 py-8"><section className="rounded-[34px] bg-stone-900 p-10 text-white shadow-2xl"><p className="text-xs uppercase tracking-[.35em] text-stone-400">Curated home goods</p><h2 className="mt-4 max-w-2xl text-6xl font-light leading-tight">Objects for a slower, softer home.</h2><div className="mt-8 flex flex-wrap gap-2">{['All','Furniture','Lighting','Textiles','Decor'].map(cat=><button key={cat} onClick={()=>setCategory(cat)} className={'rounded-full px-4 py-2 text-sm '+(category===cat?'bg-white text-stone-900':'border border-white/20 text-white')}>{cat}</button>)}</div></section><section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]"><div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{shown.map(p=><article key={p.id} className="group overflow-hidden rounded-[28px] bg-white shadow-sm"><img src={p.img} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"/><div className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-bold">{p.name}</h3><p className="text-sm text-stone-500">{p.cat}</p></div><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">{p.stock} left</span></div><div className="mt-5 flex items-center justify-between"><p className="text-lg font-black">${'$'}{p.price.toFixed(2)}</p><button onClick={()=>addToCart(p.id)} disabled={p.stock===0} className="rounded-full bg-stone-900 px-4 py-2.5 font-semibold text-white disabled:bg-stone-300">{p.stock===0?'Sold out':'Add'}</button></div></div></article>)}</div><aside className="rounded-[28px] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-xl font-bold">Cart</h3><button onClick={clearCart} className="text-sm text-stone-500">Clear</button></div>{cart.length===0?<p className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">No items yet.</p>:cart.map(i=><div key={i.id} className="mt-4 flex items-center justify-between border-b pb-3"><div><p className="font-semibold">{i.name}</p><p className="text-sm text-stone-500">Qty {i.qty}</p></div><div className="text-right"><p className="font-bold">${'$'}{(i.price*i.qty).toFixed(2)}</p></div></div>)}<div className="mt-5 border-t pt-4"><p className="text-sm text-stone-500">Total</p><p className="text-2xl font-black">${'$'}{total.toFixed(2)}</p></div></aside></section></main>{drawer&&<div className="fixed inset-0 z-30 bg-black/20" onClick={()=>setDrawer(false)}><aside onClick={e=>e.stopPropagation()} className="ml-auto h-full w-full max-w-md bg-white p-7 shadow-2xl"><div className="flex justify-between"><h3 className="text-2xl font-black">Your bag</h3><button onClick={()=>setDrawer(false)}>×</button></div><div className="my-8 space-y-4">{cart.length===0?<p className="text-sm text-stone-500">Bag is empty.</p>:cart.map(i=><div className="flex justify-between border-b pb-4" key={i.id}><div><b>{i.name}</b><p className="text-sm text-stone-500">Qty {i.qty}</p></div><span>${'$'}{(i.price*i.qty).toFixed(2)}</span></div>)}</div><div className="flex justify-between text-xl font-black"><span>Total</span><span>${'$'}{total.toFixed(2)}</span></div><button onClick={()=>alert('Thanks for your order!')} className="mt-7 w-full rounded-full bg-stone-900 py-4 text-white">Checkout</button></aside></div>}</div>
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
`

export function fallbackTemplate(prompt:string):string {
  const p=prompt.toLowerCase()
  if(p.includes('calculat')||p.includes('calc')) return CALCULATOR_CODE
  if(p.includes('book')||p.includes('bookhaven')||p.includes('library')) return BOOKHAVEN_CODE
  if(p.includes('hospital')||p.includes('clinic')||p.includes('patient')||p.includes('medical')) return HOSPITAL_CODE
  if(p.includes('shop')||p.includes('store')||p.includes('ecommerce')||p.includes('commerce')||p.includes('cart')) return SHOP_CODE
  return BOOKHAVEN_CODE
}

// Backwards-compatible alias for older store code; Builder uses the AI pipeline first.
export const generateApp = fallbackTemplate
