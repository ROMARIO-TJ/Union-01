import{_ as N,c as s,b as e,d as g,F as h,r as q,t as r,e as _,G as x,x as S,h as f,o as C,i as E,A as R,l as i,n as D}from"./index-BGx4u8UC.js";import{u as A}from"./paymentsStore-BcSh7-92.js";import{f as z}from"./firma-C6m3jE3l.js";const I={__name:"PortalPazySalvo",setup(P,{expose:t}){t();const y=x(),a=S(),d=A(),v=f(!1),u=f(!1),c=f(null),o=f(null);C(async()=>{var n;v.value=!0,(n=a.parentUser)!=null&&n.email&&await Promise.all([y.initPlayers(),d.fetchPazSalvoRequests()]),v.value=!1});const b=E(()=>{var p,m;const n=(m=(p=a.parentUser)==null?void 0:p.email)==null?void 0:m.toLowerCase();return n?y.players.filter(l=>(l.parentEmail||l.email||"").toLowerCase()===n).map(l=>{const k=(l.category||"").toLowerCase().includes("escuela"),L=d.pazSalvoRequests.find(O=>O.player_id===l.id);return{id:l.id,name:l.name||l.fullName,category:l.category||"Sin asignar",paymentStatus:l.paymentStatus,dni:l.dni||l.documentNumber||"_________________",isEscuela:k,currentRequest:L}}):[]}),w={playersStore:y,authStore:a,paymentsStore:d,isLoading:v,showRequestModal:u,selectedChild:c,calculation:o,allChildren:b,openRequestModal:async n=>{c.value=n,o.value=await d.calculatePazSalvoDebt(n.id),u.value=!0},submitRequest:async()=>{if(c.value)try{await d.submitPazSalvoRequest({player_id:c.value.id,monthly_debt:o.value.monthly_debt}),await d.fetchPazSalvoRequests(),u.value=!1,alert("Solicitud enviada correctamente")}catch(n){alert("Error: "+n.message)}},downloadCertificate:n=>{const p=window.open("","_blank"),m=new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"}),l=`
        <html>
        <head>
            <title>PAZ Y SALVO - ${n.name}</title>
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
                    <img src="${window.location.origin}${R}" class="logo" alt="Escudo">
                    <div class="header-info">
                        <div class="club-name">CLUB DEPORTIVO UNIÓN JAGÜERA</div>
                        <div class="legal-info">
                            PERSONERÍA JURÍDICA N° 003023 | NIT. 824.006.372<br>
                            RECONOCIMIENTO DEPORTIVO N° 467<br>
                            Antonio Rafael Torres Manjarrez - Representante Legal
                        </div>
                    </div>
                </div>

                <h2 class="doc-title">PAZ Y SALVO</h2>

                <div class="content">
                    <p>El suscrito Representante Legal del <span class="highlight">CLUB DEPORTIVO UNIÓN JAGÜERA</span>, hace constar que el deportista 
                    <span class="highlight">${n.name.toUpperCase()}</span>, identificado con el documento de identidad No. 
                    <span class="highlight">${n.dni}</span> y perteneciente a la categoría 
                    <span class="highlight">${n.category}</span>, se encuentra a la fecha 
                    <span class="highlight">DEBIDAMENTE PAZ Y SALVO</span> 
                    por todo concepto relacionado con mensualidades, cuotas de administración, inscripción y derechos de formación con nuestra institución.</p>
                    
                    <p>Se certifica que, tras revisar los registros contables a la fecha, el deportista no presenta deudas pendientes de ninguna índole con el club.</p>

                    <p>Para constancia de lo anterior, se firma el presente documento en el municipio de La Jagua de Ibirico, el día ${m}.</p>
                </div>

                <div class="signature-section">
                    <p>Atentamente,</p>
                    <div style="margin-top: 30px;">
                        <div class="signature-wrapper">
                            <img src="${window.location.origin}${z}" class="signature-img" onerror="this.style.display='none'">
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

                    ${n.isEscuela?`
                        <div style="text-align: center; border: 1.5px solid #1fa774; padding: 12px; border-radius: 8px; background: #f9fffb; max-width: 500px; margin-top: 25px;">
                            <p style="margin: 0; font-size: 9pt; color: #1a1a1a; text-transform: none; line-height: 1.4;">
                                <strong style="color: #1fa774; font-size: 10pt;">DOCUMENTO AUTORIZADO DIGITALMENTE</strong><br>
                                Este certificado ha sido generado automáticamente por el sistema de control financiero del club. 
                                La validez de este Paz y Salvo está sujeta a la verificación del estado de cuenta "Al Día" en nuestra plataforma oficial.
                            </p>
                            <div style="margin-top: 10px; font-family: monospace; font-size: 8pt; color: #666; border-top: 1px dashed #ccc; padding-top: 5px;">
                                CÓDIGO DE VALIDACIÓN: ${Math.random().toString(36).substr(2,9).toUpperCase()}<br>
                                EXPEDICIÓN: ${m}
                            </div>
                        </div>
                    `:""}
                </div>
            </div>
            <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); }<\/script>
        </body>
        </html>
    `;p.document.write(l),p.document.close()},ref:f,computed:E,onMounted:C,get usePlayersStore(){return x},get useAuthStore(){return S},get usePaymentsStore(){return A},get logoUrl(){return R},get firmaUrl(){return z}};return Object.defineProperty(w,"__isScriptSetup",{enumerable:!1,value:!0}),w}},T={class:"admin-dashboard"},M={class:"admin-table-wrapper",style:{"margin-top":"2rem"}},U={class:"admin-table-container"},V={class:"admin-table"},j=["onClick"],G={key:1,class:"badge badge-pending"},$=["onClick"],B=["onClick"],J={key:0,class:"admin-modal-overlay"},Z={class:"admin-modal",style:{"max-width":"500px"}},F={class:"admin-modal-header"},Y={key:0,class:"admin-modal-body"},W={class:"debt-breakdown"},X={class:"debt-item"},H={key:0,class:"debt-item"},K={class:"debt-item"},Q={key:0},ee={key:1,style:{color:"#27ae60"}},te={key:1,class:"debt-item"},ae={style:{color:"#27ae60"}},oe={class:"debt-item total"};function ne(P,t,y,a,d,v){var u,c;return i(),s("div",T,[t[14]||(t[14]=e("div",{class:"admin-toolbar"},[e("div",{class:"toolbar-left"},[e("h2",null,"Certificados Paz y Salvo"),e("p",{style:{color:"#666","font-size":"0.9rem"}},"Gestione y descargue los paz y salvos de sus hijos.")])],-1)),e("div",M,[e("div",U,[e("table",V,[t[3]||(t[3]=e("thead",null,[e("tr",null,[e("th",null,"Deportista"),e("th",null,"Categoría"),e("th",null,"Tipo"),e("th",null,"Estado / Acciones")])],-1)),e("tbody",null,[(i(!0),s(h,null,q(a.allChildren,o=>(i(),s("tr",{key:o.id},[e("td",null,[e("strong",null,r(o.name),1)]),e("td",null,r(o.category),1),e("td",null,r(o.isEscuela?"Escuela":"Competitivo"),1),e("td",null,[o.isEscuela?(i(),s(h,{key:0},[o.paymentStatus==="Al Día"?(i(),s("button",{key:0,onClick:b=>a.downloadCertificate(o),class:"btn-action view",style:{background:"#1fa774",color:"white",width:"auto",padding:"0 15px"}},[...t[1]||(t[1]=[e("i",{class:"fa-solid fa-download"},null,-1),_(" Descargar ")])],8,j)):(i(),s("span",G,"Pendiente de Pago"))],64)):(i(),s(h,{key:1},[o.currentRequest?(i(),s(h,{key:0},[e("span",{class:D(["status-badge",o.currentRequest.status.toLowerCase()])},r(o.currentRequest.status),3),o.currentRequest.status==="Aprobado"||o.currentRequest.status==="Generado"?(i(),s("button",{key:0,onClick:b=>a.downloadCertificate(o),class:"btn-action view",style:{"margin-left":"10px"}},[...t[2]||(t[2]=[e("i",{class:"fa-solid fa-download"},null,-1)])],8,$)):g("",!0)],64)):(i(),s("button",{key:1,onClick:b=>a.openRequestModal(o),class:"btn-admin primary",style:{"font-size":"0.8rem",padding:"5px 15px"}}," Solicitar Paz y Salvo ",8,B))],64))])]))),128))])])])]),a.showRequestModal?(i(),s("div",J,[e("div",Z,[e("div",F,[e("h3",null,"Solicitar Paz y Salvo - "+r(a.selectedChild.name),1),e("button",{onClick:t[0]||(t[0]=o=>a.showRequestModal=!1),class:"close-modal-btn"},"×")]),a.calculation?(i(),s("div",Y,[e("div",W,[e("div",X,[t[4]||(t[4]=e("span",null,"Mensualidades Pendientes:",-1)),t[5]||(t[5]=_()),e("strong",null,"$"+r(a.calculation.monthly_debt.toLocaleString()),1)]),!((u=a.selectedChild)!=null&&u.isEscuela)||a.calculation.subscription_debt>0?(i(),s("div",H,[t[6]||(t[6]=e("span",null,"Suscripción Club:",-1)),t[7]||(t[7]=_()),e("strong",null,"$"+r(a.calculation.subscription_debt.toLocaleString()),1)])):g("",!0),e("div",K,[t[8]||(t[8]=e("span",null,"Valor Base Paz y Salvo:",-1)),(c=a.selectedChild)!=null&&c.isEscuela?(i(),s("strong",ee,"¡SIN COSTO! (Escuela)")):(i(),s("strong",Q,"$200.000"))]),a.calculation.convention_discount>0?(i(),s("div",te,[t[9]||(t[9]=e("span",null,"Descuento Convenio:",-1)),e("strong",ae,"- $"+r(a.calculation.convention_discount.toLocaleString()),1)])):g("",!0),t[12]||(t[12]=e("hr",null,null,-1)),e("div",oe,[t[10]||(t[10]=e("span",null,"TOTAL A CANCELAR:",-1)),t[11]||(t[11]=_()),e("strong",null,"$"+r(a.calculation.total_to_pay.toLocaleString()),1)])]),t[13]||(t[13]=e("p",{style:{"margin-top":"1rem","font-size":"0.85rem",color:"#666"}}," * Al solicitar el paz y salvo, el administrador revisará su estado y podrá aprobar la descarga una vez confirmado el pago. ",-1))])):g("",!0),e("div",{class:"admin-modal-footer"},[e("button",{onClick:a.submitRequest,class:"btn-admin primary",style:{width:"100%"}}," Confirmar Solicitud ")])])])):g("",!0)])}const ue=N(I,[["render",ne],["__scopeId","data-v-692210ca"],["__file","C:/Git/Union-01/src/views/admin/portal/PortalPazySalvo.vue"]]);export{ue as default};
