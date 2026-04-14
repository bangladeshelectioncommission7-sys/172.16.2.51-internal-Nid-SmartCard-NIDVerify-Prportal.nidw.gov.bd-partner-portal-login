export default async function handler(req, res) {
  if(req.method !== "POST"){
    return res.status(405).json({success:false});
  }

  const { mobile } = req.body;

  // নাম্বার ঠিক করা (017 → 88017)
  let formatted = mobile;
  if(mobile.startsWith("01")){
    formatted = "88" + mobile;
  }

  // OTP তৈরি
  const otp = Math.floor(100000 + Math.random()*900000);
  const message = `Your OTP: ${otp}`;

  const API_KEY = process.env.SMS_API_KEY;

  // ✅ Alpha Non-Masking URL
  const URL = `https://api.sms.net.bd/sendsms?api_key=${API_KEY}&msg=${encodeURIComponent(message)}&to=${formatted}`;

  try{
    const r = await fetch(URL);
    const data = await r.text();

    console.log("SMS API Response:", data);

    res.status(200).json({success:true, otp});
  }catch(e){
    console.error(e);
    res.status(500).json({success:false});
  }
}
