/* MissExplica — upload seguro de vídeo/material do professor. */
(function(){
  const MAX_VIDEO=500*1024*1024, MAX_FILE=50*1024*1024;
  const videoTypes=['video/mp4','video/webm','video/quicktime'];
  const fileTypes=['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-powerpoint'];
  const safeName=n=>n.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,120);
  async function upload(file,courseId,type,onProgress){
    if(!file) throw new Error('Selecione um arquivo.');
    const allowed=type==='video'?videoTypes:fileTypes, max=type==='video'?MAX_VIDEO:MAX_FILE;
    if(!allowed.includes(file.type)) throw new Error(type==='video'?'Use MP4, WebM ou MOV.':'Use PDF, Word ou PowerPoint.');
    if(file.size>max) throw new Error(type==='video'?'O vídeo deve ter no máximo 500 MB.':'O arquivo deve ter no máximo 50 MB.');
    const sb=window.missExplicaSupabase;
    if(!sb) throw new Error('Armazenamento ainda não configurado.');
    const {data:{user}}=await sb.auth.getUser(); if(!user) throw new Error('Faça login novamente.');
    const path=`${courseId}/${user.id}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const bucket=type==='video'?'course-videos':'course-materials';
    onProgress?.(10);
    const {error}=await sb.storage.from(bucket).upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
    if(error) throw error; onProgress?.(100);
    return {bucket,path,name:file.name,size:file.size,type:file.type};
  }
  window.MissExplicaUpload={upload,MAX_VIDEO,MAX_FILE};
})();
