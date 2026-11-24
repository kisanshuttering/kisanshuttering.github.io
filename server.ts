import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import PDFDocument from "pdfkit";

const app = express();

function getArgValue(name: string): string | undefined {
  const flag = `--${name}`;
  const eqPrefix = `${flag}=`;
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === flag && process.argv[i + 1]) {
      return process.argv[i + 1];
    }
    if (arg.startsWith(eqPrefix)) {
      return arg.slice(eqPrefix.length);
    }
  }
  return undefined;
}

function getPort(): number {
  const cliPort = getArgValue("port");
  if (cliPort) {
    const parsed = parseInt(cliPort, 10);
    if (!isNaN(parsed)) return parsed;
  }
  if (process.env.NODE_ENV === "production" && process.env.PORT) {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed)) return parsed;
  }
  if (process.env.PORT && process.env.PORT !== process.env.NGINX_PORT) {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return process.env.DEFAULT_APP_PORT ? parseInt(process.env.DEFAULT_APP_PORT, 10) || 3000 : 3000;
}

function getHost(): string {
  return getArgValue("host") || process.env.HOST || "0.0.0.0";
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
        current: "Rent shuttering plates, Cuplock scaffolding, prop jacks & spans in Gurgaon, Noida, Farukhnagar, Sohna, Jaipur & Kota. Coordinated supply & rental quotes.",
        proposed: "Rent shuttering plates, Cuplock scaffolding, prop jacks & adjustable spans across Gurgaon, Noida, Farukhnagar, Sohna, Jaipur & Kota. Call +91 7988862842."
      },
      {
        page: "Materials & Specifications (materials.html)",
        current: "Explore shuttering plates, Cuplock scaffolding, prop jacks, spans, MS Challi & formwork accessories on rent. Verified sizes and enquiry desk.",
        proposed: "Explore MS shuttering plates, Cuplock scaffolding, prop jacks, Acrow spans & MS Challi on rent. Verified sizes & rental quotes: +91 7988862842."
      },
      {
        page: "Gurgaon Rental Guide (scaffolding-rental-gurgaon.html)",
        current: "Rent scaffolding and shuttering material in Gurgaon with coordinated main-yard dispatch across Golf Course Rd, Sohna Rd, DLF phases & IMT Manesar.",
        proposed: "Rent Cuplock scaffolding, prop jacks & steel shuttering plates for Gurgaon (NCR) sites. Coordinated main-yard dispatch. Call +91 7988862842."
      },
      {
        page: "Noida Rental Guide (scaffolding-rental-noida.html)",
        current: "Rent scaffolding and shuttering material in Noida & Greater Noida with coordinated main-yard dispatch to Sector 62, Sector 150 & Noida Extension.",
        proposed: "Rent shuttering plates & Cuplock scaffolding in Noida & Greater Noida. Coordinated site delivery across active NCR sectors. Call +91 7988862842."
      },
      {
        page: "Farukhnagar Rental Guide (scaffolding-rental-farukhnagar.html)",
        current: "Rent scaffolding and shuttering material in Farukhnagar, Gurugram. Cuplock systems, prop jacks, MS plates & coordinated delivery on the KMP corridor.",
        proposed: "Scaffolding & shuttering material on rent for Farukhnagar & KMP corridor projects. Cuplock, prop jacks & MS plates. Call +91 7988862842."
      },
      {
        page: "Sohna Rental Guide (scaffolding-rental-sohna.html)",
        current: "Rent scaffolding and shuttering plates in Sohna & South Gurugram. Coordinated delivery to IMT Sohna, residential townships, and NH-248A projects.",
        proposed: "Scaffolding rental for Sohna & South Gurugram sites. Shuttering plates, Cuplock systems & prop jacks delivered from main yards. Call +91 7988862842."
      },
      {
        page: "Jaipur Rental Guide (scaffolding-rental-jaipur.html)",
        current: "Rent shuttering and scaffolding material in Jaipur. MS plates, Cuplock towers, prop jacks & spans for Mansarovar, Sitapura & VKI corridor projects.",
        proposed: "Scaffolding & shuttering rentals for Jaipur construction sites across Mansarovar, Sitapura & VKI corridor. Enquire on +91 7988862842."
      },
      {
        page: "Kota Rental Guide (scaffolding-rental-kota.html)",
        current: "Rent shuttering and scaffolding material in Kota. MS plates, Cuplock systems, prop jacks & spans for Indraprastha, Ranpur, and Kunhari sites.",
        proposed: "Shuttering & scaffolding rentals for Kota projects across Indraprastha, Ranpur & Kunhari. Coordinated supply: +91 7988862842."
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
       .text("Document generated automatically by Kisan Shuttering SEO tool.", { align: "center" });
    
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

// Serve robots.txt cleanly in both dev and production
app.get("/robots.txt", (req, res) => {
  const distRobots = path.join(process.cwd(), "dist", "robots.txt");
  const publicRobots = path.join(process.cwd(), "public", "robots.txt");
  const robotsPath = process.env.NODE_ENV === "production" && fs.existsSync(distRobots)
    ? distRobots
    : publicRobots;
  if (fs.existsSync(robotsPath)) {
    res.setHeader("Content-Type", "text/plain");
    res.sendFile(robotsPath);
  } else {
    res.status(404).end();
  }
});

// Enforce canonical apex host (kisanshuttering.com) and single-hop /index.html -> / canonicalization
app.use((req, res, next) => {
  const hostHeader = (req.headers.host || "").split(":")[0].toLowerCase();
  const isWww = hostHeader === "www.kisanshuttering.com";
  const isIndexAlias = req.path === "/index.html" || req.path === "/index";
  const qsIndex = req.originalUrl.indexOf("?");
  const qs = qsIndex !== -1 ? req.originalUrl.slice(qsIndex) : "";

  if (isWww) {
    const targetPath = isIndexAlias ? `/${qs}` : req.originalUrl;
    return res.redirect(301, `https://kisanshuttering.com${targetPath}`);
  }
  if (isIndexAlias) {
    return res.redirect(301, `/${qs}`);
  }
  next();
});

// Relevant legacy WordPress / category / archive redirects (never blindly redirect unrelated URLs to /)
app.get(["/blog", "/blog/", "/category/*", "/tag/*", "/feed", "/feed/"], (_req, res) => {
  res.redirect(301, "/blog.html");
});
app.get(["/products/*", "/shuttering/*", "/scaffolding/*", "/materials", "/materials/"], (_req, res) => {
  res.redirect(301, "/materials.html");
});
app.get(["/gurgaon", "/gurgaon/", "/gurugram", "/gurugram/"], (_req, res) => {
  res.redirect(301, "/scaffolding-rental-gurgaon.html");
});
app.get(["/noida", "/noida/", "/greater-noida", "/greater-noida/"], (_req, res) => {
  res.redirect(301, "/scaffolding-rental-noida.html");
});
app.get(["/farukhnagar", "/farukhnagar/"], (_req, res) => {
  res.redirect(301, "/scaffolding-rental-farukhnagar.html");
});
app.get(["/sohna", "/sohna/"], (_req, res) => {
  res.redirect(301, "/scaffolding-rental-sohna.html");
});
app.get(["/jaipur", "/jaipur/"], (_req, res) => {
  res.redirect(301, "/scaffolding-rental-jaipur.html");
});
app.get(["/kota", "/kota/"], (_req, res) => {
  res.redirect(301, "/scaffolding-rental-kota.html");
});

// 301 redirects for the 3 duplicate / legacy URL variants to their canonical primary URLs
app.get(["/coimbatore", "/coimbatore/", "/coimbatore.html"], (_req, res) => {
  res.redirect(301, "/scaffolding-rental-coimbatore.html");
});
app.get(["/scaffolding-in-chennai", "/scaffolding-in-chennai/", "/scaffolding-in-chennai/index.html"], (_req, res) => {
  res.redirect(301, "/scaffolding-rental-chennai.html");
});
app.get(
  [
    "/scaffolding-rental-services-vijayawada",
    "/scaffolding-rental-services-vijayawada/",
    "/scaffolding-rental-services-vijayawada/index.html",
  ],
  (_req, res) => {
    res.redirect(301, "/scaffolding-rental-vijayawada.html");
  }
);

// Canonical trailing-slash handling for /rental-scaffolding-in-palwal/ without matching /rental-scaffolding-in-palwal/ itself
app.use((req, res, next) => {
  if (req.path === "/rental-scaffolding-in-palwal" || req.path === "/rental-scaffolding-in-palwal/index.html") {
    return res.redirect(301, "/rental-scaffolding-in-palwal/");
  }
  next();
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        allowedHosts: true,
      },
      appType: "spa",
    });

    app.get("/rental-scaffolding-in-palwal/", async (req, res, next) => {
      const palwalPath = path.join(process.cwd(), "rental-scaffolding-in-palwal", "index.html");
      if (!fs.existsSync(palwalPath)) return next();
      try {
        const raw = fs.readFileSync(palwalPath, "utf-8");
        const html = await vite.transformIndexHtml(req.originalUrl, raw);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    // Development route for .html files
    app.get("/:page.html", async (req, res, next) => {
      const pagePath = path.join(process.cwd(), `${req.params.page}.html`);
      if (!fs.existsSync(pagePath)) return next();
      try {
        const raw = fs.readFileSync(pagePath, "utf-8");
        const html = await vite.transformIndexHtml(req.originalUrl, raw);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    // Redirect clean extensionless URLs to canonical .html routes (preventing duplicate URLs)
    app.get("/:page", (req, res, next) => {
      if (req.params.page.includes('.') || req.params.page.startsWith('api')) {
        return next();
      }
      const pagePath = path.join(process.cwd(), `${req.params.page}.html`);
      if (fs.existsSync(pagePath)) {
        return res.redirect(301, `/${req.params.page}.html`);
      }
      next();
    });

    // Serve compiled CSS directly as text/css in dev mode to avoid Accept-header MIME negotiation or stale cache issues
    app.get("*.css", async (req, res, next) => {
      if (req.originalUrl.includes("?import")) return next();
      const relPath = req.path.replace(/^\/+/, "");
      if (!fs.existsSync(path.join(process.cwd(), relPath))) return next();
      try {
        const result = await vite.transformRequest(`${req.path}?direct`);
        if (!result) return next();
        res
          .status(200)
          .set({
            "Content-Type": "text/css; charset=utf-8",
            "Cache-Control": "no-store",
          })
          .end(result.code);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Redirect clean extensionless URLs to canonical .html routes (preventing duplicate URLs)
    app.get("/:page", (req, res, next) => {
      if (req.params.page.includes('.') || req.params.page.startsWith('api')) {
        return next();
      }
      const pagePath = path.join(distPath, `${req.params.page}.html`);
      if (fs.existsSync(pagePath)) {
        return res.redirect(301, `/${req.params.page}.html`);
      }
      next();
    });

    app.use(
      "/assets",
      express.static(path.join(distPath, "assets"), {
        maxAge: "1y",
        immutable: true,
      })
    );
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (
            filePath.endsWith(".css") ||
            filePath.endsWith(".js") ||
            filePath.endsWith(".svg") ||
            filePath.endsWith(".png") ||
            filePath.endsWith(".jpg") ||
            filePath.endsWith(".webp")
          ) {
            res.setHeader("Cache-Control", "public, max-age=2592000");
          } else if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
          }
        },
      })
    );
    // Serve HTML files properly
    app.get("/:page.html", (req, res, next) => {
      const pagePath = path.join(distPath, `${req.params.page}.html`);
      if (fs.existsSync(pagePath)) {
        res.sendFile(pagePath);
      } else {
        next();
      }
    });
    // Return 404 for unknown / unrelated URLs instead of serving homepage HTML as soft-404
    app.get("*", (_req, res) => {
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      res.status(404).send(`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex, nofollow"><title>404 Page Not Found | Kisan Shuttering</title></head><body style="font-family:sans-serif;padding:3rem;text-align:center"><h1>404 - Page Not Found</h1><p>The requested URL was not found on Kisan Shuttering &amp; Scaffolding.</p><p><a href="/">Go to Homepage</a> | <a href="/materials.html">Materials &amp; Specs</a> | <a href="/blog.html">Blog</a></p></body></html>`);
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });

  server.on("error", (err: any) => {
    console.error("Server listen error:", err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
