import Stripe from "stripe"
import Course from "../Models/course.js"
import { Purchase } from "../Models/Purchases.js"
import User from "../Models/userModel.js"
import { CourseProgress } from "../Models/CourseProgress.js"


// Get user data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId
        const user = await User.findById(userId)
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        res.json({ success: true, user })
    } catch (error) {
        res.json({ success: false, messgae: error.message })
    }
}

// User enrolled courses with lectures links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')
        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}



export const purchaseCourse = async (req, res) => {
    console.log("BODY:", req.body);
    console.log("HEADERS:", req.headers);
    try {
        const { courseId } = req.body;
        const { origin } = req.headers
        const userId = req.auth.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)
        if (!userData || !courseData) {
            return res.json({ success: false, message: "Data not found" })
        }
        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)
        }
        const newPurchase = await Purchase.create(purchaseData)
        // Stripe Gateway stripe
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLowerCase()
        // creatig line items for stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }]
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: "payment",
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })
        res.json({ success: true, session_url: session.url })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// upddate user course progress 
export const updateUserCoursePorgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId, lectureId } = req.body
        const progressData = await CourseProgress.findOne({ userId, courseId })
        if (progressData) {
            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: "Lecture already completed" })
            }
            progressData.lectureCompleted.push(lectureId)
            progressData.save()
        } else {
            await CourseProgress.create({
                userId, courseId,
                lectureCompleted: []
            })
        }
        res.json({ success: true, message: "Progress Updated " })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Use course Progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId } = req.body
        const progressData = await CourseProgress.findOne({ userId, courseId })
        res.json({ success: true, progressData })
    } catch (error) {
        res.json({ success: false, messgae: error.message })
    }
}

// add user rating to course
export const addUserRating = async (req, res) => {
    const userId = req.auth.userId
    const { courseId, rating } = req.body
    if (!userId || !courseId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, messgae: "Invalid Details" })
    }
    try {
        const course = await Course.findById(courseId)
        if (!course) {
            return res.json({ success: false, message: "Course not found" })
        }
        const user = await User.findById(userId)
        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: "User has not purchased this course." })
        }
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId)
        if (existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating = rating
        } else {
            course.courseRatings.push({ userId, rating })
        }
        await course.save()
        res.json({ success: true, message: "Rating Added" })
    } catch (error) {
        res.json({ success: false, messgae: error.message })
    }
}