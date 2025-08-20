import{u as w,a as T,j as e,L as E,d as y}from"./index-DxRwWpQI.js";import{r as j}from"./vendor-DJ1oPbzn.js";import{g as v,c as f}from"./firebase-DMhjYMbV.js";const D=({data:a,title:p,type:N="bar",color:b="blue",darkMode:h})=>{if(!a||a.length===0)return e.jsxs("div",{className:`p-6 rounded-lg border ${h?"bg-gray-800/50 border-gray-700":"bg-white border-gray-200"}`,children:[e.jsx("h3",{className:`text-lg font-semibold mb-4 text-${b}-500`,children:p}),e.jsxs("div",{className:"text-center py-8",children:[e.jsx("div",{className:`text-4xl mb-2 ${h?"text-gray-600":"text-gray-400"}`,children:"📊"}),e.jsx("div",{className:`text-sm ${h?"text-gray-500":"text-gray-400"}`,children:"No data available"})]})]});const o=Math.max(...a.map(l=>l.value));return e.jsxs("div",{className:`p-6 rounded-lg border ${h?"bg-gray-800/50 border-gray-700":"bg-white border-gray-200"} hover:shadow-lg transition-all`,children:[e.jsxs("h3",{className:`text-lg font-semibold mb-4 text-${b}-500 flex items-center`,children:[e.jsx("span",{className:"mr-2",children:"📊"}),p]}),N==="bar"&&e.jsx("div",{className:"space-y-3",children:a.map((l,g)=>{const c=o>0?l.value/o*100:0;return e.jsxs("div",{className:"relative",children:[e.jsxs("div",{className:"flex justify-between items-center mb-1",children:[e.jsx("span",{className:`text-sm ${h?"text-gray-300":"text-gray-700"}`,children:l.label}),e.jsx("span",{className:`text-sm font-bold text-${b}-500`,children:l.value})]}),e.jsx("div",{className:`w-full h-3 rounded-full ${h?"bg-gray-700":"bg-gray-200"}`,children:e.jsx("div",{className:`h-full rounded-full bg-${b}-500 transition-all duration-1000`,style:{width:`${c}%`}})})]},g)})}),N==="line"&&e.jsx("div",{className:"relative h-32",children:e.jsx("svg",{className:"w-full h-full",viewBox:"0 0 400 100",children:a.map((l,g)=>{const c=g/Math.max(a.length-1,1)*380+10,d=90-l.value/(o||1)*80;return e.jsxs("g",{children:[e.jsx("circle",{cx:c,cy:d,r:"4",className:`fill-${b}-500`}),g>0&&e.jsx("line",{x1:(g-1)/Math.max(a.length-1,1)*380+10,y1:90-a[g-1].value/(o||1)*80,x2:c,y2:d,className:`stroke-${b}-500`,strokeWidth:"2"})]},g)})})}),N==="pie"&&e.jsx("div",{className:"space-y-2",children:a.map((l,g)=>{const c=a.reduce((m,r)=>m+r.value,0),d=c>0?(l.value/c*100).toFixed(1):0;return e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx("div",{className:`w-4 h-4 rounded-full bg-${b}-${400+g*100} mr-3`}),e.jsx("span",{className:`text-sm ${h?"text-gray-300":"text-gray-700"}`,children:l.label})]}),e.jsxs("span",{className:`text-sm font-bold text-${b}-500`,children:[d,"%"]})]},g)})})]})},R=({darkMode:a})=>{const[p,N]=j.useState({totalUsers:0,activeUsers:0,totalProducts:0,totalOrders:0,pendingApprovals:0,businessUsers:0,regularUsers:0,recentRegistrations:0}),[b,h]=j.useState(!0);j.useEffect(()=>{const l=async()=>{try{const[c,d,m]=await Promise.all([v(f(y,"users")),v(f(y,"products")),v(f(y,"orders"))]),r=c.docs.map(t=>t.data()),i=r.filter(t=>t.status==="active"&&t.approved).length,x=r.filter(t=>t.status==="pending_approval"||t.status==="pending").length,$=r.filter(t=>t.accountType==="business").length,s=r.filter(t=>t.accountType==="user").length,n=new Date(Date.now()-7*24*60*60*1e3),u=r.filter(t=>{var S;const A=(S=t.createdAt)==null?void 0:S.toDate();return A&&A>n}).length;N({totalUsers:c.size,activeUsers:i,totalProducts:d.size,totalOrders:m.size,pendingApprovals:x,businessUsers:$,regularUsers:s,recentRegistrations:u})}catch(c){console.error("Error fetching real-time stats:",c)}finally{h(!1)}};l();const g=setInterval(l,3e4);return()=>clearInterval(g)},[]);const o=[{label:"Total Users",value:p.totalUsers,color:"blue",icon:"👥"},{label:"Active Users",value:p.activeUsers,color:"green",icon:"✅"},{label:"Total Products",value:p.totalProducts,color:"purple",icon:"📦"},{label:"Total Orders",value:p.totalOrders,color:"orange",icon:"📋"},{label:"Pending Approvals",value:p.pendingApprovals,color:"yellow",icon:"⏳"},{label:"Recent Registrations",value:p.recentRegistrations,color:"cyan",icon:"🆕"}];return b?e.jsx("div",{className:"flex items-center justify-center py-12",children:e.jsxs("div",{className:`text-center ${a?"text-gray-400":"text-gray-600"}`,children:[e.jsx("div",{className:"text-2xl mb-2",children:"📊"}),e.jsx("div",{children:"Loading statistics..."})]})}):e.jsxs("div",{className:`p-6 rounded-lg border ${a?"bg-gray-800/50 border-gray-700":"bg-white border-gray-200"}`,children:[e.jsxs("h3",{className:`text-lg font-semibold mb-6 ${a?"text-blue-400":"text-blue-600"} flex items-center`,children:[e.jsx("span",{className:"mr-3",children:"📡"}),"Real-time Statistics"]}),e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-4",children:o.map((l,g)=>e.jsxs("div",{className:`p-4 rounded border ${a?"bg-gray-700/50 border-gray-600":"bg-gray-50 border-gray-200"} hover:shadow-md transition-all`,children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("div",{className:"text-2xl",children:l.icon}),e.jsx("div",{className:`text-2xl font-bold text-${l.color}-500`,children:l.value})]}),e.jsx("div",{className:`text-sm ${a?"text-gray-400":"text-gray-600"}`,children:l.label})]},g))}),e.jsxs("div",{className:"mt-6 grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:`p-4 rounded border ${a?"bg-gray-700/50 border-gray-600":"bg-gray-50 border-gray-200"}`,children:[e.jsx("h4",{className:`text-sm font-medium mb-2 ${a?"text-gray-300":"text-gray-700"}`,children:"User Distribution"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:`text-xs ${a?"text-gray-400":"text-gray-600"}`,children:"Business Users:"}),e.jsx("span",{className:"text-xs font-bold text-blue-500",children:p.businessUsers})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:`text-xs ${a?"text-gray-400":"text-gray-600"}`,children:"Regular Users:"}),e.jsx("span",{className:"text-xs font-bold text-green-500",children:p.regularUsers})]})]})]}),e.jsxs("div",{className:`p-4 rounded border ${a?"bg-gray-700/50 border-gray-600":"bg-gray-50 border-gray-200"}`,children:[e.jsx("h4",{className:`text-sm font-medium mb-2 ${a?"text-gray-300":"text-gray-700"}`,children:"System Health"}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("div",{className:"w-3 h-3 bg-green-500 rounded-full mr-2"}),e.jsx("span",{className:`text-xs ${a?"text-green-400":"text-green-600"}`,children:"All systems operational"})]})]})]})]})},U=({darkMode:a,timeRange:p})=>{const[N,b]=j.useState([]),[h,o]=j.useState(!0);return j.useEffect(()=>{(async()=>{try{const c=(await v(f(y,"users"))).docs.map(r=>({id:r.id,...r.data()})),d=new Map;c.forEach(r=>{var x;const i=(x=r.createdAt)==null?void 0:x.toDate();if(i){const $=i.toISOString().split("T")[0];d.set($,(d.get($)||0)+1)}});const m=Array.from(d.entries()).map(([r,i])=>({label:new Date(r).toLocaleDateString("en-US",{month:"short",day:"numeric"}),value:i,fullDate:r})).sort((r,i)=>new Date(r.fullDate)-new Date(i.fullDate)).slice(-7);b(m)}catch(g){console.error("Error fetching user activity:",g)}finally{o(!1)}})()},[p]),h?e.jsx("div",{className:"flex items-center justify-center py-12",children:e.jsxs("div",{className:`text-center ${a?"text-gray-400":"text-gray-600"}`,children:[e.jsx("div",{className:"text-2xl mb-2",children:"📈"}),e.jsx("div",{children:"Loading user activity..."})]})}):e.jsx(D,{data:N,title:"User Registrations (Last 7 days)",type:"line",color:"green",darkMode:a})},P=({darkMode:a})=>{const[p,N]=j.useState([]),[b,h]=j.useState(!0);return j.useEffect(()=>{(async()=>{try{const c=(await v(f(y,"users"))).docs.map(m=>m.data()).reduce((m,r)=>{let i=r.accountType||"user";return i==="business"?r.businessType==="seller"?i="Business Seller":r.businessType==="buyer"?i="Business Buyer":i="Business User":i==="user"?i="Regular User":i==="admin"?i="Administrator":i==="manager"&&(i="Manager"),m[i]=(m[i]||0)+1,m},{}),d=Object.entries(c).map(([m,r])=>({label:m,value:r}));N(d)}catch(l){console.error("Error fetching account distribution:",l)}finally{h(!1)}})()},[]),b?e.jsx("div",{className:"flex items-center justify-center py-12",children:e.jsxs("div",{className:`text-center ${a?"text-gray-400":"text-gray-600"}`,children:[e.jsx("div",{className:"text-2xl mb-2",children:"👥"}),e.jsx("div",{children:"Loading account distribution..."})]})}):e.jsx(D,{data:p,title:"Account Type Distribution",type:"pie",color:"purple",darkMode:a})},O=({darkMode:a})=>{const[p,N]=j.useState([]),[b,h]=j.useState(!0);return j.useEffect(()=>{(async()=>{try{const[l,g]=await Promise.all([v(f(y,"products")),v(f(y,"users"))]),c=l.docs.map(i=>i.data()),d=g.docs.map(i=>({id:i.id,...i.data()})),m=c.reduce((i,x)=>{const $=x.createdBy,s=d.find(u=>u.id===$),n=(s==null?void 0:s.businessName)||(s==null?void 0:s.displayName)||(s==null?void 0:s.email)||"Unknown";return i[n]=(i[n]||0)+1,i},{}),r=Object.entries(m).map(([i,x])=>({label:i.length>15?i.substring(0,15)+"...":i,value:x})).sort((i,x)=>x.value-i.value).slice(0,5);N(r)}catch(l){console.error("Error fetching product analytics:",l)}finally{h(!1)}})()},[]),b?e.jsx("div",{className:"flex items-center justify-center py-12",children:e.jsxs("div",{className:`text-center ${a?"text-gray-400":"text-gray-600"}`,children:[e.jsx("div",{className:"text-2xl mb-2",children:"📦"}),e.jsx("div",{children:"Loading product analytics..."})]})}):e.jsx(D,{data:p,title:"Top Product Contributors",type:"bar",color:"cyan",darkMode:a})},C=({darkMode:a,analyticsData:p={}})=>{const N=async()=>{try{const[o,l,g]=await Promise.all([v(f(y,"users")),v(f(y,"orders")),v(f(y,"products"))]),c=o.docs.map(s=>({id:s.id,...s.data()})),d=l.docs.map(s=>({id:s.id,...s.data()})),m=g.docs.map(s=>({id:s.id,...s.data()}));let r=`ANALYTICS EXPORT REPORT
`;r+=`Generated on: ${new Date().toLocaleString()}

`,r+=`USERS DATA
`,r+=`ID,Name,Email,Account Type,Status,Created Date
`,c.forEach(s=>{var u;const n=(u=s.createdAt)!=null&&u.toDate?s.createdAt.toDate().toLocaleDateString():"N/A";r+=`"${s.id}","${s.displayName||""}","${s.email}","${s.accountType}","${s.status||"active"}","${n}"
`}),r+=`
ORDERS DATA
`,r+=`Order ID,Customer Email,Total,Status,Date,Items Count
`,d.forEach(s=>{var u,t;const n=(u=s.createdAt)!=null&&u.toDate?s.createdAt.toDate().toLocaleDateString():"N/A";r+=`"${s.id}","${s.customerEmail||""}","${s.total||0}","${s.status||""}","${n}","${((t=s.items)==null?void 0:t.length)||0}"
`}),r+=`
PRODUCTS DATA
`,r+=`ID,Name,Category,Price,Stock,Creator
`,m.forEach(s=>{r+=`"${s.id}","${s.name||""}","${s.category||""}","${s.price||0}","${s.stock||0}","${s.createdBy||""}"
`});const i=new Blob([r],{type:"text/csv;charset=utf-8;"}),x=document.createElement("a"),$=URL.createObjectURL(i);x.setAttribute("href",$),x.setAttribute("download",`analytics-report-${new Date().toISOString().split("T")[0]}.csv`),x.style.visibility="hidden",document.body.appendChild(x),x.click(),document.body.removeChild(x),alert("CSV export completed successfully!")}catch(o){console.error("CSV Export Error:",o),alert("Error exporting CSV. Please try again.")}},b=async()=>{try{const[o,l,g]=await Promise.all([v(f(y,"users")),v(f(y,"orders")),v(f(y,"products"))]),c=o.docs.map(n=>({id:n.id,...n.data()})),d=l.docs.map(n=>({id:n.id,...n.data()})),m=g.docs.map(n=>({id:n.id,...n.data()})),r=d.reduce((n,u)=>n+(u.total||0),0),i=d.length>0?r/d.length:0,x=c.filter(n=>n.accountType==="business").length,$=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Analytics Report</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 40px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #007bff; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            h1 { 
              color: #007bff; 
              margin: 0;
              font-size: 2.5em;
            }
            .subtitle {
              color: #666;
              font-size: 1.1em;
              margin: 10px 0;
            }
            .summary { 
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 25px; 
              border-radius: 10px; 
              margin: 30px 0;
              border-left: 5px solid #007bff;
            }
            .summary h2 {
              color: #007bff;
              margin-top: 0;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin: 20px 0;
            }
            .stat-item {
              background: white;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #ddd;
              text-align: center;
            }
            .stat-value {
              font-size: 1.8em;
              font-weight: bold;
              color: #007bff;
            }
            .stat-label {
              color: #666;
              font-size: 0.9em;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 25px 0; 
              background: white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px 8px; 
              text-align: left; 
            }
            th { 
              background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f8f9fa; 
            }
            tr:hover {
              background-color: #e3f2fd;
            }
            .section {
              margin: 40px 0;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #007bff;
              border-bottom: 2px solid #007bff;
              padding-bottom: 10px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 0.9em;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Analytics Dashboard Report</h1>
            <div class="subtitle">Comprehensive Business Intelligence Summary</div>
            <div class="subtitle">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="summary">
            <h2>📈 Executive Summary</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">${c.length}</div>
                <div class="stat-label">Total Users</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${d.length}</div>
                <div class="stat-label">Total Orders</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${r.toFixed(2)}</div>
                <div class="stat-label">Total Revenue</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${i.toFixed(2)}</div>
                <div class="stat-label">Avg Order Value</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>👥 Users Overview (Top 15)</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Account Type</th>
                  <th>Status</th>
                  <th>Join Date</th>
                </tr>
              </thead>
              <tbody>
                ${c.slice(0,15).map(n=>{var u,t,A;return`
                  <tr>
                    <td>${n.displayName||"N/A"}</td>
                    <td>${n.email}</td>
                    <td>${n.accountType}</td>
                    <td>${n.status||"active"}</td>
                    <td>${((A=(t=(u=n.createdAt)==null?void 0:u.toDate)==null?void 0:t.call(u))==null?void 0:A.toLocaleDateString())||"N/A"}</td>
                  </tr>
                `}).join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>🛒 Recent Orders (Top 15)</h2>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${d.slice(0,15).map(n=>{var u,t,A,S;return`
                  <tr>
                    <td>${n.id.substring(0,8)}...</td>
                    <td>${n.customerEmail||"N/A"}</td>
                    <td>${(n.total||0).toFixed(2)}</td>
                    <td>${n.status||"N/A"}</td>
                    <td>${((u=n.items)==null?void 0:u.length)||0}</td>
                    <td>${((S=(A=(t=n.createdAt)==null?void 0:t.toDate)==null?void 0:A.call(t))==null?void 0:S.toLocaleDateString())||"N/A"}</td>
                  </tr>
                `}).join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>📦 Products Overview (Top 15)</h2>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Creator</th>
                </tr>
              </thead>
              <tbody>
                ${m.slice(0,15).map(n=>`
                  <tr>
                    <td>${n.name||"N/A"}</td>
                    <td>${n.category||"N/A"}</td>
                    <td>${(n.price||0).toFixed(2)}</td>
                    <td>${n.stock||0}</td>
                    <td>${n.createdBy||"N/A"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>📊 This report contains ${c.length} users, ${d.length} orders, and ${m.length} products.</p>
            <p>Generated automatically by Admin Analytics Dashboard</p>
          </div>
        </body>
        </html>
      `,s=window.open("","_blank");s.document.write($),s.document.close(),setTimeout(()=>{s.print(),setTimeout(()=>{s.close()},1e3)},500),alert("PDF export initiated! Please check your print dialog.")}catch(o){console.error("PDF Export Error:",o),alert("Error generating PDF. Please try again.")}},h=async()=>{try{const[o,l,g]=await Promise.all([v(f(y,"users")),v(f(y,"orders")),v(f(y,"products"))]),c=o.docs.map(t=>({id:t.id,...t.data()})),d=l.docs.map(t=>({id:t.id,...t.data()})),m=g.docs.map(t=>({id:t.id,...t.data()})),r=d.reduce((t,A)=>t+(A.total||0),0),i=d.length>0?r/d.length:0,x=c.filter(t=>t.accountType==="business").length,$=d.filter(t=>t.status==="pending").length,s=`📊 Admin Analytics Report - ${new Date().toLocaleDateString()}`,n=`🎯 ADMIN ANALYTICS DASHBOARD REPORT
═══════════════════════════════════════

📅 Report Date: ${new Date().toLocaleString()}

📊 KEY METRICS SUMMARY:
──────────────────────
👥 Total Users: ${c.length}
🏢 Business Users: ${x}
🛒 Total Orders: ${d.length}
⏳ Pending Orders: ${$}
📦 Total Products: ${m.length}
💰 Total Revenue: ${r.toFixed(2)}
📈 Average Order Value: ${i.toFixed(2)}

🔍 RECENT ACTIVITY:
──────────────────
• Last 5 Users: ${c.slice(-5).map(t=>t.displayName||t.email).join(", ")}
• Recent Orders: ${d.slice(-3).length} in last batch
• Low Stock Items: ${m.filter(t=>(t.stock||0)<10).length} products

⚡ SYSTEM HEALTH:
────────────────
✅ Database Status: Operational
✅ User Management: Active
✅ Order Processing: Running
✅ Product Catalog: Updated

📌 ACTION ITEMS:
───────────────
${$>0?`🔴 ${$} orders pending review`:"✅ No pending orders"}
${m.filter(t=>(t.stock||0)<5).length>0?`🔴 ${m.filter(t=>(t.stock||0)<5).length} products critically low stock`:"✅ Stock levels healthy"}
${c.filter(t=>t.status==="pending").length>0?`🔴 ${c.filter(t=>t.status==="pending").length} user approvals pending`:"✅ No pending user approvals"}

═══════════════════════════════════════
📧 This is an automated report from your Admin Dashboard.
🔗 For detailed analysis, please visit the full dashboard.

Generated by: Admin Analytics System
Timestamp: ${new Date().toISOString()}`,u=`mailto:?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(n)}`;window.open(u,"_self"),alert("Email client opened with report summary!")}catch(o){console.error("Email Report Error:",o),alert("Error preparing email report. Please try again.")}};return e.jsxs("div",{className:`p-6 rounded-lg border ${a?"bg-gray-800/50 border-gray-700":"bg-white border-gray-200"}`,children:[e.jsxs("h3",{className:`text-lg font-semibold mb-4 ${a?"text-blue-400":"text-blue-600"} flex items-center`,children:[e.jsx("span",{className:"mr-3",children:"📤"}),"Export Options"]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[{label:"CSV Export",icon:"📊",color:"green",action:N,description:"Download raw data"},{label:"PDF Report",icon:"📄",color:"red",action:b,description:"Generate formatted report"},{label:"Email Report",icon:"📧",color:"blue",action:h,description:"Send via email"}].map((o,l)=>e.jsxs("button",{onClick:o.action,className:`p-4 rounded border transition-all hover:scale-105 text-center ${a?o.color==="green"?"bg-green-800/20 border-green-700 text-green-400 hover:bg-green-800/30":o.color==="red"?"bg-red-800/20 border-red-700 text-red-400 hover:bg-red-800/30":"bg-blue-800/20 border-blue-700 text-blue-400 hover:bg-blue-800/30":o.color==="green"?"bg-green-50 border-green-200 text-green-700 hover:bg-green-100":o.color==="red"?"bg-red-50 border-red-200 text-red-700 hover:bg-red-100":"bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"}`,children:[e.jsx("div",{className:"text-2xl mb-2",children:o.icon}),e.jsx("div",{className:"font-medium",children:o.label}),e.jsx("div",{className:"text-xs opacity-75",children:o.description})]},l))})]})},F=()=>{const{darkMode:a}=w(),{user:p}=T(),[N,b]=j.useState(!1),[h,o]=j.useState("7d"),[l,g]=j.useState(null);return e.jsxs("div",{className:`min-h-screen ${a?"bg-gray-900":"bg-gray-50"} p-6`,children:[l&&e.jsx("div",{className:`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${l.type==="success"?"bg-green-600 text-white":"bg-red-600 text-white"}`,children:l.message}),e.jsx("div",{className:"mb-8",children:e.jsxs("div",{className:"flex items-center justify-between mb-6",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:`text-3xl font-bold ${a?"text-white":"text-gray-900"} flex items-center`,children:[e.jsx("span",{className:"mr-3",children:"📊"}),"Analytics Dashboard"]}),e.jsx("p",{className:`text-sm ${a?"text-gray-400":"text-gray-600"}`,children:"Real-time business intelligence and performance metrics"})]}),e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsxs("select",{value:h,onChange:c=>o(c.target.value),className:`p-2 rounded border text-sm ${a?"bg-gray-800 border-gray-600 text-white":"bg-white border-gray-300 text-gray-900"}`,children:[e.jsx("option",{value:"24h",children:"Last 24 Hours"}),e.jsx("option",{value:"7d",children:"Last 7 Days"}),e.jsx("option",{value:"30d",children:"Last 30 Days"}),e.jsx("option",{value:"90d",children:"Last 90 Days"})]}),e.jsx(E,{to:"/admin",className:`px-4 py-2 rounded-lg text-sm transition-all border ${a?"bg-gray-800 hover:bg-gray-700 text-blue-400 border-blue-500/50":"bg-white hover:bg-gray-50 text-blue-600 border-blue-500/50"}`,children:"← Back to Admin"})]})]})}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8",children:[e.jsx("div",{className:"xl:col-span-2",children:e.jsx(R,{darkMode:a})}),e.jsx(U,{darkMode:a,timeRange:h}),e.jsx(P,{darkMode:a}),e.jsx(O,{darkMode:a}),e.jsx(C,{darkMode:a})]})]})};export{F as default};
