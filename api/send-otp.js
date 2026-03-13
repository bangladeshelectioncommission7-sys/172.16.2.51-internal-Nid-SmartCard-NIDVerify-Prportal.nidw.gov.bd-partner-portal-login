export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const phone = body?.phone;
    const otp = body?.otp;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "phone বা otp পাওয়া যায়নি"
      });
    }

    const apiUrl = process.env.SMS_API_URL;

    if (!apiUrl) {
      return res.status(500).json({
        success: false,
        message: "SMS_API_URL পাওয়া যায়নি"
      });
    }

    const smsText = `Your OTP code is ${otp}`;

    const attempts = [
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message: smsText })
      },
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone, sms: smsText })
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ to: phone, message: smsText }).toString()
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ mobile: phone, sms: smsText }).toString()
      }
    ];

    for (const attempt of attempts) {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: attempt.headers,
        body: attempt.body
      });

      const text = await response.text();

      if (response.ok) {
        return res.status(200).json({
          success: true,
          providerResponse: text
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "provider request failed"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
