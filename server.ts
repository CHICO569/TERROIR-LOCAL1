import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/paydunya/create-invoice", async (req, res) => {
    try {
      const payload = {
        invoice: {
          total_amount: req.body.amount,
          description: req.body.description,
        },
        store: {
          name: "Terroir Local",
          return_url: req.body.return_url,
          cancel_url: req.body.cancel_url,
        }
      };

      const response = await fetch("https://app.paydunya.com/api/v1/checkout-invoice/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "PAYDUNYA-MASTER-KEY": "774Wmnh6-EkFL-Sufq-GwfG-YCwvzcLWhtVW",
          "PAYDUNYA-PRIVATE-KEY": "live_private_1XHD19iII7uNqarBAk35wdD8N7k",
          "PAYDUNYA-TOKEN": "jM4WZdgRaIlT9mdsOOCt"
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log("PayDunya Response:", data);
      res.json(data);
    } catch (error: any) {
      console.error("PayDunya API Catch Error:", error);
      res.status(500).json({ error: error.message, response_code: "500" });
    }
  });

  // Simulation de commandes automatiques (Objectif 3)
  // Cette partie sera pleinement fonctionnelle quand Firebase sera configuré
  let autoOrderInterval: NodeJS.Timeout | null = null;

  async function startAutoOrders() {
    if (autoOrderInterval) return;
    
    console.log("Démarrage de la simulation de commandes automatiques (1/min)...");
    autoOrderInterval = setInterval(async () => {
      try {
        // Logique de création de commande aléatoire ici
        // Sera implémentée après l'acceptation de Firebase
        console.log(`[Simulation] Nouvelle commande générée à ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error("Erreur simulation commande:", error);
      }
    }, 60000);
  }

  startAutoOrders();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Terroir Local démarré sur http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
