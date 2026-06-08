const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log("➡️", req.method, req.originalUrl);
  next();
});

// Para servir imágenes/logos locales en el futuro
app.use("/static", express.static(path.join(__dirname, "public")));

function readJson(relativePath) {
  const filePath = path.join(__dirname, relativePath);
  const rawData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(rawData);
}

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "RCN Mock Backend is running"
  });
});

app.get("/api/v1/app/init/", (req, res) => {
  const data = readJson("data/app_init.json");
  res.json(data);
});

app.get("/api/v1/app/version/ios/", (req, res) => {
  const data = readJson("data/version_ios.json");
  res.json(data);
});

app.get("/api/v1/app/breaking-alert/", (req, res) => {
  const data = readJson("data/breaking_alert.json");
  res.json(data);
});

app.get("/api/v1/app/services/notifications/topics/", (req, res) => {
  const data = readJson("data/topics.json");
  res.json(data);
});

app.get("/api/v1/app/pages/home", (req, res) => {
  const identifier = req.query.identifier;

  if (!identifier) {
    return res.status(400).json({
      error: "Missing identifier query parameter"
    });
  }

  try {
    const data = readJson(`data/home_components/${identifier}.json`);
    res.json(data);
  } catch (error) {
    console.error("❌ Component not found:", identifier);

    res.status(404).json({
      error: "Component not found",
      identifier
    });
  }
});

app.get("/api/v1/app/news/by-section", (req, res) => {
  const storyId = req.query.story_id;

  const ids = ["rcn-001", "rcn-002", "rcn-003"];

  if (storyId && ids.includes(storyId)) {
    const orderedIds = [
      storyId,
      ...ids.filter(id => id !== storyId)
    ];

    return res.json(orderedIds);
  }

  res.json(ids);
});

app.get("/api/v1/app/news/by-id", (req, res) => {
  const rawId = req.query.id_or_url || req.query.id;

  if (!rawId) {
    return res.status(400).json({
      error: "Missing id_or_url query parameter"
    });
  }

  let id = String(rawId);

  // Si llega una URL completa o una ruta:
  // /colombia/noticia-rcn-001/rcn-001/story/
  // extraemos el id rcn-001
  const match = id.match(/rcn-\d+/);

  if (match) {
    id = match[0];
  }

  try {
    const data = readJson(`data/news/${id}.json`);
    res.json(data);
  } catch (error) {
    console.error("❌ News not found:", rawId, "=> parsed:", id);

    res.status(404).json({
      error: "News not found",
      rawId,
      parsedId: id
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`RCN Mock Backend running on port ${PORT}`);
});