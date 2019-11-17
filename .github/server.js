const http = require("http");
const app = require("./backend/app");
const server = http.createServer(app);

server.listen(3000,(req,res)=>{
    console.log("server listens at 3000")
})