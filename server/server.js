
import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDB from "./Configs/mongodb.js"
import { clerkWebhooks } from "./Controllers/webHooks.js"

// initialize express
const app = express()


// connect to database
await connectDB()

// middleware
app.use(cors())


// routes
app.get("/", (req, res) => {
    res.send("Server working properly")
})

app.post('/clerk', express.json(), clerkWebhooks)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})