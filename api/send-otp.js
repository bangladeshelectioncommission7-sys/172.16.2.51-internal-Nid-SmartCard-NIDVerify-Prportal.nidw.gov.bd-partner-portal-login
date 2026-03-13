export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { phone, otp } = req.body;

  const apiUrl = process.env.SMS_API_URL;

  const message = `Your OTP code is ${otp}`;

  try {
    await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: phone,
        message: message
      })
    });

    res.status(200).json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
}
