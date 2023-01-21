import mongoose from "mongoose";
const ObjectID = mongoose.Types.ObjectId

const user = mongoose.Schema({
    fullname:{
        type: String,
        require:true
    },
    email:{
        type: String,
        require:true
    },
    password:{
        type: String,
        require:true
    },
    username:{
        type: String,
        require:true
    }
})

export const userCollection = mongoose.model('users',user)

const topic  = mongoose.Schema({
    user:{
        type: ObjectID,
        ref:'users'
    },
    topic:{
        type: String,
    },
    category:{
        type: String,
    },
    description: {
        type: String,
    },
    reaction:[
        {
            user:{
                type: ObjectID,
                ref:'users'
            }
        }
    ],

    comment:[
        {
            user:{
                type: ObjectID,
                ref:'users' 
            },
            text:{
                text:String
            },
        }
    ],
    file:{
        type:String
    }

})

export const topicCollection = mongoose.model('topic',topic)