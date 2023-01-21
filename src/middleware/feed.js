import { topicCollection } from "../db/collections.js";

export class Topic{

    static async checkTopic(data){
        const request = await topicCollection.findOne({_id:data})
        if(!request){
            return false
        }
        return request
    }

    static async UserTopicCount(user){
        const request = await topicCollection.find({user:user}).countDocuments()
        if(!request){
            return false
        }
        return request
    }

    static async createTopic(req,res){

        const {topic, description, category} = req.body
        const path = `${process.env.LocalURL}/files/upload/${req.file.filename}`;

        const createTopic = await topicCollection.create({
            user:req.user._id,
            topic:topic,
            description: description,
            category: category,
            file:path,
            reaction:[],
            comment:[]
        })

        if(!createTopic){
            return res.status(500).send({message:'error creating topic'})
        }
        return res.status(200).send({message:'success creating topic'})
    }

    static async getTopics(req,res){
        const request = await topicCollection.find()

        if(request.length < 1){
            return res.status(200).send({message:'no post available yet'})
        }
        return res.status(200).send({message:request})
    }

   static async getOneTopic(req,res) {
        const request = await Topic.checkTopic(req.params.topicid)
        if(!request) {
            return res.status(404).send({message:`this topic isn't available yet`})
        }
        return res.status(200).send({message:request})
   }
}