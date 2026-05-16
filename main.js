/* ── state ── */
let ACTIVE_TPL = "executive";
let RESUME_DATA = null;
let PERSONAL_DATA = null;

const $ = (id) => document.getElementById(id);

function showToast(msg, type = "ok") {
  const el = $("toast"); el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 4000);
}
function showError(msg) { const el = $("error-box"); el.textContent = "⚠  " + msg; el.classList.remove("hidden"); }
function hideError() { $("error-box").classList.add("hidden"); }
function setOverlay(show, title, sub) {
  const ov = $("overlay");
  if (show) { $("ov-title").textContent = title; $("ov-sub").textContent = sub; ov.classList.remove("hidden"); }
  else ov.classList.add("hidden");
}
function setBtnLoading(loading) {
  const btn = $("gen-btn"), lbl = $("btn-label");
  btn.disabled = loading; btn.classList.toggle("loading", loading);
  lbl.textContent = loading ? "Generating…" : "✦ Generate My Resume";
}

function selectTemplate(el) {
  document.querySelectorAll(".tpl-card").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected"); ACTIVE_TPL = el.dataset.tpl;
  if (RESUME_DATA && PERSONAL_DATA) renderPreview();
}
function scrollToTemplates() { $("templates").scrollIntoView({ behavior: "smooth" }); }

function getFormData() {
  return {
    name: $("f-name").value.trim(), jobTitle: $("f-title").value.trim(),
    email: $("f-email").value.trim(), phone: $("f-phone").value.trim(),
    location: $("f-location").value.trim(), linkedin: $("f-linkedin").value.trim(),
    industry: $("f-industry").value.trim(), experience: $("f-exp").value,
    skills: $("f-skills").value.trim(), background: $("f-bg").value.trim(),
    education: $("f-edu").value.trim(),
  };
}

/* ── RESUME DATA GENERATOR (replaces API) ── */
const COMPANIES = ["Vantara Systems","Helix Digital","NovaCrest Inc","Lumina Technologies","Apex Dynamics","Stellar Solutions","Vertex Global","Pinnacle Labs","Catalyst Corp","Meridian Tech"];
const CITIES = ["San Francisco, CA","New York, NY","Austin, TX","Seattle, WA","Boston, MA","Chicago, IL","Denver, CO","Los Angeles, CA"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SOFT = ["Cross-functional Collaboration","Strategic Planning","Team Leadership","Stakeholder Management","Agile Methodologies","Problem Solving","Communication","Mentoring"];
const CERTS_DB = {
  "Technology":["AWS Certified Solutions Architect","Google Cloud Professional","Certified Kubernetes Administrator"],
  "Finance":["CFA Level II","Bloomberg Market Concepts","Financial Risk Manager"],
  "Healthcare":["HIPAA Compliance Certified","Certified Health Data Analyst","HL7 FHIR Specialist"],
  "Marketing":["Google Analytics Certified","HubSpot Inbound Marketing","Meta Blueprint Certified"],
  "default":["Project Management Professional (PMP)","Certified Scrum Master","Six Sigma Green Belt"]
};
const BULLET_TEMPLATES = [
  "Spearheaded {action} resulting in {metric}% improvement in {area} across {num} {entity}",
  "Developed and launched {thing} that drove {metric}% increase in {kpi}, impacting {num}+ {entity}",
  "Led cross-functional team of {num} to deliver {thing}, reducing {area} by {metric}%",
  "Architected {thing} serving {num}+ {entity}, improving {kpi} by {metric}%",
  "Optimized {area} workflows, achieving ${dollars}K cost savings and {metric}% efficiency gain",
  "Managed {thing} with ${dollars}M budget, delivering {metric}% ahead of schedule",
  "Implemented {thing} that increased {kpi} by {metric}%, generating ${dollars}K revenue",
  "Collaborated with {num} stakeholders to redesign {thing}, boosting {area} by {metric}%",
];
const ACTIONS = ["initiative","transformation","migration","integration","redesign","automation"];
const THINGS = ["a scalable platform","an automated pipeline","a data-driven dashboard","a microservices architecture","a customer-facing portal","an analytics framework","a CI/CD pipeline","a recommendation engine"];
const AREAS = ["operational efficiency","user engagement","customer retention","system performance","team productivity","revenue growth","conversion rates"];
const KPIS = ["user retention","quarterly revenue","customer satisfaction","deployment speed","page load time","conversion rate","NPS score"];
const ENTITIES = ["users","clients","team members","departments","markets","accounts","stakeholders"];

function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) { const s = [...arr].sort(() => Math.random() - 0.5); return s.slice(0, Math.min(n, s.length)); }

function makeBullet() {
  let b = pick(BULLET_TEMPLATES);
  b = b.replace("{action}", pick(ACTIONS)).replace("{thing}", pick(THINGS));
  b = b.replace("{area}", pick(AREAS)).replace("{kpi}", pick(KPIS));
  b = b.replace("{metric}", rng(15, 68)).replace("{num}", rng(3, 25));
  b = b.replace("{entity}", pick(ENTITIES)).replace("{dollars}", rng(50, 800));
  return b;
}

function generateResumeData(form) {
  const job = form.jobTitle;
  const userSkills = form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const tech = userSkills.length >= 3 ? userSkills.slice(0, 5) : [job.split(" ").pop() + " Development", "System Architecture", "Data Analysis", "Cloud Infrastructure", "Performance Optimization"];
  const tools = userSkills.length > 5 ? userSkills.slice(5, 8) : ["Jira", "Confluence", "Slack"];
  const soft = pickN(SOFT, 3);

  const expVal = form.experience || "2-4 years";
  const numJobs = expVal.startsWith("0") ? 2 : 3;
  const titles = [];
  if (numJobs === 3) titles.push("Senior " + job, job, "Junior " + job);
  else titles.push(job, "Junior " + job);

  const experience = [];
  let year = 2024, month = 11;
  for (let i = 0; i < numJobs; i++) {
    const dur = rng(1, 3);
    const endM = MONTHS[month]; const endY = year;
    year -= dur; month = rng(0, 11);
    const startM = MONTHS[month]; const startY = year;
    const bullets = [];
    for (let b = 0; b < 4; b++) bullets.push(makeBullet());
    experience.push({
      title: titles[i], company: pick(COMPANIES), location: pick(CITIES),
      startDate: startM + " " + startY, endDate: i === 0 ? "Present" : endM + " " + endY,
      bullets
    });
  }

  // Education
  let edu = { degree: "B.S. Computer Science", school: "Stanford University", location: "Stanford, CA", graduationYear: String(year - rng(1, 3)), gpa: "3." + rng(5, 9), honors: "Cum Laude" };
  if (form.education) {
    const parts = form.education.split(",").map(s => s.trim());
    edu.degree = parts[0] || edu.degree;
    edu.school = parts[1] || edu.school;
    edu.graduationYear = parts[2] || edu.graduationYear;
  }

  const ind = form.industry || "default";
  const certPool = CERTS_DB[ind] || CERTS_DB["default"];
  const certs = pickN(certPool, 2).map((c, i) => ({ name: c, issuer: "Professional Institute", year: String(2024 - i) }));

  const summary = `Results-driven ${job} with ${expVal} of experience delivering high-impact solutions in the ${form.industry || "technology"} sector. Proven track record of leading cross-functional teams, driving ${pick(KPIS)} improvements, and implementing innovative strategies that generate measurable business outcomes. Adept at ${tech.slice(0, 2).join(", ")}, and ${pick(SOFT).toLowerCase()}.`;

  return {
    summary, experience, education: [edu],
    skills: { technical: tech, tools, soft },
    certifications: certs, languages: ["English (Native)", "Spanish (Conversational)"]
  };
}

/* ── TEMPLATE BUILDERS (moved from Python) ── */
function contactsInline(p) {
  return [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join(" &nbsp;|&nbsp; ");
}
function contactsBlock(p) {
  return [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join("<br>");
}
function sw(text) { let h = 0; for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0; return 58 + (Math.abs(h) % 35); }
function sd(text) { let h = 0; for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0; return 2 + (Math.abs(h) % 3); }

function expHtml(list, tc, cc, dc, divider) {
  return list.map((e, i) => {
    const bullets = (e.bullets || []).map(b => `<li>${b}</li>`).join("");
    const sep = divider && i < list.length - 1 ? "border-bottom:1px solid #f0f0f0;padding-bottom:16px;margin-bottom:16px;" : "margin-bottom:16px;";
    return `<div style="${sep}"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;"><span style="font-weight:700;font-size:13px;color:${tc};">${e.title || ""}</span><span style="font-size:10.5px;color:${dc};white-space:nowrap;font-style:italic;">${e.startDate || ""} – ${e.endDate || ""}</span></div><div style="font-size:11.5px;color:${cc};font-weight:600;margin:3px 0 7px;">${e.company || ""}${e.location ? " · " + e.location : ""}</div><ul style="padding-left:15px;margin:0;">${bullets}</ul></div>`;
  }).join("");
}

function sTitle(text, color, bc) {
  const border = bc ? `border-bottom:2px solid ${bc};` : "";
  return `<div style="font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${color};margin-bottom:9px;padding-bottom:6px;${border}">${text}</div>`;
}

function buildExecutive(p, r) {
  const edu = (r.education || [{}])[0];
  const tech = (r.skills || {}).technical || [];
  const tools = (r.skills || {}).tools || [];
  const soft = (r.skills || {}).soft || [];
  const certs = r.certifications || [];
  const langs = r.languages || [];
  const pill = s => `<span style="display:inline-block;padding:3px 9px;background:#fff;border:1px solid #e0e0f0;border-radius:3px;font-size:11px;color:#444;margin:3px 3px 0 0;">${s}</span>`;
  const pills = items => items.map(pill).join("");
  const certH = certs.map(c => `<div style="font-size:11px;color:#444;margin-bottom:5px;padding-left:10px;position:relative;"><span style="position:absolute;left:0;color:#7c6af7;font-weight:700;">›</span>${c.name || ""}</div>`).join("");
  const langH = langs.map(l => `<div style="font-size:11.5px;color:#444;margin-bottom:4px;">• ${l}</div>`).join("");
  const sec = (t, c) => `<div style="margin-bottom:22px;">${sTitle(t, "#7c6af7", "#7c6af7")}${c}</div>`;
  return `<div style="font-family:Arial,sans-serif;background:#fff;width:100%;"><div style="background:#1a1a2e;color:#fff;padding:40px 48px 30px;position:relative;"><div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#7c6af7,#a78bfa,#2dd4bf);"></div><div style="font-size:34px;font-weight:700;line-height:1;margin-bottom:5px;">${p.name || ""}</div><div style="font-size:12px;font-weight:300;letter-spacing:0.18em;text-transform:uppercase;color:#a78bfa;margin-bottom:16px;">${p.jobTitle || ""}</div><div style="font-size:11.5px;color:rgba(255,255,255,.65);">${contactsInline(p)}</div></div><div style="display:grid;grid-template-columns:1fr 215px;"><div style="padding:32px 40px;border-right:1px solid #ebecf5;">${sec("Professional Summary", `<p style="font-size:12px;line-height:1.82;color:#444;margin:0;">${r.summary || ""}</p>`)}${sec("Work Experience", expHtml(r.experience || [], "#1a1a2e", "#7c6af7", "#999"))}</div><div style="padding:32px 22px;background:#f8f9ff;">${sec("Education", `<div style="font-weight:700;font-size:12px;color:#1a1a2e;">${edu.degree || ""}</div><div style="font-size:11px;color:#7c6af7;margin:2px 0;">${edu.school || ""}</div><div style="font-size:10.5px;color:#888;">${edu.graduationYear || ""}${edu.gpa ? " · GPA " + edu.gpa : ""}</div>`)}${tech.length ? sec("Technical Skills", pills(tech)) : ""}${tools.length ? sec("Tools", pills(tools)) : ""}${soft.length ? sec("Strengths", pills(soft)) : ""}${certs.length ? sec("Certifications", certH) : ""}${langs.length ? sec("Languages", langH) : ""}</div></div></div>`;
}

function buildEditorial(p, r) {
  const edu = (r.education || [{}])[0];
  const allSk = [...((r.skills || {}).technical || []), ...((r.skills || {}).tools || []), ...((r.skills || {}).soft || [])].slice(0, 9);
  const certs = r.certifications || []; const langs = r.languages || [];
  const bars = allSk.map(s => `<div style="margin-bottom:8px;"><div style="font-size:11px;color:rgba(255,255,255,.68);margin-bottom:3px;">${s}</div><div style="height:3px;background:rgba(255,255,255,.12);border-radius:2px;"><div style="height:100%;width:${sw(s)}%;background:#d4b483;border-radius:2px;"></div></div></div>`).join("");
  const sideSec = (t, c) => `<div style="margin-bottom:20px;"><div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#d4b483;margin-bottom:10px;">${t}</div>${c}</div>`;
  const mainSec = (t, c) => `<div style="margin-bottom:22px;"><div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#111;margin-bottom:10px;border-bottom:2px solid #111;padding-bottom:5px;">${t}</div>${c}</div>`;
  const certH = certs.map(c => `<div style="font-size:11px;color:rgba(255,255,255,.58);margin-bottom:5px;">${c.name || ""}</div>`).join("");
  const langH = langs.map(l => `<div style="font-size:11px;color:rgba(255,255,255,.58);margin-bottom:3px;">${l}</div>`).join("");
  return `<div style="font-family:Arial,sans-serif;background:#fff;width:100%;"><div style="padding:44px 52px 32px;border-bottom:3px solid #111;display:grid;grid-template-columns:1fr auto;align-items:flex-end;gap:16px;"><div><div style="font-size:40px;font-weight:800;color:#111;line-height:1;letter-spacing:-1.5px;">${p.name || ""}</div><div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#888;margin-top:7px;">${p.jobTitle || ""}</div></div><div style="text-align:right;font-size:11px;color:#666;line-height:2.1;">${contactsBlock(p)}</div></div><div style="display:grid;grid-template-columns:200px 1fr;"><div style="padding:30px 22px;background:#111;color:#fff;">${sideSec("Skills", bars)}${sideSec("Education", `<div style="font-weight:700;font-size:12px;color:rgba(255,255,255,.9);">${edu.degree || ""}</div><div style="font-size:11px;color:rgba(255,255,255,.48);margin:2px 0;">${edu.school || ""}</div><div style="font-size:10px;color:#d4b483;">${edu.graduationYear || ""}</div>`)}${certs.length ? sideSec("Certifications", certH) : ""}${langs.length ? sideSec("Languages", langH) : ""}</div><div style="padding:30px 40px;">${mainSec("Profile", `<p style="font-size:12.5px;line-height:1.88;color:#333;margin:0;">${r.summary || ""}</p>`)}${mainSec("Experience", expHtml(r.experience || [], "#111", "#777", "#aaa", true))}</div></div></div>`;
}

function buildMinimal(p, r) {
  const edu = (r.education || [{}])[0];
  const allSk = [...((r.skills || {}).technical || []), ...((r.skills || {}).tools || []), ...((r.skills || {}).soft || [])].slice(0, 10);
  const certs = r.certifications || []; const langs = r.languages || [];
  const dotsH = allSk.map(s => {
    let dots = ""; for (let i = 0; i < 5; i++) dots += `<div style="width:7px;height:7px;border-radius:50%;background:${i < sd(s) ? "#2dd4bf" : "#e0e0e0"};"></div>`;
    return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;"><span style="font-size:11px;color:#333;">${s}</span><div style="display:flex;gap:3px;">${dots}</div></div>`;
  }).join("");
  const certH = certs.map(c => `<div style="font-size:11px;color:#555;margin-bottom:5px;padding-left:10px;position:relative;"><span style="position:absolute;left:0;color:#2dd4bf;">—</span>${c.name || ""}</div>`).join("");
  const langH = langs.map(l => `<span style="display:inline-block;padding:2px 8px;background:#f0fffe;border:1px solid #b2f5ef;border-radius:3px;font-size:10.5px;color:#0f766e;margin:3px 3px 0 0;">${l}</span>`).join("");
  const sec = (t, c) => `<div style="margin-bottom:20px;"><div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#2dd4bf;margin-bottom:7px;">${t}</div><div style="height:1px;background:#e8e8e8;margin-bottom:10px;"></div>${c}</div>`;
  return `<div style="font-family:Arial,sans-serif;background:#fff;width:100%;"><div style="padding:44px 52px 24px;border-left:5px solid #2dd4bf;"><div style="font-size:34px;font-weight:700;color:#111;line-height:1;margin-bottom:5px;">${p.name || ""}</div><div style="font-size:13px;font-weight:300;color:#2dd4bf;letter-spacing:0.05em;margin-bottom:12px;">${p.jobTitle || ""}</div><div style="font-size:11px;color:#888;">${contactsInline(p)}</div></div><div style="padding:0 52px 44px;"><div style="display:grid;grid-template-columns:1fr 190px;gap:36px;margin-top:10px;"><div>${sec("Summary", `<p style="font-size:12px;line-height:1.82;color:#444;margin:0;">${r.summary || ""}</p>`)}${sec("Experience", expHtml(r.experience || [], "#111", "#555", "#bbb"))}</div><div>${sec("Education", `<div style="font-weight:700;font-size:12px;color:#111;">${edu.degree || ""}</div><div style="font-size:11px;color:#777;margin:2px 0;">${edu.school || ""}</div><div style="font-size:10px;color:#bbb;">${edu.graduationYear || ""}</div>`)}${sec("Skills", dotsH)}${certs.length ? sec("Certifications", certH) : ""}${langs.length ? sec("Languages", langH) : ""}</div></div></div></div>`;
}

function buildCreative(p, r) {
  const edu = (r.education || [{}])[0];
  const tech = (r.skills || {}).technical || []; const tools = (r.skills || {}).tools || [];
  const certs = r.certifications || []; const langs = r.languages || [];
  const cpill = s => `<span style="display:inline-block;padding:3px 9px;background:rgba(251,113,133,.12);border:1px solid rgba(251,113,133,.22);border-radius:4px;font-size:11px;color:rgba(255,255,255,.85);margin:3px 3px 0 0;">${s}</span>`;
  const certH = certs.map(c => `<div style="font-size:11px;color:rgba(255,255,255,.65);margin-bottom:5px;">▸ ${c.name || ""}</div>`).join("");
  const langH = langs.map(l => `<div style="font-size:11px;color:rgba(255,255,255,.7);margin-bottom:4px;">• ${l}</div>`).join("");
  const mainSec = (t, c) => `<div style="margin-bottom:22px;"><div style="font-size:9.5px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f97316;margin-bottom:10px;border-bottom:2px solid #fed7aa;padding-bottom:5px;">${t}</div>${c}</div>`;
  const sideSec = (t, c) => `<div style="margin-bottom:20px;"><div style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#fbbf24;margin-bottom:10px;">${t}</div>${c}</div>`;
  return `<div style="font-family:Arial,sans-serif;background:#fff;width:100%;"><div style="background:linear-gradient(135deg,#fb7185 0%,#f97316 55%,#f59e0b 100%);padding:40px 46px 32px;color:#fff;"><div style="font-size:36px;font-weight:800;line-height:1;letter-spacing:-1px;margin-bottom:5px;">${p.name || ""}</div><div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:.88;margin-bottom:16px;">${p.jobTitle || ""}</div><div style="font-size:11.5px;opacity:.85;">${contactsInline(p)}</div></div><div style="display:grid;grid-template-columns:1fr 215px;"><div style="padding:32px 40px;">${mainSec("About Me", `<p style="font-size:12px;line-height:1.82;color:#333;margin:0;">${r.summary || ""}</p>`)}${mainSec("Experience", expHtml(r.experience || [], "#111", "#888", "#f97316"))}</div><div style="padding:32px 22px;background:#1c1c26;color:#fff;">${sideSec("Education", `<div style="font-weight:700;font-size:12px;color:#fff;">${edu.degree || ""}</div><div style="font-size:11px;color:rgba(255,255,255,.45);margin:2px 0;">${edu.school || ""}</div><div style="font-size:10px;color:#fbbf24;">${edu.graduationYear || ""}</div>`)}${tech.length ? sideSec("Technical", tech.map(cpill).join("")) : ""}${tools.length ? sideSec("Tools", tools.map(cpill).join("")) : ""}${certs.length ? sideSec("Certifications", certH) : ""}${langs.length ? sideSec("Languages", langH) : ""}</div></div></div>`;
}

const BUILDERS = { executive: buildExecutive, editorial: buildEditorial, minimal: buildMinimal, creative: buildCreative };

function renderPreview() {
  const builder = BUILDERS[ACTIVE_TPL] || buildExecutive;
  $("preview-frame").innerHTML = builder(PERSONAL_DATA, RESUME_DATA);
}

/* ── GENERATE (local, no API) ── */
function generate() {
  hideError();
  const p = getFormData();
  if (!p.name) { showError("Please enter your full name."); return; }
  if (!p.email) { showError("Please enter your email address."); return; }
  if (!p.jobTitle) { showError("Please enter your target job title."); return; }

  setBtnLoading(true);
  setOverlay(true, "Building your resume…", "Generating content · formatting");

  setTimeout(() => {
    try {
      PERSONAL_DATA = p;
      RESUME_DATA = generateResumeData(p);
      renderPreview();
      const resEl = $("result-section");
      resEl.classList.remove("hidden");
      setTimeout(() => resEl.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      showToast("✓ Resume generated! Click Download PDF to save it.", "ok");
    } catch (err) {
      showError(err.message || "Generation failed.");
      showToast("Generation failed: " + err.message, "err");
    } finally {
      setBtnLoading(false);
      setOverlay(false);
    }
  }, 800);
}

/* ── DOWNLOAD PDF (browser print) ── */
function downloadPDF() {
  if (!RESUME_DATA || !PERSONAL_DATA) { showToast("Please generate a resume first.", "err"); return; }
  const builder = BUILDERS[ACTIVE_TPL] || buildExecutive;
  const html = builder(PERSONAL_DATA, RESUME_DATA);
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${PERSONAL_DATA.name} Resume</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{width:794px;}@media print{@page{size:A4;margin:0;}}</style></head><body>${html}</body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); }, 400);
}
