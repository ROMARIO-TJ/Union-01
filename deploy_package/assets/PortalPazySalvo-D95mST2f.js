import{_ as b,C as y,j as f,E as x,c as v,a as n,d as e,e as g,F as m,h as u,o as i,t as r,i as h}from"./index-DID2U0QP.js";const _={class:"admin-dashboard"},w={class:"admin-table-wrapper",style:{"margin-top":"2rem"}},S={class:"admin-table-container"},k={class:"admin-table"},A={class:"badge",style:{background:"#eee",color:"#666"}},C=["onClick"],z={key:0},P={class:"admin-cards-grid",style:{"margin-top":"1.5rem"}},D={class:"admin-card-item__header"},E={style:{"font-weight":"800","font-size":"1.1rem"}},L={class:"badge",style:{background:"#eee",color:"#666","font-size":"0.7rem"}},N={class:"admin-card-item__actions"},$=["onClick"],I={key:0,style:{"text-align":"center",padding:"2rem",background:"var(--admin-card)","border-radius":"12px",border:"1px dashed #ccc"}},U={__name:"PortalPazySalvo",setup(V){const d=y(),c=f();x(async()=>{var s;(s=c.parentUser)!=null&&s.email&&await d.initPlayers()});const l=v(()=>{var t,a;const s=(a=(t=c.parentUser)==null?void 0:t.email)==null?void 0:a.toLowerCase();return s?d.players.filter(o=>(o.parentEmail||"").toLowerCase()===s&&o.paymentStatus==="Al Día").map(o=>({id:o.id,name:o.name||o.fullName,category:o.category||"Sin asignar"})):[]}),p=s=>{const t=window.open("","_blank","width=800,height=900"),a="/src/assets/img/logosinfondo.png",o=`
        <html>
        <head>
            <title>PAZ Y SALVO - ${s.name}</title>
            <style>
                body { font-family: 'Georgia', serif; padding: 60px; line-height: 1.8; color: #1a1a1a; }
                .border-container { border: 10px double #1fa774; padding: 40px; position: relative; height: 100%; box-sizing: border-box; }
                .header { text-align: center; margin-bottom: 50px; }
                .logo { height: 120px; margin-bottom: 20px; }
                .title { font-size: 32px; font-weight: bold; color: #1fa774; text-transform: uppercase; letter-spacing: 4px; border-bottom: 2px solid #1fa774; display: inline-block; padding-bottom: 10px; }
                .content { text-align: justify; margin: 50px 0; font-size: 18px; }
                .highlight { font-weight: bold; text-decoration: underline; }
                .footer { margin-top: 100px; text-align: center; }
                .seal { position: absolute; bottom: 40px; right: 40px; width: 150px; opacity: 0.2; }
                @media print { body { padding: 0; } .border-container { height: 95vh; } }
            </style>
        </head>
        <body>
            <div class="border-container">
                <div class="header">
                    <img src="${a}" class="logo">
                    <br>
                    <h1 class="title">PAZ Y SALVO</h1>
                </div>
                
                <div class="content">
                    <p>El suscrito Tesorero del <strong>CLUB UNIÓN JEGUERA</strong>, hace constar que el deportista:</p>
                    <p style="text-align: center; font-size: 24px; margin: 30px 0;">
                        <strong class="highlight">${s.name}</strong>
                    </p>
                    <p>Perteneciente a la categoría <strong class="highlight">${s.category}</strong>, se encuentra a la fecha 
                    <strong>PAZ Y SALVO</strong> por todo concepto relacionado con mensualidades, inscripciones 
                    y derechos de formación con nuestra institución deportiva.</p>
                    
                    <p>Se expide a solicitud del interesado en la ciudad de Sincelejo, el día ${new Date().toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"})}.</p>
                </div>

                <div class="footer">
                    <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px;">
                        <strong>DIRECCIÓN ADMINISTRATIVA</strong><br>
                        Club Unión Jeguera
                    </div>
                </div>
                
                <img src="${a}" class="seal">
            </div>
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
        </html>
    `;t.document.write(o),t.document.close()};return(s,t)=>(i(),n("div",_,[t[8]||(t[8]=e("div",{class:"admin-toolbar"},[e("div",{class:"toolbar-left"},[e("h2",null,"Certificados Paz y Salvo"),e("p",{style:{color:"#666","font-size":"0.9rem"}},"Descarga los certificados oficiales de tus hijos que están al día con sus pagos.")])],-1)),e("div",w,[e("div",S,[e("table",k,[t[3]||(t[3]=e("thead",null,[e("tr",null,[e("th",null,"Deportista"),e("th",null,"Categoría"),e("th",null,"Estado de Cuenta"),e("th",null,"Acciones")])],-1)),e("tbody",null,[(i(!0),n(m,null,u(l.value,a=>(i(),n("tr",{key:a.id},[e("td",null,[e("strong",null,r(a.name),1)]),e("td",null,[e("span",A,r(a.category),1)]),t[1]||(t[1]=e("td",null,[e("span",{class:"badge status-accepted"},"AL DÍA")],-1)),e("td",null,[e("button",{onClick:o=>p(a),class:"btn-action view",style:{background:"#1fa774",color:"white",width:"auto",padding:"0 20px",height:"35px","border-radius":"8px"}},t[0]||(t[0]=[e("i",{class:"fa-solid fa-download"},null,-1),h(" Descargar Paz y Salvo ")]),8,C)])]))),128)),l.value.length===0?(i(),n("tr",z,t[2]||(t[2]=[e("td",{colspan:"4",style:{"text-align":"center",padding:"4rem",color:"#888"}},[e("i",{class:"fa-solid fa-file-circle-xmark",style:{"font-size":"3rem",display:"block","margin-bottom":"1rem",opacity:"0.5"}}),e("p",null,"No hay certificados disponibles en este momento."),e("small",null,'Para obtener un Paz y Salvo, el deportista debe estar "Al Día" en el panel de pagos.')],-1)]))):g("",!0)])])])]),e("div",P,[(i(!0),n(m,null,u(l.value,a=>(i(),n("div",{key:"card-"+a.id,class:"admin-card-item"},[e("div",D,[t[4]||(t[4]=e("div",{class:"stat-icon matches",style:{width:"40px",height:"40px","font-size":"1rem"}},[e("i",{class:"fa-solid fa-file-circle-check"})],-1)),e("div",null,[e("h4",E,r(a.name),1),e("span",L,r(a.category),1)])]),t[6]||(t[6]=e("div",{class:"admin-card-item__body"},[e("div",{class:"admin-card-item__row"},[e("span",{class:"admin-card-item__label"},"Estado:"),e("span",{class:"text-success",style:{"font-weight":"700",color:"#1fa774"}},"AL DÍA")])],-1)),e("div",N,[e("button",{onClick:o=>p(a),class:"btn-admin primary",style:{width:"100%",padding:"0.7rem"}},t[5]||(t[5]=[e("i",{class:"fa-solid fa-download"},null,-1),h(" Descargar Certificado ")]),8,$)])]))),128)),l.value.length===0?(i(),n("div",I,t[7]||(t[7]=[e("p",{style:{color:"#888"}},"No hay certificados disponibles.",-1)]))):g("",!0)])]))}},B=b(U,[["__scopeId","data-v-72e795e1"]]);export{B as default};
