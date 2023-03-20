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
Routes.post('/createtopic',AccessToken.ValidateToken,Topic.createTopic)
Routes.get('/getTopics/:role',Topic.getTopics)
Routes.get('/gettopic/:topicid',Topic.getOneTopic)
Routes.get('/getTopicCountsperuser/:user',User.totalNumberofTopicperuser)
Routes.patch('/updatestatus/:topicid',Topic.updateStatus)
Routes.delete('/deletetopic/:topicid',AccessToken.ValidateToken,Topic.deleteTopic)
Routes.get('/totalmembers',User.totalNumberofMembers)
Routes.get('/userprofile/:userid',User.userProfile)
Routes.post('/report',AccessToken.ValidateToken, Admin.ReportContent)
Routes.get('/getreports',AccessToken.ValidateToken, Admin.getAllreport)
Routes.post('/loginwithgoogle',User.LoginWithGoogle)
Routes.post('/createcategory',Topic.CreateCate)
Routes.get('/getallcategories',Topic.GetCatgories)
Routes.get('/allMembers', User.AllMembers)
Routes.patch('/makecomment',Topic.MakeComment)
Routes.get("/totaltopic",Topic.totalNumberofTopics)
Routes.patch("/update/account",AccessToken.ValidateToken, User.updateAccount)
Routes.patch("/change/password",AccessToken.ValidateToken, User.changePassword)
Routes.patch("/user/settings",AccessToken.ValidateToken, User.userSettings)
Routes.patch("/createComment",AccessToken.ValidateToken, Topic.MakeComment)
Routes.patch("/reaction",AccessToken.ValidateToken, Topic.MakeReaction)
Routes.post("/savePost",AccessToken.ValidateToken, Topic.SavePost)
Routes.get("/getsavePost",AccessToken.ValidateToken, Topic.getSavedPost)
Routes.get("/trendingTopic", Topic.getTrendingTopics)
Routes.get("/topContributors", Topic.topContributors)
Routes.get("/checkBookMark/:topicid",AccessToken.ValidateToken, Topic.checkBookMark)