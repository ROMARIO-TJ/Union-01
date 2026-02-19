import{_ as L,C as J,r as d,E as O,c as A,a as l,d as t,e as b,t as s,p as m,G as k,F as C,h as _,v as $,i as E,m as U,f as B,o as i,H as j}from"./index-xwdGmxcT.js";import{u as H}from"./paymentsStore-_Y9IW8NQ.js";const G={class:"admin-dashboard"},W={class:"admin-toolbar",style:{display:"flex",gap:"1rem","align-items":"center","flex-wrap":"wrap"}},q={class:"toolbar-left",style:{flex:"1","min-width":"200px"}},Q={class:"badge",style:{background:"var(--admin-accent)",color:"white",padding:"2px 8px","border-radius":"10px","font-size":"0.8rem"}},Y={class:"toolbar-right",style:{display:"flex",gap:"1rem",flex:"2","justify-content":"flex-end","align-items":"center","min-width":"300px"}},K={class:"admin-filter-wrapper",style:{position:"relative","min-width":"180px"}},X=["value"],Z={class:"admin-search-wrapper",style:{position:"relative","min-width":"250px"}},tt={key:0,class:"admin-alert success",style:{"margin-bottom":"1rem",padding:"1rem","border-radius":"8px",background:"#e6f3ef",color:"#1fa774","border-left":"5px solid #1fa774",display:"flex","align-items":"center",gap:"0.5rem"}},et={key:1,class:"admin-alert error",style:{"margin-bottom":"1rem",padding:"1rem","border-radius":"8px",background:"#fdf2f2",color:"#e74c3c","border-left":"5px solid #e74c3c",display:"flex","align-items":"center",gap:"0.5rem"}},at={class:"admin-stats-grid"},ot={class:"stat-card"},st={class:"stat-info"},lt={class:"stat-value"},it={class:"stat-card"},nt={class:"stat-info"},rt={class:"stat-value"},dt={class:"stat-card"},ut={class:"stat-info"},ct={class:"stat-value"},pt={class:"admin-table-wrapper"},mt={class:"admin-table-container"},gt={class:"admin-table"},vt={class:"badge",style:{background:"#eee",color:"#666"}},ft=["value","disabled","onChange"],bt={class:"action-btns"},yt=["onClick"],xt=["onClick"],ht={key:0},wt={class:"admin-modal",style:{"max-width":"500px"}},kt={class:"admin-modal-header"},Ct={class:"admin-modal-body"},_t={class:"admin-form-group",style:{"margin-bottom":"1rem"}},Mt={style:{display:"grid","grid-template-columns":"1fr 1fr",gap:"1rem","margin-bottom":"1rem"}},Pt={class:"admin-form-group"},Dt=["value"],zt={class:"admin-form-group"},St={style:{display:"grid","grid-template-columns":"1fr 1fr",gap:"1rem","margin-bottom":"1rem"}},At={class:"admin-form-group"},$t={class:"admin-form-group"},Et={class:"admin-modal-footer"},Tt=["disabled"],Ut={class:"admin-modal",style:{"max-width":"700px"}},Nt={class:"admin-modal-header"},Rt={class:"admin-modal-body"},Vt={key:0,style:{"text-align":"center",padding:"2rem"}},Ft={key:1,class:"admin-table-container"},It={class:"admin-table",style:{"font-size":"0.9rem"}},Lt={class:"badge",style:{background:"#f0f7f4",color:"#1fa774"}},Jt={key:0},Ot={class:"admin-modal-footer"},Bt={__name:"Pagos",setup(jt){const c=J(),M=H(),P=d(""),h=d("Todas"),p=d(""),y=d(""),u=d(!1),x=d(!1),g=d(!1),v=d(null),D=d([]),r=d({tipo:"Mensualidad",mes:new Date().getMonth()+1,valor:5e4,metodo:"Efectivo",fecha:new Date().toISOString().split("T")[0]});O(async()=>{c.players.length===0&&await c.initPlayers()});const N=A(()=>{const o=c.players.map(e=>e.category).filter(e=>e&&e!=="").map(e=>e.trim());return["Todas",...new Set(o)].sort()}),f=A(()=>c.players.filter(o=>o.status==="Aceptado"||o.status==="Pendiente").filter(o=>{const e=(o.name||o.fullName||"").toLowerCase().includes(P.value.toLowerCase()),n=h.value==="Todas"||o.category===h.value;return e&&n}).map(o=>({id:o.id,player:o.name||o.fullName,category:o.category||"Sin asignar",amount:"$50.000",date:o.registrationDate||"N/A",status:o.paymentStatus||"Pendiente"}))),z=A(()=>{const o=f.value.filter(n=>n.status==="Al Día").length,e=f.value.length;return{paid:o,pending:e-o,totalAmount:o*5e4}}),R=async(o,e)=>{if(e==="Al Día"){v.value=f.value.find(n=>n.id===o),g.value=!0;return}p.value="",y.value="",u.value=!0;try{await c.updatePaymentStatus(o,e),p.value="¡Estado de pago actualizado!",await c.initPlayers(),setTimeout(()=>p.value="",3e3)}catch(n){y.value="Error: "+(n.message||"Error al actualizar")}finally{u.value=!1}},V=async()=>{u.value=!0,p.value="Registrando pago...";try{const o={jugadorId:v.value.id,...r.value};await M.registerPayment(o)&&(await c.updatePaymentStatus(v.value.id,"Al Día"),p.value="✅ Pago registrado y estado actualizado",g.value=!1,await c.initPlayers())}catch{y.value="Error al registrar el pago"}finally{u.value=!1,setTimeout(()=>p.value="",3e3)}},F=async o=>{v.value=o,D.value=await M.fetchPaymentsByPlayer(o.id),x.value=!0},I=o=>{const e=window.open("","_blank","width=800,height=800"),n="/src/assets/img/logosinfondo.png",w=`
        <html>
        <head>
            <title>Recibo de Pago - ${o.player}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                .receipt-container { 
                    border: 2px solid #1fa774; 
                    padding: 40px; 
                    border-radius: 15px; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    position: relative;
                    background: white;
                }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.05;
                    width: 400px;
                    z-index: 0;
                }
                .content { position: relative; z-index: 1; }
                .header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    border-bottom: 3px solid #1fa774; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px; 
                }
                .logo-box { display: flex; align-items: center; gap: 15px; }
                .logo-img { height: 80px; }
                .club-name { color: #1fa774; font-size: 28px; font-weight: 900; line-height: 1; }
                .receipt-meta { text-align: right; }
                .receipt-no { font-size: 18px; color: #e74c3c; font-weight: bold; margin-bottom: 5px; }
                .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                .details-table th { text-align: left; padding: 12px; background: #f4fbf8; color: #1fa774; border-bottom: 2px solid #1fa774; font-size: 13px; text-transform: uppercase; }
                .details-table td { padding: 15px 12px; border-bottom: 1px solid #eee; font-size: 16px; }
                .amount-total { 
                    background: #1fa774; 
                    color: white; 
                    padding: 20px; 
                    border-radius: 8px; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    margin-top: 20px;
                }
                .total-label { font-size: 18px; font-weight: bold; }
                .total-value { font-size: 30px; font-weight: 900; }
                .signatures { display: flex; justify-content: space-around; margin-top: 80px; }
                .sig-box { text-align: center; width: 250px; }
                .sig-line { border-top: 2px solid #333; margin-bottom: 10px; }
                .sig-name { font-size: 14px; font-weight: bold; color: #555; }
                .legal { font-size: 11px; color: #888; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <img src="${n}" class="watermark" onerror="this.style.display='none'">
                
                <div class="content">
                    <div class="header">
                        <div class="logo-box">
                            <img src="${n}" class="logo-img" onerror="this.src='https://via.placeholder.com/80?text=U.J.'">
                            <div class="club-name">CLUB UNIÓN<br>JEGUERA</div>
                        </div>
                        <div class="receipt-meta">
                            <div class="receipt-no">RECIBO No. ${Math.floor(1e3+Math.random()*9e3)}</div>
                            <div style="font-size: 14px; color: #666;">Fecha: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    <table class="details-table">
                        <thead>
                            <tr>
                                <th>Descripción de Concepto</th>
                                <th>Jugador / Deportista</th>
                                <th>Categoría</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Mensualidad / Derecho de Participación</td>
                                <td><strong>${o.player}</strong></td>
                                <td>${o.category}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="amount-total">
                        <span class="total-label">VALOR TOTAL RECIBIDO</span>
                        <span class="total-value">${o.amount}</span>
                    </div>

                    <div style="margin-top: 40px; display: flex; justify-content: center;">
                        <div style="border: 2px solid #1fa774; color: #1fa774; padding: 10px 20px; border-radius: 5px; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
                            Comprobante Digital Autorizado
                        </div>
                    </div>

                    <div class="legal">
                        Este documento es un soporte oficial generado por el sistema administrativo del Club Unión Jeguera. 
                        No requiere firma física para su validez legal interna. 
                        Generado el: ${new Date().toLocaleString()}
                    </div>
                </div>
            </div>
            <script>
                window.onload = function() { 
                    setTimeout(() => {
                        window.print(); 
                        window.close();
                    }, 500);
                }
            <\/script>
        </body>
        </html>
    `;e.document.write(w),e.document.close()},T=o=>o==="Al Día"?{bg:"rgba(46, 204, 113, 0.1)",text:"#27ae60"}:o==="Pendiente"?{bg:"rgba(243, 156, 18, 0.1)",text:"#d35400"}:{bg:"rgba(231, 76, 60, 0.1)",text:"#c0392b"};return(o,e)=>{var n,w;return i(),l("div",G,[t("div",W,[t("div",q,[e[13]||(e[13]=t("h2",null,"Gestión de Pagos",-1)),t("span",Q,s(f.value.length)+" Futbolistas ",1)]),t("div",Y,[t("div",K,[m(t("select",{"onUpdate:modelValue":e[0]||(e[0]=a=>h.value=a),class:"admin-search-input",style:{width:"100%",height:"40px",padding:"0 1rem","border-radius":"8px",background:"white"}},[(i(!0),l(C,null,_(N.value,a=>(i(),l("option",{key:a,value:a},s(a==="Todas"?"Todas las Categorías":a),9,X))),128))],512),[[k,h.value]])]),t("div",Z,[e[14]||(e[14]=t("i",{class:"fa-solid fa-magnifying-glass search-icon",style:{position:"absolute",left:"1rem",top:"50%",transform:"translateY(-50%)",color:"#aaa"}},null,-1)),m(t("input",{"onUpdate:modelValue":e[1]||(e[1]=a=>P.value=a),type:"text",placeholder:"Buscar jugador...",class:"admin-search-input",style:{width:"100%","padding-left":"2.5rem","border-radius":"8px",border:"1px solid #ddd",height:"40px"}},null,512),[[$,P.value]])])])]),p.value?(i(),l("div",tt,[e[15]||(e[15]=t("i",{class:"fa-solid fa-circle-check"},null,-1)),E(" "+s(p.value),1)])):b("",!0),y.value?(i(),l("div",et,[e[16]||(e[16]=t("i",{class:"fa-solid fa-circle-xmark"},null,-1)),E(" "+s(y.value),1)])):b("",!0),t("div",at,[t("div",ot,[e[18]||(e[18]=t("div",{class:"stat-icon news"},[t("i",{class:"fa-solid fa-dollar-sign"})],-1)),t("div",st,[e[17]||(e[17]=t("h3",null,"Ingresos Previstos",-1)),t("div",lt,"$"+s((z.value.totalAmount/1e6).toFixed(1))+"M",1)])]),t("div",it,[e[20]||(e[20]=t("div",{class:"stat-icon sponsors"},[t("i",{class:"fa-solid fa-clock"})],-1)),t("div",nt,[e[19]||(e[19]=t("h3",null,"Pendientes",-1)),t("div",rt,s(z.value.pending),1)])]),t("div",dt,[e[22]||(e[22]=t("div",{class:"stat-icon matches"},[t("i",{class:"fa-solid fa-check-double"})],-1)),t("div",ut,[e[21]||(e[21]=t("h3",null,"Al Día",-1)),t("div",ct,s(z.value.paid),1)])])]),t("div",pt,[t("div",mt,[e[28]||(e[28]=t("div",{class:"admin-modal-header",style:{background:"rgba(0,0,0,0.02)","border-bottom":"2px solid var(--admin-border)"}},[t("h2",{style:{"font-size":"1.1rem","font-weight":"700"}},"Control de Mensualidades")],-1)),t("table",gt,[e[27]||(e[27]=t("thead",null,[t("tr",null,[t("th",null,"Jugador"),t("th",null,"Categoría"),t("th",null,"Monto"),t("th",null,"Estado Financiero"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(i(!0),l(C,null,_(f.value,a=>(i(),l("tr",{key:a.id},[t("td",null,[t("strong",null,s(a.player),1)]),t("td",null,[t("span",vt,s(a.category),1)]),t("td",null,s(a.amount),1),t("td",null,[t("select",{value:a.status,disabled:u.value,onChange:S=>R(a.id,S.target.value),style:j({padding:"6px 10px",borderRadius:"6px",fontSize:"0.85rem",fontWeight:"700",border:"none",cursor:u.value?"not-allowed":"pointer",backgroundColor:T(a.status).bg,color:T(a.status).text,opacity:u.value?.6:1})},e[23]||(e[23]=[t("option",{value:"Pendiente"},"Pendiente",-1),t("option",{value:"Al Día"},"Al Día",-1),t("option",{value:"En Mora"},"En Mora",-1)]),44,ft)]),t("td",null,[t("div",bt,[t("button",{onClick:S=>F(a),class:"btn-action edit",title:"Ver Historial",style:{background:"#f0f4f8",color:"#2c3e50"}},e[24]||(e[24]=[t("i",{class:"fa-solid fa-history"},null,-1)]),8,yt),t("button",{onClick:S=>I(a),class:"btn-action edit",title:"Exportar Recibo",style:{background:"#e6f3ef",color:"#1fa774"}},e[25]||(e[25]=[t("i",{class:"fa-solid fa-file-pdf"},null,-1)]),8,xt)])])]))),128)),f.value.length===0?(i(),l("tr",ht,e[26]||(e[26]=[t("td",{colspan:"5",style:{"text-align":"center",padding:"2rem",color:"#888"}},"No se encontraron registros activos.",-1)]))):b("",!0)])])])]),g.value?(i(),l("div",{key:2,class:"admin-modal-overlay",onClick:e[9]||(e[9]=U(a=>g.value=!1,["self"]))},[t("div",wt,[t("div",kt,[t("h2",null,"Registrar Pago: "+s((n=v.value)==null?void 0:n.player),1),t("button",{class:"close-modal",onClick:e[2]||(e[2]=a=>g.value=!1)},"×")]),t("div",Ct,[t("div",_t,[e[30]||(e[30]=t("label",null,"Concepto",-1)),m(t("select",{"onUpdate:modelValue":e[3]||(e[3]=a=>r.value.tipo=a),class:"admin-search-input",style:{width:"100%"}},e[29]||(e[29]=[t("option",{value:"Mensualidad"},"Mensualidad",-1),t("option",{value:"Inscripción"},"Inscripción",-1),t("option",{value:"Uniforme"},"Uniforme",-1),t("option",{value:"Otro"},"Otro",-1)]),512),[[k,r.value.tipo]])]),t("div",Mt,[t("div",Pt,[e[31]||(e[31]=t("label",null,"Mes Correspondiente",-1)),m(t("select",{"onUpdate:modelValue":e[4]||(e[4]=a=>r.value.mes=a),class:"admin-search-input",style:{width:"100%"}},[(i(),l(C,null,_(12,a=>t("option",{key:a,value:a},s(["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][a-1]),9,Dt)),64))],512),[[k,r.value.mes]])]),t("div",zt,[e[32]||(e[32]=t("label",null,"Valor ($)",-1)),m(t("input",{"onUpdate:modelValue":e[5]||(e[5]=a=>r.value.valor=a),type:"number",class:"admin-search-input",style:{width:"100%"}},null,512),[[$,r.value.valor]])])]),t("div",St,[t("div",At,[e[33]||(e[33]=t("label",null,"Fecha de Recaudo",-1)),m(t("input",{"onUpdate:modelValue":e[6]||(e[6]=a=>r.value.fecha=a),type:"date",class:"admin-search-input",style:{width:"100%"}},null,512),[[$,r.value.fecha]])]),t("div",$t,[e[35]||(e[35]=t("label",null,"Método",-1)),m(t("select",{"onUpdate:modelValue":e[7]||(e[7]=a=>r.value.metodo=a),class:"admin-search-input",style:{width:"100%"}},e[34]||(e[34]=[t("option",{value:"Efectivo"},"Efectivo",-1),t("option",{value:"Transferencia"},"Transferencia",-1),t("option",{value:"Depósito"},"Depósito",-1)]),512),[[k,r.value.metodo]])])])]),t("div",Et,[t("button",{class:"btn-admin secondary",onClick:e[8]||(e[8]=a=>g.value=!1)},"Cancelar"),t("button",{class:"btn-admin primary",onClick:V,disabled:u.value},s(u.value?"Registrando...":"Confirmar y Marcar Al Día"),9,Tt)])])])):b("",!0),x.value?(i(),l("div",{key:3,class:"admin-modal-overlay",onClick:e[12]||(e[12]=U(a=>x.value=!1,["self"]))},[t("div",Ut,[t("div",Nt,[t("h2",null,"Historial Financiero: "+s((w=v.value)==null?void 0:w.player),1),t("button",{class:"close-modal",onClick:e[10]||(e[10]=a=>x.value=!1)},"×")]),t("div",Rt,[B(M).isLoading?(i(),l("div",Vt,e[36]||(e[36]=[t("i",{class:"fa-solid fa-spinner fa-spin"},null,-1),E(" Cargando historial... ")]))):(i(),l("div",Ft,[t("table",It,[e[38]||(e[38]=t("thead",null,[t("tr",null,[t("th",null,"Fecha"),t("th",null,"Mes"),t("th",null,"Concepto"),t("th",null,"Monto"),t("th",null,"Método")])],-1)),t("tbody",null,[(i(!0),l(C,null,_(D.value,a=>(i(),l("tr",{key:a.id},[t("td",null,s(a.fecha),1),t("td",null,s(["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][a.mes-1]),1),t("td",null,[t("span",Lt,s(a.tipo),1)]),t("td",null,[t("strong",null,"$"+s(Number(a.valor).toLocaleString()),1)]),t("td",null,[t("small",null,s(a.metodo),1)])]))),128)),D.value.length===0?(i(),l("tr",Jt,e[37]||(e[37]=[t("td",{colspan:"5",style:{"text-align":"center",padding:"2rem",color:"#888"}},"No hay pagos registrados anteriormente.",-1)]))):b("",!0)])])]))]),t("div",Ot,[t("button",{class:"btn-admin",onClick:e[11]||(e[11]=a=>x.value=!1)},"Cerrar")])])])):b("",!0)])}}},Wt=L(Bt,[["__scopeId","data-v-4d3b4a08"]]);export{Wt as default};
