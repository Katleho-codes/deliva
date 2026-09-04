// server/routes/payments.ts (or wherever your order routes live)
import { createHash } from "crypto";
import "dotenv/config";
function payfastEncode(value) {
    return encodeURIComponent(value.trim())
        .replace(/%20/g, "+")
        .replace(
            /[!'()*]/g,
            (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
        );
}

function generateSignature(data, passphrase) {
    let pairs = Object.entries(data)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([key, value]) => `${key}=${payfastEncode(value)}`);
    if (passphrase) pairs.push(`passphrase=${payfastEncode(passphrase)}`);
    return createHash("md5").update(pairs.join("&")).digest("hex");
}
const payfastCheckout = async (req, res) => {
    try {
        const { order_id } = req.params;
        const order = await getOrder(order_id); // however you fetch it — don't trust client-sent amount

        const fields = {
            merchant_id: process.env.PAYFAST_MERCHANT_ID,
            merchant_key: process.env.PAYFAST_MERCHANT_KEY,
            return_url: `https://deliva.lsquared.org.za/orders/${order_id}/orders`,
            cancel_url: `https://deliva.lsquared.org.za/checkout`,
            notify_url: `https://deliva.lsquared.org.za/api/payments/notify`,
            amount: Number(order.total_amount).toFixed(2),
            item_name: order.order_number,
            custom_int1: String(order_id),
        };

        const signature = generateSignature(
            fields,
            process.env.PAYFAST_PASSPHRASE,
        );

        res.json({
            actionUrl: "https://sandbox.payfast.co.za/eng/process",
            fields: { ...fields, signature },
        });
    } catch (error) {
        console.log("payfast checkout error");
    }
};

export default payfastCheckout;
