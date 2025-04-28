
import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDB from "./Configs/mongodb.js"
import { clerkWebhooks, stripeWebhooks } from "./Controllers/webHooks.js"
import educatorRouter from "./Routes/educatorRoutes.js"
import { clerkMiddleware } from "@clerk/express"
import connectCloudinary from "./Configs/cloudinary.js"
import courseRouter from "./Routes/courseRoute.js"
import userRouter from "./Routes/userRoutes.js"

// initialize express
const app = express()


// connect to database
await connectDB()
connectCloudinary()

// middleware
app.use(cors())
app.use(clerkMiddleware())
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)
app.use(express.json())
// routes
app.get("/", (req, res) => {
    res.send("Server working properly")
})
app.post('/clerk', clerkWebhooks)
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})