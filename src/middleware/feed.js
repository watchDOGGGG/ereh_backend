import { topicCollection } from "../db/collections.js";

export class Topic{

    static async checkTopic(data){
        const request = await topicCollection.findOne({_id:data}).populate({
            path:'user',
            select:''
        })
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
            comment:[],
            status: 'pending'
        })

        if(!createTopic){
            return res.status(500).send({message:'error creating topic'})
        }
        return res.status(200).send({message:'success creating topic'})
    }

    static async getTopics(req,res){
        const request = await topicCollection.find({status:'approve'})

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

   static async updateStatus(req,res){
    const {status} = req.body
    const request = await Topic.checkTopic(req.params.topicid)
    if(!request){
        return res.status(404).send({message:'this topic is not available'})
    }
    const update = await topicCollection.updateOne({_id:req.params.topicid},{$set:{status:status}})
    if(update.modifiedCount > 0){
        return res.status(200).send({message:'updated successfully'})
    }
    return res.status(500).send({message:'error updating status'})
   }

   static async deleteTopic(req,res){
    const request = await Topic.checkTopic(req.params.topicid)
    if(!request){
        return res.status(404).send({message:'topic not available'})
    }
    if(request.user !== req.user._id || req.user.role !== 'ADMIN'){
        return res.status(401).send({message:'not authorized to perform this action'})
    }
    const deleteTopic = await topicCollection.deleteOne({_id:req.params.topicid})
    if(!deleteTopic){
        return res.status(500).send({message:'error deleting topic'})
    }
    return res.status(200).send({message:'topic successfully deleted'})
   }
}