import { topicCollection, userCollection } from "../db/collections.js"
import bcrypt from 'bcrypt'
import { verify } from "jsonwebtoken"
import { AccessToken } from "./helper/jwt.js"
import { Topic } from "./feed.js"

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

        const updateLogin = await userCollection.updateOne({ email: email }, { $set: { lastvisit: new_date } })

        if (updateLogin) {
            res.status(200).send({ message: token, user: request })
            return
        }
        res.status(500).send({ message: 'error updating login info' })

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
            .populate({ path: 'user', select: '' })
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

        if (phone && email){
            await userCollection.updateOne({ _id: req.user._id }, { $set: { phone: phone, email:email } })
            return res.status(200).send({ message: 'phone and email updated' })
        }else if (phone) {
            await userCollection.updateOne({ _id: req.user._id }, { $set: { phone: phone } })
            return res.status(200).send({ message: 'phone updated' })
        }else if (email) {
            await userCollection.updateOne({ _id: req.user._id }, { $set: { email: email } })
            return res.status(200).send({ message: 'email updated' })
        }else{
            return res.status(400).send({message:'please pass email or phone to update account'})
        }
    }

    static async changePassword(req, res) {
        const { password } = req.body

        if (password){
            const salt = await bcrypt.genSalt(10)
            const new_password = await bcrypt.hash(password, salt) 

            await userCollection.updateOne({ _id: req.user._id }, { $set: { password:new_password } })
            return res.status(200).send({ message: 'password updated successfully' })
        }else{
            return res.status(400).send({message:'please no empty field'})
        }
    }

}

