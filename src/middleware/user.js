import { topicCollection, userCollection } from "../db/collections.js"
import bcrypt from 'bcrypt'
import { verify } from "jsonwebtoken"
import { AccessToken } from "./helper/jwt.js"
import { Topic } from "./feed.js"
import { sendMail } from "./helper/mail.js"
import moment from "moment";

export class User {

    static async checkUser(type, data) {
        if (type == "email") {
            const user = await userCollection.findOne({ email: data }).select('-password -lastvisit')
            if (!user) {
                return false
            }
            return user
        }

        if (type == "id") {
            const user = await userCollection.findOne({ _id: data }).select('-password -lastvisit')
            if (!user) {
                return false
            }
            return user
        }



    }

    static async getuser(req, res) {
        const request = await User.checkUser('id', req.params.user)
        if (request === false) {
            return res.status(400).send({ message: 'user not found' })
        }
        return res.status(200).send({ message: request })
    }

    static async RegisterUser(req, res) {
        const { fullname, username, email, password } = req.body

        const salt = await bcrypt.genSalt(10)
        const new_password = await bcrypt.hash(password, salt)

        const request = await User.checkUser('email', email)

        if (request !== false) {
            return res.status(400).send({ message: 'user with this email or username already exist' })
        }

        const createuser = await userCollection.create({
            fullname: fullname,
            email: email,
            username: username,
            password: new_password,
            profileimg: "",
            phone: "",
            bio: "",
            role: 'USER'
        })

        if (!createuser) {
            return res.status(500).send({ message: 'error creating user' })
        }
        return res.status(200).send({ message: 'user created successfully' })
    }

    static async Login(req, res) {

        const { email, password } = req.body

        const new_date = Date.now()
        const request = await userCollection.findOne({ email: email })

        if (!request) {
            return res.status(404).send({ message: "user not found" })
        }
        const verify_password = await bcrypt.compare(password, request.password)

        if (!verify_password) {
            return res.status(401).send({ message: "incorrect password" })
        }
        const token = AccessToken.GenerateToken(request)

        const updateLogin = await userCollection.updateOne({ email: email }, { $set: { 
            status: true,
            lastvisit: new_date 
        } })

        if (updateLogin) {
            res.status(200).send({ message: token, user: request })
            return
        }
        res.status(500).send({ message: 'error updating login info' })

    }

    static async Logout(req, res) {
        const new_date = Date.now()
        const request = await User.checkUser('id', req.user._id)

        if (!request) {
            return res.status(404).send({ message: "user not found" })
        }

        const updateLogin = await userCollection.updateOne({ email: request.email }, { $set: { 
            status: false,
            lastvisit: new_date 
        } })

        if (updateLogin) {
            return res.status(200).send({ 
                message: "User successfully logged out" 
            })
        }

        return res.status(500).send({ 
            message: "Log out failed" 
        })
    }

    static async totalNumberofTopicperuser(req, res) {
        const request = await User.checkUser('id', req.params.user)
        console.log(request)
        if (request === false) {
            return res.status(404).send({ message: 'user not available' })
        }
        const topicCount = await topicCollection.find({ user: req.params.user }).countDocuments()
        return res.status(200).send({ message: topicCount })
    }

    static async totalNumberofMembers(req, res) {
        const members = await userCollection.find({ role: { $ne: 'admin' } }).countDocuments()
        return res.status(200).send({ message: members })
    }

    static async UsersStats(req, res) {
        const members = await userCollection.find({ 
            role: { 
                $ne: 'admin'
            } 
        }).select(['fullname', 'date', 'status']);

        return res.status(200).send({ message: members })
    }

    static async UsersMonthlyStats(req, res) {
        const { month } = req.params;

        const members = await userCollection.aggregate([
            {$addFields: {  "month" : {$month: '$date'}}},
            {$match: { 
                month: Number(month),
                role: { $ne: 'admin' }
            }}
        ]);

        return res.status(200).send({ message: members.length })
    }

    static async AllMembers(req, res) {
        const members = await userCollection.find({ role: { $ne: 'admin' } }).select("-password")
        return res.status(200).send({ message: members })
    }


    static async userProfile(req, res) {
        const request = await User.checkUser('id', req.params.userid)

        let topics;

        if (!request) {
            return res.status(404).send({ message: 'user not available' })
        }

        const fetchTopic = await topicCollection.find({ user: req.params.userid })
            .populate({
                path: 'user comment.from comment.to comment.reply.from comment.reply.to',
                model: 'users',
                select: "-password"
            }).sort({ "comment.date": -1, date: -1 })
        if (fetchTopic.length < 1) {
            topics = "no topic yet"
        } else {
            topics = fetchTopic
        }

        return res.status(200).send({ message: request, topics: topics })

    }


    static async LoginWithGoogle(req, res) {

        const { email, fullname, profileimg, username } = req.body

        const new_date = Date.now()
        const request = await userCollection.findOne({ email: email })

        if (!request) {
            const createuser = await userCollection.create({
                fullname: fullname,
                email: email,
                username: username,
                password: "",
                profileimg: profileimg,
                phone: "",
                bio: "",
                role: 'USER'
            })

            if (!createuser) {
                return res.status(500).send({ message: 'error creating user' })
            }
            const token = AccessToken.GenerateToken(createuser)

            const updateLogin = await userCollection.updateOne({ email: email }, { $set: { lastvisit: new_date } })

            if (updateLogin) {
                res.status(200).send({ message: token, user: createuser })
                return
            }
            return res.status(500).send({ message: 'error updating login info' })
        }

        const token = AccessToken.GenerateToken(request)

        const updateLogin = await userCollection.updateOne({ email: email }, { $set: { lastvisit: new_date } })

        if (updateLogin) {
            res.status(200).send({ message: token, user: request })
            return
        }
        return res.status(500).send({ message: 'error updating login info' })

    }

    static async updateAccount(req, res) {
        const { phone, email } = req.body

        if (phone && email) {
            await userCollection.updateOne({ _id: req.user._id }, { $set: { phone: phone, email: email } })
            return res.status(200).send({ message: 'phone and email updated' })
        } else if (phone) {
            await userCollection.updateOne({ _id: req.user._id }, { $set: { phone: phone } })
            return res.status(200).send({ message: 'phone updated' })
        } else if (email) {
            await userCollection.updateOne({ _id: req.user._id }, { $set: { email: email } })
            return res.status(200).send({ message: 'email updated' })
        } else {
            return res.status(400).send({ message: 'please pass email or phone to update account' })
        }
    }

    static async changePassword(req, res) {
        const { password } = req.body

        if (password) {
            const salt = await bcrypt.genSalt(10)
            const new_password = await bcrypt.hash(password, salt)

            await userCollection.updateOne({ _id: req.user._id }, { $set: { password: new_password } })
            return res.status(200).send({ message: 'password updated successfully' })
        } else {
            return res.status(400).send({ message: 'please no empty field' })
        }
    }

    static async userSettings(req, res) {
        const { path, fullname, username, email, phone, bio } = req.body

        if (path) {
            await userCollection.updateOne({ _id: req.user._id }, { $set: { profileimg: path } })
        }
        if (fullname) {
            await userCollection.updateOne({ _id: req.user._id }, { $set: { fullname: fullname } })
        }
        if (username) {
            //check if user name exist
            const checkusername = await userCollection.findOne({ username: username })
            if (checkusername) {
                return res.status(400).send({ message: "username already exist" })
            }
            await userCollection.updateOne({ _id: req.user._id }, { $set: { username: username } })

        }
        if (email) {
            await userCollection.updateOne({ _id: req.user._id }, { $set: { email: email } })
        }
        if (bio) {
            await userCollection.updateOne({ _id: req.user._id }, { $set: { bio: bio } })
        }
        if (phone) {
            await userCollection.updateOne({ _id: req.user._id }, { $set: { phone: phone } })
        }

        return res.status(200).send({ message: 'updated successfully' })
    }

    static async ForgotPassword(req, res) {
        const { email } = req.body

        const checkIfEmailExist = await userCollection.findOne({ email: email })
        if (!checkIfEmailExist) {
            return res.status(400).send({ message: "user with this email does not exist" })
        }

        const length = 20;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        


        let link1 = `https://tech-space-eight.vercel.app/create-new-password/${result}/${email}`
        let link2 = `http://localhost:3000/create-new-password/${result}/${email}`
        //send mail to users 
        await sendMail(email, link1, link2)

        const updateKey = await userCollection.updateOne({email:email}, {$set:{key:result}})

        if(updateKey){
            return res.status(200).send({ message: 'mail sent' })
        }
        return res.status(500).send({ message: 'mail not sent' })
    }

    static async ResetPassword(req,res){
        const { password } = req.body 

        const checkIfEmailExist = await userCollection.findOne({ email: req.params.email })
        if (!checkIfEmailExist) {
            return res.status(400).send({ message: "user with this email does not exist" })
        }

        const checkLink = await userCollection.findOne({email:req.params.email, key:req.params.key})
        if (!checkLink) {
            return res.status(401).send({ message: "unauthorized key" })
        }

        if (password) {
            const salt = await bcrypt.genSalt(10)
            const new_password = await bcrypt.hash(password, salt)

            await userCollection.updateOne({ email: req.params.email }, { $set: { password: new_password, key:"" } })
            return res.status(200).send({ message: 'password updated successfully' })
        } else {
            return res.status(400).send({ message: 'please no empty field' })
        }
    }

}

