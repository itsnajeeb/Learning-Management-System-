import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import CourseRouters from './routes/course.router.js';
import errorMiddleware from './middleware/error.middleware.js';
config()


const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,

}));



app.use(morgan('dev'));
app.use('/ping', (req, res) => {
    res.send('/Pong')
})



//routes of 3 module
app.use('/api/v1/user/', userRoutes)
app.use('/api/v1/courses/',CourseRouters)


app.use((req, res) => {
    res.status(404).send('OOPS ! 404 page not found');
});

app.use(errorMiddleware)

export default app;