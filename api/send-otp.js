export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const phone = body?.phone;
    const otp = body?.otp;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "phone বা otp পাওয়া যায়নি" });
    }

    const apiBase = process.env.SMS_API_URL;
    const apiKey = process.env.SMS_API_KEY || "585|uHouJiWAUU0HfLIlOF6eg1XGKF94jPVeFfYIolJB79a3d8b9"; // fallback হিসেবে আপনার key

    if (!apiBase) {
      return res.status(500).json({ success: false, message: "SMS_API_URL পাওয়া যায়নি" });
    }

    // ফোন নাম্বার +880 ফরম্যাটে করুন (আপনার উদাহরণে 68416598221 আছে, কিন্তু BD-এ +880 লাগবে)
    let formattedPhone = phone.startsWith('0') ? phone.replace(/^0/, '88') : phone;
    if (!formattedPhone.startsWith('88')) {
      formattedPhone = '88' + formattedPhone.replace(/^0?/, '');
    }
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    const smsText = `Your OTP code is ${otp}. Valid for 5 minutes.`;

    const params = new URLSearchParams({
      api_key: apiKey,
      to: formattedPhone.replace('+', ''),  // অনেক API + ছাড়া চায়, যেমন 88019...
      from: 'sms',                          // আপনার উদাহরণে from=sms
      sms: smsText,                         // parameter sms (message না)
      // unicode: '1'                       // যদি বাংলা টেক্সট লাগে তাহলে uncomment করুন
      // whatsapp: '1'                      // whatsapp দরকার হলে
    });

    const fullUrl = `${apiBase}&${params.toString()}`;

    const response = await fetch(fullUrl, {
      method: "GET",
    });

    const text = await response.text();

    // Response চেক (এই API সাধারণত text/plain বা simple string দেয়, যেমন "OK" বা error message)
    if (response.ok && (text.includes('OK') || text.includes('success') || text.trim().length > 0)) {
      return res.status(200).json({
        success: true,
        providerResponse: text
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `SMS API failed: ${text || 'No response'}`
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
