import{_ as z,C as P,j as S,r as f,E as D,c as $,a as s,d as t,e as c,F as b,h as y,i as r,m as A,t as l,f as E,o as n,H as C}from"./index-DaT0hRL-.js";import{u as I}from"./paymentsStore-Bm81-JvL.js";const L={class:"admin-dashboard"},M={class:"admin-table-wrapper",style:{"margin-top":"2rem"}},N={class:"admin-table-container"},R={class:"admin-table"},H={class:"badge",style:{background:"#eee",color:"#666"}},U={style:{display:"flex",gap:"0.5rem","justify-content":"flex-end"}},V=["onClick"],j=["onClick"],B={key:0},F={class:"admin-cards-grid",style:{"margin-top":"1.5rem"}},O={class:"admin-card-item__header"},G={style:{"font-weight":"800","font-size":"1.1rem"}},J={class:"badge",style:{background:"#eee",color:"#666","font-size":"0.7rem"}},T={class:"admin-card-item__body"},W={class:"admin-card-item__row"},q={class:"admin-card-item__row"},K={class:"admin-card-item__actions"},Q=["onClick"],X=["onClick"],Y={class:"admin-modal",style:{"max-width":"600px"}},Z={class:"admin-modal-header"},tt={class:"admin-modal-body"},et={key:0,style:{"text-align":"center",padding:"2rem"}},ot={key:1,class:"admin-table-container"},at={class:"admin-table",style:{"font-size":"0.85rem"}},st={key:0},nt={class:"admin-modal-footer"},lt={__name:"PortalPagos",setup(it){const v=P(),x=S(),h=I(),d=f(!1),_=f(null),u=f([]);D(async()=>{var a;(a=x.parentUser)!=null&&a.email&&await v.initPlayers()});const w=async a=>{_.value=a,u.value=await h.fetchPaymentsByPlayer(a.id),d.value=!0},p=$(()=>{var o,i;const a=(i=(o=x.parentUser)==null?void 0:o.email)==null?void 0:i.toLowerCase();return a?v.players.filter(e=>(e.parentEmail||"").toLowerCase()===a).map(e=>({id:e.id,name:e.name||e.fullName,category:e.category||"Sin asignar",status:e.paymentStatus||"Pendiente",amount:"$50.000",date:e.registrationDate||"N/A"})):[]}),m=a=>a==="Al Día"?{bg:"rgba(46, 204, 113, 0.1)",text:"#27ae60"}:a==="Pendiente"?{bg:"rgba(243, 156, 18, 0.1)",text:"#d35400"}:{bg:"rgba(231, 76, 60, 0.1)",text:"#c0392b"},k=a=>{if(a.status!=="Al Día"){alert('Solo se pueden generar recibos para pagos con estado "Al Día".');return}const o="/src/assets/img/logosinfondo.png",i=window.open("","_blank","width=800,height=800"),e=`
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
                <img src="${o}" class="watermark" onerror="this.style.display='none'">
                <div class="content">
                    <div class="header">
                        <div class="logo-box">
                            <img src="${o}" class="logo-img" onerror="this.src='https://via.placeholder.com/80?text=U.J.'">
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
    `;i.document.write(e),i.document.close()};return(a,o)=>{var i;return n(),s("div",L,[o[15]||(o[15]=t("div",{class:"admin-toolbar"},[t("div",{class:"toolbar-left"},[t("h2",null,"Mis Pagos"),t("p",{style:{color:"#666","font-size":"0.9rem"}},"Consulta el estado financiero de tus hijos registrados.")])],-1)),t("div",M,[t("div",N,[t("table",R,[o[6]||(o[6]=t("thead",null,[t("tr",null,[t("th",null,"Hijo(a)"),t("th",null,"Categoría"),t("th",null,"Monto Mensual"),t("th",null,"Estado Actual"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(n(!0),s(b,null,y(p.value,e=>(n(),s("tr",{key:e.id},[t("td",null,[t("strong",null,l(e.name),1)]),t("td",null,[t("span",H,l(e.category),1)]),t("td",null,l(e.amount),1),t("td",null,[t("span",{style:C({padding:"6px 12px",borderRadius:"20px",fontSize:"0.8rem",fontWeight:"700",backgroundColor:m(e.status).bg,color:m(e.status).text})},l(e.status),5)]),t("td",null,[t("div",U,[t("button",{onClick:g=>w(e),class:"btn-action view",title:"Historial de Pagos",style:{background:"#f0f4f8",color:"#2c3e50","border-radius":"6px",width:"auto",padding:"0 10px",height:"32px"}},o[3]||(o[3]=[t("i",{class:"fa-solid fa-clock-rotate-left"},null,-1),r(" Historial ")]),8,V),e.status==="Al Día"?(n(),s("button",{key:0,onClick:g=>k(e),class:"btn-action edit",title:"Descargar Recibo",style:{background:"#e6f3ef",color:"#1fa774",width:"auto",padding:"0 15px",height:"32px","font-size":"0.8rem"}},o[4]||(o[4]=[t("i",{class:"fa-solid fa-file-pdf"},null,-1),r(" Ver Recibo ")]),8,j)):c("",!0)])])]))),128)),p.value.length===0?(n(),s("tr",B,o[5]||(o[5]=[t("td",{colspan:"5",style:{"text-align":"center",padding:"3rem",color:"#888"}},[t("i",{class:"fa-solid fa-user-slash",style:{"font-size":"2rem",display:"block","margin-bottom":"1rem"}}),r(" No hay hijos vinculados a este correo electrónico."),t("br"),t("small",null,"Contacta al club para vincular tus registros antiguos.")],-1)]))):c("",!0)])])])]),t("div",F,[(n(!0),s(b,null,y(p.value,e=>(n(),s("div",{key:"card-"+e.id,class:"admin-card-item"},[t("div",O,[o[7]||(o[7]=t("div",{class:"stat-icon players",style:{width:"40px",height:"40px","font-size":"1rem"}},[t("i",{class:"fa-solid fa-child"})],-1)),t("div",null,[t("h4",G,l(e.name),1),t("span",J,l(e.category),1)])]),t("div",T,[t("div",W,[o[8]||(o[8]=t("span",{class:"admin-card-item__label"},"Monto Mensual:",-1)),t("span",null,l(e.amount),1)]),t("div",q,[o[9]||(o[9]=t("span",{class:"admin-card-item__label"},"Estado:",-1)),t("span",{style:C({color:m(e.status).text,fontWeight:"700"})},l(e.status),5)])]),t("div",K,[t("button",{onClick:g=>w(e),class:"btn-admin secondary",style:{flex:"1",padding:"0.6rem","font-size":"0.8rem"}},o[10]||(o[10]=[t("i",{class:"fa-solid fa-clock-rotate-left"},null,-1),r(" Historial ")]),8,Q),e.status==="Al Día"?(n(),s("button",{key:0,onClick:g=>k(e),class:"btn-admin primary",style:{flex:"1",padding:"0.6rem","font-size":"0.8rem"}},o[11]||(o[11]=[t("i",{class:"fa-solid fa-file-pdf"},null,-1),r(" Ver Recibo ")]),8,X)):c("",!0)])]))),128))]),d.value?(n(),s("div",{key:0,class:"admin-modal-overlay",onClick:o[2]||(o[2]=A(e=>d.value=!1,["self"]))},[t("div",Y,[t("div",Z,[t("h2",null,"Historial de Pagos: "+l((i=_.value)==null?void 0:i.name),1),t("button",{class:"close-modal",onClick:o[0]||(o[0]=e=>d.value=!1)},"×")]),t("div",tt,[E(h).isLoading?(n(),s("div",et,o[12]||(o[12]=[t("i",{class:"fa-solid fa-spinner fa-spin"},null,-1),r(" Cargando historial... ")]))):(n(),s("div",ot,[t("table",at,[o[14]||(o[14]=t("thead",null,[t("tr",null,[t("th",null,"Fecha"),t("th",null,"Mes"),t("th",null,"Concepto"),t("th",null,"Valor")])],-1)),t("tbody",null,[(n(!0),s(b,null,y(u.value,e=>(n(),s("tr",{key:e.id},[t("td",null,l(e.fecha),1),t("td",null,l(["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][e.mes-1]),1),t("td",null,l(e.tipo),1),t("td",null,[t("strong",null,"$"+l(Number(e.valor).toLocaleString()),1)])]))),128)),u.value.length===0?(n(),s("tr",st,o[13]||(o[13]=[t("td",{colspan:"4",style:{"text-align":"center",padding:"2rem",color:"#888"}},"No se encontraron registros de pago.",-1)]))):c("",!0)])])]))]),t("div",nt,[t("button",{class:"btn-admin primary",onClick:o[1]||(o[1]=e=>d.value=!1)},"Cerrar")])])])):c("",!0)])}}},ct=z(lt,[["__scopeId","data-v-0d53d1a8"]]);export{ct as default};
