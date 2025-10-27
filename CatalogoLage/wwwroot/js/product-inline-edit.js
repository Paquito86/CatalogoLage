(function(){
 // Config
 const ctxSel = '#global-product-context';
 const modalSel = '#productEditModal';
 let bootstrapModal = null;
 function ensureModal(){ try{ if(!bootstrapModal){ bootstrapModal = window.bootstrap ? new bootstrap.Modal(document.querySelector(modalSel)) : null; } } catch { bootstrapModal = null; } }

 function getToken(){ const antif = document.querySelector('#global-antiforgery input[name="__RequestVerificationToken"]'); return antif ? antif.value : ''; }

 function closeMenus(){ const m = document.querySelector(ctxSel); if(m) m.classList.add('d-none'); }

 // Fetch helpers
 async function fetchJson(url, opts){ const resp = await fetch(url, opts); if(!resp.ok) throw new Error(await resp.text()); return await resp.json(); }

 // Load lookups (categories, grapes)
 async function loadLookups(){
 const [categories, grapes] = await Promise.all([
 fetchJson('/api/lookups/categories'),
 fetchJson('/api/lookups/grapes')
 ]);
 const catSel = document.getElementById('pe-category');
 const grapeSel = document.getElementById('pe-grape');
 catSel.innerHTML = '';
 grapeSel.innerHTML = '<option value="">-- Sin especificar --</option>';
 categories.forEach(c=>{ const o=document.createElement('option'); o.value=c.id; o.textContent=c.name; catSel.appendChild(o); });
 grapes.forEach(g=>{ const o=document.createElement('option'); o.value=g.id; o.textContent=g.name; grapeSel.appendChild(o); });
 }

 function fillForm(p){
 document.getElementById('pe-id').value = p.id;
 document.getElementById('pe-name').value = p.name ?? '';
 document.getElementById('pe-category').value = p.categoryId ?? '';
 document.getElementById('pe-winery').value = p.winery ?? '';
 document.getElementById('pe-manufacturer').value = p.manufacturer ?? '';
 document.getElementById('pe-grape').value = p.grapeTypeId ?? '';
 document.getElementById('pe-price').value = p.price ?? '';
 document.getElementById('pe-alcohol').value = p.alcoholPercent ?? '';
 document.getElementById('pe-size').value = p.size ?? '';
 document.getElementById('pe-origin').value = p.origin ?? '';
 document.getElementById('pe-image').value = p.imageUrl ?? '';
 document.getElementById('pe-description').value = p.description ?? '';
 updateWineryManufacturerVisibility();
 }

 function isWineSelected(){
 const catSel = document.getElementById('pe-category');
 const selectedOption = catSel.options[catSel.selectedIndex];
 const name = selectedOption ? (selectedOption.text||'') : '';
 // Heurística: si contiene "Vino" lo tratamos como vino
 return /vino/i.test(name);
 }
 function updateWineryManufacturerVisibility(){
 const isWine = isWineSelected();
 const wineryField = document.getElementById('pe-winery-field');
 const manufacturerField = document.getElementById('pe-manufacturer-field');
 const grapeField = document.getElementById('pe-grape-field');
 if(isWine){
 wineryField.style.display='block';
 manufacturerField.style.display='none';
 grapeField.style.display='block';
 } else {
 wineryField.style.display='none';
 manufacturerField.style.display='block';
 grapeField.style.display='none';
 }
 }

 async function openEditor(productId){
 ensureModal();
 await loadLookups();
 const p = await fetchJson(`/api/products/${productId}`);
 fillForm(p);
 document.getElementById('pe-category')?.addEventListener('change', updateWineryManufacturerVisibility);
 if(bootstrapModal) bootstrapModal.show(); else document.querySelector(modalSel).style.display='block';
 }

 async function saveProduct(e){
 e.preventDefault();
 const token = getToken();
 const form = document.getElementById('productEditForm');
 const fd = new FormData(form);
 fd.append('__RequestVerificationToken', token);
 const resp = await fetch('/api/products/save', { method: 'POST', body: fd });
 if(resp.ok){ location.reload(); } else { alert('Error: '+await resp.text()); }
 }

 function installContext(){
 const context = document.querySelector(ctxSel);
 const root = document;
 let currentTargetCard = null;

 root.addEventListener('contextmenu', function(e){
 // Solo cuando el catálogo no esté en modo admin (admin-mode no presente en grid)
 const grid = e.target.closest('.matrix-grid');
 if(!grid || grid.classList.contains('admin-mode')) return;
 const card = e.target.closest('.product-card');
 const pid = card ? card.getAttribute('data-product-id') : null;
 if(!pid){ closeMenus(); return; }
 e.preventDefault();
 currentTargetCard = card;
 context.style.top = e.clientY + 'px';
 context.style.left = e.clientX + 'px';
 context.classList.remove('d-none');
 const btnEdit = document.getElementById('gpc-edit');
 btnEdit.onclick = () => { closeMenus(); openEditor(pid); };
 });

 root.addEventListener('click', ()=> closeMenus());
 }

 function init(){
 installContext();
 document.getElementById('productEditForm')?.addEventListener('submit', saveProduct);
 }
 document.addEventListener('DOMContentLoaded', init);
})();
