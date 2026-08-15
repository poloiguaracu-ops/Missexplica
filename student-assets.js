/* MissExplica — exibição de materiais autorizados na sala de aula. */
(function(){
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  async function load(lessonId){
    const sb=window.missExplicaSupabase;if(!sb)throw new Error('Supabase não configurado.');
    const {data,error}=await sb.from('lesson_assets').select('id,bucket,storage_path,original_name,mime_type,size_bytes').eq('lesson_id',lessonId).order('created_at');
    if(error)throw error;return data||[];
  }
  async function signed(asset,expires=900){
    const {data,error}=await window.missExplicaSupabase.storage.from(asset.bucket).createSignedUrl(asset.storage_path,expires);
    if(error)throw error;return data.signedUrl;
  }
  async function render(root,lessonId){
    try{const assets=await load(lessonId);root.innerHTML=assets.length?`<div class="lesson-assets"><h3>Materiais da aula</h3>${assets.map(a=>`<button class="asset-item" data-asset="${esc(a.id)}"><span>${a.mime_type.startsWith('video/')?'🎥':'📄'}</span><span><strong>${esc(a.original_name)}</strong><small>${format(a.size_bytes)}</small></span><b>↗</b></button>`).join('')}</div>`:'<div class="lesson-assets empty-assets"><h3>Materiais</h3><p>Nenhum material adicional nesta aula.</p></div>';root.querySelectorAll('[data-asset]').forEach(b=>b.onclick=async()=>{const a=assets.find(x=>x.id===b.dataset.asset);if(!a)return;try{b.disabled=true;window.open(await signed(a),'_blank','noopener,noreferrer')}catch(e){alert(e.message||'Não foi possível abrir o material.')}finally{b.disabled=false}})}catch(e){root.innerHTML=`<div class="lesson-assets error"><h3>Materiais indisponíveis</h3><p>${esc(e.message||'Tente novamente.')}</p></div>`}
  }
  function format(n){n=Number(n||0);const u=['B','KB','MB','GB'];let i=0;while(n>=1024&&i<3){n/=1024;i++}return `${n.toFixed(i?1:0)} ${u[i]}`}
  window.MissExplicaStudentAssets={load,signed,render};
})();
