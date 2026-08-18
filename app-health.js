/* MissExplica — health check leve para detectar configuração incompleta sem expor segredos. */
(function(){
  function timeout(ms){return new Promise((_,reject)=>setTimeout(()=>reject(new Error('Tempo limite excedido.')),ms));}

  window.MissExplicaHealth={
    async check(){
      const sb=window.missexplicaSupabase;
      if(!sb) return {ok:false,code:'SUPABASE_NOT_CONFIGURED',message:'O ambiente ainda não está conectado ao Supabase.'};
      try{
        const result=await Promise.race([sb.auth.getSession(),timeout(8000)]);
        if(result.error) return {ok:false,code:'AUTH_ERROR',message:result.error.message};
        return {ok:true,authenticated:!!result.data?.session};
      }catch(error){
        return {ok:false,code:'RUNTIME_ERROR',message:error instanceof Error?error.message:'Não foi possível verificar o ambiente.'};
      }
    }
  };
})();
