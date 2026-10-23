import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('pdf_assets', exist_ok=True)

# 1. Page 4 Horizontal Bar Chart
def generate_page4_chart():
    countries = ['UK', 'Germany', 'France', 'South Korea', 'USA', 'Japan', 'China', 'India', 'Canada', 'Brazil']
    values = [890, 915, 960, 985, 1025, 1045, 1070, 1110, 1140, 1180]
    
    fig, ax = plt.subplots(figsize=(4.2, 3.2), dpi=200)
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    y_pos = np.arange(len(countries))
    bars = ax.barh(y_pos, values, color='#A66B38', height=0.65, edgecolor='none')
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(countries, fontsize=9, color='#222222')
    ax.set_xlabel('Mean e-waste per record (metric t…', fontsize=8.5, color='#444444', labelpad=6)
    
    ax.set_xlim(0, 1400)
    ax.set_xticks([0, 500, 1000])
    ax.set_xticklabels(['0', '500', '1k'], fontsize=8.5, color='#555555')
    
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#888888')
    ax.spines['bottom'].set_color('#888888')
    ax.xaxis.grid(True, linestyle=':', alpha=0.6, color='#CCCCCC')
    
    plt.tight_layout()
    plt.savefig(os.path.join('pdf_assets', 'mean_ewaste_chart.png'), dpi=200, bbox_inches='tight')
    plt.close()

# 2. Figure 1: EcoReclaim Homepage UI Mockup
def generate_fig1():
    fig, ax = plt.subplots(figsize=(5.5, 3.8), dpi=200)
    fig.patch.set_facecolor('#F0FDF4')
    ax.set_facecolor('#F8FAFC')
    
    # Outer frame
    ax.add_patch(plt.Rectangle((0, 0), 1, 1, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.5, transform=ax.transAxes))
    # Top navbar
    ax.add_patch(plt.Rectangle((0, 0.88), 1, 0.12, facecolor='#0F172A', transform=ax.transAxes))
    ax.text(0.04, 0.93, '♻️ EcoReclaim', color='#4ADE80', fontsize=10, fontweight='bold', transform=ax.transAxes)
    ax.text(0.40, 0.93, 'Home  •  Dashboard  •  Search  •  Tracking  •  B2B  •  Impact', color='#94A3B8', fontsize=7, transform=ax.transAxes)
    ax.add_patch(plt.Rectangle((0.84, 0.90), 0.13, 0.07, facecolor='#16A34A', edgecolor='none', transform=ax.transAxes))
    ax.text(0.86, 0.93, 'Recycle Now', color='white', fontsize=6.5, fontweight='bold', transform=ax.transAxes)
    
    # Hero Title
    ax.text(0.5, 0.74, 'Transforming E-Waste\nInto Opportunity', color='#0F172A', fontsize=13, fontweight='bold', ha='center', va='center', transform=ax.transAxes)
    ax.text(0.5, 0.61, 'Track, analyze and manage electronic assets across 10 countries with real-time\ninsights for a sustainable circular economy.', color='#475569', fontsize=6.5, ha='center', va='center', transform=ax.transAxes)
    
    # Stat boxes
    stats = [('10', 'Countries'), ('110', 'Datasets'), ('11', 'Categories'), ('7', 'Metrics')]
    for i, (num, lbl) in enumerate(stats):
        x = 0.12 + i * 0.20
        ax.add_patch(plt.Rectangle((x, 0.38), 0.16, 0.15, facecolor='#F0FDF4', edgecolor='#86EFAC', lw=1, transform=ax.transAxes))
        ax.text(x + 0.08, 0.47, num, color='#15803D', fontsize=11, fontweight='bold', ha='center', va='center', transform=ax.transAxes)
        ax.text(x + 0.08, 0.41, lbl, color='#64748B', fontsize=6, ha='center', va='center', transform=ax.transAxes)
        
    # CTA buttons
    ax.add_patch(plt.Rectangle((0.26, 0.18), 0.22, 0.11, facecolor='#16A34A', transform=ax.transAxes))
    ax.text(0.37, 0.23, 'Explore Dashboard', color='white', fontsize=7.5, fontweight='bold', ha='center', va='center', transform=ax.transAxes)
    ax.add_patch(plt.Rectangle((0.52, 0.18), 0.22, 0.11, facecolor='#E2E8F0', transform=ax.transAxes))
    ax.text(0.63, 0.23, 'Register E-Waste', color='#1E293B', fontsize=7.5, fontweight='bold', ha='center', va='center', transform=ax.transAxes)

    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join('pdf_assets', 'fig1_homepage.png'), dpi=200, bbox_inches='tight')
    plt.close()

# 3. Figure 2: Smart Search Interface
def generate_fig2():
    fig, ax = plt.subplots(figsize=(5.5, 3.8), dpi=200)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    
    ax.add_patch(plt.Rectangle((0, 0), 1, 1, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.5, transform=ax.transAxes))
    # Header
    ax.text(0.5, 0.88, 'Instant Data Search Engine', color='#0F172A', fontsize=12, fontweight='bold', ha='center', transform=ax.transAxes)
    ax.text(0.5, 0.81, 'Search anything about the dataset — country, 4-digit year, metric tokens, etc.', color='#64748B', fontsize=6.5, ha='center', transform=ax.transAxes)
    
    # Search bar
    ax.add_patch(plt.Rectangle((0.15, 0.66), 0.70, 0.10, facecolor='#F8FAFC', edgecolor='#0284C7', lw=1.2, transform=ax.transAxes))
    ax.text(0.18, 0.71, 'Search: USA 2024', color='#0F172A', fontsize=8, va='center', transform=ax.transAxes)
    ax.add_patch(plt.Rectangle((0.72, 0.67), 0.12, 0.08, facecolor='#0284C7', transform=ax.transAxes))
    ax.text(0.78, 0.71, 'Search', color='white', fontsize=7, fontweight='bold', ha='center', va='center', transform=ax.transAxes)
    
    # Preset Tags
    ax.text(0.20, 0.58, 'Presets: [Highest E-Waste]  [China 2023]  [5G Leaders]  [Spending Peak]', color='#0369A1', fontsize=6.5, transform=ax.transAxes)
    
    # Result Card
    ax.add_patch(plt.Rectangle((0.10, 0.10), 0.80, 0.42, facecolor='#F0F9FF', edgecolor='#BAE6FD', lw=1, transform=ax.transAxes))
    ax.text(0.15, 0.44, '[US] USA -- Year 2024 (Matched)', color='#0369A1', fontsize=9, fontweight='bold', transform=ax.transAxes)

    
    metrics = [
        ('Smartphone Sales', '312.4 M'), ('Laptop Shipments', '118.2 M'), ('E-Waste Generated', '1,024 MT'),
        ('Consumer Spending', '$1,840'), ('5G Penetration', '74.2%'), ('Console Adoption', '31.5%')
    ]
    for idx, (m_lbl, m_val) in enumerate(metrics):
        col = idx % 3
        row = idx // 3
        cx = 0.15 + col * 0.27
        cy = 0.32 - row * 0.14
        ax.text(cx, cy + 0.04, m_lbl, color='#64748B', fontsize=6, transform=ax.transAxes)
        ax.text(cx, cy - 0.01, m_val, color='#0F172A', fontsize=8, fontweight='bold', transform=ax.transAxes)

    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join('pdf_assets', 'fig2_smart_search.png'), dpi=200, bbox_inches='tight')
    plt.close()

# 4. Figure 3: Analytics Dashboard
def generate_fig3():
    fig, ax = plt.subplots(figsize=(6.5, 3.8), dpi=200)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    
    ax.add_patch(plt.Rectangle((0, 0), 1, 1, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.5, transform=ax.transAxes))
    ax.text(0.5, 0.90, 'Global E-Waste Insights', color='#0F172A', fontsize=12, fontweight='bold', ha='center', transform=ax.transAxes)
    ax.text(0.5, 0.83, 'Comprehensive visualization of global tech gadget consumption and e-waste generation across 10 countries', color='#64748B', fontsize=6.5, ha='center', transform=ax.transAxes)
    
    # 4 KPI cards
    kpis = [('TOTAL E-WASTE', '113,889 MT', '#EF4444'), ('SMARTPHONE SALES', '29,601 M', '#10B981'), ('LAPTOP SHIPMENTS', '9,469 M', '#3B82F6'), ('AVG SPENDING', '$1,572', '#F59E0B')]
    for i, (k_lbl, k_val, col) in enumerate(kpis):
        kx = 0.06 + i * 0.23
        ax.add_patch(plt.Rectangle((kx, 0.62), 0.21, 0.17, facecolor='#F8FAFC', edgecolor='#E2E8F0', lw=1, transform=ax.transAxes))
        ax.add_patch(plt.Rectangle((kx, 0.62), 0.015, 0.17, facecolor=col, transform=ax.transAxes))
        ax.text(kx + 0.03, 0.74, k_lbl, color='#64748B', fontsize=5.5, fontweight='bold', transform=ax.transAxes)
        ax.text(kx + 0.03, 0.66, k_val, color='#0F172A', fontsize=9, fontweight='bold', transform=ax.transAxes)
        
    # Chart area
    ax.add_patch(plt.Rectangle((0.06, 0.08), 0.88, 0.48, facecolor='#F8FAFC', edgecolor='#CBD5E1', lw=0.8, transform=ax.transAxes))
    ax.text(0.09, 0.50, '[Trend] E-Waste Generation Trends By Country (2015 - 2025)', color='#334155', fontsize=7, fontweight='bold', transform=ax.transAxes)
    
    # Multi-lines inside chart
    x_pts = np.linspace(0.12, 0.88, 11)
    np.random.seed(42)
    colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4']
    for c in colors:
        y_pts = 0.18 + np.sin(x_pts * 15 + np.random.rand()*5) * 0.08 + np.linspace(0.05, 0.18, 11) + np.random.rand()*0.05
        ax.plot(x_pts, y_pts, color=c, lw=1.2, alpha=0.85, transform=ax.transAxes)
        
    ax.text(0.5, 0.11, '2015   2016   2017   2018   2019   2020   2021   2022   2023   2024   2025', color='#94A3B8', fontsize=5.5, ha='center', transform=ax.transAxes)

    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join('pdf_assets', 'fig3_analytics_dashboard.png'), dpi=200, bbox_inches='tight')
    plt.close()

# 5. Figure 4: Collection Registration Form
def generate_fig4():
    fig, ax = plt.subplots(figsize=(5.5, 3.8), dpi=200)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    
    ax.add_patch(plt.Rectangle((0, 0), 1, 1, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.5, transform=ax.transAxes))
    ax.text(0.5, 0.90, 'E-Waste Collection Registration', color='#0F172A', fontsize=11, fontweight='bold', ha='center', transform=ax.transAxes)
    ax.text(0.5, 0.83, 'Register collected e-waste material, track distribution identity, and manage downstream handoffs', color='#64748B', fontsize=6, ha='center', transform=ax.transAxes)
    
    # 2 columns of inputs
    fields_left = ['Collector / Source Name', 'Drop-off / Facility Location', 'Product Category (Select)', 'Item Quantity & Total Weight (kg)']
    fields_right = ['Physical Device Condition', 'Primary Material Matrix', 'Hazardous Components Flag', 'Detailed Notes / Serialization']
    
    for i in range(4):
        y = 0.68 - i * 0.14
        # Left
        ax.text(0.08, y + 0.04, fields_left[i], color='#334155', fontsize=6, fontweight='bold', transform=ax.transAxes)
        ax.add_patch(plt.Rectangle((0.08, y - 0.04), 0.38, 0.065, facecolor='#F8FAFC', edgecolor='#CBD5E1', lw=0.8, transform=ax.transAxes))
        # Right
        ax.text(0.54, y + 0.04, fields_right[i], color='#334155', fontsize=6, fontweight='bold', transform=ax.transAxes)
        ax.add_patch(plt.Rectangle((0.54, y - 0.04), 0.38, 0.065, facecolor='#F8FAFC', edgecolor='#CBD5E1', lw=0.8, transform=ax.transAxes))
        
    ax.add_patch(plt.Rectangle((0.36, 0.07), 0.28, 0.08, facecolor='#0284C7', transform=ax.transAxes))
    ax.text(0.5, 0.11, '[OK] Submit Collection Record', color='white', fontsize=7, fontweight='bold', ha='center', va='center', transform=ax.transAxes)

    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join('pdf_assets', 'fig4_collection_form.png'), dpi=200, bbox_inches='tight')
    plt.close()

# 6. Figure 5: Lifecycle Tracker
def generate_fig5():
    fig, ax = plt.subplots(figsize=(5.5, 3.8), dpi=200)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    
    ax.add_patch(plt.Rectangle((0, 0), 1, 1, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.5, transform=ax.transAxes))
    ax.text(0.5, 0.90, 'E-Waste Lifecycle Tracker', color='#0F172A', fontsize=11, fontweight='bold', ha='center', transform=ax.transAxes)
    ax.text(0.5, 0.83, 'Track recovery from collection through processing to final disposition', color='#64748B', fontsize=6, ha='center', transform=ax.transAxes)
    
    # 4 Status Badges
    badges = [('48', 'Registered'), ('17', 'In Transit'), ('12', 'Delivered'), ('19', 'Recycled')]
    cols = ['#0284C7', '#F59E0B', '#8B5CF6', '#10B981']
    for i, (b_num, b_lbl) in enumerate(badges):
        bx = 0.12 + i * 0.21
        ax.add_patch(plt.Circle((bx + 0.03, 0.68), 0.055, facecolor=cols[i], transform=ax.transAxes))
        ax.text(bx + 0.03, 0.68, b_num, color='white', fontsize=8, fontweight='bold', ha='center', va='center', transform=ax.transAxes)
        ax.text(bx + 0.03, 0.58, b_lbl, color='#475569', fontsize=6, ha='center', transform=ax.transAxes)
        
    # Table header
    ax.add_patch(plt.Rectangle((0.06, 0.42), 0.88, 0.08, facecolor='#0F172A', transform=ax.transAxes))
    ax.text(0.09, 0.46, 'Token ID', color='white', fontsize=6, fontweight='bold', transform=ax.transAxes)
    ax.text(0.32, 0.46, 'Device Category', color='white', fontsize=6, fontweight='bold', transform=ax.transAxes)
    ax.text(0.58, 0.46, 'Weight', color='white', fontsize=6, fontweight='bold', transform=ax.transAxes)
    ax.text(0.76, 0.46, 'Current Status', color='white', fontsize=6, fontweight='bold', transform=ax.transAxes)
    
    rows = [
        ('COL-2026-0891', 'Enterprise Blade Servers', '140.0 kg', 'In Transit', '#F59E0B'),
        ('COL-2026-0892', 'Lithium Battery Packs', '45.5 kg', 'Recycled', '#10B981'),
        ('COL-2026-0893', 'Telecom Switching Units', '88.0 kg', 'Delivered', '#8B5CF6')
    ]
    for idx, (rid, rcat, rwt, rst, c) in enumerate(rows):
        ry = 0.32 - idx * 0.09
        ax.add_patch(plt.Rectangle((0.06, ry), 0.88, 0.08, facecolor='#F8FAFC' if idx%2==0 else '#FFFFFF', transform=ax.transAxes))
        ax.text(0.09, ry + 0.03, rid, color='#0284C7', fontsize=6, transform=ax.transAxes)
        ax.text(0.32, ry + 0.03, rcat, color='#334155', fontsize=6, transform=ax.transAxes)
        ax.text(0.58, ry + 0.03, rwt, color='#334155', fontsize=6, transform=ax.transAxes)
        ax.text(0.76, ry + 0.03, rst, color=c, fontsize=6, fontweight='bold', transform=ax.transAxes)

    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join('pdf_assets', 'fig5_lifecycle_tracker.png'), dpi=200, bbox_inches='tight')
    plt.close()

# 7. Figure 6: Processing Handoff
def generate_fig6():
    fig, ax = plt.subplots(figsize=(5.5, 3.8), dpi=200)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    
    ax.add_patch(plt.Rectangle((0, 0), 1, 1, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.5, transform=ax.transAxes))
    ax.text(0.5, 0.90, 'Processing Handoff & Transfer Manifest', color='#0F172A', fontsize=11, fontweight='bold', ha='center', transform=ax.transAxes)
    ax.text(0.5, 0.83, 'Authorize custody handover to accredited smelting and recovery refiners', color='#64748B', fontsize=6, ha='center', transform=ax.transAxes)
    
    ax.add_patch(plt.Rectangle((0.08, 0.58), 0.84, 0.18, facecolor='#F0FDF4', edgecolor='#86EFAC', lw=1, transform=ax.transAxes))
    ax.text(0.12, 0.70, 'Facility: EcoSmelt Global Refining Ltd. (R2v3 Certified)', color='#15803D', fontsize=7, fontweight='bold', transform=ax.transAxes)
    ax.text(0.12, 0.63, 'License: CPCB-EPR-2026-9042  --  Location: MIDC Industrial Zone, Pune', color='#475569', fontsize=6, transform=ax.transAxes)
    
    fields = [('Manifest ID: HND-2026-0312', 'Vehicle No: MH-12-QE-4091'), ('Consignment Weight: 1,250 kg', 'GPS Telematics: ACTIVE'), ('Material: PCB Scraps Class A', 'EPR Certificate: PENDING DISPATCH')]
    for idx, (f1, f2) in enumerate(fields):
        fy = 0.44 - idx * 0.10
        ax.text(0.10, fy, f1, color='#334155', fontsize=6.5, transform=ax.transAxes)
        ax.text(0.55, fy, f2, color='#334155', fontsize=6.5, transform=ax.transAxes)
        
    ax.add_patch(plt.Rectangle((0.30, 0.08), 0.40, 0.08, facecolor='#16A34A', transform=ax.transAxes))
    ax.text(0.50, 0.12, '[OK] Dispatch Custody Transfer', color='white', fontsize=7, fontweight='bold', ha='center', va='center', transform=ax.transAxes)

    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join('pdf_assets', 'fig6_processing_handoff.png'), dpi=200, bbox_inches='tight')
    plt.close()

# 8. Figure 7: B2B Marketplace Feed
def generate_fig7():
    fig, ax = plt.subplots(figsize=(5.5, 3.8), dpi=200)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    
    ax.add_patch(plt.Rectangle((0, 0), 1, 1, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.5, transform=ax.transAxes))
    ax.text(0.5, 0.90, 'B2B E-Waste Exchange & Request Window', color='#0F172A', fontsize=11, fontweight='bold', ha='center', transform=ax.transAxes)
    
    # 4 metrics
    ax.text(0.12, 0.80, '48+ Active B2B Lots', color='#0284C7', fontsize=6.5, fontweight='bold', transform=ax.transAxes)
    ax.text(0.38, 0.80, '3 Live Auctions', color='#10B981', fontsize=6.5, fontweight='bold', transform=ax.transAxes)
    ax.text(0.62, 0.80, '100% KYC Verified', color='#8B5CF6', fontsize=6.5, fontweight='bold', transform=ax.transAxes)
    ax.text(0.85, 0.80, '<2h Turnaround', color='#F59E0B', fontsize=6.5, fontweight='bold', transform=ax.transAxes)
    
    lots = [
        ('LOT #B2B-801', 'High-Grade Telecom Server Motherboards', '500 kg', 'High Bid: Rs 3,25,000', 'Closes in 45m'),
        ('LOT #B2B-802', 'Bulk EV Lithium Battery Cells (Grade B)', '1,200 kg', 'High Bid: Rs 1,80,000', 'Closes in 2h 15m')
    ]
    for idx, (lid, ltitle, lwt, lbid, ltime) in enumerate(lots):
        ly = 0.52 - idx * 0.24
        ax.add_patch(plt.Rectangle((0.08, ly), 0.84, 0.20, facecolor='#F8FAFC', edgecolor='#E2E8F0', lw=1, transform=ax.transAxes))
        ax.text(0.12, ly + 0.14, lid + ' -- ' + ltitle, color='#0F172A', fontsize=7, fontweight='bold', transform=ax.transAxes)
        ax.text(0.12, ly + 0.06, 'Volume: ' + lwt + '  *  ' + lbid, color='#15803D', fontsize=6.5, fontweight='bold', transform=ax.transAxes)
        ax.text(0.62, ly + 0.06, '[Time] ' + ltime, color='#F59E0B', fontsize=6, transform=ax.transAxes)
        ax.add_patch(plt.Rectangle((0.78, ly + 0.04), 0.12, 0.07, facecolor='#0284C7', transform=ax.transAxes))
        ax.text(0.84, ly + 0.075, 'Submit Bid', color='white', fontsize=6, fontweight='bold', ha='center', va='center', transform=ax.transAxes)

    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join('pdf_assets', 'fig7_b2b_marketplace.png'), dpi=200, bbox_inches='tight')
    plt.close()


# 9. Figure 8: Environmental Impact Calculator
def generate_fig8():
    fig, ax = plt.subplots(figsize=(5.5, 3.8), dpi=200)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    
    ax.add_patch(plt.Rectangle((0, 0), 1, 1, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.5, transform=ax.transAxes))
    ax.text(0.5, 0.90, 'Environmental Impact Calculator', color='#0F172A', fontsize=11, fontweight='bold', ha='center', transform=ax.transAxes)
    ax.text(0.5, 0.83, 'Estimate carbon offset, resource recovery & landfill avoidance metrics', color='#64748B', fontsize=6, ha='center', transform=ax.transAxes)
    
    # Selection
    ax.text(0.12, 0.72, 'Input E-Waste Weight: [ 100 kg ]', color='#0F172A', fontsize=7.5, fontweight='bold', transform=ax.transAxes)
    ax.text(0.55, 0.72, 'Category: [ Smartphones & Tablets ]', color='#0F172A', fontsize=7.5, fontweight='bold', transform=ax.transAxes)
    
    # 5 outcome cards
    outcomes = [
        ('CO2 REDUCTION', '380.0 kg', '#10B981'),
        ('WATER SAVED', '2,200 L', '#0284C7'),
        ('ENERGY PRESERVED', '720.0 kWh', '#F59E0B'),
        ('LANDFILL DIVERTED', '95.0 kg', '#8B5CF6'),
        ('TOXIC DISSIPATION', '2,500 g', '#EF4444')
    ]
    for i, (olbl, oval, col) in enumerate(outcomes):
        ox = 0.08 + (i % 3) * 0.28
        oy = 0.44 if i < 3 else 0.22
        ax.add_patch(plt.Rectangle((ox, oy), 0.26, 0.16, facecolor='#F8FAFC', edgecolor=col, lw=1, transform=ax.transAxes))
        ax.text(ox + 0.13, oy + 0.10, olbl, color='#64748B', fontsize=5.5, fontweight='bold', ha='center', transform=ax.transAxes)
        ax.text(ox + 0.13, oy + 0.04, oval, color=col, fontsize=8.5, fontweight='bold', ha='center', transform=ax.transAxes)
        
    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join('pdf_assets', 'fig8_impact_calculator.png'), dpi=200, bbox_inches='tight')
    plt.close()

# 10. Figure 9: Enterprise Multi-Tenant Architecture
def generate_fig9():
    fig, ax = plt.subplots(figsize=(6.5, 3.8), dpi=200)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    
    ax.add_patch(plt.Rectangle((0, 0), 1, 1, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.5, transform=ax.transAxes))
    ax.text(0.5, 0.91, 'Enterprise Multi-Tenant Cloud Architecture', color='#0F172A', fontsize=11, fontweight='bold', ha='center', transform=ax.transAxes)
    
    layers = [
        ('CLIENT / TOUCHPOINTS', ['PWA Mobile', 'Corporate Portal', 'Smelter Terminal', 'B2B Auction App'], '#0284C7', 0.72),
        ('API GATEWAY & SECURITY', ['Kong / Envoy API Gateway', 'OAuth2 / JWT Auth', 'mTLS Telematics', 'WAF & Rate Limiting'], '#0F172A', 0.52),
        ('MICROSERVICES CORE', ['Collection Service', 'B2B Matching Engine', 'EPR Regulatory Service', 'LCA Carbon Accounting'], '#15803D', 0.32),
        ('DATA & STORAGE FABRIC', ['PostgreSQL (Multi-Tenant)', 'TimescaleDB (Telematics)', 'Redis (Auction Cache)', 'S3 (Immutable Audits)'], '#7C3AED', 0.12)
    ]
    for title, items, col, y in layers:
        ax.add_patch(plt.Rectangle((0.06, y), 0.88, 0.15, facecolor='#F8FAFC', edgecolor=col, lw=1.2, transform=ax.transAxes))
        ax.text(0.08, y + 0.10, title, color=col, fontsize=6.5, fontweight='bold', transform=ax.transAxes)
        for idx, item in enumerate(items):
            ix = 0.08 + idx * 0.22
            ax.add_patch(plt.Rectangle((ix, y + 0.02), 0.20, 0.065, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6, transform=ax.transAxes))
            ax.text(ix + 0.10, y + 0.052, item, color='#334155', fontsize=5.5, ha='center', va='center', transform=ax.transAxes)

    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join('pdf_assets', 'fig9_enterprise_architecture.png'), dpi=200, bbox_inches='tight')
    plt.close()

# Run all asset generators
generate_page4_chart()
generate_fig1()
generate_fig2()
generate_fig3()
generate_fig4()
generate_fig5()
generate_fig6()
generate_fig7()
generate_fig8()
generate_fig9()
print("All visual figure assets successfully generated in pdf_assets/")
