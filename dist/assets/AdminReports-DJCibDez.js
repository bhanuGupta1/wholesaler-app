import{u as B,r as h,j as e,L as K,g as y,c as v,d as $}from"./index-Cayz1xms.js";import{U as A,C as M,T as E}from"./users-C33UlmdB.js";import{S as k}from"./shopping-cart-C3-LX7ba.js";import{R as Q}from"./refresh-cw-2-R4Kr26.js";import{D as W}from"./dollar-sign-C4Y0PZxW.js";import{m as U}from"./proxy-XmAmU5Pj.js";import{D as Y}from"./download-DPlqKAv_.js";import"./createLucideIcon-ZL5jKoAQ.js";const se=()=>{var w,D;const{darkMode:s}=B(),[L,j]=h.useState(!0),[i,P]=h.useState({users:[],orders:[],products:[],analytics:{}}),[N,F]=h.useState("30d"),[_,q]=h.useState(new Set),V=async()=>{j(!0);try{const[t,g,o]=await Promise.all([y(v($,"users")),y(v($,"orders")),y(v($,"products"))]),m=t.docs.map(a=>({id:a.id,...a.data()})),l=g.docs.map(a=>({id:a.id,...a.data()})),x=o.docs.map(a=>({id:a.id,...a.data()})),r=l.reduce((a,u)=>a+(u.total||0),0),n=l.length>0?r/l.length:0,d=m.length,c=m.filter(a=>a.accountType==="business").length;P({users:m,orders:l,products:x,analytics:{totalRevenue:r,averageOrderValue:n,totalUsers:d,businessUsers:c,totalOrders:l.length,totalProducts:x.length}})}catch(t){console.error("Error fetching reports data:",t)}finally{j(!1)}};h.useEffect(()=>{V()},[N]);const f=(t,g)=>{let o="";t.users&&(o+=`USERS REPORT
`,o+=`ID,Name,Email,Account Type,Status,Created Date
`,t.users.forEach(r=>{var n,d,c;o+=`"${r.id}","${r.displayName||""}","${r.email}","${r.accountType}","${r.status||"active"}","${((c=(d=(n=r.createdAt)==null?void 0:n.toDate)==null?void 0:d.call(n))==null?void 0:c.toLocaleDateString())||"N/A"}"
`}),o+=`
`),t.orders&&(o+=`ORDERS REPORT
`,o+=`Order ID,Customer Email,Total,Status,Date,Items Count
`,t.orders.forEach(r=>{var n,d,c,a;o+=`"${r.id}","${r.customerEmail||""}","${r.total||0}","${r.status||""}","${((c=(d=(n=r.createdAt)==null?void 0:n.toDate)==null?void 0:d.call(n))==null?void 0:c.toLocaleDateString())||"N/A"}","${((a=r.items)==null?void 0:a.length)||0}"
`}),o+=`
`),t.products&&(o+=`PRODUCTS REPORT
`,o+=`ID,Name,Category,Price,Stock,Creator
`,t.products.forEach(r=>{o+=`"${r.id}","${r.name||""}","${r.category||""}","${r.price||0}","${r.stock||0}","${r.createdBy||""}"
`}));const m=new Blob([o],{type:"text/csv;charset=utf-8;"}),l=document.createElement("a"),x=URL.createObjectURL(m);l.setAttribute("href",x),l.setAttribute("download",g),l.style.visibility="hidden",document.body.appendChild(l),l.click(),document.body.removeChild(l)},R=async(t,g)=>{var l,x,r,n,d,c,a,u,S;const o=`
      <html>
        <head>
          <title>Admin Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; }
            h2 { color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Admin Dashboard Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          
          <div class="summary">
            <h2>Summary</h2>
            <p>Total Users: ${((l=t.analytics)==null?void 0:l.totalUsers)||0}</p>
            <p>Total Orders: ${((x=t.analytics)==null?void 0:x.totalOrders)||0}</p>
            <p>Total Products: ${((r=t.analytics)==null?void 0:r.totalProducts)||0}</p>
            <p>Total Revenue: $${((d=(n=t.analytics)==null?void 0:n.totalRevenue)==null?void 0:d.toFixed(2))||"0.00"}</p>
            <p>Average Order Value: $${((a=(c=t.analytics)==null?void 0:c.averageOrderValue)==null?void 0:a.toFixed(2))||"0.00"}</p>
          </div>

          <h2>Users (Top 10)</h2>
          <table>
            <tr><th>Name</th><th>Email</th><th>Account Type</th><th>Status</th></tr>
            ${((u=t.users)==null?void 0:u.slice(0,10).map(p=>`
              <tr>
                <td>${p.displayName||"N/A"}</td>
                <td>${p.email}</td>
                <td>${p.accountType}</td>
                <td>${p.status||"active"}</td>
              </tr>
            `).join(""))||""}
          </table>

          <h2>Recent Orders (Top 10)</h2>
          <table>
            <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
            ${((S=t.orders)==null?void 0:S.slice(0,10).map(p=>{var T,b,C,O;return`
              <tr>
                <td>${p.id}</td>
                <td>${p.customerEmail||"N/A"}</td>
                <td>$${((T=p.total)==null?void 0:T.toFixed(2))||"0.00"}</td>
                <td>${p.status||"N/A"}</td>
                <td>${((O=(C=(b=p.createdAt)==null?void 0:b.toDate)==null?void 0:C.call(b))==null?void 0:O.toLocaleDateString())||"N/A"}</td>
              </tr>
            `}).join(""))||""}
          </table>
        </body>
      </html>
    `,m=window.open("","_blank");m.document.write(o),m.document.close(),setTimeout(()=>{m.print(),m.close()},500)},I=t=>{var l,x,r,n,d,c,a;const g=`Admin Dashboard Report - ${new Date().toLocaleDateString()}`,o=`Admin Dashboard Report Summary:
    
Total Users: ${((l=t.analytics)==null?void 0:l.totalUsers)||0}
Total Orders: ${((x=t.analytics)==null?void 0:x.totalOrders)||0}
Total Products: ${((r=t.analytics)==null?void 0:r.totalProducts)||0}
Total Revenue: $${((d=(n=t.analytics)==null?void 0:n.totalRevenue)==null?void 0:d.toFixed(2))||"0.00"}
Average Order Value: $${((a=(c=t.analytics)==null?void 0:c.averageOrderValue)==null?void 0:a.toFixed(2))||"0.00"}

Generated on: ${new Date().toLocaleString()}

Note: This is an automated report from your admin dashboard.`,m=`mailto:?subject=${encodeURIComponent(g)}&body=${encodeURIComponent(o)}`;window.location.href=m},G=[{id:"users",title:"Users Report",description:"Complete user database with account types and status",icon:A,color:"blue",count:i.users.length},{id:"orders",title:"Orders Report",description:"All orders with customer details and revenue data",icon:k,color:"green",count:i.orders.length},{id:"products",title:"Products Report",description:"Product inventory with pricing and stock levels",icon:M,color:"purple",count:i.products.length},{id:"analytics",title:"Analytics Summary",description:"Key performance metrics and business insights",icon:E,color:"orange",count:Object.keys(i.analytics).length}];return L?e.jsx("div",{className:`min-h-screen ${s?"bg-gray-900":"bg-gray-50"}`,children:e.jsx("div",{className:"container mx-auto px-4 py-8 max-w-7xl",children:e.jsx("div",{className:"flex items-center justify-center py-12",children:e.jsxs("div",{className:`text-center ${s?"text-gray-400":"text-gray-600"}`,children:[e.jsx(Q,{className:"h-8 w-8 animate-spin mx-auto mb-4"}),e.jsx("div",{children:"Loading reports data..."})]})})})}):e.jsx("div",{className:`min-h-screen ${s?"bg-gray-900":"bg-gray-50"}`,children:e.jsxs("div",{className:"container mx-auto px-4 py-8 max-w-7xl",children:[e.jsx("div",{className:"mb-8",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:`text-3xl font-bold ${s?"text-white":"text-gray-900"}`,children:"Reports Dashboard"}),e.jsx("p",{className:`mt-1 text-sm ${s?"text-gray-400":"text-gray-500"}`,children:"Generate and export comprehensive business reports"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("select",{value:N,onChange:t=>F(t.target.value),className:`px-4 py-2 rounded-lg border ${s?"bg-gray-800 border-gray-600 text-white":"bg-white border-gray-300 text-gray-900"}`,children:[e.jsx("option",{value:"7d",children:"Last 7 Days"}),e.jsx("option",{value:"30d",children:"Last 30 Days"}),e.jsx("option",{value:"90d",children:"Last 90 Days"}),e.jsx("option",{value:"1y",children:"Last Year"})]}),e.jsx(K,{to:"/admin",className:`px-4 py-2 rounded-lg text-sm transition-all border ${s?"bg-gray-800 hover:bg-gray-700 text-blue-400 border-blue-500/50":"bg-white hover:bg-gray-50 text-blue-600 border-blue-500/50"}`,children:"← Back to Admin"})]})]})}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",children:[{title:"Total Revenue",value:`$${((w=i.analytics.totalRevenue)==null?void 0:w.toFixed(2))||"0.00"}`,icon:W,color:"green"},{title:"Total Orders",value:i.analytics.totalOrders||0,icon:k,color:"blue"},{title:"Total Users",value:i.analytics.totalUsers||0,icon:A,color:"purple"},{title:"Avg Order Value",value:`$${((D=i.analytics.averageOrderValue)==null?void 0:D.toFixed(2))||"0.00"}`,icon:E,color:"orange"}].map((t,g)=>e.jsx(U.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:g*.1},className:`p-6 rounded-lg border ${s?"bg-gray-800 border-gray-700":"bg-white border-gray-200"}`,children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("div",{className:`p-3 rounded-lg ${t.color==="green"?"bg-green-100 text-green-600":t.color==="blue"?"bg-blue-100 text-blue-600":t.color==="purple"?"bg-purple-100 text-purple-600":"bg-orange-100 text-orange-600"}`,children:e.jsx(t.icon,{className:"h-6 w-6"})}),e.jsxs("div",{className:"ml-4",children:[e.jsx("p",{className:`text-sm ${s?"text-gray-400":"text-gray-500"}`,children:t.title}),e.jsx("p",{className:`text-2xl font-bold ${s?"text-white":"text-gray-900"}`,children:t.value})]})]})},g))}),e.jsxs("div",{className:`p-6 rounded-lg border ${s?"bg-gray-800 border-gray-700":"bg-white border-gray-200"} mb-8`,children:[e.jsxs("h3",{className:`text-lg font-semibold mb-4 ${s?"text-blue-400":"text-blue-600"} flex items-center`,children:[e.jsx(Y,{className:"mr-3 h-5 w-5"}),"Quick Export Options"]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("button",{onClick:()=>f(i,`admin-report-${new Date().toISOString().split("T")[0]}.csv`),className:`p-4 rounded border transition-all hover:scale-105 text-center ${s?"bg-green-800/20 border-green-700 text-green-400 hover:bg-green-800/30":"bg-green-50 border-green-200 text-green-700 hover:bg-green-100"}`,children:[e.jsx("div",{className:"text-2xl mb-2",children:"📊"}),e.jsx("div",{className:"font-medium",children:"CSV Export"}),e.jsx("div",{className:"text-xs opacity-75",children:"Download raw data"})]}),e.jsxs("button",{onClick:()=>R(i,`admin-report-${new Date().toISOString().split("T")[0]}.pdf`),className:`p-4 rounded border transition-all hover:scale-105 text-center ${s?"bg-red-800/20 border-red-700 text-red-400 hover:bg-red-800/30":"bg-red-50 border-red-200 text-red-700 hover:bg-red-100"}`,children:[e.jsx("div",{className:"text-2xl mb-2",children:"📄"}),e.jsx("div",{className:"font-medium",children:"PDF Report"}),e.jsx("div",{className:"text-xs opacity-75",children:"Generate formatted report"})]}),e.jsxs("button",{onClick:()=>I(i),className:`p-4 rounded border transition-all hover:scale-105 text-center ${s?"bg-blue-800/20 border-blue-700 text-blue-400 hover:bg-blue-800/30":"bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"}`,children:[e.jsx("div",{className:"text-2xl mb-2",children:"📧"}),e.jsx("div",{className:"font-medium",children:"Email Report"}),e.jsx("div",{className:"text-xs opacity-75",children:"Send via email"})]})]})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:G.map((t,g)=>e.jsxs(U.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:g*.1},className:`p-6 rounded-lg border ${s?"bg-gray-800 border-gray-700":"bg-white border-gray-200"}`,children:[e.jsx("div",{className:"flex items-start justify-between",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("div",{className:`p-3 rounded-lg ${t.color==="blue"?"bg-blue-100 text-blue-600":t.color==="green"?"bg-green-100 text-green-600":t.color==="purple"?"bg-purple-100 text-purple-600":"bg-orange-100 text-orange-600"}`,children:e.jsx(t.icon,{className:"h-6 w-6"})}),e.jsxs("div",{className:"ml-4",children:[e.jsx("h3",{className:`text-lg font-semibold ${s?"text-white":"text-gray-900"}`,children:t.title}),e.jsx("p",{className:`text-sm ${s?"text-gray-400":"text-gray-500"}`,children:t.description}),e.jsxs("p",{className:`text-xs mt-1 ${s?"text-gray-500":"text-gray-400"}`,children:[t.count," records"]})]})]})}),e.jsxs("div",{className:"mt-4 flex gap-2",children:[e.jsx("button",{onClick:()=>f({[t.id]:i[t.id]},`${t.id}-report.csv`),className:`px-3 py-1 text-xs rounded ${s?"bg-gray-700 text-gray-300 hover:bg-gray-600":"bg-gray-100 text-gray-700 hover:bg-gray-200"} transition-colors`,children:"Export CSV"}),e.jsx("button",{onClick:()=>R({[t.id]:i[t.id],analytics:i.analytics},`${t.id}-report.pdf`),className:`px-3 py-1 text-xs rounded ${s?"bg-gray-700 text-gray-300 hover:bg-gray-600":"bg-gray-100 text-gray-700 hover:bg-gray-200"} transition-colors`,children:"Export PDF"})]})]},t.id))})]})})};export{se as default};
