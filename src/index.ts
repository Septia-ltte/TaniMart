import "dotenv/config";

import express from "express";
import authRouter from './routes/auth/auth.route';
import postsRouter from './routes/posts/posts.route';
import farmerRouter from './routes/farmer/farmer.route';
import usersRouter from './routes/users/users.route';
import categoriesRouter from './routes/categories/categories.route'



const app = express();
const PORT = 5000;

app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/farmer', farmerRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/posts', postsRouter);
app.use("/api/v1/categories", categoriesRouter);

app.get("/", (req, res) => {
    res.send("hello ges");
});

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
})