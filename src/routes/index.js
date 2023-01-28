import express from 'express';
import { upload } from '../../upload/index.js';
import { Admin } from '../middleware/admin.js';
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
Routes.patch('/updatestatus/:topicid',Topic.updateStatus)
Routes.delete('/deletetopic/:topicid',AccessToken.ValidateToken,Topic.deleteTopic)
Routes.get('/totalmembers',User.totalNumberofMembers)
Routes.get('/userprofile/:user',User.userProfile)
Routes.post('/report',AccessToken.ValidateToken, Admin.ReportContent)
Routes.get('/getreports',AccessToken.ValidateToken, Admin.getAllreport)