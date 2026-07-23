// Brain Sync Endpoint — 02_BRAIN local OS ↔ cloud glyphin sync
// Local AI posts its glyphin state, we merge it into the player's RingMinePlayer record
Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization"}});
  if(req.method==="GET")return new Response(JSON.stringify({ok:true,service:"brainSync",version:"1.0"}),{headers:{"Content-Type":"application/json"}});
  try{
    const body=await req.json();
    const base44=(await import("npm:@base44/sdk@0.8.31")).createClientFromRequest(req);
    const tid=String(body.telegram_id||"");
    if(!tid)return new Response(JSON.stringify({error:"missing telegram_id"}),{status:400,headers:{"Content-Type":"application/json"}});
    const authKey=body.sovereign_key||"";
    if(!authKey)return new Response(JSON.stringify({error:"missing sovereign_key"}),{status:401,headers:{"Content-Type":"application/json"}});
    const ps=await base44.asServiceRole.entities.RingMinePlayer.filter({telegram_id:tid});
    if(!ps||ps.length===0)return new Response(JSON.stringify({ok:false,error:"Player not found. Start Ring Mine first."}),{headers:{"Content-Type":"application/json"}});
    const p=ps[0];
    if(body.action==="sync_glyphin"){
      const updates:any={};
      if(body.glyph_state)updates.glyph_state=body.glyph_state;
      if(body.glyph_cohesion!==undefined)updates.glyph_cohesion=body.glyph_cohesion;
      if(body.glyph_seeds)updates.glyph_seeds=body.glyph_seeds;
      if(body.glyph_lineage)updates.glyph_lineage=body.glyph_lineage;
      if(body.resonance_anchors)updates.resonance_anchors=body.resonance_anchors;
      if(body.growth_xp!==undefined)updates.growth_xp=body.growth_xp;
      if(body.queen_bond!==undefined)updates.queen_bond=body.queen_bond;
      if(body.streak_days!==undefined)updates.streak_days=body.streak_days;
      let sd:any={};
      if(p.state_data){try{sd=typeof p.state_data==="string"?JSON.parse(p.state_data):p.state_data;}catch{}}
      sd.brain_sync={timestamp:new Date().toISOString(),local_glyph:body.glyph_state||p.glyph_state||"Seed",aperture:body.aperture||null,pressure:body.pressure||null,variator_state:body.variator_state||null};
      updates.state_data=sd;
      await base44.asServiceRole.entities.RingMinePlayer.update(p.id,updates);
      return new Response(JSON.stringify({ok:true,synced:true,timestamp:sd.brain_sync.timestamp,player:{glyph_state:updates.glyph_state||p.glyph_state,growth_xp:updates.growth_xp||p.growth_xp,queen_bond:updates.queen_bond||p.queen_bond}}),{headers:{"Content-Type":"application/json"}});
    }
    if(body.action==="pull_cloud"){
      let sd:any={};
      if(p.state_data){try{sd=typeof p.state_data==="string"?JSON.parse(p.state_data):p.state_data;}catch{}}
      const journals=await base44.asServiceRole.entities.RingMineJournal.filter({telegram_id:tid});
      const recentJournals=(journals||[]).slice(-10).map((j:any)=>({entry:j.entry,mood:j.mood,xp_earned:j.xp_earned,mudd_earned:j.mudd_earned,created_date:j.created_date}));
      return new Response(JSON.stringify({ok:true,cloud:{glyph_state:p.glyph_state||"Seed",glyph_cohesion:p.glyph_cohesion||0,glyph_seeds:p.glyph_seeds||[],glyph_lineage:p.glyph_lineage||[],resonance_anchors:p.resonance_anchors||[],queen_name:p.queen_name||"",queen_bond:p.queen_bond||0,growth_xp:p.growth_xp||0,streak_days:p.streak_days||0,companion:p.companion||null,mudd_ore_balance:p.mudd_ore_balance||0,mudd_balance:p.mudd_balance||0,journals:recentJournals}}),{headers:{"Content-Type":"application/json"}});
    }
    if(body.action==="push_chronicle"){
      let sd:any={};
      if(p.state_data){try{sd=typeof p.state_data==="string"?JSON.parse(p.state_data):p.state_data;}catch{}}
      if(!sd.chronicle)sd.chronicle=[];
      sd.chronicle.push({timestamp:new Date().toISOString(),event:body.event||"unknown",details:body.details||"",source:"02_BRAIN"});
      if(sd.chronicle.length>100)sd.chronicle=sd.chronicle.slice(-100);
      await base44.asServiceRole.entities.RingMinePlayer.update(p.id,{state_data:sd});
      return new Response(JSON.stringify({ok:true,chronicle_entries:sd.chronicle.length}),{headers:{"Content-Type":"application/json"}});
    }
    return new Response(JSON.stringify({error:"unknown action: "+(body.action||"none")}),{status:400,headers:{"Content-Type":"application/json"}});
  }catch(e){
    console.error("brainSync error:",e);
    return new Response(JSON.stringify({error:String(e)}),{status:500,headers:{"Content-Type":"application/json"}});
  }
});
