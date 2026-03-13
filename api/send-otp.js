export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ success:false, message:"Method not allowed" });
  }

  try {

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const phone = body.phone;
    const otp = body.otp;

    const apiUrl = process.env.SMS_API_URL;

    const smsText = `Your OTP code is ${otp}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        mobile: phone,
        sms: smsText
      })
    });

    const result = await response.text();

    return res.status(200).json({
      success:true,
      providerResponse: result
    });

  } catch(err) {

    return res.status(500).json({
      success:false,
      error: err.message
    });

  }

}
