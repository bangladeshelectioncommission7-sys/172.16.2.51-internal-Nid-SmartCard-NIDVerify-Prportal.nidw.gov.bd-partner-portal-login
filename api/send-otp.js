export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { phone, otp } = body;

  const apiUrl = process.env.SMS_API_URL;

  const message = `Your OTP code is ${otp}`;

  try {

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        to: phone,
        message: message
      })
    });

    const data = await response.text();

    res.status(200).json({
      success: true,
      apiResponse: data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

}
