import{_ as u,C as m,E as p,c as b,a as i,d as t,t as l,i as f,e as y,F as h,h as v,o as r}from"./index-D8zP1H6w.js";const x={class:"admin-dashboard"},_={class:"admin-toolbar"},w={class:"toolbar-left"},C={class:"badge",style:{background:"#27ae60",color:"white",padding:"2px 8px","border-radius":"10px","font-size":"0.8rem"}},A={class:"dashboard-secondary-grid",style:{"grid-template-columns":"1fr"}},N={class:"admin-table-wrapper"},D={class:"admin-table-container"},k={class:"admin-table"},E={class:"action-btns"},I=["onClick"],S={key:0},z={__name:"PazySalvo",setup(P){const d=m();p(async()=>{d.players.length===0&&await d.initPlayers()});const s=b(()=>d.players.filter(o=>o.paymentStatus==="Al Día").map(o=>({id:o.id,name:o.name||o.fullName,category:o.category||"N/A",lastPayment:o.registrationDate||"N/A",dni:o.documentNumber||"Ver ficha"}))),c=o=>{const e=window.open("","_blank"),a=new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"}),n=`
    <html>
    <head>
        <title>Paz y Salvo - ${o.name}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 50px; }
            .header { text-align: center; margin-bottom: 50px; }
            .logo { width: 120px; margin-bottom: 10px; }
            .club-name { font-size: 24px; font-weight: bold; color: #1fa774; margin: 0; }
            .title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 40px; text-decoration: underline; }
            .content { font-size: 16px; text-align: justify; margin-bottom: 50px; }
            .date-place { margin-bottom: 30px; }
            .footer { margin-top: 100px; }
            .sign-area { border-top: 1px solid #333; width: 250px; text-align: center; font-size: 0.9rem; }
            @media print { .no-print { display: none; } }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="/src/assets/img/logosinfondo.png" class="logo" alt="Logo Club">
            <h1 class="club-name">CLUB DEPORTIVO UNIÓN JEGUERA</h1>
            <p>NIT: 900.000.000-0</p>
        </div>

        <h2 class="title">CONSTANCIA DE PAZ Y SALVO</h2>

        <div class="date-place">
            <strong>Lugar y Fecha:</strong> Jeguera, ${a}
        </div>

        <div class="content">
            <p>EL CLUB DEPORTIVO UNIÓN JEGUERA hace constar que el jugador(a) <strong>${o.name.toUpperCase()}</strong>, 
            identificado(a) con documento <strong>${o.dni}</strong> y perteneciente a la categoría <strong>${o.category}</strong>, 
            se encuentra a la fecha <strong>AL DÍA</strong> por todo concepto relacionado con mensualidades y derechos deportivos.</p>
            
            <p>Se expide la presente a solicitud del interesado para los fines que estime convenientes.</p>
        </div>

        <div class="footer">
            <p>Atentamente,</p>
            <br><br><br>
            <div class="sign-area">
                <br>
                <strong>DIRECCIÓN FINANCIERA</strong><br>
                Club Deportivo Unión Jeguera
            </div>
        </div>
        
        <script>
            window.onload = function() { window.print(); }
        <\/script>
</body>

</html>
`;e.document.write(n),e.document.close()},g=()=>{const o=`data:text/csv;charset=utf-8,ID,Jugador,Categoria,Identificacion,Estado
`+s.value.map(n=>`${n.id},${n.name},${n.category},${n.dni},Al Dia`).join(`
`),e=encodeURI(o),a=document.createElement("a");a.setAttribute("href",e),a.setAttribute("download","reporte_paz_y_salvos_global.csv"),document.body.appendChild(a),a.click(),document.body.removeChild(a)};return(o,e)=>(r(),i("div",x,[t("div",_,[t("div",w,[e[0]||(e[0]=t("h2",null,"Paz y Salvos",-1)),t("span",C,l(s.value.length)+" Jugadores Aptos ",1)]),t("button",{onClick:g,class:"btn-admin btn-admin--primary"},e[1]||(e[1]=[t("i",{class:"fa-solid fa-file-export"},null,-1),f(" Descargar Reporte Global ")]))]),t("div",A,[t("div",N,[t("div",D,[e[7]||(e[7]=t("div",{class:"admin-modal-header",style:{background:"rgba(0,0,0,0.02)","border-bottom":"2px solid var(--admin-border)"}},[t("h2",{style:{"font-size":"1.1rem","font-weight":"700"}},"Jugadores con Mensualidades al Día")],-1)),t("table",k,[e[6]||(e[6]=t("thead",null,[t("tr",null,[t("th",null,"Jugador"),t("th",null,"Categoría"),t("th",null,"Identificación"),t("th",null,"Estado"),t("th",null,"Acciones")])],-1)),t("tbody",null,[(r(!0),i(h,null,v(s.value,a=>(r(),i("tr",{key:a.id},[t("td",null,[t("strong",null,l(a.name),1)]),t("td",null,l(a.category),1),t("td",null,l(a.dni),1),e[4]||(e[4]=t("td",null,[t("span",{style:{padding:"4px 8px","border-radius":"4px","font-size":"0.8rem","font-weight":"bold","background-color":"rgba(46, 204, 113, 0.1)",color:"#27ae60"}}," PAZ Y SALVO ")],-1)),t("td",null,[t("div",E,[t("button",{onClick:n=>c(a),class:"btn-action edit",title:"Descargar Certificado",style:{background:"#e6f3ef",color:"#1fa774"}},e[2]||(e[2]=[t("i",{class:"fa-solid fa-download"},null,-1)]),8,I),e[3]||(e[3]=t("button",{class:"btn-action edit",title:"Ver Ficha",style:{background:"#f0f4f8",color:"#2c3e50"}},[t("i",{class:"fa-solid fa-user"})],-1))])])]))),128)),s.value.length===0?(r(),i("tr",S,e[5]||(e[5]=[t("td",{colspan:"5",class:"empty-row",style:{"text-align":"center",padding:"2rem",color:"#888"}}," No hay jugadores con pagos al día actualmente para generar Paz y Salvos. ",-1)]))):y("",!0)])])])])])]))}},U=u(z,[["__scopeId","data-v-e847a8ca"]]);export{U as default};
