import "dotenv/config";
import db_Connect from "./db/index.js";
import express from "express"
import { app } from "./app.js";

db_Connect()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})