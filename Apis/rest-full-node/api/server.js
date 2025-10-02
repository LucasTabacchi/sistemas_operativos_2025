import express from "express";
import morgan from "morgan";
import cors from "cors";
import createError from "http-errors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/* =======================
   SQLite (persistencia)
   ======================= */
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "inventory.db");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let db;
async function initDb() {
  db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS inventory(
      product_id TEXT PRIMARY KEY,
      qty INTEGER NOT NULL CHECK(qty >= 0)
    );
  `);
  // seed si está vacío
  const row = await db.get("SELECT COUNT(*) as c FROM inventory");
  if (row.c === 0) {
    await db.run(
      "INSERT INTO inventory(product_id, qty) VALUES (?,?),(?,?)",
      "P001", 100, "P002", 50
    );
  }
}

/* =======================
   Swagger / OpenAPI
   ======================= */
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "Inventory API", version: "1.0.0" },
    servers: [{ url: "http://localhost:5000" }]
  },
  apis: [__filename]
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Endpoint para devolver la especificación OpenAPI en JSON
app.get("/docs-json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckResponse:
 *       type: object
 *       properties:
 *         ProductId: { type: string }
 *         Available: { type: boolean }
 *     OrderRequest:
 *       type: object
 *       required: [ProductId, Quantity]
 *       properties:
 *         ProductId: { type: string }
 *         Quantity:  { type: integer, minimum: 1 }
 *     MutateResponse:
 *       type: object
 *       properties:
 *         Success: { type: boolean }
 *         Message: { type: string }
 */

/**
 * @swagger
 * /api/inventory/check/{productId}/{quantity}:
 *   get:
 *     summary: Verifica si hay stock suficiente
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: quantity
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CheckResponse' }
 */
app.get("/api/inventory/check/:productId/:quantity", async (req, res, next) => {
  try {
    const { productId, quantity } = req.params;
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) throw createError(400, "Quantity inválida");
    const row = await db.get("SELECT qty FROM inventory WHERE product_id = ?", productId);
    const stockQty = row?.qty ?? 0;
    res.json({ ProductId: productId, Available: stockQty >= qty });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/inventory/order:
 *   post:
 *     summary: Crea una orden y descuenta stock
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrderRequest' }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MutateResponse' }
 *       400:
 *         description: Sin stock suficiente
 */
app.post("/api/inventory/order", async (req, res, next) => {
  try {
    const { ProductId, Quantity } = req.body || {};
    if (typeof ProductId !== "string" || !Number.isInteger(Quantity) || Quantity < 1) {
      throw createError(400, "Body inválido");
    }
    const row = await db.get("SELECT qty FROM inventory WHERE product_id = ?", ProductId);
    const stockQty = row?.qty ?? 0;
    if (stockQty < Quantity) throw createError(400, "Insufficient stock.");
    await db.run("UPDATE inventory SET qty = qty - ? WHERE product_id = ?", Quantity, ProductId);
    res.json({ Success: true, Message: "Order created." });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/inventory/{productId}:
 *   put:
 *     summary: Crea o actualiza el stock de un producto (upsert)
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Quantity]
 *             properties:
 *               Quantity: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MutateResponse' }
 */
app.put("/api/inventory/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { Quantity } = req.body || {};
    if (!Number.isInteger(Quantity) || Quantity < 0) throw createError(400, "Quantity inválida");
    await db.run(
      `
      INSERT INTO inventory(product_id, qty) VALUES (?, ?)
      ON CONFLICT(product_id) DO UPDATE SET qty=excluded.qty
      `,
      productId,
      Quantity
    );
    res.json({ Success: true, Message: "Inventory upserted." });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/inventory/{productId}:
 *   delete:
 *     summary: Elimina un producto del inventario
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MutateResponse' }
 *       404:
 *         description: No existe
 */
app.delete("/api/inventory/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const result = await db.run("DELETE FROM inventory WHERE product_id = ?", productId);
    if (result.changes === 0) throw createError(404, "Product not found");
    res.json({ Success: true, Message: "Product deleted." });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/inventory/{productId}:
 *   get:
 *     summary: Obtiene la cantidad actual de un producto
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ProductId: { type: string }
 *                 Quantity:  { type: integer, minimum: 0 }
 *       404:
 *         description: Producto no encontrado
 */
app.get("/api/inventory/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const row = await db.get(
      "SELECT qty FROM inventory WHERE product_id = ?",
      productId
    );
    if (!row) {
      return res.status(404).json({ Success: false, Message: "Product not found" });
    }
    res.json({ ProductId: productId, Quantity: row.qty });
  } catch (e) { next(e); }
});

/* Healthcheck */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* =======================
   Middleware de errores
   ======================= */
app.use((req, _res, next) => next(createError(404, "Endpoint no encontrado")));
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    Success: false,
    Message: err.message || "Internal Server Error"
  });
});

/* =======================
   Start
   ======================= */
const PORT = process.env.PORT || 80;
initDb().then(() => {
  app.listen(PORT, () => console.log(`[API] Listening on port ${PORT}`));
});
