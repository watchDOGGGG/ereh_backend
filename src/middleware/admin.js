import { reportCollection } from "../db/collections.js"

export class Admin{
    static async ReportContent(req,res){
        const {report} = req.body

        const reportCnt = await reportCollection.create({
            report:report,
            user:req.user._id
        })

        if(!reportCnt){
            return res.status(500).send({message:'there was a problem sending report'})
        }

        return res.status(200).send({message:'report sent successfully'})
    }

    static async getAllreport(req,res){
        const request = await reportCollection.find()
        if(request.length < 1){
            return res.status(200).send({message:'no report at the moment'})
        }
        return res.status(200).send({message:request})
    }
}