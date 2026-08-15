/* MissExplica — health check leve para detectar configuração incompleta sem expor segredos. */
(function(){
  window.MissExplicaHealth={
    async check(){
      const sb=window.missExplicaSupabase;
      if(!sb) return {ok:false,code:'SUPABASE_NOT_CONFIGURED',message:'O ambiente ainda não está conectado ao Supabase.'};
      try{
        const {data:{session},error}=await sb.auth.getSession();
        if(error) return {ok:false,code:'AUTH_ERROR',message:error.message};
        return {ok:true,authenticated:!!session,userId:session?.user?.id||null};
      }catch(error){return {ok:false,code:'RUNTIME_ERROR',message:error.message};}
    }
  };
})();
