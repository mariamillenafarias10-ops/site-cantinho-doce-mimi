require("dotenv").config();


const pool = require("./db");
const { v4: uuidv4 } = require("uuid");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, 
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
   
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Origem não permitida (CORS)." });
  }
  next(err);
});

function validarPedido(body) {
  const { nome, sabor, quantidade, endereco, whatsapp } = body;

  if (!nome || !sabor || !quantidade || !endereco || !whatsapp) {
    return "Todos os campos são obrigatórios.";
  }

  if (quantidade <= 0) {
    return "A quantidade deve ser maior que zero.";
  }

  if (!/^\d{10,11}$/.test(String(whatsapp))) {
    return "Número de WhatsApp inválido.";
  }

  return null; 
}


app.post("/pedidos", async (req, res) => {
  const erro = validarPedido(req.body);
  if (erro) return res.status(400).json({ error: erro });

  let { nome, sabor, quantidade, endereco, whatsapp } = req.body;

  quantidade = Number(quantidade);
  whatsapp = String(whatsapp).replace(/\D/g, "");

  const PRECO_BOLO = 9;
  const total = quantidade * PRECO_BOLO;

  
  const sessionId = req.header("x-session-id") || uuidv4();

  try {
    const result = await pool.query(
      `INSERT INTO pedidos (session_id, nome, sabor, quantidade, endereco, whatsapp, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, nome, sabor, quantidade, total`,
      [sessionId, nome, sabor, quantidade, endereco, whatsapp, total]
    );

    return res.status(201).json({ ok: true, sessionId, pedido: result.rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao salvar o pedido no banco de dados." });
  }
});

app.get("/meus-pedidos", async (req, res) => {
  const sessionId = req.header("x-session-id");
  if (!sessionId) return res.status(401).json({ error: "Sessão não encontrada." });

  try {
    const result = await pool.query(
      `SELECT id, nome, sabor, quantidade, total
       FROM pedidos
       WHERE session_id = $1
       ORDER BY id DESC`,
      [sessionId]
    );

    return res.json(result.rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao buscar seus pedidos." });
  }
});




app.get("/adminpedidos", async (req, res) => {
  const key = req.header("x-admin-key");

  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM pedidos ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao buscar os pedidos no banco de dados." });
  }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
