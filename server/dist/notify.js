import dotenv from 'dotenv';
import twilio from 'twilio';
dotenv.config();
const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_FROM;
const to = process.env.ALERT_TO;
let client = null;
if (sid && token) {
    client = twilio(sid, token);
}
export async function sendBreachAlert(message) {
    if (!client)
        return { sent: false, reason: 'twilio_not_configured' };
    if (!from || !to)
        return { sent: false, reason: 'phone_not_configured' };
    try {
        await client.messages.create({ from, to, body: message });
        return { sent: true };
    }
    catch (err) {
        return { sent: false, reason: err.message };
    }
}
