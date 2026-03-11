const express= require("express");
const app= express();
const PORT=4000;

// Get Library bootstrap from node_modules
app.use(
    "/bootstrap",
    express.static(__dirname + "/node_modules/bootstrap/dist"),
);
// Get File & Open bootstrap.html
app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/public/bootstrap.html");
});
// Startup servver Nodejs
app.listen(PORT,()=>{
    console.log(`Server is 
        running with:http://localhost:${PORT}`);
}) ;