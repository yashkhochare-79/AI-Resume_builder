import os, json, tempfile, hashlib, urllib.request, urllib.error
from flask import Flask, request, jsonify, send_file, render_template

app = Flask(__name__)
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")


# ── helpers ──────────────────────────────────────────────────────────────────

def sw(text):
    """Seeded bar width 58–93%."""
    return 58 + (int(hashlib.md5(text.encode()).hexdigest(), 16) % 35)

def sd(text):
    """Seeded dot count 2–4."""
    return 2 + (int(hashlib.md5(text.encode()).hexdigest(), 16) % 3)

def contacts_inline(p):
    return " &nbsp;|&nbsp; ".join(x for x in [p.get("email",""), p.get("phone",""), p.get("location",""), p.get("linkedin","")] if x)

def contacts_block(p):
    return "<br>".join(x for x in [p.get("email",""), p.get("phone",""), p.get("location",""), p.get("linkedin","")] if x)

def exp_html(exp_list, title_color="#111", co_color="#666", date_color="#999", divider=False):
    out = ""
    for i, e in enumerate(exp_list):
        bullets = "".join(f"<li>{b}</li>" for b in e.get("bullets", []))
        sep = "border-bottom:1px solid #f0f0f0;padding-bottom:16px;margin-bottom:16px;" if divider and i < len(exp_list)-1 else "margin-bottom:16px;"
        out += f"""<div style="{sep}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <span style="font-weight:700;font-size:13px;color:{title_color};">{e.get("title","")}</span>
            <span style="font-size:10.5px;color:{date_color};white-space:nowrap;font-style:italic;">{e.get("startDate","")} – {e.get("endDate","")}</span>
          </div>
          <div style="font-size:11.5px;color:{co_color};font-weight:600;margin:3px 0 7px;">{e.get("company","")}{(" · "+e.get("location","")) if e.get("location") else ""}</div>
          <ul style="padding-left:15px;margin:0;">{bullets}</ul>
        </div>"""
    return out


# ── section title helper ──────────────────────────────────────────────────────

def stitle(text, color, border_color=None):
    border = f"border-bottom:2px solid {border_color};" if border_color else ""
    return f'<div style="font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:{color};margin-bottom:9px;padding-bottom:6px;{border}">{text}</div>'


# ── TEMPLATE BUILDERS ────────────────────────────────────────────────────────

def build_executive(p, r):
    edu   = (r.get("education") or [{}])[0]
    tech  = r.get("skills", {}).get("technical", [])
    tools = r.get("skills", {}).get("tools", [])
    soft  = r.get("skills", {}).get("soft", [])
    certs = r.get("certifications", [])
    langs = r.get("languages", [])

    pill  = lambda s: f'<span style="display:inline-block;padding:3px 9px;background:#fff;border:1px solid #e0e0f0;border-radius:3px;font-size:11px;color:#444;margin:3px 3px 0 0;">{s}</span>'
    pills = lambda items: "".join(pill(s) for s in items)

    cert_h = "".join(f'<div style="font-size:11px;color:#444;margin-bottom:5px;padding-left:10px;position:relative;"><span style="position:absolute;left:0;color:#7c6af7;font-weight:700;">›</span>{c.get("name","")}</div>' for c in certs)
    lang_h = "".join(f'<div style="font-size:11.5px;color:#444;margin-bottom:4px;">• {l}</div>' for l in langs)

    sec = lambda title, content: f'<div style="margin-bottom:22px;">{stitle(title,"#7c6af7","#7c6af7")}{content}</div>'

    return f"""<div style="font-family:Arial,sans-serif;background:#fff;width:100%;">
  <!-- header -->
  <div style="background:#1a1a2e;color:#fff;padding:40px 48px 30px;position:relative;">
    <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#7c6af7,#a78bfa,#2dd4bf);"></div>
    <div style="font-size:34px;font-weight:700;line-height:1;margin-bottom:5px;">{p.get("name","")}</div>
    <div style="font-size:12px;font-weight:300;letter-spacing:0.18em;text-transform:uppercase;color:#a78bfa;margin-bottom:16px;">{p.get("jobTitle","")}</div>
    <div style="font-size:11.5px;color:rgba(255,255,255,.65);">{contacts_inline(p)}</div>
  </div>
  <!-- body -->
  <div style="display:grid;grid-template-columns:1fr 215px;">
    <div style="padding:32px 40px;border-right:1px solid #ebecf5;">
      {sec("Professional Summary", f'<p style="font-size:12px;line-height:1.82;color:#444;margin:0;">{r.get("summary","")}</p>')}
      {sec("Work Experience", exp_html(r.get("experience",[]), "#1a1a2e", "#7c6af7", "#999"))}
    </div>
    <div style="padding:32px 22px;background:#f8f9ff;">
      {sec("Education", f'<div style="font-weight:700;font-size:12px;color:#1a1a2e;">{edu.get("degree","")}</div><div style="font-size:11px;color:#7c6af7;margin:2px 0;">{edu.get("school","")}</div><div style="font-size:10.5px;color:#888;">{edu.get("graduationYear","")}{(" · GPA "+edu.get("gpa","")) if edu.get("gpa") else ""}</div>')}
      {sec("Technical Skills", pills(tech)) if tech else ""}
      {sec("Tools", pills(tools)) if tools else ""}
      {sec("Strengths", pills(soft)) if soft else ""}
      {sec("Certifications", cert_h) if certs else ""}
      {sec("Languages", lang_h) if langs else ""}
    </div>
  </div>
</div>"""


def build_editorial(p, r):
    edu       = (r.get("education") or [{}])[0]
    all_sk    = (r.get("skills",{}).get("technical",[]) + r.get("skills",{}).get("tools",[]) + r.get("skills",{}).get("soft",[]))[:9]
    certs     = r.get("certifications", [])
    langs     = r.get("languages", [])

    bars = "".join(f"""<div style="margin-bottom:8px;">
      <div style="font-size:11px;color:rgba(255,255,255,.68);margin-bottom:3px;">{s}</div>
      <div style="height:3px;background:rgba(255,255,255,.12);border-radius:2px;">
        <div style="height:100%;width:{sw(s)}%;background:#d4b483;border-radius:2px;"></div>
      </div></div>""" for s in all_sk)

    side_sec = lambda t, c: f'<div style="margin-bottom:20px;"><div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#d4b483;margin-bottom:10px;">{t}</div>{c}</div>'
    main_sec = lambda t, c: f'<div style="margin-bottom:22px;"><div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#111;margin-bottom:10px;border-bottom:2px solid #111;padding-bottom:5px;">{t}</div>{c}</div>'

    cert_h = "".join(f'<div style="font-size:11px;color:rgba(255,255,255,.58);margin-bottom:5px;">{c.get("name","")}</div>' for c in certs)
    lang_h = "".join(f'<div style="font-size:11px;color:rgba(255,255,255,.58);margin-bottom:3px;">{l}</div>' for l in langs)

    return f"""<div style="font-family:Arial,sans-serif;background:#fff;width:100%;">
  <div style="padding:44px 52px 32px;border-bottom:3px solid #111;display:grid;grid-template-columns:1fr auto;align-items:flex-end;gap:16px;">
    <div>
      <div style="font-size:40px;font-weight:800;color:#111;line-height:1;letter-spacing:-1.5px;">{p.get("name","")}</div>
      <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#888;margin-top:7px;">{p.get("jobTitle","")}</div>
    </div>
    <div style="text-align:right;font-size:11px;color:#666;line-height:2.1;">{contacts_block(p)}</div>
  </div>
  <div style="display:grid;grid-template-columns:200px 1fr;">
    <div style="padding:30px 22px;background:#111;color:#fff;">
      {side_sec("Skills", bars)}
      {side_sec("Education", f'<div style="font-weight:700;font-size:12px;color:rgba(255,255,255,.9);">{edu.get("degree","")}</div><div style="font-size:11px;color:rgba(255,255,255,.48);margin:2px 0;">{edu.get("school","")}</div><div style="font-size:10px;color:#d4b483;">{edu.get("graduationYear","")}</div>')}
      {side_sec("Certifications", cert_h) if certs else ""}
      {side_sec("Languages", lang_h) if langs else ""}
    </div>
    <div style="padding:30px 40px;">
      {main_sec("Profile", f'<p style="font-size:12.5px;line-height:1.88;color:#333;margin:0;">{r.get("summary","")}</p>')}
      {main_sec("Experience", exp_html(r.get("experience",[]), "#111", "#777", "#aaa", divider=True))}
    </div>
  </div>
</div>"""


def build_minimal(p, r):
    edu    = (r.get("education") or [{}])[0]
    all_sk = (r.get("skills",{}).get("technical",[]) + r.get("skills",{}).get("tools",[]) + r.get("skills",{}).get("soft",[]))[:10]
    certs  = r.get("certifications", [])
    langs  = r.get("languages", [])

    dots_h = "".join(
        f'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;">'
        f'<span style="font-size:11px;color:#333;">{s}</span>'
        f'<div style="display:flex;gap:3px;">'
        + "".join(f'<div style="width:7px;height:7px;border-radius:50%;background:{"#2dd4bf" if i < sd(s) else "#e0e0e0"};"></div>' for i in range(5))
        + f'</div></div>'
        for s in all_sk
    )
    cert_h = "".join(f'<div style="font-size:11px;color:#555;margin-bottom:5px;padding-left:10px;position:relative;"><span style="position:absolute;left:0;color:#2dd4bf;">—</span>{c.get("name","")}</div>' for c in certs)
    lang_h = "".join(f'<span style="display:inline-block;padding:2px 8px;background:#f0fffe;border:1px solid #b2f5ef;border-radius:3px;font-size:10.5px;color:#0f766e;margin:3px 3px 0 0;">{l}</span>' for l in langs)

    sec = lambda t, c: f'<div style="margin-bottom:20px;"><div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#2dd4bf;margin-bottom:7px;">{t}</div><div style="height:1px;background:#e8e8e8;margin-bottom:10px;"></div>{c}</div>'

    return f"""<div style="font-family:Arial,sans-serif;background:#fff;width:100%;">
  <div style="padding:44px 52px 24px;border-left:5px solid #2dd4bf;">
    <div style="font-size:34px;font-weight:700;color:#111;line-height:1;margin-bottom:5px;">{p.get("name","")}</div>
    <div style="font-size:13px;font-weight:300;color:#2dd4bf;letter-spacing:0.05em;margin-bottom:12px;">{p.get("jobTitle","")}</div>
    <div style="font-size:11px;color:#888;">{contacts_inline(p)}</div>
  </div>
  <div style="padding:0 52px 44px;">
    <div style="display:grid;grid-template-columns:1fr 190px;gap:36px;margin-top:10px;">
      <div>
        {sec("Summary", f'<p style="font-size:12px;line-height:1.82;color:#444;margin:0;">{r.get("summary","")}</p>')}
        {sec("Experience", exp_html(r.get("experience",[]), "#111", "#555", "#bbb"))}
      </div>
      <div>
        {sec("Education", f'<div style="font-weight:700;font-size:12px;color:#111;">{edu.get("degree","")}</div><div style="font-size:11px;color:#777;margin:2px 0;">{edu.get("school","")}</div><div style="font-size:10px;color:#bbb;">{edu.get("graduationYear","")}</div>')}
        {sec("Skills", dots_h)}
        {sec("Certifications", cert_h) if certs else ""}
        {sec("Languages", lang_h) if langs else ""}
      </div>
    </div>
  </div>
</div>"""


def build_creative(p, r):
    edu   = (r.get("education") or [{}])[0]
    tech  = r.get("skills", {}).get("technical", [])
    tools = r.get("skills", {}).get("tools", [])
    certs = r.get("certifications", [])
    langs = r.get("languages", [])

    cpill = lambda s: f'<span style="display:inline-block;padding:3px 9px;background:rgba(251,113,133,.12);border:1px solid rgba(251,113,133,.22);border-radius:4px;font-size:11px;color:rgba(255,255,255,.85);margin:3px 3px 0 0;">{s}</span>'
    cert_h = "".join(f'<div style="font-size:11px;color:rgba(255,255,255,.65);margin-bottom:5px;">▸ {c.get("name","")}</div>' for c in certs)
    lang_h = "".join(f'<div style="font-size:11px;color:rgba(255,255,255,.7);margin-bottom:4px;">• {l}</div>' for l in langs)

    main_sec = lambda t, c: f'<div style="margin-bottom:22px;"><div style="font-size:9.5px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f97316;margin-bottom:10px;border-bottom:2px solid #fed7aa;padding-bottom:5px;">{t}</div>{c}</div>'
    side_sec = lambda t, c: f'<div style="margin-bottom:20px;"><div style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#fbbf24;margin-bottom:10px;">{t}</div>{c}</div>'

    return f"""<div style="font-family:Arial,sans-serif;background:#fff;width:100%;">
  <div style="background:linear-gradient(135deg,#fb7185 0%,#f97316 55%,#f59e0b 100%);padding:40px 46px 32px;color:#fff;">
    <div style="font-size:36px;font-weight:800;line-height:1;letter-spacing:-1px;margin-bottom:5px;">{p.get("name","")}</div>
    <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:.88;margin-bottom:16px;">{p.get("jobTitle","")}</div>
    <div style="font-size:11.5px;opacity:.85;">{contacts_inline(p)}</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 215px;">
    <div style="padding:32px 40px;">
      {main_sec("About Me", f'<p style="font-size:12px;line-height:1.82;color:#333;margin:0;">{r.get("summary","")}</p>')}
      {main_sec("Experience", exp_html(r.get("experience",[]), "#111", "#888", "#f97316"))}
    </div>
    <div style="padding:32px 22px;background:#1c1c26;color:#fff;">
      {side_sec("Education", f'<div style="font-weight:700;font-size:12px;color:#fff;">{edu.get("degree","")}</div><div style="font-size:11px;color:rgba(255,255,255,.45);margin:2px 0;">{edu.get("school","")}</div><div style="font-size:10px;color:#fbbf24;">{edu.get("graduationYear","")}</div>')}
      {side_sec("Technical", "".join(cpill(s) for s in tech)) if tech else ""}
      {side_sec("Tools", "".join(cpill(s) for s in tools)) if tools else ""}
      {side_sec("Certifications", cert_h) if certs else ""}
      {side_sec("Languages", lang_h) if langs else ""}
    </div>
  </div>
</div>"""


BUILDERS = {"executive": build_executive, "editorial": build_editorial, "minimal": build_minimal, "creative": build_creative}


def full_page_html(inner_html):
    return f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<style>*{{margin:0;padding:0;box-sizing:border-box;}}body{{width:794px;}}</style>
</head><body>{inner_html}</body></html>"""


# ── routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/generate", methods=["POST"])
def api_generate():
    data     = request.get_json(force=True) or {}
    name     = data.get("name","").strip()
    job      = data.get("jobTitle","").strip()
    exp      = data.get("experience","2-4 years")
    skills   = data.get("skills","")
    bg       = data.get("background","")
    edu      = data.get("education","")
    industry = data.get("industry","Technology")

    if not name or not job:
        return jsonify({"error": "Name and job title are required."}), 400
    if not ANTHROPIC_API_KEY:
        return jsonify({"error": "Server missing ANTHROPIC_API_KEY. Set it and restart Flask."}), 500

    prompt = f"""You are a world-class professional resume writer. Create a complete, impressive, realistic resume.

PERSON DETAILS:
- Name: {name}
- Target Job Title: {job}
- Years of Experience: {exp}
- Skills: {skills or "Infer the most relevant skills for "+job}
- Background / Achievements: {bg or "Create 3 realistic impressive jobs with quantified results for "+job}
- Education: {edu or "Create a realistic relevant university degree"}
- Industry: {industry}

RULES:
1. Exactly 3 work experience entries (use 2 only if 0-1 years)
2. Every bullet point MUST have quantified results (%, $, numbers, users)
3. Professional summary: 3-4 sentences, ATS-keyword-rich
4. Dates work backwards from Dec 2024
5. Realistic fictional company names (Vantara Systems, Helix Digital, NovaCrest etc.)

RETURN ONLY raw JSON — no markdown, no backticks, no explanation whatsoever:
{{"summary":"...","experience":[{{"title":"...","company":"...","location":"City, ST","startDate":"Mon YYYY","endDate":"Mon YYYY","bullets":["...","...","...","..."]}}],"education":[{{"degree":"...","school":"...","location":"...","graduationYear":"YYYY","gpa":"3.8","honors":"..."}}],"skills":{{"technical":["s1","s2","s3","s4","s5"],"tools":["t1","t2","t3"],"soft":["s1","s2","s3"]}},"certifications":[{{"name":"...","issuer":"...","year":"YYYY"}}],"languages":["English (Native)"]}}"""

    payload = json.dumps({
        "model": "claude-opus-4-5",
        "max_tokens": 2500,
        "messages": [{"role":"user","content": prompt}]
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={"Content-Type":"application/json","x-api-key":ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"}
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return jsonify({"error": f"Anthropic error {e.code}: {e.read().decode()[:300]}"}), 500
    except Exception as e:
        return jsonify({"error": f"Request failed: {str(e)}"}), 500

    raw   = "".join(b.get("text","") for b in result.get("content",[])).strip()
    start = raw.find("{"); end = raw.rfind("}")
    if start == -1 or end == -1:
        return jsonify({"error": "AI did not return JSON. Please try again."}), 500
    try:
        resume_data = json.loads(raw[start:end+1])
    except Exception as e:
        return jsonify({"error": f"JSON parse failed: {e}"}), 500

    return jsonify({"resume": resume_data})


@app.route("/api/preview", methods=["POST"])
def api_preview():
    data = request.get_json(force=True) or {}
    builder = BUILDERS.get(data.get("template","executive"), build_executive)
    return jsonify({"html": builder(data.get("personal",{}), data.get("resume",{}))})


@app.route("/api/download-pdf", methods=["POST"])
def api_download_pdf():
    import pdfkit
    data     = request.get_json(force=True) or {}
    personal = data.get("personal", {})
    resume   = data.get("resume", {})
    template = data.get("template", "executive")

    builder  = BUILDERS.get(template, build_executive)
    html     = full_page_html(builder(personal, resume))

    opts = {
        "page-size":"A4","margin-top":"0mm","margin-right":"0mm",
        "margin-bottom":"0mm","margin-left":"0mm","encoding":"UTF-8",
        "no-outline":None,"disable-smart-shrinking":"",
        "load-error-handling":"ignore","load-media-error-handling":"ignore",
        "quiet":"",
    }
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        tmp = f.name
    try:
        pdfkit.from_string(html, tmp, options=opts)
        fname = personal.get("name","Resume").replace(" ","_") + "_Resume.pdf"
        return send_file(tmp, mimetype="application/pdf", as_attachment=True, download_name=fname)
    except Exception as e:
        return jsonify({"error": f"PDF failed: {e}"}), 500


if __name__ == "__main__":
    print("✅  ResumeAI  →  http://localhost:5000")
    if not ANTHROPIC_API_KEY:
        print("⚠   Set ANTHROPIC_API_KEY env var before generating resumes.")
    app.run(debug=True, port=5000)
