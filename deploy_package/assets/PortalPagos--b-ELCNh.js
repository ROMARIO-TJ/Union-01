import{_ as M,c as n,b as t,d as f,F as v,r as h,e as p,q as R,t as l,G as k,x as S,h as b,o as P,i as z,l as i,J as _}from"./index-BGx4u8UC.js";import{u as A}from"./paymentsStore-BcSh7-92.js";const L={__name:"PortalPagos",setup(D,{expose:o}){o();const m=k(),s=S(),y=A(),x=b(!1),g=b(null),e=b([]),u=a=>{if(!a)return!1;const d=a.toLowerCase();if(d.includes("escuela"))return!1;if(d.includes("primera"))return!0;const c=d.match(/sub[\s-]*(\d+)/);return!!(c&&parseInt(c[1])>=13)};P(async()=>{var a;(a=s.parentUser)!=null&&a.email?await m.fetchPlayersByParent(s.parentUser.email):await m.initPlayers()});const H=async a=>{g.value=a,e.value=await y.fetchPaymentsByPlayer(a.id),x.value=!0},I=z(()=>{var d,c;const a=(c=(d=s.parentUser)==null?void 0:d.email)==null?void 0:c.toLowerCase();return a?m.players.filter(r=>(r.parentEmail||"").toLowerCase()===a).map(r=>{const C=u(r.category)?2e4:5e4;return{id:r.id,name:r.name||r.fullName,category:r.category||"Sin asignar",status:r.paymentStatus||"Pendiente",amountValue:C,amount:`$${C.toLocaleString()}`,date:r.registrationDate||"N/A"}}):[]}),w={playersStore:m,authStore:s,paymentsStore:y,showHistoryModal:x,selectedChild:g,childHistory:e,isCompetitive:u,openHistory:H,myChildren:I,getStatusColor:a=>a==="Al Día"?{bg:"rgba(46, 204, 113, 0.1)",text:"#27ae60"}:a==="Pendiente"?{bg:"rgba(243, 156, 18, 0.1)",text:"#d35400"}:{bg:"rgba(231, 76, 60, 0.1)",text:"#c0392b"},exportReceipt:a=>{if(a.status!=="Al Día"){alert('Solo se pueden generar recibos para pagos con estado "Al Día".');return}const d="/src/assets/img/logosinfondo.png",c=window.open("","_blank","width=800,height=800"),r=`
        <html>
        <head>
            <title>Recibo de Pago - ${a.name}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                .receipt-container { border: 2px solid #1fa774; padding: 40px; border-radius: 15px; max-width: 800px; margin: 0 auto; position: relative; background: white; }
                .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; width: 400px; z-index: 0; }
                .content { position: relative; z-index: 1; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1fa774; padding-bottom: 20px; margin-bottom: 30px; }
                .logo-box { display: flex; align-items: center; gap: 15px; }
                .logo-img { height: 80px; }
                .club-name { color: #1fa774; font-size: 28px; font-weight: 900; line-height: 1; }
                .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                .details-table th { text-align: left; padding: 12px; background: #f4fbf8; color: #1fa774; border-bottom: 2px solid #1fa774; font-size: 13px; text-transform: uppercase; }
                .details-table td { padding: 15px 12px; border-bottom: 1px solid #eee; font-size: 16px; }
                .amount-total { background: #1fa774; color: white; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
                .total-value { font-size: 30px; font-weight: 900; }
                .legal { font-size: 11px; color: #888; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <img src="${d}" class="watermark" onerror="this.style.display='none'">
                <div class="content">
                    <div class="header">
                        <div class="logo-box">
                            <img src="${d}" class="logo-img" onerror="this.src='https://via.placeholder.com/80?text=U.J.'">
                            <div class="club-name">CLUB UNIÓN<br>JEGUERA</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #e74c3c; font-weight: bold;">CERTIFICADO DIGITAL</div>
                            <div style="font-size: 14px; color: #666;">Fecha: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                    <table class="details-table">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th>Deportista</th>
                                <th>Categoría</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Mensualidad / Inscripción</td>
                                <td><strong>${a.name}</strong></td>
                                <td>${a.category}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="amount-total">
                        <strong>VALOR RECIBIDO</strong>
                        <span class="total-value">${a.amount}</span>
                    </div>
                    <div style="margin-top: 40px; text-align: center;">
                        <div style="border: 2px solid #1fa774; color: #1fa774; padding: 10px 20px; display: inline-block; border-radius: 5px; font-weight: bold;">
                            VERIFICADO POR EL CLUB
                        </div>
                    </div>
                    <div class="legal">
                        Este documento es un comprobante oficial de pago generado desde el Portal de Padres.
                        No requiere firma física. Generado el: ${new Date().toLocaleString()}
                    </div>
                </div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
        </html>
    `;c.document.write(r),c.document.close()},ref:b,computed:z,onMounted:P,get usePlayersStore(){return k},get useAuthStore(){return S},get usePaymentsStore(){return A}};return Object.defineProperty(w,"__isScriptSetup",{enumerable:!1,value:!0}),w}},E={class:"admin-dashboard"},N={class:"admin-table-wrapper",style:{"margin-top":"2rem"}},U={class:"admin-table-container"},V={class:"admin-table"},B={class:"badge",style:{background:"#eee",color:"#666"}},j={style:{display:"flex",gap:"0.5rem","justify-content":"flex-end"}},F=["onClick"],O=["onClick"],G={key:0},J={class:"admin-cards-grid",style:{"margin-top":"1.5rem"}},T={class:"admin-card-item__header"},W={style:{"font-weight":"800","font-size":"1.1rem"}},$={class:"badge",style:{background:"#eee",color:"#666","font-size":"0.7rem"}},q={class:"admin-card-item__body"},K={class:"admin-card-item__row"},Q={class:"admin-card-item__row"},X={class:"admin-card-item__actions"},Y=["onClick"],Z=["onClick"],tt={class:"admin-modal",style:{"max-width":"600px"}},et={class:"admin-modal-header"},ot={class:"admin-modal-body"},st={key:0,style:{"text-align":"center",padding:"2rem"}},at={key:1,class:"admin-table-container"},nt={class:"admin-table",style:{"font-size":"0.85rem"}},it={key:0},lt={class:"admin-modal-footer"};function rt(D,o,m,s,y,x){var g;return i(),n("div",E,[o[15]||(o[15]=t("div",{class:"admin-toolbar"},[t("div",{class:"toolbar-left"},[t("h2",null,"Mis Pagos"),t("p",{style:{color:"#666","font-size":"0.9rem"}},"Consulta el estado financiero de tus hijos registrados.")])],-1)),t("div",N,[t("div",U,[t("table",V,[o[6]||(o[6]=t("thead",null,[t("tr",null,[t("th",null,"Hijo(a)"),t("th",null,"Categoría"),t("th",null,"Monto Mensual"),t("th",null,"Estado Actual"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(i(!0),n(v,null,h(s.myChildren,e=>(i(),n("tr",{key:e.id},[t("td",null,[t("strong",null,l(e.name),1)]),t("td",null,[t("span",B,l(e.category),1)]),t("td",null,l(e.amount),1),t("td",null,[t("span",{style:_({padding:"6px 12px",borderRadius:"20px",fontSize:"0.8rem",fontWeight:"700",backgroundColor:s.getStatusColor(e.status).bg,color:s.getStatusColor(e.status).text})},l(e.status),5)]),t("td",null,[t("div",j,[t("button",{onClick:u=>s.openHistory(e),class:"btn-action view",title:"Historial de Pagos",style:{background:"#f0f4f8",color:"#2c3e50","border-radius":"6px",width:"auto",padding:"0 10px",height:"32px"}},[...o[3]||(o[3]=[t("i",{class:"fa-solid fa-clock-rotate-left"},null,-1),p(" Historial ")])],8,F),e.status==="Al Día"?(i(),n("button",{key:0,onClick:u=>s.exportReceipt(e),class:"btn-action edit",title:"Descargar Recibo",style:{background:"#e6f3ef",color:"#1fa774",width:"auto",padding:"0 15px",height:"32px","font-size":"0.8rem"}},[...o[4]||(o[4]=[t("i",{class:"fa-solid fa-file-pdf"},null,-1),p(" Ver Recibo ")])],8,O)):f("",!0)])])]))),128)),s.myChildren.length===0?(i(),n("tr",G,o[5]||(o[5]=[t("td",{colspan:"5",style:{"text-align":"center",padding:"3rem",color:"#888"}},[t("i",{class:"fa-solid fa-user-slash",style:{"font-size":"2rem",display:"block","margin-bottom":"1rem"}}),p(" No hay hijos vinculados a este correo electrónico."),t("br"),t("small",null,"Contacta al club para vincular tus registros antiguos.")],-1)]))):f("",!0)])])])]),t("div",J,[(i(!0),n(v,null,h(s.myChildren,e=>(i(),n("div",{key:"card-"+e.id,class:"admin-card-item"},[t("div",T,[o[7]||(o[7]=t("div",{class:"stat-icon players",style:{width:"40px",height:"40px","font-size":"1rem"}},[t("i",{class:"fa-solid fa-child"})],-1)),t("div",null,[t("h4",W,l(e.name),1),t("span",$,l(e.category),1)])]),t("div",q,[t("div",K,[o[8]||(o[8]=t("span",{class:"admin-card-item__label"},"Monto Mensual:",-1)),t("span",null,l(e.amount),1)]),t("div",Q,[o[9]||(o[9]=t("span",{class:"admin-card-item__label"},"Estado:",-1)),t("span",{style:_({color:s.getStatusColor(e.status).text,fontWeight:"700"})},l(e.status),5)])]),t("div",X,[t("button",{onClick:u=>s.openHistory(e),class:"btn-admin secondary",style:{flex:"1",padding:"0.6rem","font-size":"0.8rem"}},[...o[10]||(o[10]=[t("i",{class:"fa-solid fa-clock-rotate-left"},null,-1),p(" Historial ")])],8,Y),e.status==="Al Día"?(i(),n("button",{key:0,onClick:u=>s.exportReceipt(e),class:"btn-admin primary",style:{flex:"1",padding:"0.6rem","font-size":"0.8rem"}},[...o[11]||(o[11]=[t("i",{class:"fa-solid fa-file-pdf"},null,-1),p(" Ver Recibo ")])],8,Z)):f("",!0)])]))),128))]),s.showHistoryModal?(i(),n("div",{key:0,class:"admin-modal-overlay",onClick:o[2]||(o[2]=R(e=>s.showHistoryModal=!1,["self"]))},[t("div",tt,[t("div",et,[t("h2",null,"Historial de Pagos: "+l((g=s.selectedChild)==null?void 0:g.name),1),t("button",{class:"close-modal",onClick:o[0]||(o[0]=e=>s.showHistoryModal=!1)},"×")]),t("div",ot,[s.paymentsStore.isLoading?(i(),n("div",st,o[12]||(o[12]=[t("i",{class:"fa-solid fa-spinner fa-spin"},null,-1),p(" Cargando historial... ")]))):(i(),n("div",at,[t("table",nt,[o[14]||(o[14]=t("thead",null,[t("tr",null,[t("th",null,"Fecha"),t("th",null,"Mes"),t("th",null,"Concepto"),t("th",null,"Valor")])],-1)),t("tbody",null,[(i(!0),n(v,null,h(s.childHistory,e=>(i(),n("tr",{key:e.id},[t("td",null,l(e.fecha),1),t("td",null,l(e.tipo==="Inscripción"?"N/A":(["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][e.mes-1]||"---")+" / "+(e.year||"2025")),1),t("td",null,[t("span",{class:"badge",style:_({backgroundColor:e.tipo==="Inscripción"?"rgba(52, 152, 219, 0.1)":"rgba(46, 204, 113, 0.1)",color:e.tipo==="Inscripción"?"#2980b9":"#27ae60",padding:"4px 8px",borderRadius:"4px",fontSize:"0.75rem",fontWeight:"bold"})},l(e.tipo),5)]),t("td",null,[t("strong",null,"$"+l(Number(e.valor).toLocaleString()),1)])]))),128)),s.childHistory.length===0?(i(),n("tr",it,o[13]||(o[13]=[t("td",{colspan:"4",style:{"text-align":"center",padding:"2rem",color:"#888"}},"No se encontraron registros de pago.",-1)]))):f("",!0)])])]))]),t("div",lt,[t("button",{class:"btn-admin primary",onClick:o[1]||(o[1]=e=>s.showHistoryModal=!1)},"Cerrar")])])])):f("",!0)])}const gt=M(L,[["render",rt],["__scopeId","data-v-fc649a97"],["__file","C:/Git/Union-01/src/views/admin/portal/PortalPagos.vue"]]);export{gt as default};
