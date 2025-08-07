import mongoose from 'mongoose';

mongoose.set('strictQuery', false)
const MONGODBURL=process.env.MONGO_URL || `mongodb://localhost:27017/LMS_DB`

const connectToDB = async () => {
    try {
        const { connection } = await mongoose.connect(MONGODBURL)
        if (connection) {
            console.log(`Connected to MongoDb : ${connection.host} :- ${MONGODBURL} `);
        }
    }
    catch (e) {
        console.log(e);
        process.exit(1)
    }
}
export default connectToDB