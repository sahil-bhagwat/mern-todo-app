import e from "express";
import { collectionName, connection } from "./dbconfig.js";
import cors from "cors";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";

dotenv.config(); // MUST be here or in index.js

const app = e();
const port=process.env.PORT;

app.use(e.json());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(cookieParser());

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            msg: "Email and password are required",
        });
    }

    const db = await connection();
    const collection = db.collection("users");

    // ^ Finding user by email only
    const user = await collection.findOne({ email });

    if (!user) {
        return res.status(401).json({
            success: false,
            msg: "Invalid email or password",
        });
    }

    // ^ Comparing hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            msg: "Invalid email or password",
        });
    }

    // !  Generating JWT (SAFE PAYLOAD)
    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "5d" }
    );

    // ^ Serializing response
    res.status(200).json({
        success: true,
        msg: "Login successful",
        token,
        user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
        },
    });
});

app.post("/signup", async (req, res) => {
    // ^ getting frontend data
    const { email, password, name } = req.body; `` // ? already deserialized JSON

    // ^ checking if email and password is not null
    if (!email || !password || !name) {
        return res.send({
            success: false,
            msg: "Email and password are required",
        });
    }
    // at async connection (file:///C:/Users/theco/Music/Documents/todoMERNapp/mern-todo-2025-1/mern-todo-2025/backend/dbconfig.js:18:21)
    // ^ calling
    const db = await connection();
    const collection = db.collection("users");

    // ^ Checkin if user already exists
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
        return res.send({
            success: false,
            msg: "User already exists",
        });
    }

    // ! Create new user with hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await collection.insertOne({
        email,
        password: hashedPassword,
        name,
    });


    // // 🔐 Create token
    // jwt.sign(
    //     { email, id: result.insertedId },
    //     process.env.JWT_SECRET,
    //     { expiresIn: "5d" },
    //     (error, token) => {
    //         if (error) {
    //             return res.send({
    //                 success: false,
    //                 msg: "Token generation failed",
    //             });
    //         }

    res.status(201).json({
        // id: result.insertedId.toString(),
        success: true,
        msg: "Signup successful",
        // token,
        // email,
        // name,
    });
    //     }
    // );
});

app.post("/add-task", verifyJWTToken, async (req, resp) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const result = await collection.insertOne(req.body);
    if (result) {
        resp.send({ message: "new task added", success: true, result });
    } else {
        resp.send({ message: " task not added", success: false });
    }
});

app.get("/tasks", verifyJWTToken, async (req, resp) => {
    const db = await connection();

    const collection = await db.collection(collectionName);
    const result = await collection.find().toArray();
    if (result) {
        resp.send({ message: "task list fetched", success: true, result });
    } else {
        resp.send({ message: "error try after sometime", success: false });
    }
});


app.get("/task/:id", verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = db.collection(collectionName);

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send({
            success: false,
            message: "Invalid task id",
        });
    }

    const task = await collection.findOne({
        _id: new ObjectId(id),
    });

    if (!task) {
        return res.status(404).send({
            success: false,
            message: "Task not found",
        });
    }

    res.send({
        success: true,
        result: task,
    });
});



app.put("/update-task/:id", verifyJWTToken, async (req, resp) => {
    const db = await connection();
    const collection = await db.collection(collectionName);

    const { id } = req.params;

    const { title, description } = req.body; // whitelist

    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { title, description } }
    );

    if (result.matchedCount === 0) {
        return resp.status(404).send({ success: false, message: "Task not found" });
    }

    resp.send({ success: true, message: "Task updated" });
});


app.delete("/delete/:id", verifyJWTToken, async (req, resp) => {
    const db = await connection();
    const id = req.params.id;
    const collection = await db.collection(collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result) {
        resp.send({ message: "task deleted ", success: true, result });
    } else {
        resp.send({ message: "error try after sometime", success: false });
    }
});

app.delete("/delete-multiple", verifyJWTToken, async (req, resp) => {
    const db = await connection();
    const Ids = req.body;
    const deleteTaskIds = Ids.map((item) => new ObjectId(item));
    console.log(Ids);

    const collection = await db.collection(collectionName);
    const result = await collection.deleteMany({ _id: { $in: deleteTaskIds } });
    if (result) {
        resp.send({ message: "task deleted ", success: result });
    } else {
        resp.send({ message: "error try after sometime", success: false });
    }
});
app.put("/update-profile", verifyJWTToken, async (req, res) => {
    const { name, password } = req.body;

    if (!name && !password) {
        return res.status(400).json({
            success: false,
            msg: "Nothing to update",
        });
    }

    const db = await connection();
    const collection = db.collection("users");

    const updateFields = {};

    if (name) updateFields.name = name;

    if (password) {
        updateFields.password = await bcrypt.hash(password, 10);
    }

    const result = await collection.updateOne(
        { _id: new ObjectId(req.user.id) },
        { $set: updateFields }
    );

    res.json({
        success: true,
        msg: "Profile updated successfully",
    });
});

function verifyJWTToken(req, res, next) {
    const token = req.cookies["token"];

    if (!token) {
        return res.status(401).json({ success: false, msg: "No token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).json({ success: false, msg: "Invalid token" });
        }

        req.user = decoded;
        next();
    });
}


app.listen(port, () => {
    console.log("Server running on port 3200");
});
