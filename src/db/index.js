
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
            mongoose.set('debug', (collectionName, method, query) => {
				console.log({ 
                    'type': 'mongo', 
                    'msg': `${collectionName}.${method}(` + JSON.stringify(query) + ')' 
                });
			});
        })
    } catch (error) {
      throw new Error(error)
    }
}
