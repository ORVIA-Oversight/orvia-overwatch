const MONDAY_API_URL = 'https://api.monday.com/v2';

const clean = (value,max=500)=>String(value ?? '').trim().slice(0,max);

async function mondayRequest(query,variables){
  const token = process.env.MONDAY_API_TOKEN;
  if(!token) return null;
  const response = await fetch(MONDAY_API_URL,{method:'POST',headers:{'content-type':'application/json',Authorization:token,'API-Version':'2025-10'},body:JSON.stringify({query,variables})});
  const payload = await response.json();
  if(!response.ok || payload.errors) throw new Error(`monday.com error: ${JSON.stringify(payload.errors || payload)}`);
  return payload.data;
}

export default async function handler(req,res){
  if(req.method !== 'POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'Method not allowed'});}
  const body=req.body || {};
  if(clean(body.website,200)) return res.status(200).json({ok:true});

  const firstName=clean(body.fname,80), lastName=clean(body.lname,80), email=clean(body.email,180).toLowerCase();
  const organisation=clean(body.org,180), phone=clean(body.phone,80), sector=clean(body.sector,120), interest=clean(body.interest,120);
  const teamSize=clean(body.teamSize,80), notes=clean(body.notes,2000);
  if(!firstName || !lastName || !organisation || !email || !notes || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ok:false,error:'Please complete your name, organisation, valid email and operational need.'});

  const payload={source:'ORVIA Overwatch Website',name:`${firstName} ${lastName}`.trim(),firstName,lastName,email,organisation,phone,sector,interest,teamSize,notes,createdAt:new Date().toISOString()};

  const endpoint=process.env.ORVIA_LEAD_WEBHOOK_URL;
  if(endpoint){
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      if(!response.ok) throw new Error(`Lead webhook returned ${response.status}`);
      return res.status(201).json({ok:true,route:'shared-webhook'});
    }catch(error){console.error('ORVIA Overwatch shared lead webhook failed',error);}
  }

  try{
    const board=String(process.env.MONDAY_LEADS_BOARD_ID || '5100809144');
    const group=process.env.MONDAY_LEADS_GROUP_ID || 'group_mm5fqs71';
    const today=new Date().toISOString().slice(0,10);
    const columns={lead_status:{label:'New Lead'},lead_company:organisation,text:'ORVIA Overwatch website enquiry',lead_email:{email,text:email},date_mm5fyr7n:{date:today},text_mm5fd2ma:'Human follow-up required: Overwatch demo request',date_mm5fm9vn:{date:today},long_text_mm5fbkxp:[`Website enquiry: ${notes}`,phone?`Phone: ${phone}`:'',sector?`Sector: ${sector}`:'',interest?`Interest: ${interest}`:'',teamSize?`Operational users: ${teamSize}`:''].filter(Boolean).join('\n'),text_mm5xkhyw:'ORVIA Overwatch Website',color_mm6b5tjz:{label:'Awaiting Human'},color_mm6bv0rh:{label:'Entry / Unassigned'}};
    const mutation=`mutation ($board: ID!, $group: String!, $name: String!, $cols: JSON!) { create_item(board_id: $board, group_id: $group, item_name: $name, column_values: $cols) { id name } }`;
    const data=await mondayRequest(mutation,{board,group,name:payload.name,cols:JSON.stringify(columns)});
    if(data) return res.status(201).json({ok:true,leadId:data.create_item.id,route:'monday'});
  }catch(error){console.error('ORVIA Overwatch Monday lead capture failed',error);}

  const subject=encodeURIComponent(`ORVIA Overwatch demo request — ${organisation}`);
  const message=encodeURIComponent(`Hello ORVIA,\n\nI would like an ORVIA Overwatch demo.\n\nName: ${payload.name}\nEmail: ${email}\nPhone: ${phone || 'Not supplied'}\nOrganisation: ${organisation}\nSector: ${sector || 'Not specified'}\nInterest: ${interest || 'Not specified'}\nOperational users: ${teamSize || 'Not specified'}\n\nNeed:\n${notes}`);
  return res.status(503).json({ok:false,fallback:`mailto:hello@orvia.org.uk?subject=${subject}&body=${message}`,error:'Online capture is not configured on this deployment. A prepared email can be sent instead.'});
}
