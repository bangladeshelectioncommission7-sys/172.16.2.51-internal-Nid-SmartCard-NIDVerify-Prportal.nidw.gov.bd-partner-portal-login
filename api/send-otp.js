export default async function handler(req, res) {
  if(req.method !== "POST"){
    return res.status(405).json({success:false});
  }

  const { mobile } = req.body;

  let formatted = mobile;
  if(mobile.startsWith("01")){
    formatted = "88" + mobile;
  }

  const otp = Math.floor(100000 + Math.random()*900000);
  const message = `Your OTP: ${otp}`;

  const API_KEY = process.env.SMS_API_KEY;
  const URL = `https://api.sms.net.bd/sendsms?api_key=${API_KEY}&msg=${encodeURIComponent(message)}&to=${formatted}`;

  try{
    const r = await fetch(URL);
    await r.text();
    res.status(200).json({success:true, otp});
  }catch(e){
    res.status(500).json({success:false});
  }
}
