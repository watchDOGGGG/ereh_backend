import { categoryCollection, topicCollection } from "../db/collections.js";

export class Topic {

    static async checkTopic(data) {
        const request = await topicCollection.findOne({ _id: data }).populate({
            path: 'user',
            select: '-password -lastvisit'
        })
        if (!request) {
            return false
        }
        return request
    }

    static async UserTopicCount(user) {
        const request = await topicCollection.find({ user: user }).countDocuments()
        if (!request) {
            return false
        }
        return request
    }

    static async createTopic(req, res) {

        const { topic, description, category, path } = req.body
        
        const createTopic = await topicCollection.create({
            user: req.user._id,
            topic: topic,
            description: description,
            category: category,
            image:path,
            reaction: [],
            comment: [],
            status: 'PENDING'
        })

        if (!createTopic) {
            return res.status(500).send({ message: 'error creating topic' })
        }
        return res.status(200).send({ message: 'success creating topic' })
    }

    static async getTopics(req, res) {
        if (req.params.role === 'admin') {
            const request = await topicCollection.find().populate({path:'user', select:"-password"})

            if (request.length < 1) {
                return res.status(200).send({ message: 'no post available yet' })
            }
            return res.status(200).send({ message: request })
        }

        const request = await topicCollection.find({ status: 'APPROVED' }).populate({path:'user', select:"-password"})

        if (request.length < 1) {
            return res.status(200).send({ message: 'no post available yet' })
        }
        return res.status(200).send({ message: request })
    }

    static async getOneTopic(req, res) {
        const request = await Topic.checkTopic(req.params.topicid)
        if (!request) {
            return res.status(404).send({ message: `this topic isn't available yet` })
        }
        return res.status(200).send({ message: request })
    }

    static async updateStatus(req, res) {
        const { status } = req.body
        const request = await Topic.checkTopic(req.params.topicid)
        if (!request) {
            return res.status(404).send({ message: 'this topic is not available' })
        }
        const update = await topicCollection.updateOne({ _id: req.params.topicid }, { $set: { status: status } })
        if (update.modifiedCount > 0) {
            return res.status(200).send({ message: 'updated successfully' })
        }
        return res.status(500).send({ message: 'error updating status' })
    }

    static async deleteTopic(req, res) {
        const request = await Topic.checkTopic(req.params.topicid)
        if (!request) {
            return res.status(404).send({ message: 'topic not available' })
        }
        if (req.user.role !== 'admin') {
            return res.status(401).send({ message: 'not authorized to perform this action' })
        }
        const deleteTopic = await topicCollection.deleteOne({ _id: req.params.topicid })
        if (!deleteTopic) {
            return res.status(500).send({ message: 'error deleting topic' })
        }
        return res.status(200).send({ message: 'topic successfully deleted' })
    }

    static async CreateCate(req, res) {
        const { category } = req.body
        const request = await categoryCollection.findOne({ category: category })
        if (request) {
            return res.status(400).send({ messgae: 'category already exists' })
        }
        const create = await categoryCollection.create({ category: category })
        if (!create) {
            return res.status(500).send({ messgae: 'error adding category' })
        }
        return res.status(200).send({ messgae: 'success adding category' })
    }

    static async GetCatgories(req, res) {
        const request = await categoryCollection.find()
        if (request) {
            return res.status(200).send({ messgae: request })
        }

    }

    static async MakeComment(req, res) {
        const { user, text, topicId } = req.body
    }

    static async totalNumberofTopics(req, res) {
        const topics = await topicCollection.find().countDocuments()
        return res.status(200).send({ message: topics })
    }

}