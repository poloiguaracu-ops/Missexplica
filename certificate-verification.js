/* MissExplica — emissão e validação de certificados. */
(function(){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function issue(courseId){const {data,error}=await window.missExplicaSupabase.rpc('issue_certificate',{target_course:courseId});if(error)throw error;return data}
 async function verify(code){const {data,error}=await window.missExplicaSupabase.from('certificates').select('certificate_code,issued_at,profiles(full_name),courses(title)').eq('certificate_code',code.trim().toUpperCase()).maybeSingle();if(error)throw error;return data}
 function render(root,certificate){root.innerHTML=`<div class="verify-result"><span class="verify-ok">✓ CERTIFICADO VÁLIDO</span><h2>${esc(certificate.courses?.title||'Curso')}</h2><p>Certificado emitido para <strong>${esc(certificate.profiles?.full_name||'Aluno')}</strong>.</p><small>Código: <strong>${esc(certificate.certificate_code)}</strong> · Emissão: ${new Date(certificate.issued_at).toLocaleDateString('pt-BR')}</small></div>`}
 window.MissExplicaCertificateVerification={issue,verify,render};
})();
