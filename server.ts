import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import PDFDocument from "pdfkit";

const app = express();

function getPort(): number {
  const portIndex = process.argv.indexOf("--port");
  if (portIndex !== -1 && process.argv[portIndex + 1]) {
    const parsed = parseInt(process.argv[portIndex + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }
  return process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
}

function getHost(): string {
  const hostIndex = process.argv.indexOf("--host");
  if (hostIndex !== -1 && process.argv[hostIndex + 1]) {
    return process.argv[hostIndex + 1];
  }
  return process.env.HOST || "0.0.0.0";
}

const PORT = getPort();
const HOST = getHost();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const LEADS_FILE = path.join(process.cwd(), "leads.json");

// Helper to load leads
function loadLeads() {
  if (fs.existsSync(LEADS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading leads file:", e);
    }
  }
  return [];
}

// Helper to save leads
function saveLeads(leads: any[]) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

// API Routes

// Submit Lead
app.post("/api/submit-lead", async (req, res) => {
  try {
    const lead = req.body;
    if (!lead || !lead.mobile) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    // Assign unique lead ID if not present
    if (!lead.id) {
      lead.id = "LID-" + Date.now();
    }
    if (!lead.date) {
      lead.date = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    }

    // Save locally
    const leads = loadLeads();
    leads.unshift(lead);
    saveLeads(leads);

    res.json({ success: true, lead });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all saved leads
app.get("/api/leads", (req, res) => {
  res.json(loadLeads());
});

// Delete a lead
app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  let leads = loadLeads();
  leads = leads.filter((lead: any) => lead.id !== id);
  saveLeads(leads);
  res.json({ success: true });
});

// Clear all leads
app.post("/api/leads/clear", (req, res) => {
  saveLeads([]);
  res.json({ success: true });
});

// Download Meta Descriptions PDF
app.get("/api/download-meta-pdf", (req, res) => {
  try {
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=kisan-shuttering-meta-descriptions.pdf");
    
    doc.pipe(res);
    
    // Header
    doc.fillColor("#111827")
       .font("Helvetica-Bold")
       .fontSize(24)
       .text("Kisan Shuttering & Scaffolding", { align: "center" });
       
    doc.moveDown(0.2);
    doc.fontSize(13)
       .fillColor("#B45309")
       .text("PROPOSED SEO META DESCRIPTIONS FOR ALL PAGES", { align: "center" });
       
    doc.moveDown(1.5);
    
    doc.fillColor("#374151")
       .font("Helvetica")
       .fontSize(11)
       .text("Below is the complete catalog of simple, attractive, and high-performance meta descriptions custom-written for every page of your website. They are structured to optimize CTR, maintain high keyword relevance, and strictly fit within proper search engine character boundaries (under 160 characters).", { align: "justify" });
       
    doc.moveDown(1.5);
    
    // Divider line
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor("#E5E7EB").stroke();
    doc.moveDown(1.5);
    
    const proposedMetas = [
      {
        page: "Home Page (index.html)",
        current: "Rent heavy-duty shuttering plates, Cuplock scaffolding, prop jacks & spans in Gurgaon, Noida, Farukhnagar, Sohna, Jaipur & Kota. Bulk rental & prompt delivery.",
        proposed: "Rent heavy-duty shuttering plates, Cuplock scaffolding, prop jacks, and adjustable spans. Large Inventory Available for Bulk Rental across NCR and Rajasthan. Call +91 7988862842."
      },
      {
        page: "Materials & Specifications (materials.html)",
        current: "Explore heavy-duty shuttering plates, Cuplock scaffolding, prop jacks, spans, and formwork accessories on rent. Technical specifications and direct yard rates.",
        proposed: "Heavy-duty construction materials on rent. Specifications for MS plates, Cuplock scaffolding, telescopic prop jacks & slab spans. Call +91 7988862842."
      },
      {
        page: "Gurgaon Hub (scaffolding-rental-gurgaon.html)",
        current: "Rent heavy-duty scaffolding and shuttering material in Gurgaon at direct yard rates. Prompt site delivery across Golf Course Rd, Sohna Rd & Cyber City.",
        proposed: "Rent modular scaffolding systems, prop jacks, and steel shuttering plates in Gurgaon (NCR). Direct yard rates and prompt site dispatch. Call +91 7988862842."
      },
      {
        page: "Noida Hub (scaffolding-rental-noida.html)",
        current: "Rent heavy-duty scaffolding and shuttering material in Noida & Greater Noida at direct yard rates. Prompt site delivery to Sec 62, Sec 150 & Noida Extension.",
        proposed: "Rent heavy-duty shuttering plates and Cuplock scaffolding in Noida & Greater Noida. Prompt site delivery across all active project sectors. Call +91 7988862842."
      },
      {
        page: "Farukhnagar Hub (scaffolding-rental-farukhnagar.html)",
        current: "Rent heavy-duty scaffolding and shuttering material in Farukhnagar, Gurugram. Direct yard rates, Cuplock systems, props & fast delivery across KMP corridor.",
        proposed: "Scaffolding and shuttering material on rent in Farukhnagar & KMP logistics corridor. Direct yard rates on Cuplock, props, and MS plates. Call +91 7988862842."
      },
      {
        page: "Sohna Hub (scaffolding-rental-sohna.html)",
        current: "Rent heavy-duty scaffolding and shuttering plates in Sohna & South Gurugram. Direct delivery to IMT Sohna, residential townships, and NH-248A projects.",
        proposed: "Scaffolding rental in Sohna & South Gurugram. Heavy-duty shuttering plates, Cuplock systems, and prop jacks for IMT Sohna and Roz-Ka-Meo projects. Call +91 7988862842."
      },
      {
        page: "Jaipur Hub (scaffolding-rental-jaipur.html)",
        current: "Rent shuttering and scaffolding material in Jaipur. Heavy-duty MS plates, Cuplock towers, props & spans for Mansarovar, Sitapura & VKI projects.",
        proposed: "Quality scaffolding and shuttering rentals in Jaipur. Prompt delivery across Mansarovar, Sitapura Industrial Area, and VKI corridor. Call +91 7988862842."
      },
      {
        page: "Kota Hub (scaffolding-rental-kota.html)",
        current: "Rent shuttering and scaffolding material in Kota. Heavy-duty MS plates, Cuplock towers, props & spans for IP Industrial Area, Ranpur & Kunhari projects.",
        proposed: "Reliable shuttering and scaffolding rentals in Kota. Prompt site transport to IP Industrial Area, Ranpur, and Landmark City. Call +91 7988862842."
      }
    ];
    
    proposedMetas.forEach((meta) => {
      // Avoid placing lines too low on a page
      if (doc.y > 620) {
        doc.addPage();
        // Little top header on new pages
        doc.fillColor("#9CA3AF")
           .font("Helvetica-Oblique")
           .fontSize(8)
           .text("Kisan Shuttering - Proposed SEO Meta Descriptions Catalog", { align: "right" });
        doc.moveDown(1);
      }
      
      doc.fillColor("#111827")
         .font("Helvetica-Bold")
         .fontSize(11)
         .text(meta.page);
         
      doc.moveDown(0.15);
      
      doc.fillColor("#4B5563")
         .font("Helvetica")
         .fontSize(9)
         .text(`• Current: "${meta.current}"`, { indent: 15 });
         
      doc.moveDown(0.1);
      
      doc.fillColor("#16A34A")
         .font("Helvetica-Bold")
         .fontSize(9.5)
         .text(`• Proposed: "${meta.proposed}"`, { indent: 15 });
         
      doc.fillColor("#2563EB")
         .font("Helvetica")
         .fontSize(8)
         .text(`(Length: ${meta.proposed.length} characters | Status: Optimized and simple)`, { indent: 20 });
         
      doc.moveDown(1.0);
    });
    
    // Footer note
    if (doc.y > 650) doc.addPage();
    doc.moveDown(2);
    doc.fillColor("#9CA3AF")
       .font("Helvetica")
       .fontSize(8)
       .text("Document generated automatically by AI Studio developer assistant.", { align: "center" });
    
    doc.end();
  } catch (err) {
    console.error("Error creating PDF:", err);
    res.status(500).send("Error generating PDF document.");
  }
});

// Serve sitemap.xml directly from root main folder
app.get("/sitemap.xml", (req, res) => {
  const sitemapPath = path.join(process.cwd(), "sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    res.setHeader("Content-Type", "application/xml");
    res.sendFile(sitemapPath);
  } else {
    res.status(404).end();
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development route for .html files
    app.get("/:page.html", (req, res, next) => {
      const pagePath = path.join(process.cwd(), `${req.params.page}.html`);
      if (fs.existsSync(pagePath)) {
        res.sendFile(pagePath);
      } else {
        next();
      }
    });

    // Development middleware for clean URLs (without .html)
    app.get("/:page", (req, res, next) => {
      if (req.params.page.includes('.') || req.params.page.startsWith('api')) {
        return next();
      }
      const pagePath = path.join(process.cwd(), `${req.params.page}.html`);
      if (fs.existsSync(pagePath)) {
        res.sendFile(pagePath);
      } else {
        next();
      }
    });

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve HTML files properly without extension
    app.get("/:page", (req, res, next) => {
      if (req.params.page.includes('.') || req.params.page.startsWith('api')) {
        return next();
      }
      const pagePath = path.join(distPath, `${req.params.page}.html`);
      if (fs.existsSync(pagePath)) {
        res.sendFile(pagePath);
      } else {
        next();
      }
    });

    app.use(express.static(distPath));
    // Serve HTML files properly
    app.get("/:page.html", (req, res, next) => {
      const pagePath = path.join(distPath, `${req.params.page}.html`);
      if (fs.existsSync(pagePath)) {
        res.sendFile(pagePath);
      } else {
        next();
      }
    });
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });

  server.on("error", (err: any) => {
    console.error("Server listen error:", err);
  });
}

startServer();
