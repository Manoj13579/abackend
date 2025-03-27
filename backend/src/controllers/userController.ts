import { Request, Response } from "express";
import Users from "../models/users";
import Course from "../models/Course";
import Purchase from "../models/Purchase";
import Stripe from "stripe";


// get user's data
export const getUserData = async (req:Request, res:Response) => {
    const {_id} = req.body;
    if(!_id) {
        res.status(400).json({ success: false, message: "id required"});
        return;
       };

       try {
        const user = await Users.findById(_id).select(['-password', '-refreshToken', '-lastName', '-googleId', '-isVerified', '-loginAttempts', '-lockLoginUntil', '-resetPasswordAttempts', '-lockResetPasswordUntil',  '-verificationCodeAttempts', '-verificationResendAttempts', '-lockVerificationCodeUntil', '-lockVerificationResendUntil', '-verificationCode', '-verificationCodeExpiresAt']);
        if(!user) {
            res.status(404).json({ success: false, message: "User not found"});
            return;
        }
        res.status(200).json({ success: true, message: "User data fetched successfully", data: user});
       } catch (error) {
        console.error('getUserData error', error);
        res.status(500).json({ success: false, message: "Error fetching user data", error});
        return;
       }
};


// user's enrolled courses with lecture links
export const userEnrolledCourses = async (req:Request, res:Response) => {
    const {_id} = req.body;
    if(!_id) {
        res.status(400).json({ success: false, message: "id required"});
        return;
       };
       try {
        const userData = await Users.findById(_id).populate('enrolledCourses');
        res.status(200).json({ success: true, message: "User enrolled courses fetched successfully", data: userData?.enrolledCourses});
        return;
       } catch (error) {
        console.error('userEnrolledCourses error', error);
        res.status(500).json({ success: false, message: "Error fetching user enrolled courses", error});
        return;
       }
};


// purchase course
export const purchaseCourse = async (req:Request, res:Response) => {
    const {_id, courseId} = req.body;
    const { origin } = req.headers;
    if(!_id || !courseId) {
        res.status(400).json({ success: false, message: "id and course id required"});
        return;
       };
       try {
        const userData = await Users.findById(_id);
        const courseData = await Course.findById(courseId);
        if(!userData || !courseData) {
            res.status(404).json({ success: false, message: "User or course not found"});
            return;
        };
        const purchaseData = {
            courseId: courseData._id,
            userId: _id,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100 ).toFixed(2),
        };
        const newPurchase = await Purchase.create(purchaseData);
        // stripe gateway initialization
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        // creating line items for stripe checkout session
        const lineItems = [{
            price_data:{
                currency:"usd",
                product_data:{
                    name:courseData.courseTitle,
                    /*Only include images if courseThumbnail is available, image is array coz sripe api expects it to be array. for js images: [courseData.courseThumbnail] works this done for typescript  */
                    images: courseData.courseThumbnail ? [courseData.courseThumbnail] : []
                },
                unit_amount: Math.floor(newPurchase.amount) * 100,
            },
            quantity:1
        }];
    
        const session = await stripe.checkout.sessions.create({   
            payment_method_types:["card"],
            success_url:`${origin}/my-enrollments-page`,
            cancel_url:`${origin}/`,
            line_items:lineItems,
            mode:"payment",
            metadata: {
                purchaseId: (newPurchase._id as any).toString(),
            },
        });
    
        res.status(200).json({ success: true, message: "Course purchased successfully", session_url: session.url});
    console.log("session" ,session.url);
        return;
        
} catch (error) {
        console.error('purchaseCourse error', error);
        res.status(500).json({ success: false, message: "Error purchasing course", error});
        return;
       };
}