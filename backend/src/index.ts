import express from 'express';
import {env} from './services/env';
import connectDB from './services/dbConnection';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route';
import messageRoute from './routes/message.route';
const app = express();
const PORT=env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",userRouter);
app.use('/api/messages',messageRoute);
app.get('/', (req, res) => {
  res.send('Hello from TypeScript Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});


