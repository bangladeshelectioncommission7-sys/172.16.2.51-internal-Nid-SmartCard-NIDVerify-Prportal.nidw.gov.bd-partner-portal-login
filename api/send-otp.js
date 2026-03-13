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
        name: "json_to_message",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message: smsText })
      },
      {
        name: "json_mobile_sms",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone, sms: smsText })
      },
      {
        name: "json_number_message",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: phone, message: smsText })
      },
      {
        name: "form_to_message",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ to: phone, message: smsText }).toString()
      },
      {
        name: "form_mobile_sms",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ mobile: phone, sms: smsText }).toString()
      },
      {
        name: "form_phone_message",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ phone: phone, message: smsText }).toString()
      }
    ];

    const tried = [];

    for (const attempt of attempts) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: attempt.headers,
          body: attempt.body
        });

        const text = await response.text();
        tried.push({
          attempt: attempt.name,
          status: response.status,
          response: text
        });

        if (response.ok) {
          return res.status(200).json({
            success: true,
            message: "OTP পাঠানো হয়েছে",
            attempt: attempt.name
          });
        }
      } catch (err) {
        tried.push({
          attempt: attempt.name,
          error: err.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "সব format দিয়েও OTP পাঠানো যায়নি",
      debug: tried
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}
