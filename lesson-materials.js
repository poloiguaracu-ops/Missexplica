/* MissExplica — materiais de aula para professor e aluno. */
(function(){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function list(lessonId){const {data,error}=await window.missExplicaSupabase.from('lesson_materials').select('id,title,file_url,file_name,mime_type,size_bytes,created_at').eq('lesson_id',lessonId).order('created_at');if(error)throw error;return data||[]}
 async function add(payload){const {data,error}=await window.missExplicaSupabase.from('lesson_materials').insert(payload).select().single();if(error)throw error;return data}
 async function remove(id){const {error}=await window.missExplicaSupabase.from('lesson_materials').delete().eq('id',id);if(error)throw error}
 function render(root,items,canManage){root.innerHTML=`<section class="lesson-materials"><div class="materials-head"><div><span class="section-tag">MATERIAIS</span><h3>Arquivos da aula</h3></div>${canManage?'<button class="green-btn" id="addMaterial">+ Adicionar material</button>':''}</div><div class="materials-list">${items.map(x=>`<article class="material-item"><div class="material-icon">${x.mime_type?.includes('pdf')?'📕':x.mime_type?.startsWith('video')?'🎬':'📎'}</div><div><strong>${esc(x.title)}</strong><small>${esc(x.file_name)}${x.size_bytes?` · ${formatSize(x.size_bytes)}`:''}</small></div><a class="outline-btn" href="${esc(x.file_url)}" target="_blank" rel="noopener">Abrir</a>${canManage?`<button class="delete-material" data-delete="${x.id}">×</button>`:''}</article>`).join('')||'<div class="empty-module">Nenhum material disponível nesta aula.</div>'}</div></section>`;}
 function formatSize(n){if(n<1024)return `${n} B`;if(n<1048576)return `${(n/1024).toFixed(1)} KB`;return `${(n/1048576).toFixed(1)} MB`}
 window.MissExplicaLessonMaterials={list,add,remove,render,formatSize};
})();
