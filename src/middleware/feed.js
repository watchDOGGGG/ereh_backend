import { categoryCollection, SaveCollection, topicCollection } from "../db/collections.js";

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

    static async searchTopic(req, res) {
        const search = req.query.search;
        const request = await topicCollection.find({
            $or: [ {topic: { 
                $regex: search, 
                $options: "i" 
            }},
            {category: {
                $regex: search, 
                $options: "i" 
            }},
            {description: {
                $regex: search, 
                $options: "i" 
            }}
        ]}).populate({
            path: 'user comment.from comment.to comment.reply.from comment.reply.to', select: "-password",
            model: 'users'
        });
        return res.status(200).send({ message: request })
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
            image: path,
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
            const request = await topicCollection.find().populate({
                path: 'user comment.from comment.to comment.reply.from comment.reply.to', select: "-password",
                model: 'users'
            }).sort({ "comment.date": -1, date: -1 });

            if (request.length < 1) {
                return res.status(200).send({ message: 'no post available yet' })
            }
            return res.status(200).send({ message: request })
        }

        const request = await topicCollection.find({ status: 'APPROVED' }).populate({
            path: 'user comment.from comment.to comment.reply.from comment.reply.to',
            model: 'users',
            select: "-password"
        }).sort({ "comment.date": -1, date: -1 });

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
        if (status == 'REJECT') {
            const deleteTopic = await topicCollection.deleteOne({ _id: req.params.topicid })
            if (deleteTopic) {
                return res.status(200).send({ message: 'updated successfully' })
            }
            return res.status(500).send({ message: 'error updating status' })
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
        const { comment_userto, text, topicId, type, comment_id } = req.body

        if (type == 'reply') {
            if (!comment_userto) {
                return res.status(400).send({ message: 'add a user your making the reply to' })
            }

            const CreateComment = await topicCollection.updateOne({ _id: topicId, 'comment._id': comment_id },
                { $push: { 'comment.$.reply': { from: req.user._id, to: comment_userto, text: text } } })
            await topicCollection.updateOne({ _id: topicId },
                { $inc: { comment_count: 1 } })
            const updatedComment = await topicCollection.findOne({
                _id: topicId, 'comment._id': comment_id
            })
            if (!CreateComment) {
                return res.status(500).send({ message: 'error creating comment' })
            }
            return res.status(201).send({ message: 'reply created', comment: updatedComment })
        }

        if (!comment_userto) {
            return res.status(400).send({ message: 'add a user your making the comment to' })
        }

        const CreateComment = await topicCollection.updateOne({ _id: topicId },
            { $push: { comment: { from: req.user._id, to: comment_userto, text: text } } })
        await topicCollection.updateOne({ _id: topicId },
            { $inc: { comment_count: 1 } })

        if (!CreateComment) {
            return res.status(500).send({ message: 'error creating comment' })
        }
        const updatedComment = await topicCollection.findOne({
            _id: topicId
        })
        return res.status(201).send({ message: updatedComment })
    }

    static async MakeReaction(req, res) {
        const { topicId, emojiname } = req.body

        //check if user has already liked
        const checkReaction = await topicCollection.findOne(
            { _id: topicId, reaction: { $elemMatch: { user: req.user._id } } }
        )
        if (checkReaction) {
            const removeReaction = await topicCollection.updateOne({ _id: topicId }, { $pull: { reaction: { user: req.user._id } } })
            await topicCollection.updateOne({ _id: topicId },
                { $inc: { reaction_count: 1 } })
            if (!removeReaction) {
                return res.status(500).send({ message: 'error reaction' })
            }
            return res.status(200).send({ message: 'reacted' })
        }

        const addReaction = await topicCollection.updateOne({ _id: topicId }, { $addToSet: { reaction: { user: req.user._id, emojiname: emojiname } } })
        await topicCollection.updateOne({ _id: topicId },
            { $inc: { reaction_count: 1 } })
        if (!addReaction) {
            return res.status(500).send({ message: 'error reaction' })
        }
        return res.status(200).send({ message: 'reacted' })
    }

    static async totalNumberofTopics(req, res) {
        const topics = await topicCollection.find().countDocuments()
        return res.status(200).send({ message: topics })
    }

    static async SavePost(req, res) {
        const { topicId } = req.body

        const checkUserSave = await SaveCollection.findOne({ user: req.user._id, topicId: topicId })
        if (!checkUserSave) {
            const createSave = await SaveCollection.create({
                user: req.user._id,
                topicId: topicId
            })

            if (!createSave) {
                return res.status(500).send({ message: "error saving post" })
            }
            return res.status(200).send({ message: "saved" })
        }
        const deletePost = await SaveCollection.deleteOne({ user: req.user._id, topicId: topicId })
        if (deletePost) {
            return res.status(200).send({ message: "unsave" })
        }

    }

    static async getSavedPost(req, res) {
        const checkUserSave = await SaveCollection.find({ user: req.user._id })
        .populate({
            path: 'user',
            model: 'users',
            select: '-password',
        })
            .populate({
                path: 'topicId',
                model: 'topic',
                select: '-password',
                populate: [
                    { path: 'user', model: 'users', select: '-password' },
                    { path: 'comment.from', model: 'users', select: '-password' },
                    { path: 'comment.to', model: 'users', select: '-password' },
                    { path: 'comment.reply.from', model: 'users', select: '-password' },
                    { path: 'comment.reply.to', model: 'users', select: '-password' },
                ]
            })
            .sort({ "comment.date": -1, date: -1 });
        if (!checkUserSave) {

            return res.status(204).send({ message: "error saving post" })

        }
        return res.status(200).send({ message: checkUserSave })
    }

    static async getTrendingTopics(req, res) {
        const FindMax = await topicCollection.find({
            $and: [{ comment_count: { $gt: 0 } }],
        })
            .sort({ engagement: -1 })
            .limit(100)
            .populate({
                path: 'user comment.from comment.to comment.reply.from comment.reply.to', select: "-password",
                model: 'users'
            }).sort({ "comment.date": -1, date: -1 });

        return res.status(200).send({ message: FindMax });
    }

    static async topContributors(req, res) {
        const getContributors = await topicCollection.aggregate([
            { $group: { _id: "$user", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $project: { _id: "$user._id", name: "$user.fullname", email: "$user.email", profileimg: "$user.profileimg", count: 1 } }
        ]).exec();

        if (!getContributors) {
            return res.status(500).send({ message: "Can't get contributors" });
        }
        getContributors.sort((a, b) => b.count - a.count);

        return res.status(200).send({ message: getContributors });

    }

    static async checkBookMark(req, res) {
        try {
            const checkBookMark = await SaveCollection.findOne({ topicId: req.params.topicid, user: req.user._id })
            if (!checkBookMark) {
                return res.status(200).send({ message: false })
            }
            return res.status(200).send({ message: true })
        } catch (error) {
            return res.status(500).send({ message: error })
        }
    }
}


