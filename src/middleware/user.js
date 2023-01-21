import { userCollection } from "../db/collections.js"
import bcrypt from 'bcrypt'
import { verify } from "jsonwebtoken"
import { AccessToken } from "./helper/jwt.js"
import { Topic } from "./feed.js"

export class User{

    static async checkUser(data){
        const user = await userCollection.findOne({$or:[{id:data},{username:data},{email:data}]})
        if(!user){
            return false
        }
        return user
    }

    static async getuser(req,res){
        const request = await User.checkUser(req.params.user)
        if(request === false){
            return res.status(400).send({message: 'user not found'})
        }
        return res.status(200).send({message:request})
    }

    static async RegisterUser (req, res) {
        const {fullname, username, email, password} = req.body

        const salt = await bcrypt.genSalt(10)
        const new_password = await bcrypt.hash(password, salt)

        const request = await User.checkUser(email)

        if(request !== false){
            return res.status(400).send({ message:'user with this email or username already exist'})
        }

        const createuser = await userCollection.create({
            fullname: fullname,
            email:email,
            username: username,
            password: new_password
        })

        if(!createuser){
            return res.status(500).send({message:'error creating user'})
        }
        return res.status(200).send({message:'user created successfully'})
    }

    static async Login (req, res) {
        const {email, password} = req.body
        const request = await User.checkUser(email)
        if(!request){
            return res.status(404).send({message:"user not found"})
        }
        const verify_password = await bcrypt.compare(password, request.password)
        if (!verify_password){
            return res.status(401).send({message:"incorrect password"})
        }
        const token = AccessToken.GenerateToken(request)
        res.status(200).send({message:token,user:request})
        return
        
    }

    static async totalNumberofTopicperuser(req,res){
        const request = await Topic.UserTopicCount(req.params.user)
        if(!request){
            return res.status(500).send({message:'error geting count of user topic'})
        }
        return res.status(200).send({message:request})
    }
}