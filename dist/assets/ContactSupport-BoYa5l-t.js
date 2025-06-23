import{a as ne,u as le,r as n,q as O,c as S,d as P,l as ce,g as U,w as de,k as ue,j as e,s as Y,m as ge}from"./index-Cayz1xms.js";import{E as me,a as z,b as xe,G as he,H as G,v as pe,I as ye,J as F,K as be,L as fe,B as Q,M as V,N as _,w as we,O as ve}from"./index-Bek8qiMI.js";const ke=()=>{const{user:a}=ne(),{darkMode:t}=le(),[u,x]=n.useState("contact"),[l,w]=n.useState({name:(a==null?void 0:a.displayName)||"",email:(a==null?void 0:a.email)||"",subject:"",category:"general",priority:"medium",message:""}),[v,j]=n.useState([]),[N,k]=n.useState(!1),[J,I]=n.useState(!1),[T,h]=n.useState(!1),[A,D]=n.useState([{id:1,type:"bot",message:`Hello ${(a==null?void 0:a.displayName)||"there"}! I'm here to help you with any questions about our platform.`,timestamp:new Date}]),[p,M]=n.useState(""),[K,E]=n.useState(!1),R=n.useRef(null),y=n.useRef(null),[b,X]=n.useState([]),[g,q]=n.useState(!1),[$,C]=n.useState(null),Z=[{id:"account",label:"Account & Login",icon:"👤",color:"blue"},{id:"orders",label:"Orders & Billing",icon:"📦",color:"green"},{id:"inventory",label:"Inventory Management",icon:"📊",color:"purple"},{id:"technical",label:"Technical Issues",icon:"⚙️",color:"red"},{id:"general",label:"General Questions",icon:"❓",color:"gray"}],ee=[{question:"How do I reset my password?",answer:"Go to the login page and click 'Forgot Password'. Enter your email and follow the instructions.",category:"account"},{question:"Why can't I see all products in the catalog?",answer:"Product visibility depends on your account type and permissions. Contact your administrator for access.",category:"inventory"},{question:"How do I track my order status?",answer:"Visit the Orders section in your dashboard to see real-time order status and tracking information.",category:"orders"},{question:"What file formats are supported for product uploads?",answer:"We support CSV files for bulk uploads and JPG/PNG images for product photos.",category:"technical"}];n.useEffect(()=>{var r;(r=R.current)==null||r.scrollIntoView({behavior:"smooth"})},[A]),n.useEffect(()=>{u==="tickets"&&(a!=null&&a.uid)&&f()},[u,a==null?void 0:a.uid]);const f=async()=>{if(!a||!a.uid){C("Please log in to view your tickets.");return}try{q(!0),C(null),console.log("Fetching tickets for user:",a.uid);try{const c=O(S(P,"supportTickets"),ce(1));await U(c),console.log("Firebase connection successful")}catch(c){throw console.error("Firebase connection failed:",c),new Error("Unable to connect to database. Please check your internet connection.")}const r=S(P,"supportTickets"),s=O(r,de("userId","==",a.uid),ue("createdAt","desc")),i=await U(s),o=[];console.log(`Found ${i.size} tickets for user ${a.uid}`),i.forEach(c=>{var W,B;try{const d=c.data();console.log("Processing ticket:",c.id,d),o.push({id:c.id,...d,createdAt:(W=d.createdAt)!=null&&W.toDate?d.createdAt.toDate():d.createdAt?new Date(d.createdAt):new Date,updatedAt:(B=d.updatedAt)!=null&&B.toDate?d.updatedAt.toDate():d.updatedAt?new Date(d.updatedAt):new Date})}catch(d){console.error("Error processing document:",c.id,d)}}),console.log("Final tickets array:",o),X(o),o.length===0&&console.log("No tickets found for user")}catch(r){console.error("Error fetching user tickets:",r);let s="Failed to load your tickets. ";r.code==="permission-denied"?s+="You do not have permission to access this data. Please contact support.":r.code==="failed-precondition"?s+="Database index may be missing. Please contact support.":r.code==="unavailable"?s+="Service is temporarily unavailable. Please try again later.":r.message?s+=r.message:s+="Please try again or contact support if the problem persists.",C(s)}finally{q(!1)}},m=r=>{const{name:s,value:i}=r.target;w(o=>({...o,[s]:i}))},te=r=>{const i=Array.from(r.target.files).filter(o=>o.size<=10*1024*1024);j(o=>[...o,...i].slice(0,5)),y.current&&(y.current.value="")},se=r=>{j(s=>s.filter((i,o)=>o!==r))},re=async r=>{if(r.preventDefault(),k(!0),!a||!a.uid){alert("Please log in to submit a support ticket."),k(!1);return}try{const s=`TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2,8).toUpperCase()}`;console.log("Creating ticket with ID:",s),console.log("User data:",{uid:a.uid,email:a.email,displayName:a.displayName});const i={ticketId:s,userId:a.uid,userEmail:a.email||"unknown@example.com",userName:a.displayName||l.name||"Unknown User",subject:l.subject,category:l.category,priority:l.priority,message:l.message,status:"open",attachments:v.map(c=>({name:c.name,size:c.size,type:c.type})),createdAt:Y(),updatedAt:Y(),source:"web_form"};console.log("Saving ticket document:",i);const o=await ge(S(P,"supportTickets"),i);console.log("Ticket saved successfully with ID:",o.id),I(!0),w({name:(a==null?void 0:a.displayName)||"",email:(a==null?void 0:a.email)||"",subject:"",category:"general",priority:"medium",message:""}),j([]),u==="tickets"&&(console.log("Refreshing tickets list..."),await f()),setTimeout(()=>I(!1),5e3)}catch(s){console.error("Error saving ticket to Firebase:",s);let i="Failed to submit ticket. ";s.code==="permission-denied"?i+="You do not have permission to create tickets.":s.code==="failed-precondition"?i+="Database configuration error. Please contact support.":i+="Please try again or contact support directly.",alert(i)}finally{k(!1)}},H=()=>{if(p.trim()==="")return;const r={id:Date.now()+Math.random(),type:"user",message:p,timestamp:new Date};D(i=>[...i,r]),M(""),E(!0);const s=Math.random()*1e3+1e3;setTimeout(()=>{E(!1);const i={id:Date.now()+Math.random(),type:"bot",message:ae(p),timestamp:new Date};D(o=>[...o,i])},s)},ae=r=>{const s=r.toLowerCase();return s.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)?"Hello! 👋 I'm your virtual assistant for the Wholesaler App. I'm here to help you with orders, payments, inventory, and any other questions you might have. How can I assist you today?":s.match(/^(yes|yeah|yep|ok|okay|sure|sounds good|that helps|thanks|thank you)$/)?"Great! I'm happy I could help. Is there anything else you'd like to know about using the Wholesaler App? I can assist with orders, payments, inventory management, or account settings.":s.match(/^(no|nope|not really|that's all)$/)?"No problem! Feel free to reach out anytime if you have questions. I'm always here to help make your wholesale experience smoother. Have a great day! 😊":s.includes("how to order")||s.includes("place order")||s.includes("make order")?`Here's how to place an order step by step:

📋 **Placing an Order:**
1. Go to **Products** or **Inventory** section
2. Browse or search for items you need
3. Click **Add to Cart** for each product
4. Set quantities in your cart
5. Click **Checkout** when ready
6. Fill in shipping and billing details
7. Review your order and confirm

💡 **Pro tip:** You can save frequently ordered items to your favorites for quicker reordering!

Would you like me to explain any specific step in more detail?`:s.includes("payment")||s.includes("pay")||s.includes("billing")||s.includes("credit card")?`Here's everything about payments:

💳 **Payment Methods:**
• Credit/Debit Cards (Visa, MasterCard, Amex)
• Bank transfers
• Net payment terms (for approved accounts)
• PayPal (select accounts)

🔐 **Payment Process:**
1. During checkout, select your payment method
2. Enter payment details securely
3. Review charges and confirm
4. Receive instant confirmation

💰 **Billing Info:**
• Invoices are generated automatically
• Payment receipts sent via email
• Track payment status in your account
• Set up auto-payment for recurring orders

Need help with a specific payment issue?`:s.includes("shipping")||s.includes("delivery")||s.includes("tracking")?`Here's your shipping guide:

🚚 **Shipping Options:**
• Standard shipping (3-5 business days)
• Express shipping (1-2 business days)
• Overnight delivery (next business day)
• Bulk/freight shipping for large orders

📦 **Tracking Your Order:**
1. Check **My Orders** in your dashboard
2. Click on any order for tracking details
3. Receive tracking numbers via email
4. Real-time status updates

🏠 **Delivery Details:**
• Signature required for orders over $500
• Safe drop-off available
• Schedule delivery windows
• Special handling for fragile items

What would you like to know about your delivery?`:s.includes("password")||s.includes("login")||s.includes("account")||s.includes("forgot")?`I can help with account issues:

🔑 **Login Problems:**
• Click "Forgot Password" on login page
• Check your email for reset link
• Use the temporary password provided
• Update to a new secure password

👤 **Account Management:**
• Update profile in Account Settings
• Manage shipping addresses
• Set payment preferences
• View order history

🛡️ **Security Tips:**
• Use strong, unique passwords
• Enable two-factor authentication
• Log out on shared devices
• Report suspicious activity immediately

Still having trouble accessing your account?`:s.includes("inventory")||s.includes("product")||s.includes("stock")||s.includes("catalog")?`Here's how to navigate our inventory:

📦 **Finding Products:**
• Use the search bar for specific items
• Filter by category, price, or brand
• Check product availability in real-time
• View detailed product specifications

📊 **Stock Information:**
• Green indicator = In stock
• Yellow indicator = Low stock
• Red indicator = Out of stock
• Get notified when items restock

🏷️ **Product Details:**
• High-resolution product images
• Wholesale pricing tiers
• Bulk discount information
• Technical specifications
• Customer reviews and ratings

Need help finding a specific product?`:s.includes("price")||s.includes("discount")||s.includes("wholesale")||s.includes("bulk")?`Let me explain our pricing structure:

💰 **Wholesale Pricing:**
• Tiered pricing based on quantity
• Volume discounts for bulk orders
• Special rates for verified businesses
• Seasonal promotional pricing

🎯 **Discount Programs:**
• First-time buyer discounts
• Loyalty program rewards
• Early payment discounts
• Referral bonuses

📈 **Bulk Benefits:**
• Higher quantities = better prices
• Free shipping on large orders
• Priority customer support
• Extended payment terms

Want to know about pricing for specific products?`:s.includes("return")||s.includes("refund")||s.includes("exchange")||s.includes("warranty")?`Our return policy is designed to be fair and simple:

↩️ **Return Process:**
• 30-day return window for most items
• Items must be unused and in original packaging
• Start return request in **My Orders**
• Print prepaid return label

💰 **Refunds:**
• Full refund for defective items
• Return shipping covered for our errors
• Refunds processed within 3-5 business days
• Original payment method credited

🔄 **Exchanges:**
• Exchange for different size/color
• Upgrade to different model (pay difference)
• Quick exchange process available

🛡️ **Warranty Coverage:**
• Manufacturer warranties honored
• Extended warranty options available
• Detailed warranty terms per product

Need to start a return or have questions about a specific item?`:s.includes("help")||s.includes("support")||s.includes("contact")||s.includes("phone")||s.includes("email")?`I'm here to help! Here are all the ways to get support:

🤖 **Instant Help (Me!):**
• Available 24/7 for quick questions
• Product information and guidance
• Order status and tracking
• Account assistance

📧 **Email Support:**
• support@wholesaler-app.com
• Response within 4-6 hours
• Detailed technical assistance
• Order modifications and special requests

📞 **Phone Support:**
• 1-800-WHOLESALE (Mon-Fri, 8AM-6PM)
• Immediate assistance for urgent issues
• Speak with product specialists
• Account managers for business customers

💬 **Live Chat:**
• Business hours: Mon-Fri, 9AM-5PM
• Real-time support with human agents
• Screen sharing for technical issues

What's the best way I can help you right now?`:s.includes("order status")||s.includes("where is my order")||s.includes("order tracking")?`Let me help you track your order:

📋 **Check Order Status:**
1. Go to **My Orders** in your dashboard
2. Find your order by order number or date
3. Click **View Details** for full information
4. See real-time status updates

📦 **Order Statuses:**
• **Processing** - We're preparing your order
• **Shipped** - On its way to you
• **Out for Delivery** - Arriving today
• **Delivered** - Successfully delivered

🔍 **Tracking Details:**
• Carrier information and tracking number
• Estimated delivery date and time
• Current location of your package
• Delivery attempt history

If you have your order number, I can help you look up specific details. What's your order number?`:s.includes("bug")||s.includes("error")||s.includes("not working")||s.includes("problem")?`I'm sorry you're experiencing technical issues. Let me help:

🔧 **Quick Fixes:**
• Try refreshing the page (Ctrl+F5)
• Clear your browser cache and cookies
• Disable browser extensions temporarily
• Try using an incognito/private window

🌐 **Browser Support:**
• Chrome, Firefox, Safari, Edge (latest versions)
• JavaScript must be enabled
• Pop-up blocker should allow our site

📱 **Mobile Issues:**
• Update to the latest app version
• Check your internet connection
• Restart the app
• Free up device storage space

🆘 **Still Having Problems?**
Please describe the specific error message or issue you're seeing, and I'll provide more targeted help or escalate to our technical team.

What exactly is happening when you try to use the app?`:s.includes("business account")||s.includes("wholesale account")||s.includes("tax exempt")?`Here's information about business accounts:

🏢 **Business Account Benefits:**
• Wholesale pricing access
• Extended payment terms (NET 30/60)
• Dedicated account manager
• Priority customer support
• Bulk order capabilities

📋 **Account Setup:**
• Business license verification required
• Tax ID number needed
• Credit check for payment terms
• Professional references

💼 **Business Features:**
• Multi-user account access
• Approval workflows for orders
• Custom pricing agreements
• Purchase order integration
• Detailed reporting and analytics

🧾 **Tax Benefits:**
• Tax-exempt status available
• Resale certificate upload
• Automated tax calculations
• Detailed tax reporting

Would you like help setting up a business account or upgrading your current account?`:s.includes("order")||s.includes("purchase")||s.includes("buy")?`I can help you with all order-related questions! 🛒 Whether you need help placing a new order, tracking an existing one, modifying quantities, or understanding our ordering process, I'm here to assist. 

What specifically would you like to know about orders? You can ask me about:
• How to place orders
• Payment methods
• Shipping options
• Order tracking
• Returns and exchanges`:`I want to make sure I give you the most helpful information! 🤔 

I can assist you with:
• **Orders** - Placing, tracking, modifying orders
• **Payments** - Methods, billing, payment issues
• **Products** - Finding items, pricing, availability
• **Shipping** - Delivery options, tracking, schedules
• **Account** - Login help, settings, business accounts
• **Returns** - Return process, exchanges, refunds
• **Technical** - App issues, troubleshooting

Could you tell me more specifically what you need help with? For example, you could ask:
"How do I place an order?" or "What payment methods do you accept?" or "How do I track my order?"

I'm here to make your wholesale experience as smooth as possible! 😊`},ie=r=>{switch(r){case"open":return t?"bg-red-900/20 text-red-400 border-red-800":"bg-red-100 text-red-800 border-red-200";case"in_progress":return t?"bg-yellow-900/20 text-yellow-400 border-yellow-800":"bg-yellow-100 text-yellow-800 border-yellow-200";case"resolved":return t?"bg-green-900/20 text-green-400 border-green-800":"bg-green-100 text-green-800 border-green-200";case"closed":return t?"bg-gray-900/20 text-gray-400 border-gray-800":"bg-gray-100 text-gray-800 border-gray-200";default:return t?"bg-blue-900/20 text-blue-400 border-blue-800":"bg-blue-100 text-blue-800 border-blue-200"}},oe=r=>{switch(r){case"urgent":return t?"text-red-400":"text-red-600";case"high":return t?"text-orange-400":"text-orange-600";case"medium":return t?"text-yellow-400":"text-yellow-600";case"low":return t?"text-green-400":"text-green-600";default:return t?"text-gray-400":"text-gray-600"}},L=r=>new Intl.DateTimeFormat("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(r);return e.jsx("div",{className:`min-h-screen ${t?"bg-gray-900":"bg-gray-50"} py-8`,children:e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[e.jsxs("div",{className:"text-center mb-8",children:[e.jsx("h1",{className:`text-4xl font-bold ${t?"text-white":"text-gray-900"} mb-4`,children:"Support Center"}),a&&e.jsxs("p",{className:`text-lg ${t?"text-gray-300":"text-gray-600"} mb-2`,children:["Welcome back, ",a.displayName||a.email,"!"]}),e.jsx("p",{className:`text-lg ${t?"text-gray-300":"text-gray-600"}`,children:"How can we help you today?"})]}),e.jsx("div",{className:`${t?"bg-gray-800":"bg-white"} rounded-lg shadow-md p-4 mb-8`,children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(me,{className:"text-indigo-600 text-xl"}),e.jsxs("div",{children:[e.jsx("p",{className:`font-medium ${t?"text-white":"text-gray-900"}`,children:"Phone Support"}),e.jsx("a",{href:"tel:+6495551234",className:"text-indigo-600 hover:text-indigo-800 font-medium",children:"+64 9 555 1234"})]})]}),e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(z,{className:"text-indigo-600 text-xl"}),e.jsxs("div",{children:[e.jsx("p",{className:`font-medium ${t?"text-white":"text-gray-900"}`,children:"Email Support"}),e.jsx("a",{href:"mailto:support@megawholesaler.co.nz",className:"text-indigo-600 hover:text-indigo-800 font-medium text-sm",children:"support@megawholesaler.co.nz"})]})]}),e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(xe,{className:"text-indigo-600 text-xl"}),e.jsxs("div",{children:[e.jsx("p",{className:`font-medium ${t?"text-white":"text-gray-900"}`,children:"Business Hours"}),e.jsx("p",{className:`${t?"text-gray-300":"text-gray-600"} text-sm`,children:"Mon-Fri: 9AM-6PM"})]})]}),e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(he,{className:"text-indigo-600 text-xl"}),e.jsxs("div",{children:[e.jsx("p",{className:`font-medium ${t?"text-white":"text-gray-900"}`,children:"Live Chat"}),e.jsx("button",{onClick:()=>h(!0),className:"text-indigo-600 hover:text-indigo-800 font-medium text-sm",children:"Start Chat"})]})]})]})}),e.jsxs("div",{className:`${t?"bg-gray-800":"bg-white"} rounded-lg shadow-md mb-8`,children:[e.jsx("div",{className:"flex border-b border-gray-200 dark:border-gray-700",children:[{id:"contact",label:"Submit Ticket",icon:z},{id:"tickets",label:"My Tickets",icon:G},{id:"faq",label:"Quick Help",icon:pe}].map(r=>{const s=r.icon;return e.jsxs("button",{onClick:()=>x(r.id),className:`flex-1 py-4 px-6 text-center font-medium transition-colors flex items-center justify-center space-x-2 ${u===r.id?"border-b-2 border-indigo-500 text-indigo-600":t?"text-gray-400 hover:text-gray-200":"text-gray-500 hover:text-gray-700"}`,children:[e.jsx(s,{className:"text-lg"}),e.jsx("span",{children:r.label}),r.id==="tickets"&&b.length>0&&e.jsx("span",{className:"bg-indigo-600 text-white text-xs px-2 py-1 rounded-full ml-1",children:b.length})]},r.id)})}),e.jsxs("div",{className:"p-8",children:[u==="contact"&&e.jsxs("div",{children:[e.jsx("h2",{className:`text-2xl font-bold ${t?"text-white":"text-gray-900"} mb-6`,children:"Submit Support Ticket"}),J&&e.jsx("div",{className:`mb-6 p-4 rounded-lg border ${t?"bg-green-900/20 border-green-800":"bg-green-50 border-green-200"}`,children:e.jsxs("div",{className:"flex items-center",children:[e.jsx(ye,{className:`mr-3 text-xl ${t?"text-green-400":"text-green-600"}`}),e.jsxs("div",{children:[e.jsx("h3",{className:`font-medium ${t?"text-green-300":"text-green-800"}`,children:"Ticket submitted successfully!"}),e.jsx("p",{className:`text-sm ${t?"text-green-400":"text-green-700"}`,children:`We'll get back to you within 24 hours. Your ticket has been saved and will appear in "My Tickets".`})]})]})}),!a&&e.jsx("div",{className:`mb-6 p-4 rounded-lg border ${t?"bg-yellow-900/20 border-yellow-800":"bg-yellow-50 border-yellow-200"}`,children:e.jsxs("div",{className:"flex items-center",children:[e.jsx(F,{className:`mr-3 text-xl ${t?"text-yellow-400":"text-yellow-600"}`}),e.jsxs("div",{children:[e.jsx("h3",{className:`font-medium ${t?"text-yellow-300":"text-yellow-800"}`,children:"Please log in to submit tickets"}),e.jsx("p",{className:`text-sm ${t?"text-yellow-400":"text-yellow-700"}`,children:"You need to be logged in to submit and track support tickets."})]})]})}),e.jsxs("div",{className:"mb-6",children:[e.jsx("h3",{className:`text-lg font-medium ${t?"text-white":"text-gray-900"} mb-4`,children:"What do you need help with?"}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4",children:Z.map(r=>e.jsxs("button",{onClick:()=>w(s=>({...s,category:r.id})),className:`p-4 rounded-lg border text-center transition-all hover:shadow-md ${l.category===r.id?"border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20":t?"border-gray-600 bg-gray-700 hover:bg-gray-600":"border-gray-300 bg-white hover:bg-gray-50"}`,children:[e.jsx("div",{className:"text-2xl mb-2",children:r.icon}),e.jsx("div",{className:`text-sm font-medium ${l.category===r.id?"text-indigo-700 dark:text-indigo-300":t?"text-gray-200":"text-gray-700"}`,children:r.label})]},r.id))})]}),e.jsxs("form",{onSubmit:re,className:"space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:`block text-sm font-medium ${t?"text-gray-300":"text-gray-700"} mb-2`,children:"Full Name *"}),e.jsx("input",{type:"text",name:"name",value:l.name,onChange:m,required:!0,className:`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${t?"bg-gray-700 border-gray-600 text-white placeholder-gray-400":"bg-white border-gray-300 text-gray-900"}`,placeholder:"Enter your full name"})]}),e.jsxs("div",{children:[e.jsx("label",{className:`block text-sm font-medium ${t?"text-gray-300":"text-gray-700"} mb-2`,children:"Email Address *"}),e.jsx("input",{type:"email",name:"email",value:l.email,onChange:m,required:!0,className:`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${t?"bg-gray-700 border-gray-600 text-white placeholder-gray-400":"bg-white border-gray-300 text-gray-900"}`,placeholder:"Enter your email address"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:`block text-sm font-medium ${t?"text-gray-300":"text-gray-700"} mb-2`,children:"Subject *"}),e.jsx("input",{type:"text",name:"subject",value:l.subject,onChange:m,required:!0,className:`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${t?"bg-gray-700 border-gray-600 text-white placeholder-gray-400":"bg-white border-gray-300 text-gray-900"}`,placeholder:"Brief description of your issue"})]}),e.jsxs("div",{children:[e.jsx("label",{className:`block text-sm font-medium ${t?"text-gray-300":"text-gray-700"} mb-2`,children:"Priority"}),e.jsxs("select",{name:"priority",value:l.priority,onChange:m,className:`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${t?"bg-gray-700 border-gray-600 text-white":"bg-white border-gray-300 text-gray-900"}`,children:[e.jsx("option",{value:"low",children:"Low"}),e.jsx("option",{value:"medium",children:"Medium"}),e.jsx("option",{value:"high",children:"High"}),e.jsx("option",{value:"urgent",children:"Urgent"})]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:`block text-sm font-medium ${t?"text-gray-300":"text-gray-700"} mb-2`,children:"Message *"}),e.jsx("textarea",{name:"message",value:l.message,onChange:m,required:!0,rows:"6",className:`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${t?"bg-gray-700 border-gray-600 text-white placeholder-gray-400":"bg-white border-gray-300 text-gray-900"}`,placeholder:"Please describe your issue in detail..."})]}),e.jsxs("div",{children:[e.jsx("label",{className:`block text-sm font-medium ${t?"text-gray-300":"text-gray-700"} mb-2`,children:"Attachments (Optional)"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{onClick:()=>{var r;return(r=y.current)==null?void 0:r.click()},className:`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${t?"border-gray-600 hover:border-gray-500 bg-gray-700 hover:bg-gray-600":"border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"}`,children:[e.jsx(be,{className:`mx-auto mb-2 text-2xl ${t?"text-gray-400":"text-gray-500"}`}),e.jsx("p",{className:`text-sm ${t?"text-gray-300":"text-gray-600"}`,children:"Click to attach files or drag and drop"}),e.jsx("p",{className:`text-xs ${t?"text-gray-400":"text-gray-500"} mt-1`,children:"Max 10MB each, 5 files total"})]}),e.jsx("input",{ref:y,type:"file",multiple:!0,onChange:te,accept:".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx",className:"hidden"}),v.length>0&&e.jsx("div",{className:"space-y-2",children:v.map((r,s)=>e.jsxs("div",{className:`flex items-center justify-between p-3 rounded-lg border ${t?"bg-gray-700 border-gray-600":"bg-gray-50 border-gray-200"}`,children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(fe,{className:`${t?"text-gray-400":"text-gray-500"}`}),e.jsxs("div",{children:[e.jsx("p",{className:`text-sm font-medium ${t?"text-white":"text-gray-900"}`,children:r.name}),e.jsxs("p",{className:`text-xs ${t?"text-gray-400":"text-gray-500"}`,children:[(r.size/1024/1024).toFixed(2)," MB"]})]})]}),e.jsx("button",{type:"button",onClick:()=>se(s),className:`p-1 rounded-full transition-colors ${t?"text-gray-400 hover:text-red-400 hover:bg-red-900/20":"text-gray-500 hover:text-red-600 hover:bg-red-100"}`,children:e.jsx(Q,{})})]},s))})]})]}),e.jsx("button",{type:"submit",disabled:N||!a,className:`w-full py-3 px-6 rounded-lg font-medium transition-colors ${N||!a?"bg-gray-400 cursor-not-allowed text-white":"bg-indigo-600 hover:bg-indigo-700 text-white"}`,children:N?e.jsxs("div",{className:"flex items-center justify-center",children:[e.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"}),"Saving to Database..."]}):a?"Submit Ticket":"Please Log In to Submit"})]})]}),u==="tickets"&&e.jsxs("div",{children:[e.jsxs("div",{className:"flex justify-between items-center mb-6",children:[e.jsx("h2",{className:`text-2xl font-bold ${t?"text-white":"text-gray-900"}`,children:"Your Support Tickets"}),e.jsxs("button",{onClick:f,disabled:g||!a,className:`flex items-center px-4 py-2 border rounded-lg transition-colors ${g||!a?"border-gray-400 text-gray-400 cursor-not-allowed":t?"border-gray-600 text-gray-300 hover:bg-gray-700":"border-gray-300 text-gray-700 hover:bg-gray-50"}`,children:[e.jsx("svg",{className:`w-4 h-4 mr-2 ${g?"animate-spin":""}`,fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"})}),g?"Refreshing...":"Refresh"]})]}),!a&&e.jsxs("div",{className:"text-center py-12",children:[e.jsx(F,{className:`mx-auto text-6xl mb-4 ${t?"text-yellow-600":"text-yellow-400"}`}),e.jsx("h3",{className:`text-xl font-medium ${t?"text-gray-400":"text-gray-500"} mb-2`,children:"Please log in to view tickets"}),e.jsx("p",{className:`${t?"text-gray-500":"text-gray-600"} mb-4`,children:"You need to be authenticated to view your support tickets."})]}),g&&a&&e.jsxs("div",{className:"text-center py-8",children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"}),e.jsx("p",{className:`${t?"text-gray-400":"text-gray-600"}`,children:"Loading your tickets..."})]}),$&&a&&e.jsx("div",{className:`p-6 rounded-lg border mb-6 ${t?"bg-red-900/20 border-red-800":"bg-red-50 border-red-200"}`,children:e.jsxs("div",{className:"flex items-start",children:[e.jsx(F,{className:`mr-3 text-xl mt-1 ${t?"text-red-400":"text-red-600"}`}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:`font-medium ${t?"text-red-300":"text-red-800"} mb-2`,children:"Unable to Load Tickets"}),e.jsx("p",{className:`text-sm ${t?"text-red-400":"text-red-700"} mb-4`,children:$}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("button",{onClick:f,className:`text-sm underline hover:no-underline ${t?"text-red-300":"text-red-800"}`,children:"Try Again"}),e.jsxs("div",{className:`text-xs ${t?"text-red-400":"text-red-600"}`,children:[e.jsx("p",{children:"Troubleshooting tips:"}),e.jsxs("ul",{className:"list-disc list-inside mt-1 space-y-1",children:[e.jsx("li",{children:"Check your internet connection"}),e.jsx("li",{children:"Refresh the page"}),e.jsx("li",{children:"Log out and log back in"}),e.jsx("li",{children:"Contact support if the issue persists"})]})]})]})]})]})}),!g&&!$&&a&&e.jsx(e.Fragment,{children:b.length>0?e.jsx("div",{className:"space-y-4",children:b.map(r=>e.jsxs("div",{className:`${t?"bg-gray-700 border-gray-600":"bg-gray-50 border-gray-200"} border rounded-lg p-6 hover:shadow-md transition-shadow`,children:[e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsx("h3",{className:`text-lg font-semibold ${t?"text-white":"text-gray-900"}`,children:r.ticketId}),e.jsx("span",{className:`px-3 py-1 text-xs rounded-full border font-medium ${ie(r.status)}`,children:r.status.replace("_"," ").charAt(0).toUpperCase()+r.status.replace("_"," ").slice(1)}),e.jsxs("span",{className:`text-sm font-medium capitalize ${oe(r.priority)}`,children:[r.priority," Priority"]})]}),e.jsxs("div",{className:`text-sm ${t?"text-gray-400":"text-gray-600"} mt-2 md:mt-0`,children:["Created: ",L(r.createdAt)]})]}),e.jsx("div",{className:"mb-2",children:e.jsx("span",{className:`inline-block px-2 py-1 text-xs rounded-full ${t?"bg-gray-600 text-gray-300":"bg-gray-200 text-gray-700"} mr-2`,children:r.category})}),e.jsx("h4",{className:`text-lg font-medium ${t?"text-gray-200":"text-gray-800"} mb-2`,children:r.subject}),e.jsx("p",{className:`${t?"text-gray-300":"text-gray-600"} mb-4 line-clamp-3`,children:r.message}),r.attachments&&r.attachments.length>0&&e.jsxs("div",{className:"mb-4",children:[e.jsx("p",{className:`text-sm font-medium ${t?"text-gray-300":"text-gray-700"} mb-2`,children:"Attachments:"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:r.attachments.map((s,i)=>e.jsxs("span",{className:`text-xs px-2 py-1 rounded ${t?"bg-gray-600 text-gray-300":"bg-gray-200 text-gray-700"}`,children:["📎 ",s.name]},i))})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("span",{className:`text-sm ${t?"text-gray-400":"text-gray-500"}`,children:["Last updated: ",L(r.updatedAt)]}),e.jsx("div",{className:"flex space-x-2",children:e.jsx("button",{className:"text-indigo-600 hover:text-indigo-800 font-medium text-sm",children:"View Details →"})})]})]},r.id))}):e.jsxs("div",{className:"text-center py-12",children:[e.jsx(G,{className:`mx-auto text-6xl mb-4 ${t?"text-gray-600":"text-gray-400"}`}),e.jsx("h3",{className:`text-xl font-medium ${t?"text-gray-400":"text-gray-500"} mb-2`,children:"No tickets yet"}),e.jsx("p",{className:`${t?"text-gray-500":"text-gray-600"} mb-4`,children:"You haven't submitted any support tickets."}),e.jsx("button",{onClick:()=>x("contact"),className:"bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium",children:"Submit Your First Ticket"})]})})]}),u==="faq"&&e.jsxs("div",{children:[e.jsx("h2",{className:`text-2xl font-bold ${t?"text-white":"text-gray-900"} mb-6`,children:"Quick Help & FAQ"}),e.jsx("div",{className:"space-y-4",children:ee.map((r,s)=>e.jsxs("div",{className:`${t?"bg-gray-700 border-gray-600":"bg-gray-50 border-gray-200"} border rounded-lg p-6`,children:[e.jsx("h3",{className:`text-lg font-semibold ${t?"text-white":"text-gray-900"} mb-3`,children:r.question}),e.jsx("p",{className:`${t?"text-gray-300":"text-gray-600"} mb-4`,children:r.answer}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:`text-xs px-2 py-1 rounded-full ${t?"bg-gray-600 text-gray-300":"bg-gray-200 text-gray-700"}`,children:r.category}),e.jsx("button",{onClick:()=>x("contact"),className:"text-indigo-600 hover:text-indigo-800 text-sm font-medium",children:"Still need help? Contact us →"})]})]},s))}),e.jsxs("div",{className:"mt-8 text-center",children:[e.jsx("p",{className:`${t?"text-gray-400":"text-gray-600"} mb-4`,children:"Can't find what you're looking for?"}),e.jsx("button",{onClick:()=>x("contact"),className:"bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium mr-4",children:"Submit a Ticket"}),e.jsx("button",{onClick:()=>h(!0),className:"bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium",children:"Start Live Chat"})]})]})]})]}),T&&e.jsx("div",{className:"fixed bottom-6 right-6 z-50",children:e.jsxs("div",{className:`${t?"bg-gray-800 border-gray-700":"bg-white border-gray-200"} border rounded-lg shadow-xl w-80 h-96 flex flex-col`,children:[e.jsxs("div",{className:"bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx(V,{className:"mr-2"}),e.jsx("span",{className:"font-medium",children:"Live Support"}),e.jsx("span",{className:"ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"})]}),e.jsx("button",{onClick:()=>h(!1),className:"text-white hover:text-gray-200",children:e.jsx(Q,{})})]}),e.jsxs("div",{className:"flex-1 p-4 overflow-y-auto space-y-3",children:[A.map(r=>e.jsx("div",{className:`flex ${r.type==="user"?"justify-end":"justify-start"}`,children:e.jsx("div",{className:`max-w-xs p-3 rounded-lg ${r.type==="user"?"bg-indigo-600 text-white":t?"bg-gray-700 text-gray-100":"bg-gray-100 text-gray-800"}`,children:e.jsxs("div",{className:"flex items-start space-x-2",children:[r.type==="bot"&&e.jsx(_,{className:`mt-1 ${t?"text-gray-400":"text-gray-500"}`}),r.type==="user"&&e.jsx(we,{className:"mt-1 text-white"}),e.jsx("p",{className:"text-sm whitespace-pre-line",children:r.message})]})})},r.id)),K&&e.jsx("div",{className:"flex justify-start",children:e.jsx("div",{className:`max-w-xs p-3 rounded-lg ${t?"bg-gray-700 text-gray-100":"bg-gray-100 text-gray-800"}`,children:e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(_,{className:`${t?"text-gray-400":"text-gray-500"}`}),e.jsxs("div",{className:"flex space-x-1",children:[e.jsx("div",{className:"w-2 h-2 bg-gray-500 rounded-full animate-bounce"}),e.jsx("div",{className:"w-2 h-2 bg-gray-500 rounded-full animate-bounce",style:{animationDelay:"0.1s"}}),e.jsx("div",{className:"w-2 h-2 bg-gray-500 rounded-full animate-bounce",style:{animationDelay:"0.2s"}})]})]})})}),e.jsx("div",{ref:R})]}),e.jsx("div",{className:"p-4 border-t border-gray-200 dark:border-gray-700",children:e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("input",{type:"text",value:p,onChange:r=>M(r.target.value),onKeyPress:r=>r.key==="Enter"&&H(),placeholder:"Type your message...",className:`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${t?"bg-gray-700 border-gray-600 text-white placeholder-gray-400":"bg-white border-gray-300 text-gray-900"}`}),e.jsx("button",{onClick:H,className:"bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors",children:e.jsx(ve,{className:"text-sm"})})]})})]})}),!T&&e.jsxs("button",{onClick:()=>h(!0),className:"fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-105 z-50",children:[e.jsx(V,{className:"text-xl"}),e.jsx("span",{className:"absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"})]})]})})};export{ke as default};
