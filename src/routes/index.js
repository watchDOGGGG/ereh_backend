import express from 'express';
import { upload } from '../../upload/index.js';
import { Topic } from '../middleware/feed.js';
import { AccessToken } from '../middleware/helper/jwt.js';
import { User } from '../middleware/user.js';


export const Routes = express.Router()
Routes.post('/registerUser',User.RegisterUser)
Routes.post('/login',User.Login)
Routes.get('/getuser/:user',AccessToken.ValidateToken,User.getuser)
Routes.post('/createtopic',AccessToken.ValidateToken,upload.single('image'),Topic.createTopic)
Routes.get('/getTopics',Topic.getTopics)
Routes.get('/gettopic/:topicid',Topic.getOneTopic)
Routes.get('/getTopicCountsperuser/:user',User.totalNumberofTopicperuser)