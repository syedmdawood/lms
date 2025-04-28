import { Webhook } from "svix";
import User from "../Models/userModel.js";
import Stripe from "stripe";
import { Purchase } from "../Models/Purchases.js";
import Course from "../Models/course.js";

// Api controller function to manage clerk user with database 

export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        // verify the headers
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })

        // data from req body
        const { data, type } = req.body
        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.create(userData)
                res.json({})
                break;
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData)
                res.json({})
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id)
                res.json({})
                break
            }


            default:
                break;
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook verification failed:', err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const { purchaseId } = session.metadata;

            const purchaseData = await Purchase.findById(purchaseId);
            const userData = await User.findById(purchaseData.userId);
            const courseData = await Course.findById(purchaseData.courseId.toString());

            courseData.enrolledStudents.push(userData._id); // just use _id
            await courseData.save();

            userData.enrolledCourses.push(courseData._id);
            await userData.save();

            purchaseData.status = 'completed';
            await purchaseData.save();

            break;
        }
        case 'checkout.session.async_payment_failed':
        case 'checkout.session.expired': {
            const session = event.data.object;
            const { purchaseId } = session.metadata;

            const purchaseData = await Purchase.findById(purchaseId);
            purchaseData.status = 'failed';
            await purchaseData.save();
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    response.json({ received: true });
}
