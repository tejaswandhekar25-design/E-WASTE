import os
import re

# Base directory
BASE_DIR = r"c:\Users\user5\OneDrive\Desktop\E-waste"
PAGES_DIR = os.path.join(BASE_DIR, "pages")

# HTML Template for index.html (prefix: "pages/")
INDEX_HEADER = '''  <!-- Site Header (Unified Fixed Container) -->
  <header class="site-header">
    <div class="live-commodity-ticker-bar">
      <div class="ticker-content" id="globalTickerBar">
        <span class="ticker-item">🔴 <strong>LIVE LME COMMODITY INDEX:</strong></span>
        <span class="ticker-item">🥇 Gold (Au 99.9%): <span class="ticker-rate">₹6,845.50/g</span> <span class="ticker-up">+1.24%</span></span>
        <span class="ticker-item">🥈 Silver (Ag): <span class="ticker-rate">₹83.40/g</span> <span class="ticker-up">+0.85%</span></span>
        <span class="ticker-item">🥉 Copper (Cathode): <span class="ticker-rate">₹748.00/kg</span> <span class="ticker-up">+2.10%</span></span>
        <span class="ticker-item">🔋 Lithium (Battery Grade): <span class="ticker-rate">₹1,420.00/kg</span> <span class="ticker-down">-0.45%</span></span>
        <span class="ticker-item">⚡ Palladium: <span class="ticker-rate">₹2,980.00/g</span> <span class="ticker-up">+1.50%</span></span>
        <span class="ticker-item">🏛️ CPCB EPR Target Compliance Index: <span class="ticker-rate">94.2%</span> <span class="ticker-up">Audit Verified</span></span>
      </div>
    </div>
    <nav class="navbar" role="navigation" aria-label="Main Navigation">
      <div class="navbar-inner">
        <a href="index.html" class="navbar-brand">
          <div class="logo-icon">♻️</div>
          EcoLoop
        </a>
        <div class="navbar-menu" id="navMenu">
          <a href="index.html" class="active">Home</a>
          <a href="pages/collection.html">Collect</a>
          
          <div class="nav-dropdown">
            <div class="nav-dropdown-toggle">
              Enterprise Suite ▾
            </div>
            <div class="nav-dropdown-menu">
              <a href="pages/ai-scanner.html" class="nav-dropdown-item">
                <span class="item-icon">🤖</span>
                <div>
                  <span class="item-title">AI Vision Scanner</span>
                  <span class="item-desc">Component assay & thermal hazard vision</span>
                </div>
              </a>
              <a href="pages/b2b-exchange.html" class="nav-dropdown-item">
                <span class="item-icon">🤝</span>
                <div>
                  <span class="item-title">B2B Liquidity Auction</span>
                  <span class="item-desc">Live scrap trading & LME spot pricing</span>
                </div>
              </a>
              <a href="pages/epr-compliance.html" class="nav-dropdown-item">
                <span class="item-icon">🏛️</span>
                <div>
                  <span class="item-title">CPCB EPR & ESG Center</span>
                  <span class="item-desc">Form 2/3/6 & SHA-256 digital seals</span>
                </div>
              </a>
              <a href="pages/recycling.html" class="nav-dropdown-item">
                <span class="item-icon">⛏️</span>
                <div>
                  <span class="item-title">Urban Mining Calculator</span>
                  <span class="item-desc">Metallurgical precious metal recovery</span>
                </div>
              </a>
            </div>
          </div>

          <div class="nav-dropdown">
            <div class="nav-dropdown-toggle">
              Operations ▾
            </div>
            <div class="nav-dropdown-menu">
              <a href="pages/tracking.html" class="nav-dropdown-item">
                <span class="item-icon">📦</span>
                <div>
                  <span class="item-title">Live Tracking</span>
                  <span class="item-desc">Chain of custody & status updates</span>
                </div>
              </a>
              <a href="pages/segregation.html" class="nav-dropdown-item">
                <span class="item-icon">🏷️</span>
                <div>
                  <span class="item-title">Smart Segregation</span>
                  <span class="item-desc">Automated triage & classification</span>
                </div>
              </a>
              <a href="pages/dashboard.html" class="nav-dropdown-item">
                <span class="item-icon">📊</span>
                <div>
                  <span class="item-title">Operations Dashboard</span>
                  <span class="item-desc">Throughput, SLA & recovery metrics</span>
                </div>
              </a>
              <a href="pages/analytics.html" class="nav-dropdown-item">
                <span class="item-icon">📈</span>
                <div>
                  <span class="item-title">LCA & ESG Analytics</span>
                  <span class="item-desc">Carbon offsets & circular diversion</span>
                </div>
              </a>
              <a href="pages/awareness.html" class="nav-dropdown-item">
                <span class="item-icon">💡</span>
                <div>
                  <span class="item-title">Citizen Awareness</span>
                  <span class="item-desc">Hazard guide & disposal directory</span>
                </div>
              </a>
            </div>
          </div>

          <a href="pages/about.html">About</a>
          <a href="pages/admin.html">Admin</a>
          <a href="pages/collection.html" class="navbar-cta">♻️ Recycle Now</a>
        </div>
        <button class="menu-toggle" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  </header>'''

def get_page_header(active_page_name):
    # active_page_name e.g. "tracking.html"
    return f'''  <!-- Site Header (Unified Fixed Container) -->
  <header class="site-header">
    <div class="live-commodity-ticker-bar">
      <div class="ticker-content" id="globalTickerBar">
        <span class="ticker-item">🔴 <strong>LIVE LME COMMODITY INDEX:</strong></span>
        <span class="ticker-item">🥇 Gold (Au 99.9%): <span class="ticker-rate">₹6,845.50/g</span> <span class="ticker-up">+1.24%</span></span>
        <span class="ticker-item">🥈 Silver (Ag): <span class="ticker-rate">₹83.40/g</span> <span class="ticker-up">+0.85%</span></span>
        <span class="ticker-item">🥉 Copper (Cathode): <span class="ticker-rate">₹748.00/kg</span> <span class="ticker-up">+2.10%</span></span>
        <span class="ticker-item">🔋 Lithium (Battery Grade): <span class="ticker-rate">₹1,420.00/kg</span> <span class="ticker-down">-0.45%</span></span>
        <span class="ticker-item">⚡ Palladium: <span class="ticker-rate">₹2,980.00/g</span> <span class="ticker-up">+1.50%</span></span>
        <span class="ticker-item">🏛️ CPCB EPR Target Compliance Index: <span class="ticker-rate">94.2%</span> <span class="ticker-up">Audit Verified</span></span>
      </div>
    </div>
    <nav class="navbar" role="navigation" aria-label="Main Navigation">
      <div class="navbar-inner">
        <a href="../index.html" class="navbar-brand">
          <div class="logo-icon">♻️</div>
          EcoLoop
        </a>
        <div class="navbar-menu" id="navMenu">
          <a href="../index.html">Home</a>
          <a href="collection.html" {"class='active'" if active_page_name == "collection.html" else ""}>Collect</a>
          
          <div class="nav-dropdown {"active" if active_page_name in ["ai-scanner.html", "b2b-exchange.html", "epr-compliance.html", "recycling.html"] else ""}">
            <div class="nav-dropdown-toggle">
              Enterprise Suite ▾
            </div>
            <div class="nav-dropdown-menu">
              <a href="ai-scanner.html" class="nav-dropdown-item {"active" if active_page_name == "ai-scanner.html" else ""}">
                <span class="item-icon">🤖</span>
                <div>
                  <span class="item-title">AI Vision Scanner</span>
                  <span class="item-desc">Component assay & thermal hazard vision</span>
                </div>
              </a>
              <a href="b2b-exchange.html" class="nav-dropdown-item {"active" if active_page_name == "b2b-exchange.html" else ""}">
                <span class="item-icon">🤝</span>
                <div>
                  <span class="item-title">B2B Liquidity Auction</span>
                  <span class="item-desc">Live scrap trading & LME spot pricing</span>
                </div>
              </a>
              <a href="epr-compliance.html" class="nav-dropdown-item {"active" if active_page_name == "epr-compliance.html" else ""}">
                <span class="item-icon">🏛️</span>
                <div>
                  <span class="item-title">CPCB EPR & ESG Center</span>
                  <span class="item-desc">Form 2/3/6 & SHA-256 digital seals</span>
                </div>
              </a>
              <a href="recycling.html" class="nav-dropdown-item {"active" if active_page_name == "recycling.html" else ""}">
                <span class="item-icon">⛏️</span>
                <div>
                  <span class="item-title">Urban Mining Calculator</span>
                  <span class="item-desc">Metallurgical precious metal recovery</span>
                </div>
              </a>
            </div>
          </div>

          <div class="nav-dropdown {"active" if active_page_name in ["tracking.html", "segregation.html", "dashboard.html", "analytics.html", "awareness.html"] else ""}">
            <div class="nav-dropdown-toggle">
              Operations ▾
            </div>
            <div class="nav-dropdown-menu">
              <a href="tracking.html" class="nav-dropdown-item {"active" if active_page_name == "tracking.html" else ""}">
                <span class="item-icon">📦</span>
                <div>
                  <span class="item-title">Live Tracking</span>
                  <span class="item-desc">Chain of custody & status updates</span>
                </div>
              </a>
              <a href="segregation.html" class="nav-dropdown-item {"active" if active_page_name == "segregation.html" else ""}">
                <span class="item-icon">🏷️</span>
                <div>
                  <span class="item-title">Smart Segregation</span>
                  <span class="item-desc">Automated triage & classification</span>
                </div>
              </a>
              <a href="dashboard.html" class="nav-dropdown-item {"active" if active_page_name == "dashboard.html" else ""}">
                <span class="item-icon">📊</span>
                <div>
                  <span class="item-title">Operations Dashboard</span>
                  <span class="item-desc">Throughput, SLA & recovery metrics</span>
                </div>
              </a>
              <a href="analytics.html" class="nav-dropdown-item {"active" if active_page_name == "analytics.html" else ""}">
                <span class="item-icon">📈</span>
                <div>
                  <span class="item-title">LCA & ESG Analytics</span>
                  <span class="item-desc">Carbon offsets & circular diversion</span>
                </div>
              </a>
              <a href="awareness.html" class="nav-dropdown-item {"active" if active_page_name == "awareness.html" else ""}">
                <span class="item-icon">💡</span>
                <div>
                  <span class="item-title">Citizen Awareness</span>
                  <span class="item-desc">Hazard guide & disposal directory</span>
                </div>
              </a>
            </div>
          </div>

          <a href="about.html" {"class='active'" if active_page_name == "about.html" else ""}>About</a>
          <a href="admin.html" {"class='active'" if active_page_name == "admin.html" else ""}>Admin</a>
          <a href="collection.html" class="navbar-cta">♻️ Recycle Now</a>
        </div>
        <button class="menu-toggle" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  </header>'''

# Regex to match from <!-- Navigation --> or <nav class="navbar" to </nav> or </header>
nav_pattern = re.compile(r'(?:<!--\s*Navigation\s*-->\s*)?(?:<header class="site-header">.*?</header>|<nav class="navbar".*?</nav>)', re.DOTALL)

# Process index.html
index_path = os.path.join(BASE_DIR, "index.html")
with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

new_content = nav_pattern.sub(INDEX_HEADER, content, count=1)
with open(index_path, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Updated index.html")

# Process pages/*.html
for fname in os.listdir(PAGES_DIR):
    if fname.endswith(".html"):
        fpath = os.path.join(PAGES_DIR, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            pcontent = f.read()
        
        replacement = get_page_header(fname)
        new_pcontent = nav_pattern.sub(replacement, pcontent, count=1)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_pcontent)
        print(f"Updated {fname}")
