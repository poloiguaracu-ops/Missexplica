/* MissExplica — upload integrado ao editor do professor. */
(function(){
  const MAX_VIDEO=500*1024*1024, MAX_FILE=50*1024*1024;
  const videoTypes=['video/mp4','video/webm','video/quicktime'];
  const fileTypes=['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  function validate(file,kind){if(!file)throw new Error('Selecione um arquivo.');const max=kind==='video'?MAX_VIDEO:MAX_FILE;const allowed=kind==='video'?videoTypes:fileTypes;if(file.size>max)throw new Error(`Arquivo muito grande. Limite: ${kind==='video'?'500 MB':'50 MB'}.`);if(!allowed.includes(file.type))throw new Error('Tipo de arquivo não permitido.');return file;}
  function fmt(n){const u=['B','KB','MB','GB'];let i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return `${n.toFixed(i?1:0)} ${u[i]}`;}
  async function upload(file,kind,onProgress){validate(file,kind);const sb=window.missExplicaSupabase;if(!sb)throw new Error('Supabase ainda não está configurado.');const user=(await sb.auth.getUser()).data.user;if(!user)throw new Error('Faça login novamente.');const ext=file.name.split('.').pop().toLowerCase();const path=`${user.id}/${crypto.randomUUID()}.${ext}`;const bucket=kind==='video'?'course-videos':'course-materials';onProgress?.(5);const {error}=await sb.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;onProgress?.(100);return {bucket,path,name:file.name,size:fmt(file.size),type:file.type};}
  window.MissExplicaUpload={validate,upload,formatSize:fmt};
})();
