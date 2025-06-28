import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "../config/db";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running!");
});

const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
});
