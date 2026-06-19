import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || "ideavault-development-secret";
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5500")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017", {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true
  }
});

let db;
let users;
let ideas;
let comments;
let bookmarks;

function toObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    res.status(401).json({ message: "Unauthorized access." });
    return;
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

function cleanUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function ideaPayload(body, owner = {}) {
  return {
    title: String(body.title || "").trim(),
    shortDescription: String(body.shortDescription || "").trim(),
    detailedDescription: String(body.detailedDescription || "").trim(),
    category: String(body.category || "").trim(),
    tags: Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    image: String(body.image || body.imageURL || "").trim(),
    budget: body.budget ? Number(body.budget) : "",
    targetAudience: String(body.targetAudience || "").trim(),
    problemStatement: String(body.problemStatement || "").trim(),
    proposedSolution: String(body.proposedSolution || "").trim(),
    ...owner
  };
}

function validateIdea(payload) {
  const required = [
    "title",
    "shortDescription",
    "detailedDescription",
    "category",
    "image",
    "targetAudience",
    "problemStatement",
    "proposedSolution"
  ];
  return required.every((key) => payload[key]);
}

app.get("/", (req, res) => {
  res.json({
    name: "IdeaVault API",
    status: "running",
    routes: ["/health", "/auth/login", "/auth/register", "/ideas", "/comments"]
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "ideavault-server", time: new Date().toISOString() });
});

app.post("/auth/register", async (req, res) => {
  const { name, email, photo, password } = req.body;
  const normalizedEmail = String(email || "").toLowerCase().trim();

  if (!name || !normalizedEmail || !photo || !password) {
    res.status(400).json({ message: "Name, email, photo, and password are required." });
    return;
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(password)) {
    res.status(400).json({ message: "Password must include uppercase, lowercase, and 6 characters." });
    return;
  }

  const exists = await users.findOne({ email: normalizedEmail });
  if (exists) {
    res.status(409).json({ message: "Email already exists." });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await users.insertOne({
    name: String(name).trim(),
    email: normalizedEmail,
    photo: String(photo).trim(),
    password: hashedPassword,
    createdAt: new Date()
  });
  const user = await users.findOne({ _id: result.insertedId });

  res.status(201).json({ user: cleanUser(user), token: createToken(user) });
});

app.post("/auth/login", async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const password = String(req.body.password || "");
  const user = await users.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid email or password." });
    return;
  }

  res.json({ user: cleanUser(user), token: createToken(user) });
});

app.post("/auth/google", async (req, res) => {
  const email = String(req.body.email || "google.user@ideavault.dev").toLowerCase().trim();
  const name = String(req.body.name || "Google Founder").trim();
  const photo = String(req.body.photo || "").trim();

  let user = await users.findOne({ email });
  if (!user) {
    const result = await users.insertOne({
      name,
      email,
      photo,
      password: await bcrypt.hash(`google-${email}`, 10),
      provider: "google",
      createdAt: new Date()
    });
    user = await users.findOne({ _id: result.insertedId });
  }

  res.json({ user: cleanUser(user), token: createToken(user) });
});

app.get("/users/me", verifyToken, async (req, res) => {
  const id = toObjectId(req.user.id);
  const user = id ? await users.findOne({ _id: id }) : null;
  res.json({ user: cleanUser(user) });
});

app.patch("/users/me", verifyToken, async (req, res) => {
  const id = toObjectId(req.user.id);
  const update = {
    name: String(req.body.name || "").trim(),
    photo: String(req.body.photo || "").trim()
  };

  if (!id || !update.name || !update.photo) {
    res.status(400).json({ message: "Name and photo are required." });
    return;
  }

  await users.updateOne({ _id: id }, { $set: update });
  await ideas.updateMany({ ownerId: req.user.id }, { $set: { ownerName: update.name } });
  await comments.updateMany({ userId: req.user.id }, { $set: { userName: update.name } });
  const user = await users.findOne({ _id: id });
  res.json({ user: cleanUser(user) });
});

app.get("/ideas", async (req, res) => {
  const query = {};
  const search = String(req.query.search || "").trim();
  const category = String(req.query.category || "").trim();
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = Math.min(Number(req.query.limit || 0), 50);

  if (search) query.title = { $regex: search, $options: "i" };
  if (category) query.category = category;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = from;
    if (to) query.createdAt.$lte = to;
  }

  let cursor = ideas.find(query).sort({ createdAt: -1 });
  if (limit) cursor = cursor.limit(limit);
  res.json(await cursor.toArray());
});

app.get("/ideas/trending", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 6), 20);
  const list = await ideas
    .aggregate([
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "ideaObjectId",
          as: "commentDocs"
        }
      },
      {
        $addFields: {
          commentCount: { $size: "$commentDocs" },
          trendScore: { $add: [{ $multiply: ["$likes", 2] }, { $multiply: [{ $size: "$commentDocs" }, 5] }] }
        }
      },
      { $sort: { trendScore: -1, createdAt: -1 } },
      { $limit: limit },
      { $project: { commentDocs: 0 } }
    ])
    .toArray();

  res.json(list);
});

app.get("/ideas/:id", async (req, res) => {
  const id = toObjectId(req.params.id);
  const idea = id ? await ideas.findOne({ _id: id }) : null;
  if (!idea) {
    res.status(404).json({ message: "Idea not found." });
    return;
  }
  res.json(idea);
});

app.post("/ideas", verifyToken, async (req, res) => {
  const payload = ideaPayload(req.body, {
    ownerId: req.user.id,
    ownerName: req.user.name,
    likes: 0,
    createdAt: new Date()
  });

  if (!validateIdea(payload)) {
    res.status(400).json({ message: "Please provide all required idea fields." });
    return;
  }

  const result = await ideas.insertOne(payload);
  res.status(201).json(await ideas.findOne({ _id: result.insertedId }));
});

app.patch("/ideas/:id", verifyToken, async (req, res) => {
  const id = toObjectId(req.params.id);
  const payload = ideaPayload(req.body);

  if (!id || !validateIdea(payload)) {
    res.status(400).json({ message: "Invalid idea payload." });
    return;
  }

  const result = await ideas.updateOne({ _id: id, ownerId: req.user.id }, { $set: payload });
  if (!result.matchedCount) {
    res.status(403).json({ message: "You can only update your own ideas." });
    return;
  }

  res.json(await ideas.findOne({ _id: id }));
});

app.delete("/ideas/:id", verifyToken, async (req, res) => {
  const id = toObjectId(req.params.id);
  if (!id) {
    res.status(400).json({ message: "Invalid idea id." });
    return;
  }

  const result = await ideas.deleteOne({ _id: id, ownerId: req.user.id });
  if (!result.deletedCount) {
    res.status(403).json({ message: "You can only delete your own ideas." });
    return;
  }

  await comments.deleteMany({ ideaId: req.params.id });
  await bookmarks.deleteMany({ ideaId: req.params.id });
  res.json({ deleted: true });
});

app.get("/my/ideas", verifyToken, async (req, res) => {
  res.json(await ideas.find({ ownerId: req.user.id }).sort({ createdAt: -1 }).toArray());
});

app.get("/my/interactions", verifyToken, async (req, res) => {
  const list = await comments.find({ userId: req.user.id }).sort({ createdAt: -1 }).toArray();
  res.json(list);
});

app.get("/comments/:ideaId", verifyToken, async (req, res) => {
  res.json(await comments.find({ ideaId: req.params.ideaId }).sort({ createdAt: -1 }).toArray());
});

app.post("/comments/:ideaId", verifyToken, async (req, res) => {
  const text = String(req.body.text || "").trim();
  const ideaObjectId = toObjectId(req.params.ideaId);

  if (!text || !ideaObjectId) {
    res.status(400).json({ message: "Comment text and idea id are required." });
    return;
  }

  const idea = await ideas.findOne({ _id: ideaObjectId });
  if (!idea) {
    res.status(404).json({ message: "Idea not found." });
    return;
  }

  const result = await comments.insertOne({
    ideaId: req.params.ideaId,
    ideaObjectId,
    userId: req.user.id,
    userName: req.user.name,
    text,
    createdAt: new Date()
  });
  res.status(201).json(await comments.findOne({ _id: result.insertedId }));
});

app.patch("/comments/:id", verifyToken, async (req, res) => {
  const id = toObjectId(req.params.id);
  const text = String(req.body.text || "").trim();

  if (!id || !text) {
    res.status(400).json({ message: "Comment text is required." });
    return;
  }

  const result = await comments.updateOne(
    { _id: id, userId: req.user.id },
    { $set: { text, createdAt: new Date() } }
  );

  if (!result.matchedCount) {
    res.status(403).json({ message: "You can only edit your own comments." });
    return;
  }

  res.json(await comments.findOne({ _id: id }));
});

app.delete("/comments/:id", verifyToken, async (req, res) => {
  const id = toObjectId(req.params.id);
  const result = id ? await comments.deleteOne({ _id: id, userId: req.user.id }) : { deletedCount: 0 };

  if (!result.deletedCount) {
    res.status(403).json({ message: "You can only delete your own comments." });
    return;
  }

  res.json({ deleted: true });
});

app.post("/bookmarks/:ideaId", verifyToken, async (req, res) => {
  const existing = await bookmarks.findOne({ ideaId: req.params.ideaId, userId: req.user.id });
  if (existing) {
    await bookmarks.deleteOne({ _id: existing._id });
    res.json({ bookmarked: false });
    return;
  }

  await bookmarks.insertOne({ ideaId: req.params.ideaId, userId: req.user.id, createdAt: new Date() });
  res.status(201).json({ bookmarked: true });
});

app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

async function start() {
  await client.connect();
  db = client.db(process.env.DB_NAME || "ideavault");
  users = db.collection("users");
  ideas = db.collection("ideas");
  comments = db.collection("comments");
  bookmarks = db.collection("bookmarks");

  await users.createIndex({ email: 1 }, { unique: true });
  await ideas.createIndex({ title: "text", category: 1, createdAt: -1 });
  await comments.createIndex({ ideaId: 1, createdAt: -1 });

  app.listen(port, () => {
    console.log(`IdeaVault API running on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start IdeaVault API", error);
  process.exit(1);
});
