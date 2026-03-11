const express = require("express");
const PORT = 4000;
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");
const fs = require('fs');
const FormData = require('form-data');

//Data support text UNICODE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Access to Folder public holder
app.use(express.static(path.join(__dirname, "public")));

//Get welcome to Nodejs
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Check verified BOT_TOKEN & CHAT_ID
if(!process.env.BOT_TOKEN || !process.env.CHAT_ID){
  console.log("Invalid BOT TOKEN and CHAT_ID");
}else{
  console.log("BOT TOKEN and CHAT ID load successfully!");
  console.log("BOT TOKEN: ", process.env.BOT_TOKEN);
  console.log("CHAT ID: ",process.env.CHAT_ID);
}

//Check connection Telegram BOT
async function CheckTelegram(){
  try{
    const respone = await axios.get(
      `http://api.telegram.org/bot${process.env.BOT_TOKEN}/getME`
    );
    if(respone.data.ok){
      console.log("Telegram bot connect successfull!");
      console.log("BOT Name: ", respone.data.result.username);
    }
    axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.CHAT_ID,
        text:'Welcome to Telegram BOT using Nodejs',
      },
    ).then(()=>console.log("Message sent to Telegram BOT successfully!"));
    
  }catch(error){
    console.log("Nodejs cannot connected to Telegram Bot");
  }
}

// 📸 Function to send image to Telegram (FIXED VERSION)
async function sendImageToTelegram(imagePath, caption = "") {
  try {
    // Get the absolute file path
    const absolutePath = path.join(__dirname, "public", imagePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      console.log("❌ Image file not found:", absolutePath);
      return { success: false, message: "Image file not found" };
    }

    // Create form data
    const formData = new FormData();
    formData.append("chat_id", process.env.CHAT_ID);
    formData.append("photo", fs.createReadStream(absolutePath));
    formData.append("caption", caption);

    // Send photo using multipart/form-data
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    if (response.data.ok) {
      console.log("✅ Image sent to Telegram successfully!");
      return { success: true, message: "Image sent successfully" };
    } else {
      console.log("❌ Failed to send image:", response.data);
      return { success: false, message: "Failed to send image" };
    }
  } catch (error) {
    console.log(
      "❌ Error sending image:",
      error.response?.data || error.message,
    );
    return { success: false, message: "Failed to send image" };
  }
}
async function sendMultipleImagesToTelegram(images, caption = "") {
  try {
    const media = [];

    images.forEach((img, index) => {
      media.push({
        type: "photo",
        media: `attach://${img.name}`,
        caption: index === 0 ? caption : undefined,
      });
    });

    const formData = new FormData();
    formData.append("chat_id", process.env.CHAT_ID);
    formData.append("media", JSON.stringify(media));

    images.forEach((img) => {
      const absolutePath = path.join(__dirname, "public", img.path);
      formData.append(img.name, fs.createReadStream(absolutePath));
    });

    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMediaGroup`,
      formData,
      { headers: formData.getHeaders() },
    );

    if (response.data.ok) {
      console.log("✅ Multiple images sent successfully!");
      return { success: true };
    } else {
      console.log("❌ Failed:", response.data);
      return { success: false };
    }
  } catch (error) {
    console.log("❌ Error:", error.response?.data || error.message);
    return { success: false };
  }
}


//call function checkTelegram
CheckTelegram();

app.post("/sent", async (req, res) => {
    const { fullname, email, position, description } = req.body;

    const message = `
*📩 SEND NOTIFICATION*

*Full Name:* ${fullname}
*Email:* ${email}
*Position:* ${position}
*Description:* ${description}
`;

    try {
        await axios.post(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
                chat_id: process.env.CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            }
        );

        //create function send text & images
        // await sendImageToTelegram( "/images/2.jpg", "Thanks for sent your Images")
        //Create function send text and multiple images
        await sendMultipleImagesToTelegram(
          [
            {name: "IMAGE1", path:"/images/1.jpg"},
            {name: "IMAGE2", path:"/images/2.jpg"},
            {name: "IMAGE3", path:"/images/3.jpg"}
          ],
          "Thanks for sent multiple image to Telegram",
        );
        return res.send("Input text on form sent to Telegram successfully!");
    } catch (error) {
        res.send("Message sent to Telegram error!");
    }
});

module.exports = app;