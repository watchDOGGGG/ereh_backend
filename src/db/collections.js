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
    },
    role:{
        type: String,
        enum:['ADMIN','USER']
    },
    date:{
        type: Date,
        default:Date.now()
    },
    profile:{
        type: String,
    },

    lastvisit:{
        type: Date,
        default:Date.now()
    }
})

export const userCollection = mongoose.model('users',user)

const topic  = mongoose.Schema({
    user:{
        type: ObjectID,
        ref:'users'
    },
    role:{
        type:String,
        enum: ['USER', 'ROLE']
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
    },
    status:{
        type:String,
        enum:['pending','approve','reject']
    },
    date:{
        type: Date,
        default:Date.now()
    },
   

})

export const topicCollection = mongoose.model('topic',topic)


const report = mongoose.Schema({
    report:{
        type:String,
    },
    user:{
        type:ObjectID,
        ref:'users'
    },
    date:{
        type: Date,
        default:Date.now()
    }
})
export const reportCollection = mongoose.model('report',report)