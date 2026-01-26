
import { useState } from "react";
import axios from "axios";
import "./App.css";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default function App() {
  const [pedidos, setPedidos] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    sabor: "",
    quantidade: 1,
    endereco: "",
    whatsapp: "",
  });

  

  function textoQuantidade(p) {
    const qtd = Number(p.quantidade);
    return `${qtd} ${qtd === 1 ? "bolo de pote" : "bolos de pote"}`;
  }

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [mostrarPix, setMostrarPix] = useState(false);

 const [pedidoAtual, setPedidoAtual] = useState(null);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantidade" ? Number(value) : value,
    }));
  }

 async function onSubmit(e) {
  e.preventDefault();
  setError("");

  
  if (!form.nome.trim() || !form.sabor.trim() || !form.quantidade) {
    setError("Por favor, preencha nome, sabor e quantidade.");
    return;
  }

  setLoading(true);

  try {
    const sessionId = sessionStorage.getItem("sessionId");

    const res = await api.post("/pedidos", form, {
      headers: { "x-session-id": sessionId || "" },
    });

    
    if (res.data.sessionId) {
      sessionStorage.setItem("sessionId", res.data.sessionId);
    }
    
    setPedidoAtual(res.data.pedido);

    
    setPedidos([res.data.pedido]);

    
    setForm({
      nome: "",
      sabor: "",
      quantidade: 1,
      endereco: "",
      whatsapp: "",
    });

    setMostrarPix(false);
  } catch (err) {
    setError("Erro ao enviar pedido");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="page">
      <div className="top-links">
        <a href="consulte-sabores.html" className="top-link">
          Consulte os sabores
        </a>

        <a href="/como-nasceu.html" className="top-link">
          Como nasceu Cantinho Doce da Mimi
        </a>
      </div>

      {/* decorações */}
      <section className="decoracao">
        <img src="/bordamo.png" className="decoracao" alt="Decoração" />
      </section>

      <section className="decoracao2">
        <img src="/bordamo.png" className="decoracao2" alt="Decoração" />
      </section>

      <section className="decoracao3">
        <img src="/bordamo.png" className="decoracao3" alt="Decoração" />
      </section>

      <section className="decoracao4">
        <img src="/bordamo.png" className="decoracao4" alt="Decoração" />
      </section>

      <header className="topo">
        <div className="topo-inner">
          <h1 className="brand-left">Cantinho Doce</h1>

          <div className="logo">
            <img src="/logo.png" alt="Logo Cantinho Doce" />
          </div>

          <h1 className="brand-right">Mimi</h1>
        </div>

        <section className="decoracao5">
          <img src="/cake.png" className="decoracao5" alt="Decoração" />

          <section className="decoracao10">
            <img src="/cake.png" className="decoracao10" alt="Decoração" />
          </section>
        </section>

        <section className="decoracao8">
          <img src="/flor.png" className="decoracao8" alt="Decoração" />
        </section>

        <section className="decoracao12">
          <img src="/cake.png" className="decoracao10" alt="Decoração" />
        </section>

        <section className="decoracao11">
          <img src="/bolo.png" className="decoracao10" alt="Decoração" />
        </section>

        <section className="decoracao14">
          <img src="/flor.png" className="decoracao14" alt="Decoração" />
        </section>

        <section className="decoracao9">
          <img src="/flor.png" className="decoracao9" alt="Decoração" />
        </section>

        <section className="decoracao13">
          <img src="/flor.png" className="decoracao13" alt="Decoração" />
        </section>

        <section className="decoracao6">
          <img src="/bolo.png" className="decoracao6" alt="Decoração" />
        </section>

        <p className="sub">💕Realize seu pedido de bolo!💕</p>
      </header>

      
      <section className="box-form">
        <form className="pedido-form" onSubmit={onSubmit}>
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={onChange}
          />

          <input
            type="text"
            name="sabor"
            placeholder="Sabor"
            value={form.sabor}
            onChange={onChange}
          />

          <input
            type="number"
            min="1"
            name="quantidade"
            placeholder="Quantidade"
            value={form.quantidade}
            onChange={onChange}
          />

          <input
            type="text"
            name="endereco"
            placeholder="Endereço"
            value={form.endereco}
            onChange={onChange}
          />

          <input
            type="text"
            name="whatsapp"
            placeholder="WhatsApp"
            value={form.whatsapp}
            onChange={onChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Pedido"}
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

        <section className="lista">
          {pedidos.length === 0 ? (
            <p>Nenhum pedido ainda.</p>
          ) : (
            pedidos.map((p) => (
              <div className="row" key={p.id ?? `${p.nome}-${p.sabor}-${p.total}`}>
                <div>{p.nome}</div>
                <div>Sabor do bolo de pote: {p.sabor}</div>
                <div className="mono">{textoQuantidade(p)}</div>
                <div className="mono">
                  R$ {p.total ? Number(p.total).toFixed(2) : "0.00"}
                </div>

           
                <p className="pix-text">
                  Pague via PIX e envie o comprovante no WhatsApp para confirmarmos
                  seu pedido.
                </p>

                <button
                  type="button"
                  className="pix-btn"
                  onClick={() => setMostrarPix((prev) => !prev)}
                >
                  {mostrarPix ? "Ocultar QR Code PIX" : "Ver QR Code PIX"}
                </button>

                {mostrarPix && (
                  <div className="pix-area">
                    <img
                      src="/pix-qrcode.png"
                      alt="QR Code PIX"
                      className="pix-qrcode"
                    />

                    <a
                      href="https://wa.me/5581992547365"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-btn"
                    >
                      Enviar comprovante via WhatsApp
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </section>

      
      <footer className="rodape">
        <p>
          📸 Instagram:{" "}
          <a
            href="https://instagram.com/cantinho_doce_mimi"
            target="_blank"
            rel="noopener noreferrer"
          >
            @cantinho_doce_mimi
          </a>
        </p>

        <p>
          📱 WhatsApp:{" "}
          <a
            href="https://wa.me/5581992547365"
            target="_blank"
            rel="noopener noreferrer"
          >
            (81) 99254-7365
          </a>
        </p>

        <p>
          ✉️ E-mail:{" "}
          <a href="mailto:cantinhodocemimi@gmail.com">
            cantinhodocemimi@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}


