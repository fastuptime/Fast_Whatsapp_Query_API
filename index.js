const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Whatsapp Bot Aktif!");
});

app.get("/api", async (req, res) => {
    const { number } = req.query;
    if (!number || number.length < 10 || number.length > 13 || isNaN(number)) {
        return res.json({
            status: "error",
            message: "Invalid number",
            example: "905300000000",
        });
    }
    const user = await client.getContactById(`${number}@c.us`);
    const pic = await client.getProfilePicUrl(`${number}@c.us`);
    if (!user) return res.json({ status: "error", message: "Number not found" });
    res.json({
      status: "success",
      message: "Number found",
      data: {
          number: number,
          name: user?.pushname,
          isBusiness: user?.isBusiness,
          isEnterprise: user?.isEnterprise,
          profilePic: pic,
      },
    });
});

app.use(function (req, res, next) {
  res.status(404).json({
    status: "error",
    message: "404 Not Found",
    github: "fastuptime",
  });
});

client.initialize();
app.listen(80, () => {
    console.log("Sistem Aktif!");
});
