import{b as $,j as e,F as E}from"./chunk-EPOLDU6W-B9w3MOV_.js";function I(s){if(s==null)return null;const t=typeof s=="object"&&"toNumber"in s?s.toNumber():Number(s);return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(t)}function T({product:s,x:t,y:c,isAdmin:r,adminMode:l,isPrintMode:n,catalogType:o}){const u=!!(s.Winery&&s.Winery.trim()),y=o==="wines"?s.MatrixX!=null&&s.MatrixY!=null:o==="spirits"?s.MatrixXSpirits!=null&&s.MatrixYSpirits!=null:s.MatrixXCafe!=null&&s.MatrixYCafe!=null;return e.jsxs("div",{className:`card product-card h-100 ${l?"draggable":""}`,"data-product-id":s.Id,"data-x":t,"data-y":c,children:[l&&!n&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:`drag-area ${y?"positioned":""}`,draggable:!0,"data-product-id":s.Id,children:e.jsxs("div",{className:"drag-handle",children:[e.jsx("i",{className:"bi bi-hand-index-thumb fs-5"}),e.jsx("small",{children:"Arrastra"})]})}),e.jsx("div",{className:"position-indicator",children:`${t},${c}`})]}),e.jsxs("div",{className:`card-horizontal ${l&&!n?"non-draggable":""}`,children:[e.jsx("div",{className:"catalog-product-image-box",children:s.ImageUrl?e.jsx("img",{src:s.ImageUrl,alt:s.Name,draggable:!1}):l?e.jsx("div",{className:"no-image-placeholder",children:e.jsx("i",{className:"text-muted",children:"?"})}):e.jsxs("div",{className:"no-image-placeholder",children:[e.jsx("i",{className:"text-muted",children:"?"}),e.jsx("span",{className:"text-muted small",children:"Sin imagen"})]})}),e.jsxs("div",{className:"card-body",children:[e.jsx("h5",{className:"card-title",children:s.Name}),e.jsx("h6",{className:"card-subtitle mb-2 text-muted",children:(u?s.Winery:s.Manufacturer)??""}),!l&&e.jsxs(e.Fragment,{children:[s.Description&&e.jsx("p",{className:"card-text",children:s.Description}),e.jsxs("ul",{className:"list-unstyled small product-details",children:[s.Size&&e.jsxs("li",{children:[e.jsx("strong",{children:"Tamaño:"})," ",s.Size]}),s.AlcoholPercent!=null&&e.jsxs("li",{children:[e.jsx("strong",{children:"% Alcohol:"})," ",s.AlcoholPercent,"%"]}),s.Origin&&e.jsxs("li",{children:[e.jsx("strong",{children:"Origen:"})," ",s.Origin]}),s.GrapeType&&e.jsxs("li",{children:[e.jsx("strong",{children:"Tipo de uva:"})," ",s.GrapeType.Name]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Categoría:"})," ",s.Category?.Name]})]})]}),l&&!n&&e.jsxs("ul",{className:"list-unstyled small text-muted mb-1",children:[s.Origin&&e.jsxs("li",{children:[e.jsx("strong",{children:"Origen:"})," ",s.Origin]}),s.GrapeType&&e.jsxs("li",{children:[e.jsx("strong",{children:"Tipo de uva:"})," ",s.GrapeType.Name]})]}),s.Price!=null&&e.jsx("div",{className:`product-price text-primary fw-bold ${l?"":"fs-5"}`,children:I(s.Price)})]})]})]})}function P({data:s,catalogType:t,title:c,isAdmin:r,adminMode:l,isPrintMode:n}){const[o]=$(),u=new Map(s.titleRows.map(a=>[a.MatrixY,a])),y=new Set(s.emptyCells.map(a=>`${a.x},${a.y}`)),S=new Set(s.titleRowsWithProducts),x=o.get("Query")||"",p=o.get("categoryId")||"",h=o.get("Winery")||"",g=o.get("Origin")||"",f=o.get("GrapeTypeId")||"",j=t==="wines"?"/catalog":t==="spirits"?"/destilados":"/cafe";return e.jsxs(e.Fragment,{children:[e.jsx("h1",{children:c}),r&&!n&&e.jsxs("div",{className:"mb-3",children:[l?e.jsx("a",{href:`${j}?${new URLSearchParams(Object.fromEntries([["Query",x],["categoryId",p],["Winery",h],["Origin",g],["GrapeTypeId",f]].filter(([,a])=>a)))}`,className:"btn btn-secondary",children:"Salir del modo edición"}):e.jsx("a",{href:`${j}?AdminMode=true&${new URLSearchParams(Object.fromEntries([["Query",x],["categoryId",p],["Winery",h],["Origin",g],["GrapeTypeId",f]].filter(([,a])=>a)))}`,className:"btn btn-warning",children:"Modo edición de matriz"}),e.jsx("a",{href:`${j}?Print=true&${new URLSearchParams(Object.fromEntries([["Query",x],["categoryId",p],["Winery",h],["Origin",g],["GrapeTypeId",f]].filter(([,a])=>a)))}`,className:"btn btn-outline-secondary ms-2",children:"Versión para imprimir"})]}),!n&&e.jsxs(E,{method:"get",className:"mb-3",children:[e.jsxs("div",{className:"row g-2 align-items-end",children:[e.jsxs("div",{className:"col-md-6",children:[e.jsx("label",{htmlFor:"q",className:"form-label",children:"Buscar"}),e.jsx("input",{id:"q",name:"Query",defaultValue:x,className:"form-control",placeholder:"Nombre, descripción, fabricante o bodega"})]}),e.jsxs("div",{className:"col-md-3",children:[e.jsx("label",{htmlFor:"categoryId",className:"form-label",children:"Categoría"}),e.jsxs("select",{id:"categoryId",name:"categoryId",className:"form-select",defaultValue:p,children:[e.jsx("option",{value:"",children:"-- Todas --"}),s.categories.map(a=>e.jsx("option",{value:a.Id,children:a.Name},a.Id))]})]}),e.jsx("div",{className:"col-md-3 d-grid",children:e.jsx("button",{className:"btn btn-primary",type:"submit",children:"Filtrar"})})]}),e.jsxs("div",{className:"row g-2 mt-2",children:[e.jsxs("div",{className:"col-md-4",children:[e.jsx("label",{htmlFor:"Winery",className:"form-label",children:"Bodega"}),e.jsxs("select",{id:"Winery",name:"Winery",className:"form-select",defaultValue:h,children:[e.jsx("option",{value:"",children:"-- Todas --"}),s.wineries.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{className:"col-md-4",children:[e.jsx("label",{htmlFor:"Origin",className:"form-label",children:"Denominación de Origen"}),e.jsxs("select",{id:"Origin",name:"Origin",className:"form-select",defaultValue:g,children:[e.jsx("option",{value:"",children:"-- Todas --"}),s.origins.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{className:"col-md-4",children:[e.jsx("label",{htmlFor:"GrapeTypeId",className:"form-label",children:"Tipo de uva"}),e.jsxs("select",{id:"GrapeTypeId",name:"GrapeTypeId",className:"form-select",defaultValue:f,children:[e.jsx("option",{value:"",children:"-- Todas --"}),s.grapeTypes.map(a=>e.jsx("option",{value:a.Id,children:a.Name},a.Id))]})]})]}),l&&e.jsx("input",{type:"hidden",name:"AdminMode",value:"true"})]}),e.jsx("div",{className:`matrix-container ${n?"no-center":""} mb-4`,children:e.jsx("div",{className:`matrix-grid ${l?"admin-mode":"view-mode"} ${s.isFiltered?"filtered-mode":""}`,style:{gridTemplateColumns:`repeat(${s.matrixColumns}, 1fr)`},children:Array.from({length:s.matrixRows},(a,i)=>{const d=u.get(i);if(d){const b=!s.isFiltered||S.has(i);return e.jsxs("div",{className:`matrix-title-row section-row ${b?"":"no-products"}`,"data-y":i,"data-level":d.Level,style:{gridColumn:`1 / span ${s.matrixColumns}`,position:"relative"},children:[e.jsxs("div",{className:"d-flex justify-content-between align-items-center",children:[e.jsxs("div",{className:"d-flex align-items-center gap-2",children:[!n&&e.jsx("button",{type:"button",className:"btn btn-sm btn-outline-secondary toggle-section",title:"Colapsar/expandir sección",children:e.jsx("i",{className:"bi bi-chevron-up"})}),d.Level===1?e.jsxs("h3",{className:"m-0 title-h1",children:[d.Text,l&&e.jsxs("small",{className:"text-muted ms-2",children:["Fila ",d.MatrixY]})]}):e.jsxs("h4",{className:"m-0",children:[d.Text,l&&e.jsxs("small",{className:"text-muted ms-2",children:["Fila ",d.MatrixY]})]})]}),l&&!n&&e.jsxs("div",{className:"d-flex align-items-center gap-2",children:[e.jsx(R,{titleRow:d,catalogType:t}),e.jsx(A,{titleId:d.Id,catalogType:t})]})]}),l&&!n&&e.jsx(w,{y:i,catalogType:t})]},`title-${i}`)}return Array.from({length:s.matrixColumns},(b,m)=>{const N=y.has(`${m},${i}`),v=s.productMatrix[i]?.[m]??null,C=v==null;return e.jsxs("div",{className:`matrix-cell ${l?"editable":""} ${N&&l?"reserved-empty":""} ${s.isFiltered&&C?"empty":""}`,"data-x":m,"data-y":i,style:{position:"relative"},children:[m===s.matrixColumns-1&&l&&!n&&e.jsx(w,{y:i,catalogType:t}),v?e.jsx(T,{product:v,x:m,y:i,isAdmin:r,adminMode:l,isPrintMode:n,catalogType:t}):l&&!n?N?e.jsx("div",{className:"empty-cell-indicator reserved",children:`${m},${i}`}):e.jsx("div",{className:"empty-cell-indicator",children:`${m},${i}`}):null]},`cell-${m}-${i}`)})})})}),l&&!n&&e.jsx(L,{data:s,catalogType:t}),l&&s.unpositionedProducts.length>0&&!n&&e.jsx(O,{products:s.unpositionedProducts,catalogType:t,matrixColumns:s.matrixColumns}),l&&!n&&e.jsx(F,{catalogType:t}),l&&!n&&e.jsx(D,{catalogType:t,matrixRows:s.matrixRows,matrixColumns:s.matrixColumns,maxAllowedRows:s.maxAllowedRows,reservedRows:s.titleRows.map(a=>a.MatrixY),emptyCells:s.emptyCells})]})}function R({titleRow:s,catalogType:t}){return e.jsxs("form",{method:"post",action:`/api/catalog/${t}/update-title`,className:"row g-1 align-items-end",children:[e.jsxs("div",{className:"col-auto",children:[e.jsx("input",{type:"hidden",name:"id",value:s.Id}),e.jsx("input",{name:"text",className:"form-control form-control-sm",defaultValue:s.Text,style:{maxWidth:"220px"}})]}),e.jsx("div",{className:"col-auto",children:e.jsx("input",{name:"y",type:"number",min:"0",className:"form-control form-control-sm",defaultValue:s.MatrixY,style:{width:"90px"}})}),e.jsx("div",{className:"col-auto",children:e.jsxs("div",{className:"btn-group",role:"group",children:[e.jsx("input",{type:"radio",className:"btn-check",name:"level",id:`levelH1_${s.Id}`,value:"1",defaultChecked:s.Level===1}),e.jsx("label",{className:"btn btn-outline-secondary btn-sm",htmlFor:`levelH1_${s.Id}`,children:"h1"}),e.jsx("input",{type:"radio",className:"btn-check",name:"level",id:`levelH2_${s.Id}`,value:"2",defaultChecked:s.Level!==1}),e.jsx("label",{className:"btn btn-outline-secondary btn-sm",htmlFor:`levelH2_${s.Id}`,children:"h2"})]})}),e.jsx("div",{className:"col-auto",children:e.jsx("button",{type:"submit",className:"btn btn-sm btn-outline-success",children:"Guardar"})})]})}function A({titleId:s,catalogType:t}){return e.jsxs("form",{method:"post",action:`/api/catalog/${t}/delete-title`,onSubmit:c=>{confirm("¿Eliminar este título?")||c.preventDefault()},children:[e.jsx("input",{type:"hidden",name:"id",value:s}),e.jsx("button",{type:"submit",className:"btn btn-sm btn-outline-danger",children:"Eliminar"})]})}function w({y:s,catalogType:t}){return e.jsxs("form",{method:"post",action:`/api/catalog/${t}/delete-row`,className:"delete-row-form",children:[e.jsx("input",{type:"hidden",name:"y",value:s}),e.jsx("button",{type:"submit",className:"btn btn-sm btn-danger delete-row-btn",title:"Eliminar fila",onClick:c=>{confirm("¿Eliminar esta fila? Se desplazarán hacia arriba las filas inferiores.")||c.preventDefault()},children:"✖"})]})}function L({data:s,catalogType:t}){return e.jsxs("div",{className:"d-flex justify-content-end mb-4 gap-2",children:[e.jsxs("form",{method:"post",action:`/api/catalog/${t}/insert-row`,className:"d-inline-flex align-items-end gap-2 p-2 border rounded bg-light",children:[e.jsxs("div",{className:"d-flex flex-column",children:[e.jsx("label",{className:"form-label mb-0 small",children:"Insertar fila en posición"}),e.jsx("input",{name:"y",type:"number",min:"0",className:"form-control form-control-sm",defaultValue:s.matrixRows,style:{width:"120px"}})]}),e.jsx("div",{className:"d-grid",children:e.jsx("button",{type:"submit",className:"btn btn-sm btn-outline-primary",children:"Añadir fila"})})]}),e.jsxs("form",{method:"post",action:`/api/catalog/${t}/delete-last-empty-rows`,className:"d-inline-flex align-items-end gap-2 p-2 border rounded bg-light",children:[e.jsxs("div",{className:"d-flex flex-column",children:[e.jsx("label",{className:"form-label mb-0 small",children:"Borrar últimas filas vacías"}),e.jsx("input",{name:"count",type:"number",min:"1",className:"form-control form-control-sm",defaultValue:1,style:{width:"120px"}})]}),e.jsx("div",{className:"d-grid",children:e.jsx("button",{type:"submit",className:"btn btn-sm btn-outline-danger",children:"Borrar"})})]})]})}function O({products:s,catalogType:t,matrixColumns:c}){return e.jsxs(e.Fragment,{children:[e.jsxs("h5",{children:["Productos sin posición asignada (",s.length,"):"]}),e.jsx("div",{className:"unpositioned-products mb-4",id:"unassigned-container",style:{display:"grid",gridTemplateColumns:`repeat(${c}, 1fr)`,gap:"15px"},children:s.map(r=>{const l=!!(r.Winery&&r.Winery.trim());return e.jsxs("div",{className:"card product-card","data-product-id":r.Id,"data-unassigned":"true",children:[e.jsx("div",{className:"drag-area",draggable:!0,"data-product-id":String(r.Id),children:e.jsxs("div",{className:"drag-handle",children:[e.jsx("i",{className:"bi bi-hand-index-thumb fs-5"}),e.jsx("small",{children:"Arrastra"})]})}),e.jsxs("div",{className:"card-horizontal non-draggable",children:[e.jsx("div",{className:"catalog-product-image-box small",children:r.ImageUrl?e.jsx("img",{src:r.ImageUrl,alt:r.Name,draggable:!1}):e.jsx("div",{className:"no-image-placeholder",children:e.jsx("i",{className:"text-muted",children:"?"})})}),e.jsxs("div",{className:"card-body",children:[e.jsx("h6",{className:"card-title",children:r.Name}),e.jsx("small",{className:"card-subtitle mb-2 text-muted",children:(l?r.Winery:r.Manufacturer)??""}),e.jsxs("ul",{className:"list-unstyled small text-muted mb-1",children:[r.Origin&&e.jsxs("li",{children:[e.jsx("strong",{children:"Origen:"})," ",r.Origin]}),r.GrapeType&&e.jsxs("li",{children:[e.jsx("strong",{children:"Tipo de uva:"})," ",r.GrapeType.Name]})]}),r.Price!=null&&e.jsx("div",{className:"product-price text-primary fw-bold",children:I(r.Price)})]})]})]},r.Id)})})]})}function F({catalogType:s}){return e.jsx("div",{className:"card mb-4",children:e.jsxs("div",{className:"card-body",children:[e.jsx("h6",{children:"Crear título de sección"}),e.jsxs("form",{method:"post",action:`/api/catalog/${s}/create-title`,className:"row g-2 align-items-end",children:[e.jsxs("div",{className:"col-md-4",children:[e.jsx("label",{className:"form-label",children:"Texto"}),e.jsx("input",{name:"text",className:"form-control form-control-sm",required:!0})]}),e.jsxs("div",{className:"col-md-2",children:[e.jsx("label",{className:"form-label",children:"Fila (Y)"}),e.jsx("input",{name:"y",type:"number",min:"0",className:"form-control form-control-sm",defaultValue:"0"})]}),e.jsxs("div",{className:"col-md-2",children:[e.jsx("label",{className:"form-label",children:"Nivel"}),e.jsxs("select",{name:"level",className:"form-select form-select-sm",defaultValue:"2",children:[e.jsx("option",{value:"1",children:"h1"}),e.jsx("option",{value:"2",children:"h2"})]})]}),e.jsx("div",{className:"col-auto",children:e.jsx("button",{type:"submit",className:"btn btn-sm btn-primary",children:"Crear título"})})]})]})})}function D({catalogType:s,matrixRows:t,matrixColumns:c,maxAllowedRows:r,reservedRows:l,emptyCells:n}){const o=`
    (function(){
      const catalogType = ${JSON.stringify(s)};
      const matrixRows = ${t};
      const matrixColumns = ${c};
      const allowedRows = ${r};
      const reservedRows = new Set(${JSON.stringify(l)});
      const emptyReserved = new Set(${JSON.stringify(n.map(u=>u.x+":"+u.y))});

      const dropCells = [...document.querySelectorAll('.matrix-cell.editable')].filter(c =>
        !reservedRows.has(parseInt(c.dataset.y)) && parseInt(c.dataset.y) < allowedRows
      );
      let autoScrollInterval = null;
      const scrollEdgeSize = 60;
      const scrollSpeed = 12;

      // Section collapse
      const sectionRows = [...document.querySelectorAll('.matrix-title-row.section-row')].sort((a,b) => parseInt(a.dataset.y) - parseInt(b.dataset.y));
      const allMatrixCells = [...document.querySelectorAll('.matrix-cell')];
      const storageKey = 'matrix-collapse:' + location.pathname;
      let collapsedSet = new Set();
      try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) collapsedSet = new Set(saved.map(v => parseInt(v,10)).filter(v => !Number.isNaN(v))); } catch {}

      function getSectionRange(row) {
        const yStart = parseInt(row.dataset.y);
        const level = parseInt(row.dataset.level || '2');
        if (level === 1) {
          const nextH1 = sectionRows.find(r => parseInt(r.dataset.y) > yStart && parseInt(r.dataset.level || '2') === 1);
          return { yStart, yEnd: nextH1 ? parseInt(nextH1.dataset.y) - 1 : matrixRows - 1 };
        }
        const idx = sectionRows.indexOf(row);
        const next = idx >= 0 && idx + 1 < sectionRows.length ? sectionRows[idx + 1] : null;
        return { yStart, yEnd: next ? parseInt(next.dataset.y) - 1 : matrixRows - 1 };
      }

      function setSectionCollapsed(row, collapsed) {
        const icon = row.querySelector('.toggle-section i');
        if (icon) { icon.classList.toggle('bi-chevron-up', !collapsed); icon.classList.toggle('bi-chevron-down', collapsed); }
        const { yStart, yEnd } = getSectionRange(row);
        allMatrixCells.forEach(c => {
          const y = parseInt(c.dataset.y);
          if (!Number.isNaN(y) && y > yStart && y <= yEnd) c.classList.toggle('hidden-by-section', collapsed);
        });
        if (parseInt(row.dataset.level || '2') === 1) {
          sectionRows.forEach(sr => {
            const y = parseInt(sr.dataset.y);
            if (y > yStart && y <= yEnd) {
              const icon = sr.querySelector('.toggle-section i');
              if (icon) { icon.classList.toggle('bi-chevron-down', collapsed); icon.classList.toggle('bi-chevron-up', !collapsed); }
              sr.classList.toggle('section-collapsed', collapsed);
            }
          });
        }
      }

      sectionRows.forEach(row => {
        const y = parseInt(row.dataset.y);
        if (collapsedSet.has(y)) { row.classList.add('section-collapsed'); setSectionCollapsed(row, true); }
      });

      document.querySelectorAll('.toggle-section').forEach(btn => {
        btn.addEventListener('click', function() {
          const row = this.closest('.section-row');
          const collapsed = row.classList.toggle('section-collapsed');
          setSectionCollapsed(row, collapsed);
          const y = parseInt(row.dataset.y);
          if (!Number.isNaN(y)) {
            if (collapsed) collapsedSet.add(y); else collapsedSet.delete(y);
            try { localStorage.setItem(storageKey, JSON.stringify([...collapsedSet])); } catch {}
          }
        });
      });

      // Drag & drop
      document.querySelectorAll('.drag-area').forEach(dragArea => {
        const productCard = dragArea.closest('.card');
        const productId = dragArea.dataset.productId || productCard?.dataset.productId;
        if (!productId) return;

        dragArea.addEventListener('dragstart', function(e) {
          e.stopPropagation();
          this.classList.add('dragging');
          productCard?.classList.add('being-dragged');
          e.dataTransfer.setData('text/plain', productId);
          e.dataTransfer.effectAllowed = 'move';
        });
        dragArea.addEventListener('dragend', function() {
          this.classList.remove('dragging');
          productCard?.classList.remove('being-dragged');
          dropCells.forEach(c => c.classList.remove('drag-over'));
          stopAutoScroll();
        });
      });

      dropCells.forEach(cell => {
        cell.addEventListener('dragover', function(e) {
          const y = parseInt(this.dataset.y);
          if (y >= allowedRows) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          this.classList.add('drag-over');
          handleAutoScroll(e.clientY);
        });
        cell.addEventListener('dragleave', function(e) {
          if (!this.contains(e.relatedTarget)) this.classList.remove('drag-over');
        });
        cell.addEventListener('drop', function(e) {
          e.preventDefault();
          this.classList.remove('drag-over');
          stopAutoScroll();
          const productId = e.dataTransfer.getData('text/plain');
          const x = parseInt(this.dataset.x);
          const y = parseInt(this.dataset.y);
          if (x >= 0 && x < matrixColumns && y >= 0 && y < matrixRows && y < allowedRows && !reservedRows.has(y)) {
            updateProductPosition(productId, x, y);
          }
        });
      });

      function handleAutoScroll(mouseY) {
        const vh = window.innerHeight;
        if (vh - mouseY < scrollEdgeSize) {
          if (!autoScrollInterval) autoScrollInterval = setInterval(() => window.scrollBy({ top: scrollSpeed, behavior: 'auto' }), 16);
        } else if (mouseY < scrollEdgeSize) {
          if (!autoScrollInterval) autoScrollInterval = setInterval(() => window.scrollBy({ top: -scrollSpeed, behavior: 'auto' }), 16);
        } else { stopAutoScroll(); }
      }
      function stopAutoScroll() { if (autoScrollInterval) { clearInterval(autoScrollInterval); autoScrollInterval = null; } }

      // Context menu for vaciar celda
      document.addEventListener('contextmenu', function(e) {
        const card = e.target.closest('.product-card');
        const isUnassigned = card && card.dataset.unassigned === 'true';
        if (card && card.dataset.productId) {
          e.preventDefault();
          if (isUnassigned) {
            const productId = card.dataset.productId;
            const x = prompt('Columna (X):', '0');
            const y = prompt('Fila (Y):', '0');
            if (x !== null && y !== null) placeUnassigned(productId, parseInt(x), parseInt(y));
            return;
          }
          if (confirm('¿Reservar esta celda como vacía?')) {
            const productId = card.dataset.productId;
            const x = card.dataset.x || card.parentElement?.dataset.x;
            const y = card.dataset.y || card.parentElement?.dataset.y;
            vaciarCelda(productId, x, y);
          }
        }
      });

      async function updateProductPosition(productId, x, y) {
        try {
          const fd = new FormData();
          fd.append('productId', productId);
          fd.append('x', x);
          fd.append('y', y);
          const resp = await fetch('/api/catalog/' + catalogType + '/update-position', { method: 'POST', body: fd });
          if (resp.ok) location.reload(); else alert('Error: ' + await resp.text());
        } catch (err) { console.error(err); alert('Error al actualizar posición'); }
      }

      async function vaciarCelda(productId, x, y) {
        try {
          const fd = new FormData();
          fd.append('productId', productId);
          fd.append('x', x);
          fd.append('y', y);
          const resp = await fetch('/api/catalog/' + catalogType + '/vaciar-celda', { method: 'POST', body: fd });
          if (resp.ok) location.reload(); else alert('Error: ' + await resp.text());
        } catch (err) { console.error(err); alert('Error al reservar celda'); }
      }

      async function placeUnassigned(productId, x, y) {
        try {
          const fd = new FormData();
          fd.append('productId', productId);
          fd.append('x', x);
          fd.append('y', y);
          const resp = await fetch('/api/catalog/' + catalogType + '/place-unassigned', { method: 'POST', body: fd });
          if (resp.ok) location.reload(); else alert('Error: ' + await resp.text());
        } catch (err) { console.error(err); alert('Error al asignar posición'); }
      }
    })();
  `;return e.jsx("script",{dangerouslySetInnerHTML:{__html:o}})}export{P as C};
