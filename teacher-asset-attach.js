/* MissExplica — registra o arquivo enviado como conteúdo da aula. */
(function(){
  async function attach(lessonId,asset){
    if(!window.missExplicaSupabase) throw new Error('Supabase não configurado.');
    const {data,error}=await window.missExplicaSupabase.rpc('teacher_attach_asset',{target_lesson:lessonId,target_bucket:asset.bucket,target_path:asset.path,target_name:asset.name,target_mime:asset.type,target_size:Number(asset.sizeBytes||0)});
    if(error) throw error;
    return data;
  }
  window.MissExplicaAssetAttach={attach};
})();
