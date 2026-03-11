const axios = require("axios");
require("dotenv").config();
const API =`https://api.telegram.org/bot${process.env.BOT_TOKEN}`;
let offset = 0;
async function runbot(){
    const res = await axios.get(`${API}/getUpdates`,{
        params: { offset, setTimeout: 30},
    });
    for(const u of res.data.result) {
    offset = u.update_id + 1;
    if (u.message?.text) {
        const chatID = u.message.chat.id;
        const text = u.message.text.toLowerCase();
        let reply = "I don't understand your word!";
        if(text == "hi") reply="Hello";
        else if (text === "how are you?") reply = "I am okay, thank you";
        else if (text == "where are you study?")
             reply = "I'm studying at SETEC Institute";
        await axios.post(`${API}/sendMessage`, {
            chat_id: chatID,
            text: reply,
        });
    
        }   
    }
    setTimeout(runbot, 3000);
}
runbot();