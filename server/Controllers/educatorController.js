import { clerkClient } from "@clerk/express"
import Course from "../Models/course.js"
import { v2 as cloudinary } from "cloudinary"
import { Purchase } from "../Models/Purchases.js"
import User from "../Models/userModel.js"


// update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            }
        })

        res.json({ success: true, message: "You can publish a course now" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// add new course 
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: "Thumbnail not Attached" })
        }


        const parsedCourseData = await JSON.parse(courseData)
        parsedCourseData.educator = educatorId
        const newCourse = await Course.create(parsedCourseData)
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url

        await newCourse.save()

        res.json({ success: true, message: "Course Added" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// get educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({ educator })
        res.json({ success: true, courses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// get educator dashboard data (Total earnings, Enrolled Students, No of Courses)

export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({ educator })
        const totalCourses = courses.length

        const coursesIds = courses.map(course => course._id)

        // calculate total earning from puschases 
        const purchases = await Purchase.find({
            courseId: { $in: coursesIds },
            status: "completed",
        })
        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0)

        // collect unique enrolled student IDs with their courses titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, ' name imageUrl')
            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                })
            })
        }
        res.json({ success: true, dashboardData: { totalEarnings, totalCourses, enrolledStudentsData } })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Get enrolled students data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({ educator })
        const coursesIds = courses.map(course => course._id)

        const purchases = await Purchase.find({
            courseId: { $in: coursesIds },
            status: 'completed',
        }).populate('userId', ' name imageUrl').populate('courseId', "courseTitle")

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }))
        res.json({ success: true, enrolledStudents })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}