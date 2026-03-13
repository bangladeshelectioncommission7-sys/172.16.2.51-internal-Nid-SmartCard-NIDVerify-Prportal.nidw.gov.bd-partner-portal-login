export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const phone = body?.phone?.trim();
    const otp = body?.otp?.trim();

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "phone বা otp পাওয়া যায়নি" });
    }

    const apiBase = process.env.SMS_API_URL;
    const apiKey = process.env.SMS_API_KEY;

    if (!apiBase || !apiKey) {
      return res.status(500).json({ success: false, message: "SMS API configuration missing" });
    }

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '88' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('88')) {
      formattedPhone = '88' + formattedPhone;
    }

    const smsText = `Your OTP code is ${otp}. Valid for 5 minutes.`;

    const params = new URLSearchParams({
      api_key: apiKey,
      to: formattedPhone,
      from: 'sms',
      sms: smsText
    });

    const fullUrl = `${apiBase}&${params.toString()}`;

    const response = await fetch(fullUrl, { method: "GET" });
    const text = await response.text();

    const lowerText = text.toLowerCase();
    if (response.ok && text.trim() !== '' && !lowerText.includes('error') && !lowerText.includes('fail') && !lowerText.includes('invalid') && !lowerText.includes('insufficient')) {
      return res.status(200).json({ success: true, providerResponse: text });
    } else {
      return res.status(500).json({ success: false, message: `SMS failed: ${text || 'No response from provider'}` });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
