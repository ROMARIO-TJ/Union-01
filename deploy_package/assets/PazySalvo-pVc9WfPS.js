import{_ as R,c as s,b as t,d as r,n as _,t as l,F as w,r as E,q as M,G as D,x as A,h as g,o as k,i as C,A as P,l as i}from"./index-BGx4u8UC.js";import{u as z}from"./paymentsStore-BcSh7-92.js";import{f as I}from"./firma-C6m3jE3l.js";const U={__name:"PazySalvo",setup(T,{expose:e}){e();const f=D(),o=z(),h=A(),x=g("requests"),c=g(!1),p=g(!1),b=g(null),a=g(null);k(async()=>{c.value=!0,await Promise.all([f.initPlayers(),o.fetchPazSalvoRequests()]),c.value=!1});const m=async n=>{b.value=n,c.value=!0;try{const d=await o.calculatePazSalvoDebt(n.id);a.value=d,p.value=!0}catch(d){alert("Error al calcular la deuda detallada: "+d.message)}finally{c.value=!1}},N=C(()=>o.pazSalvoRequests),O=C(()=>f.players.filter(n=>n.status==="Aceptado").map(n=>({...n,id:n.id,name:n.name||n.fullName,category:n.category||"N/A",isEscuela:(n.category||"").toLowerCase().includes("escuela"),dni:n.dni||n.documentNumber||""}))),S={playersStore:f,paymentsStore:o,authStore:h,activeTab:x,isLoading:c,showDebtModal:p,selectedPlayerForDebt:b,debtInfo:a,viewDebt:m,requests:N,eligiblePlayers:O,handleStatusChange:async(n,d)=>{var v;let u="";if(!(d==="Rechazado"&&(u=prompt("Motivo del rechazo:"),!u)))try{await o.updatePazSalvoStatus(n.id,{status:d,rejection_reason:u,approved_by:(v=h.adminUser)==null?void 0:v.id}),await o.fetchPazSalvoRequests(),alert("Estado actualizado correctamente")}catch(y){alert("Error al actualizar: "+y.message)}},downloadCertificate:n=>{const d=window.open("","_blank");new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"});const u=(n.category||"").toLowerCase().includes("escuela"),v=u?"PAZ Y SALVO - ESCUELA DE FORMACIÓN":"PAZ Y SALVO - CATEGORÍAS COMPETITIVAS",y=u?"proceso de formación deportiva":"participación y derechos de competición",L=`
    <html>
    <head>
        <title>Paz y Salvo - ${n.fullName||n.name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
            
            @page { size: letter; margin: 1.5cm 2cm; }
            body { 
                font-family: 'Montserrat', sans-serif; 
                line-height: 1.35; 
                color: #000; 
                margin: 0;
                padding: 0;
                background-color: #fff;
                font-size: 10.5pt;
            }
            .certificate-container {
                width: 100%;
                max-width: 800px;
                margin: auto;
                position: relative;
            }
            .header { 
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 25px; 
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            .logo { width: 90px; height: auto; object-fit: contain; }
            .header-info {
                flex: 1;
                text-align: left;
            }
            .club-name { 
                font-size: 18pt; 
                font-weight: 800; 
                color: #1a1a1a; 
                margin: 0; 
                text-transform: uppercase;
            }
            .legal-info { 
                font-size: 8.5pt; 
                color: #333; 
                text-transform: uppercase; 
                font-weight: 600;
                line-height: 1.3;
            }
            .doc-title { 
                text-align: center; 
                font-size: 14pt; 
                font-weight: 800; 
                margin: 25px 0; 
                color: #000;
                text-decoration: underline;
                text-transform: uppercase;
            }
            .content { 
                text-align: justify; 
                margin: 25px 0;
                font-size: 11pt;
            }
            .content p { margin-bottom: 15px; text-indent: 0; }
            .highlight { font-weight: 700; }
            
            .signature-section { 
                margin-top: 50px; 
            }
            .signature-line { 
                border-top: 1.5px solid #000; 
                width: 250px; 
                margin-bottom: 8px; 
            }
            .signer-info { 
                font-size: 10.5pt; 
                font-weight: 700;
                color: #1a1a1a;
                text-transform: uppercase;
            }
            .contact-info { 
                font-size: 9pt; 
                color: #444; 
                font-weight: 400; 
                margin-top: 3px;
                text-transform: none;
            }
            .signature-wrapper {
                position: relative;
                height: 0;
            }
            .signature-img {
                position: absolute;
                bottom: -15px;
                left: 20px;
                width: 200px;
                z-index: 10;
            }
            @media print { 
                body { -webkit-print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        <div class="certificate-container">
            <div class="header">
                <img src="${window.location.origin}${P}" class="logo" alt="Escudo">
                <div class="header-info">
                    <div class="club-name">CLUB DEPORTIVO UNIÓN JAGÜERA</div>
                    <div class="legal-info">
                        PERSONERÍA JURÍDICA N° 003023 | NIT. 824.006.372<br>
                        RECONOCIMIENTO DEPORTIVO N° 467<br>
                        Antonio Rafael Torres Manjarrez - Representante Legal
                    </div>
                </div>
            </div>

            <h2 class="doc-title">${v}</h2>

            <div class="content">
                <p>El suscrito Representante Legal del <span class="highlight">CLUB DEPORTIVO UNIÓN JAGÜERA</span>, hace constar que el deportista 
                <span class="highlight">${(n.fullName||n.name).toUpperCase()}</span>, identificado con el documento de identidad No. 
                <span class="highlight">${n.dni||n.documentNumber||"_________________"}</span> y perteneciente a la categoría 
                <span class="highlight">${n.category}</span>, se encuentra a la fecha 
                <span class="highlight">DEBIDAMENTE PAZ Y SALVO</span> por todo concepto relacionado con mensualidades, cuotas de administración, inscripción 
                y derechos deportivos derivados de su ${y} en nuestra institución.</p>
                
                <p>Se certifica que, tras revisar los registros contables a la fecha, el deportista no presenta deudas pendientes de ninguna índole con el club.</p>

                <p>Para constancia de lo anterior, se firma el presente documento en el municipio de La Jagua de Ibirico, el día ${new Date().getDate()} del mes de ${new Date().toLocaleString("es-CO",{month:"long"})} de ${new Date().getFullYear()}.</p>
            </div>

                <p>Atentamente,</p>
                <div style="margin-top: 30px;">
                    <div class="signature-wrapper">
                        <img src="${window.location.origin}${I}" class="signature-img" onerror="this.style.display='none'">
                    </div>
                    <div class="signature-line"></div>
                    <div class="signer-info">
                        ANTONIO RAFAEL TORRES M<br>
                        Representante Legal<br>
                        <div class="contact-info">
                           Cel: 3044517408 | Email: union_user@unionjaguera.com
                        </div>
                    </div>
                </div>

                ${u?`
                    <div style="text-align: center; border: 1.5px solid #1fa774; padding: 12px; border-radius: 8px; background: #f9fffb; max-width: 500px; margin-top: 25px;">
                        <p style="margin: 0; font-size: 9pt; color: #1a1a1a; text-transform: none; line-height: 1.4;">
                            <strong style="color: #1fa774; font-size: 10pt;">DOCUMENTO AUTORIZADO DIGITALMENTE</strong><br>
                            Este certificado ha sido generado automáticamente por el sistema de control financiero del club. 
                            La validez de este Paz y Salvo está sujeta a la verificación del estado de cuenta "Al Día" en nuestra plataforma oficial.
                        </p>
                        <div style="margin-top: 10px; font-family: monospace; font-size: 8pt; color: #666; border-top: 1px dashed #ccc; padding-top: 5px;">
                            CÓDIGO DE VALIDACIÓN: ${Math.random().toString(36).substr(2,9).toUpperCase()}<br>
                            EXPEDICIÓN: ${new Date().toLocaleDateString("es-CO")} ${new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})}
                        </div>
                    </div>
                `:""}
            </div>
        </div>
        
        <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }<\/script>
    </body>
    </html>`;d.document.write(L),d.document.close()},ref:g,computed:C,onMounted:k,get usePlayersStore(){return D},get usePaymentsStore(){return z},get useAuthStore(){return A},get logoUrl(){return P},get firmaUrl(){return I}};return Object.defineProperty(S,"__isScriptSetup",{enumerable:!1,value:!0}),S}},F={class:"admin-dashboard"},V={class:"admin-toolbar"},G={class:"toolbar-left"},$={class:"tabs"},j={key:0,class:"admin-table-wrapper"},B={class:"admin-table-container"},J={class:"admin-table"},Y={class:"action-btns"},Z=["onClick"],q=["onClick"],W=["onClick"],X={key:0},H={key:1,class:"admin-table-wrapper"},K={class:"admin-table-container"},Q={class:"admin-table"},tt={class:"action-btns"},et=["onClick"],ot=["onClick"],at={class:"admin-modal",style:{"max-width":"500px"}},nt={class:"admin-modal-header"},st={key:0,class:"admin-modal-body"},it={class:"debt-breakdown"},lt={class:"debt-item"},rt={key:0,class:"debt-item"},dt={key:1,class:"debt-item"},ct={key:2,class:"debt-item"},ut={key:3,class:"debt-item"},mt={style:{color:"#27ae60"}},gt={class:"debt-item total",style:{"font-size":"1.2rem",color:"#e74c3c"}},pt={class:"admin-modal-footer"};function bt(T,e,f,o,h,x){var c,p,b;return i(),s("div",F,[t("div",V,[t("div",G,[e[5]||(e[5]=t("h2",null,"Gestión de Paz y Salvos",-1)),t("div",$,[t("button",{onClick:e[0]||(e[0]=a=>o.activeTab="requests"),class:_([{active:o.activeTab==="requests"},"tab-btn"])}," Solicitudes ("+l(o.requests.length)+") ",3),t("button",{onClick:e[1]||(e[1]=a=>o.activeTab="all"),class:_([{active:o.activeTab==="all"},"tab-btn"])}," Listado de Jugadores ",2)])])]),o.activeTab==="requests"?(i(),s("div",j,[t("div",B,[t("table",J,[e[10]||(e[10]=t("thead",null,[t("tr",null,[t("th",null,"Fecha"),t("th",null,"Jugador"),t("th",null,"Categoría"),t("th",null,"Total Deuda"),t("th",null,"Estado"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(i(!0),s(w,null,E(o.requests,a=>(i(),s("tr",{key:a.id},[t("td",null,l(new Date(a.request_date).toLocaleDateString()),1),t("td",null,[t("strong",null,l(a.fullName),1)]),t("td",null,l(a.category),1),t("td",null,"$"+l(parseFloat(a.total_to_pay).toLocaleString()),1),t("td",null,[t("span",{class:_(["status-badge",a.status.toLowerCase().replace(" ","-")])},l(a.status),3)]),t("td",null,[t("div",Y,[a.status==="Pendiente"||a.status==="En revisión"?(i(),s(w,{key:0},[t("button",{onClick:m=>o.handleStatusChange(a,"Aprobado"),class:"btn-action edit",title:"Aprobar",style:{background:"#e1f7ec",color:"#27ae60"}},[...e[6]||(e[6]=[t("i",{class:"fa-solid fa-check"},null,-1)])],8,Z),t("button",{onClick:m=>o.handleStatusChange(a,"Rechazado"),class:"btn-action delete",title:"Rechazar"},[...e[7]||(e[7]=[t("i",{class:"fa-solid fa-xmark"},null,-1)])],8,q)],64)):r("",!0),a.status==="Aprobado"||a.status==="Generado"?(i(),s("button",{key:1,onClick:m=>o.downloadCertificate(a),class:"btn-action edit",title:"Descargar"},[...e[8]||(e[8]=[t("i",{class:"fa-solid fa-download"},null,-1)])],8,W)):r("",!0)])])]))),128)),o.requests.length===0?(i(),s("tr",X,e[9]||(e[9]=[t("td",{colspan:"6",class:"empty-row"},"No hay solicitudes pendientes.",-1)]))):r("",!0)])])])])):r("",!0),o.activeTab==="all"?(i(),s("div",H,[t("div",K,[t("table",Q,[e[13]||(e[13]=t("thead",null,[t("tr",null,[t("th",null,"Jugador"),t("th",null,"Categoría"),t("th",null,"Tipo"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(i(!0),s(w,null,E(o.eligiblePlayers,a=>(i(),s("tr",{key:a.id},[t("td",null,[t("strong",null,l(a.name),1)]),t("td",null,l(a.category),1),t("td",null,l(a.isEscuela?"Escuela":"Competitivo"),1),t("td",null,[t("div",tt,[a.isEscuela?(i(),s("button",{key:0,onClick:m=>o.downloadCertificate(a),class:"btn-action edit",title:"Generar Automático"},[...e[11]||(e[11]=[t("i",{class:"fa-solid fa-bolt"},null,-1)])],8,et)):r("",!0),t("button",{class:"btn-action edit",onClick:m=>o.viewDebt(a),title:"Ver Deuda"},[...e[12]||(e[12]=[t("i",{class:"fa-solid fa-dollar-sign"},null,-1)])],8,ot)])])]))),128))])])])])):r("",!0),o.showDebtModal?(i(),s("div",{key:2,class:"admin-modal-overlay",onClick:e[4]||(e[4]=M(a=>o.showDebtModal=!1,["self"]))},[t("div",at,[t("div",nt,[t("h3",null,"Estado de Cuenta: "+l((c=o.selectedPlayerForDebt)==null?void 0:c.name),1),t("button",{onClick:e[2]||(e[2]=a=>o.showDebtModal=!1),class:"close-modal-btn"},"×")]),o.debtInfo?(i(),s("div",st,[t("div",it,[t("div",lt,[e[14]||(e[14]=t("span",null,"Mensualidades Pendientes:",-1)),t("strong",null,"$"+l(o.debtInfo.monthly_debt.toLocaleString()),1)]),(p=o.selectedPlayerForDebt)!=null&&p.isEscuela?(i(),s("div",dt,e[16]||(e[16]=[t("span",null,"Derechos de Paz y Salvo:",-1),t("strong",{style:{color:"#27ae60"}},"¡SIN COSTO! (Escuela)",-1)]))):(i(),s("div",rt,e[15]||(e[15]=[t("span",null,"Derechos de Paz y Salvo:",-1),t("strong",null,"$200.000",-1)]))),o.debtInfo.subscription_debt>0||!((b=o.selectedPlayerForDebt)!=null&&b.isEscuela)?(i(),s("div",ct,[e[17]||(e[17]=t("span",null,"Suscripción Club ($20k):",-1)),t("strong",null,"$"+l(o.debtInfo.subscription_debt.toLocaleString()),1)])):r("",!0),o.debtInfo.convention_discount>0?(i(),s("div",ut,[e[18]||(e[18]=t("span",{style:{color:"#27ae60"}},"Descuento Conv./Beca:",-1)),t("strong",mt,"- $"+l(o.debtInfo.convention_discount.toLocaleString()),1)])):r("",!0),e[20]||(e[20]=t("hr",{style:{border:"0","border-top":"1px solid #eee",margin:"15px 0"}},null,-1)),t("div",gt,[e[19]||(e[19]=t("span",null,"TOTAL PENDIENTE:",-1)),t("strong",null,"$"+l(o.debtInfo.total_to_pay.toLocaleString()),1)])]),e[21]||(e[21]=t("p",{style:{"margin-top":"1.5rem","font-size":"0.85rem",color:"#666","font-style":"italic"}}," * Este es un desglose automático basado en los registros actuales de pagos y suscripciones. ",-1))])):r("",!0),t("div",pt,[t("button",{onClick:e[3]||(e[3]=a=>o.showDebtModal=!1),class:"btn-admin primary",style:{width:"100%"}},"Cerrar")])])])):r("",!0)])}const wt=R(U,[["render",bt],["__scopeId","data-v-178b5322"],["__file","C:/Git/Union-01/src/views/admin/financiero/PazySalvo.vue"]]);export{wt as default};
