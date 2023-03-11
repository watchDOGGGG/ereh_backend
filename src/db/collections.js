import mongoose from "mongoose";
const ObjectID = mongoose.Types.ObjectId

const user = mongoose.Schema({
    fullname: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    username: {
        type: String,
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER']
    },
    date: {
        type: Date,
        default: Date.now()
    },
    profileimg: {
        type: String,
    },
    phone: {
        type: String
    },
    bio: {
        type: String
    },
    lastvisit: {
        type: Date,
        default: Date.now()
    }
})

export const userCollection = mongoose.model('users', user)

const topic = mongoose.Schema({
    user: {
        type: ObjectID,
        ref: 'users'
    },
    role: {
        type: String,
        enum: ['USER', 'admin']
    },
    topic: {
        type: String,
    },
    category: {
        type: String,
    },
    description: {
        type: String,
    },
    reaction: [
        {
            user: {
                type: ObjectID,
                ref: 'users'
            },
            emojiname:{
                type: String
            }
        }
    ],

    comment: [
        {
            from: {
                type: ObjectID,
                ref: 'users'
            },
            text: {
                type: String
            },
            date:{
                type: Date,
                default: Date.now()
            },
            to: {
                type: ObjectID,
                ref: 'users'
            },
            reply: [
                {
                    from: {
                        type: ObjectID,
                        ref: 'users'
                    },
                    to: {
                        type: ObjectID,
                        ref: 'users'
                    },
                    text: {
                        type: String
                    },
                    date:{
                        type: Date,
                        default: Date.now()
                    },
                }
            ]
        }
    ],
    image: {
        type: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECT']
    },
    date: {
        type: Date,
        default: Date.now()
    },

    comment_count:{
        type:Number
    },
    reaction_count:{
        type:Number
    }

})

export const topicCollection = mongoose.model('topic', topic)


const report = mongoose.Schema({
    report: {
        type: String,
    },
    user: {
        type: ObjectID,
        ref: 'users'
    },
    date: {
        type: Date,
        default: Date.now()
    }
})
export const reportCollection = mongoose.model('report', report)


const category = mongoose.Schema({
    category: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now()
    }
})
export const categoryCollection = mongoose.model('category', category)