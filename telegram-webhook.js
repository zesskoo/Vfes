const SUPABASE_URL = "https://txjymslgjgltafiiedhc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4anltc2xnamdsdGFmaWllZGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMDYzNTcsImV4cCI6MjA5OTc4MjM1N30.VLgNNJ5YqXwbbu7oQkjjnHk3f445wkxSfbbty4usVd4";
const AUTO_REPLY_TEXT = "Ваша заявка принята, скоро ответим 🙌";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(200).send("OK"); return; }
  try {
    const update = req.body;
    const msg = update?.message;
    if (msg && msg.text) {
      const chatId = String(msg.chat.id);
      const username = msg.from?.username || "";
      const firstName = msg.from?.first_name || "";
      const text = msg.text;

      // save incoming message (useful later if we build a reply UI)
      await fetch(SUPABASE_URL + "/rest/v1/support_messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY,
          Prefer: "return=minimal"
        },
        body: JSON.stringify({ chat_id: chatId, username, first_name: firstName, text, direction: "in" })
      }).catch(()=>{});

      // fetch support bot token from app_settings
      const settingsRes = await fetch(SUPABASE_URL + "/rest/v1/app_settings?id=eq.1&limit=1", {
        headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
      });
      const settings = await settingsRes.json();
      const supportToken = settings?.[0]?.support_token;

      if (supportToken) {
        await fetch(`https://api.telegram.org/bot${supportToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: AUTO_REPLY_TEXT })
        }).catch(()=>{});
      }
    }
  } catch (e) {
    console.error("telegram-webhook error", e);
  }
  res.status(200).send("OK");
}
