
import mongoose from 'mongoose';

export const Db_connection = () => {
    try {
        mongoose.set("strictQuery", false);
        mongoose.connect(process.env.DB_Dev_URL, {})
        mongoose.connection.on("error", err => {
            console.log("err", err)
        })
        mongoose.connection.on("connected", (err, res) => {
            console.log("Connection establish")
        })
    } catch (error) {
      throw new Error(error)
    }
}
