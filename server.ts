import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const CONFIG_FILE = path.join(process.cwd(), "google-forms-config.json");
const LEADS_FILE = path.join(process.cwd(), "leads.json");

// Helper to load config
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading config file:", e);
    }
  }
  return { formId: "", fields: {} };
}

// Helper to save config
function saveConfig(config: any) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

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

// Get Current Google Form config
app.get("/api/google-forms-config", (req, res) => {
  res.json(loadConfig());
});

// Save explicit Google Form config
app.post("/api/google-forms-config", (req, res) => {
  const { formId, fields } = req.body;
  if (!formId) {
    return res.status(400).json({ error: "Form ID is required" });
  }
  const config = { formId, fields: fields || {} };
  saveConfig(config);
  res.json({ success: true, config });
});

// Parse Google Form automatically from url/ID
app.post("/api/parse-google-form", async (req, res) => {
  try {
    let { urlOrId } = req.body;
    if (!urlOrId) {
      return res.status(400).json({ error: "Google Form ID or Link is required" });
    }

    // Extract form ID
    let formId = urlOrId.trim();
    if (formId.includes("docs.google.com/forms")) {
      const matchId = formId.match(/\/forms\/d\/e\/([a-zA-Z0-9-_]+)/);
      if (matchId) {
        formId = matchId[1];
      } else {
        const matchEdit = formId.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/);
        if (matchEdit) {
          formId = matchEdit[1];
        }
      }
    }

    const targetUrl = `https://docs.google.com/forms/d/e/${formId}/viewform`;
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(400).json({ error: `Could not retrieve Google Form. Make sure it is set to Public and the ID is correct.` });
    }

    const html = await response.text();
    const match = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(.*?);/);
    if (!match) {
      return res.status(400).json({ error: "This Google Form does not seem to contain standard public fields." });
    }

    const data = JSON.parse(match[1]);
    const items = data[1][1]; // Questions fields list

    const fields: Record<string, string> = {
      name: "",
      company: "",
      mobile: "",
      city: "",
      material: "",
      size: "",
      message: ""
    };

    if (items && Array.isArray(items)) {
      items.forEach((item: any) => {
        if (!item) return;
        const title = (item[1] || "").toLowerCase();
        const questionData = item[4];
        if (!questionData || !questionData[0]) return;
        const entryId = "entry." + questionData[0][0];

        if (title.includes("name") || title.includes("नाम") || title.includes("contact person") || title.includes("user")) {
          fields.name = entryId;
        } else if (title.includes("company") || title.includes("firm") || title.includes("enterprise") || title.includes("कंपनी")) {
          fields.company = entryId;
        } else if (title.includes("mobile") || title.includes("phone") || title.includes("whatsapp") || title.includes("नंबर") || title.includes("contact")) {
          fields.mobile = entryId;
        } else if (title.includes("city") || title.includes("location") || title.includes("site") || title.includes("शहर") || title.includes("address")) {
          fields.city = entryId;
        } else if (title.includes("material") || title.includes("requirement") || title.includes("product") || title.includes("shuttering") || title.includes("सामान")) {
          fields.material = entryId;
        } else if (title.includes("size") || title.includes("volume") || title.includes("quantity") || title.includes("area") || title.includes("मात्रा")) {
          fields.size = entryId;
        } else if (title.includes("detail") || title.includes("message") || title.includes("note") || title.includes("remark") || title.includes("विवरण")) {
          fields.message = entryId;
        }
      });
    }

    // Try fallback mapping if some keys are empty
    let fallbackCounter = 0;
    if (items && Array.isArray(items)) {
      items.forEach((item: any) => {
        if (!item) return;
        const questionData = item[4];
        if (!questionData || !questionData[0]) return;
        const entryId = "entry." + questionData[0][0];
        
        // Find if this entryId is already mapped
        const isMapped = Object.values(fields).includes(entryId);
        if (!isMapped) {
          const emptyKeys = Object.keys(fields).filter(k => !fields[k]);
          if (emptyKeys.length > 0) {
            fields[emptyKeys[0]] = entryId;
          }
        }
      });
    }

    res.json({ success: true, formId, fields });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit Lead & Proxy to Google Forms
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

    // 1. Save locally
    const leads = loadLeads();
    leads.unshift(lead);
    saveLeads(leads);

    // 2. Sync to connected Google Form if configured
    const config = loadConfig();
    let syncedToGoogle = false;
    let googleError = "";

    if (config && config.formId && Object.keys(config.fields).length > 0) {
      try {
        const formUrl = `https://docs.google.com/forms/d/e/${config.formId}/formResponse`;
        const bodyParams = new URLSearchParams();

        // Safe appending of mapped fields
        if (config.fields.name) bodyParams.append(config.fields.name, lead.name || "");
        if (config.fields.company) bodyParams.append(config.fields.company, lead.company || "");
        if (config.fields.mobile) bodyParams.append(config.fields.mobile, lead.mobile || "");
        if (config.fields.city) bodyParams.append(config.fields.city, lead.city || "");
        if (config.fields.material) bodyParams.append(config.fields.material, lead.material || "");
        if (config.fields.size) bodyParams.append(config.fields.size, lead.size || "");
        if (config.fields.message) bodyParams.append(config.fields.message, lead.message || "");

        const response = await fetch(formUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: bodyParams.toString()
        });

        if (response.ok) {
          syncedToGoogle = true;
        } else {
          googleError = `Status ${response.status}`;
        }
      } catch (e: any) {
        googleError = e.message;
        console.error("Error forwarding lead to Google Forms:", e);
      }
    }

    res.json({ success: true, lead, syncedToGoogle, googleError });
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

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
