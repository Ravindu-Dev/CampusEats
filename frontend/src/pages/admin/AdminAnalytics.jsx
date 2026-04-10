import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, Tooltip, Legend,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, ShoppingBag, Store, RefreshCw, AlertCircle,
  Clock, Star, Repeat, AlertTriangle, Award, Flame, Activity
} from 'lucide-react';
import canteenAdminService from '../../services/canteenAdminService';
import adminAuthService from '../../services/adminAuthService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ── Colour palettes ──────────────────────────────────────────────────────────
const PIE_COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#22c55e', '#eab308'];
const RADIAN = Math.PI / 180;

// ── Custom Pie label ─────────────────────────────────────────────────────────
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Star rating helper ───────────────────────────────────────────────────────
const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const frac = rating - full;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          {i <= full
            ? <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#f97316" stroke="#f97316" strokeWidth="1"/>
            : i === full + 1 && frac > 0
              ? <>
                  <defs><linearGradient id={`g${i}`}><stop offset={`${frac * 100}%`} stopColor="#f97316"/><stop offset={`${frac * 100}%`} stopColor="transparent"/></linearGradient></defs>
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={`url(#g${i})`} stroke="#f97316" strokeWidth="1"/>
                </>
              : <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          }
        </svg>
      ))}
      <span className="text-xs text-white/60 ml-1">{rating?.toFixed(1)}</span>
    </div>
  );
};

// ── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, icon, colorClass, subtext, badge }) => (
  <div className="bg-[#111111] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5">
    {badge && (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-3 inline-block ${badge.cls}`}>{badge.text}</span>
    )}
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-white/50">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-2 mb-1 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs text-white/40">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl border ${colorClass}`}>{icon}</div>
    </div>
  </div>
);

// ── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">{icon}</div>
    <div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ── Chart wrapper ────────────────────────────────────────────────────────────
const ChartCard = ({ children, className = '' }) => (
  <div className={`bg-[#111111] p-6 rounded-2xl border border-white/10 ${className}`}>{children}</div>
);

// ── Shared tooltip props ─────────────────────────────────────────────────
const TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: '#1c1c1c',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    color: '#ffffff',
    fontSize: '13px',
  },
  labelStyle: { color: '#ffffff', fontWeight: 600, marginBottom: '4px' },
  itemStyle: { color: '#e5e5e5' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

// ── Image to Base64 helper ───────────────────────────────────────────────
const getImageDataURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};


// ──────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
const AdminAnalytics = () => {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [exporting, setExporting]   = useState(false);
  const [days, setDays]             = useState(30);
  const [canteens, setCanteens]     = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState('');
  const printRef = useRef(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const url = `http://localhost:8081/api/admin/analytics/overview?days=${days}${selectedCanteen ? `&canteenId=${selectedCanteen}` : ''}`;
      const res = await axios.get(url, { headers: adminAuthService.getAuthHeader() });
      setData(res.data);
    } catch (err) {
      console.error('Analytics error:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => { canteenAdminService.getAllCanteens().then(setCanteens).catch(console.error); }, []);
  useEffect(() => { fetchData(); }, [days, selectedCanteen]);

  // ── PDF Export (Programmatic, Beautiful) ─────────────────────────────────
  const exportPDF = async () => {
    if (!data) return;
    setExporting(true);
    try {
      // ── Load logo ──
      let logoData = null;
      try {
        logoData = await getImageDataURL('/logo.png');
      } catch (e) {
        console.warn('Logo could not be loaded for PDF export', e);
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const m = 14;

      const canteenLabel = selectedCanteen
        ? (canteens.find(c => c.id === selectedCanteen)?.canteenName || 'Selected Canteen')
        : 'All Canteens';
      const periodLabel = days === 7 ? 'Last 7 Days' : days === 30 ? 'Last 30 Days' : 'Last 90 Days';
      const dateStr = new Date().toLocaleString('en-LK', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      // ── Colour helpers ──────────────────────────────────────────────────────
      const OR = [249, 115, 22];  // orange
      const WH = [255, 255, 255]; // white
      const BK = [10, 10, 10];    // near-black
      const GN = [22, 163, 74];   // green
      const BL = [59, 130, 246];  // blue
      const PU = [139, 92, 246];  // purple
      const CY = [6, 182, 212];   // cyan
      const RD = [239, 68, 68];   // red
      const YL = [234, 179, 8];   // yellow
      const TD = [20, 20, 20];    // text dark
      const TM = [80, 80, 80];    // text mid
      const TL = [150, 150, 150]; // text light
      const LG = [248, 249, 251]; // light grey bg

      const fc = (r, g, b) => pdf.setFillColor(r, g, b);
      const tc = (r, g, b) => pdf.setTextColor(r, g, b);
      const dc = (r, g, b) => pdf.setDrawColor(r, g, b);
      const bold = (s) => { pdf.setFont('helvetica', 'bold'); pdf.setFontSize(s); };
      const norm = (s) => { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(s); };
      const fmtRs = (n) => `Rs. ${(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const fmtN = (n) => (n || 0).toLocaleString();

      // ── Shared: page footer ─────────────────────────────────────────────────
      const pageFooter = (num, total) => {
        fc(...BK); pdf.rect(0, H - 11, W, 11, 'F');
        fc(...OR); pdf.rect(0, H - 11, W, 0.5, 'F');
        tc(...TL); norm(6.5);
        pdf.text('CampusEats Analytics Report', m, H - 4.5);
        pdf.text(`${periodLabel}  ·  ${canteenLabel}`, W / 2, H - 4.5, { align: 'center' });
        pdf.text(`Page ${num} of ${total}`, W - m, H - 4.5, { align: 'right' });
      };

      // ── Shared: page header bar (content pages) ─────────────────────────────
      const pageHeader = (title) => {
        fc(...BK); pdf.rect(0, 0, W, 22, 'F');
        fc(...OR); pdf.rect(0, 0, 4, 22, 'F');
        
        if (logoData) {
          pdf.addImage(logoData, 'PNG', W - m - 12, 5, 12, 12);
        }

        tc(...WH); bold(11.5); pdf.text(title, m + 4, 10);
        tc(...TL); norm(7.5); pdf.text(`${periodLabel}  ·  ${canteenLabel}`, m + 4, 17);
      };

      // ── Shared: section title ───────────────────────────────────────────────
      const secTitle = (label, y) => {
        fc(...OR); pdf.rect(m, y, 3, 7, 'F');
        tc(...TD); bold(11); pdf.text(label, m + 6, y + 5.5);
        dc(220, 220, 226); pdf.setLineWidth(0.25);
        pdf.line(m, y + 9, W - m, y + 9);
        return y + 13;
      };

      // ── Shared: table header row ────────────────────────────────────────────
      const tableHeader = (y, cols) => {
        fc(28, 28, 35); pdf.roundedRect(m, y, W - m * 2, 8, 1, 1, 'F');
        tc(...WH); bold(6.5);
        cols.forEach(([text, x, align]) => pdf.text(text, x, y + 5.5, { align: align || 'left' }));
        return y + 10;
      };

      // ── Shared: table row ───────────────────────────────────────────────────
      const ROW_H = 8.5;
      const tableRow = (y, i, cells) => {
        fc(i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
        pdf.rect(m, y, W - m * 2, ROW_H, 'F');
        cells.forEach(([text, x, clr, fnt, align]) => {
          tc(...(clr || TD));
          fnt === 'bold' ? bold(7.5) : norm(7);
          pdf.text(String(text).substring(0, 40), x, y + 6, { align: align || 'left' });
        });
        dc(228, 228, 236); pdf.setLineWidth(0.2);
        pdf.line(m, y + ROW_H, W - m, y + ROW_H);
        return y + ROW_H;
      };

      // ── Rank badge (gold/silver/bronze) ────────────────────────────────────
      const rankBadge = (x, y, rank) => {
        const colors = { 1: [249, 115, 22], 2: [148, 163, 184], 3: [180, 120, 60] };
        const col = colors[rank] || [120, 120, 130];
        fc(...col); pdf.roundedRect(x, y + 2, 6.5, 5, 1, 1, 'F');
        tc(...WH); bold(6); pdf.text(`${rank}`, x + 3.25, y + 6, { align: 'center' });
      };

      // ────────────────────────────────────────────────────────────────────────
      // PAGE 1 — COVER
      // ────────────────────────────────────────────────────────────────────────
      fc(...BK); pdf.rect(0, 0, W, H, 'F');

      // Background decoration — large faint circles
      fc(30, 15, 3); pdf.circle(W + 25, H - 40, 90, 'F');
      fc(18, 9, 1);  pdf.circle(-25, 50, 65, 'F');

      // Top accent bar
      fc(...OR); pdf.rect(0, 0, W, 3, 'F');

      // Logo box
      if (logoData) {
        // Actual Logo
        pdf.addImage(logoData, 'PNG', W / 2 - 18, 48, 36, 36);
        tc(...WH); bold(8); pdf.text('CAMPUS EATS', W / 2, 90, { align: 'center' });
      } else {
        // Fallback design
        fc(...OR); pdf.roundedRect(W / 2 - 20, 48, 40, 40, 5, 5, 'F');
        fc(200, 70, 0); pdf.roundedRect(W / 2 - 16, 72, 32, 12, 2, 2, 'F');
        tc(...WH); bold(20); pdf.text('CE', W / 2, 67, { align: 'center' });
        bold(8);   pdf.text('CAMPUS EATS', W / 2, 80, { align: 'center' });
      }

      // Title
      tc(...WH); bold(34); pdf.text('Analytics Report', W / 2, 110, { align: 'center' });

      // Orange divider
      fc(...OR); pdf.rect(W / 2 - 35, 116, 70, 1, 'F');

      // Period + filter
      tc(...OR);   bold(10.5); pdf.text(periodLabel, W / 2, 127, { align: 'center' });
      tc(...TL);   norm(9);    pdf.text(canteenLabel, W / 2, 135, { align: 'center' });

      // ── 4-column KPI grid ──
      const coverKPIs = [
        { label: 'TOTAL REVENUE', value: fmtRs(data.totalRevenue), color: GN },
        { label: 'TOTAL ORDERS',  value: fmtN(data.totalOrders),   color: BL },
        { label: 'ACTIVE USERS',  value: fmtN(data.activeUsers),   color: PU },
        { label: 'REPEAT RATE',   value: `${(data.repeatOrderRate || 0).toFixed(1)}%`, color: CY },
      ];
      const kW = (W - m * 2 - 9) / 4;
      coverKPIs.forEach((k, i) => {
        const kx = m + i * (kW + 3);
        fc(22, 22, 28); pdf.roundedRect(kx, 146, kW, 30, 2, 2, 'F');
        fc(...k.color); pdf.rect(kx, 146, kW, 1.5, 'F');
        tc(...k.color); bold(6.5); pdf.text(k.label, kx + 4, 154);
        tc(...WH); bold(11); pdf.text(k.value, kx + 4, 165);
      });

      // ── Second row KPIs ──
      const coverKPIs2 = [
        { label: 'BEST SELLER',     value: (data.bestSeller?.productName || 'N/A').substring(0, 16), color: RD },
        { label: 'AVG WAIT TIME',   value: `${(data.fulfillmentStats?.avgWaitMinutes || 0).toFixed(1)} min`, color: YL },
        { label: 'AT-RISK USERS',  value: fmtN(data.atRiskCustomers), color: RD },
        { label: 'AVG ORDER VALUE', value: data.totalOrders > 0 ? fmtRs(data.totalRevenue / data.totalOrders) : 'N/A', color: OR },
      ];
      coverKPIs2.forEach((k, i) => {
        const kx = m + i * (kW + 3);
        fc(16, 16, 20); pdf.roundedRect(kx, 182, kW, 24, 2, 2, 'F');
        fc(...k.color); pdf.rect(kx, 182, kW, 1, 'F');
        tc(...TL); norm(6); pdf.text(k.label, kx + 4, 190);
        tc(180, 180, 185); bold(9); pdf.text(k.value, kx + 4, 199);
      });

      // ── Smart insights box ──
      if (data.insights && data.insights.length) {
        fc(20, 20, 26); pdf.roundedRect(m, 212, W - m * 2, 50, 3, 3, 'F');
        fc(...OR); pdf.rect(m, 212, 3.5, 50, 'F');
        tc(...OR); bold(8); pdf.text('SMART INSIGHTS', m + 8, 221);
        data.insights.slice(0, 4).forEach((ins, i) => {
          fc(...OR); pdf.circle(m + 9, 230.5 + i * 9.5, 1.2, 'F');
          tc(200, 200, 210); norm(7.5);
          const lines = pdf.splitTextToSize(ins, W - m * 2 - 18);
          pdf.text(lines[0], m + 13, 231 + i * 9.5);
        });
      }

      // Cover footer strip
      fc(14, 14, 18); pdf.rect(0, H - 14, W, 14, 'F');
      fc(...OR);       pdf.rect(0, H - 14, W, 0.5, 'F');
      tc(...TL); norm(7);
      pdf.text(`Generated: ${dateStr}`, m, H - 6);
      pdf.text('Confidential · CampusEats Administration', W - m, H - 6, { align: 'right' });

      // ────────────────────────────────────────────────────────────────────────
      // PAGE 2 — TOP PRODUCTS & CANTEENS
      // ────────────────────────────────────────────────────────────────────────
      pdf.addPage();
      fc(...LG); pdf.rect(0, 0, W, H, 'F');
      pageHeader('Top Products & Canteen Performance');

      let y = 30;

      // Top Products
      y = secTitle('Top Selling Products', y);
      y = tableHeader(y, [
        ['#', m + 4, 'left'], ['Product', m + 14], ['Canteen', m + 90], ['Units', m + 140], ['Revenue', W - m - 3, 'right']
      ]);
      (data.topSellingProducts || []).slice(0, 10).forEach((p, i) => {
        const ry = y;
        fc(i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
        pdf.rect(m, ry, W - m * 2, ROW_H, 'F');
        if (i < 3) { rankBadge(m + 2, ry, i + 1); }
        else { tc(...TL); norm(7); pdf.text(`${i + 1}`, m + 5, ry + 6); }
        tc(...TD); bold(7.5); pdf.text((p.productName || '').substring(0, 28), m + 14, ry + 6);
        tc(...TM); norm(7);   pdf.text((p.canteenName || '').substring(0, 20), m + 90, ry + 6);
        // Units badge
        fc(235, 245, 255); pdf.roundedRect(m + 136, ry + 2, 20, 5, 1, 1, 'F');
        tc(...BL); bold(7); pdf.text(fmtN(p.totalSold), m + 146, ry + 6, { align: 'center' });
        // Revenue
        tc(...GN); bold(7.5); pdf.text(fmtRs(p.revenue), W - m - 3, ry + 6, { align: 'right' });
        dc(225, 225, 232); pdf.setLineWidth(0.2); pdf.line(m, ry + ROW_H, W - m, ry + ROW_H);
        y += ROW_H;
      });

      y += 8;

      // Top Canteens
      if (y + 80 < H - 20) {
        y = secTitle('Top Performing Canteens', y);
        y = tableHeader(y, [
          ['#', m + 4], ['Canteen Name', m + 14], ['Orders', m + 110], ['Revenue', W - m - 3, 'right']
        ]);
        (data.topCanteens || []).forEach((c, i) => {
          const ry = y;
          fc(i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
          pdf.rect(m, ry, W - m * 2, ROW_H, 'F');
          if (i < 3) { rankBadge(m + 2, ry, i + 1); }
          else { tc(...TL); norm(7); pdf.text(`${i + 1}`, m + 5, ry + 6); }
          tc(...TD); bold(7.5); pdf.text((c.canteenName || '').substring(0, 38), m + 14, ry + 6);
          tc(...TM); norm(7);   pdf.text(fmtN(c.totalOrders), m + 110, ry + 6);
          tc(...GN); bold(7.5); pdf.text(fmtRs(c.revenue), W - m - 3, ry + 6, { align: 'right' });
          dc(225, 225, 232); pdf.setLineWidth(0.2); pdf.line(m, ry + ROW_H, W - m, ry + ROW_H);
          y += ROW_H;
        });
      }

      pageFooter(2, 3);

      // ────────────────────────────────────────────────────────────────────────
      // PAGE 3 — PEAK HOURS + CUSTOMER INTELLIGENCE + EFFICIENCY + SATISFACTION
      // ────────────────────────────────────────────────────────────────────────
      pdf.addPage();
      fc(...LG); pdf.rect(0, 0, W, H, 'F');
      pageHeader('Peak Hours, Efficiency & Customer Intelligence');

      y = 30;

      // ── Peak Hours bar chart (drawn natively) ──────────────────────────────
      y = secTitle('Peak Hours Traffic', y);
      const hours = data.hourlyDistribution || [];
      const hourlyFull = Array.from({ length: 24 }, (_, h) => {
        const found = hours.find(d => d.hour === h);
        return { h, count: found?.orderCount || 0 };
      });
      const maxCount = Math.max(...hourlyFull.map(d => d.count), 1);
      const chartX = m + 8; const chartW = W - m * 2 - 8;
      const chartH = 38; const barW = chartW / 24;

      // Chart bg
      fc(255, 255, 255); pdf.roundedRect(m, y, W - m * 2, chartH + 14, 2, 2, 'F');

      // Gridlines
      dc(230, 230, 236); pdf.setLineWidth(0.2);
      [0.25, 0.5, 0.75, 1].forEach(pct => {
        const gY = y + chartH - chartH * pct + 4;
        pdf.line(chartX, gY, chartX + chartW, gY);
        tc(...TL); norm(5.5); pdf.text(`${Math.round(maxCount * pct)}`, m + 2, gY + 1.5);
      });

      // Bars
      hourlyFull.forEach(({ h, count }) => {
        const bh = maxCount > 0 ? (count / maxCount) * (chartH - 6) : 0;
        const bx = chartX + h * barW;
        const by = y + chartH - bh;
        const t = count / maxCount;
        const r = Math.round(249 * t + 200 * (1 - t));
        const g = Math.round(115 * t + 200 * (1 - t));
        const bv = Math.round(22 * t + 200 * (1 - t));
        fc(r, g, bv); pdf.roundedRect(bx + 0.4, by, barW - 0.8, bh, 0.4, 0.4, 'F');
        if (h % 3 === 0) {
          const lbl = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
          tc(...TL); norm(5.5); pdf.text(lbl, bx + barW / 2, y + chartH + 8, { align: 'center' });
        }
      });

      y += chartH + 18;

      // ── Customer Intelligence cards ────────────────────────────────────────
      y = secTitle('Customer Intelligence', y);
      const statW = (W - m * 2 - 6) / 3;
      [
        { label: 'REPEAT ORDER RATE', value: `${(data.repeatOrderRate || 0).toFixed(1)}%`, sub: 'Customers with 2+ orders', col: CY },
        { label: 'AT-RISK CUSTOMERS', value: fmtN(data.atRiskCustomers), sub: 'No activity in 10+ days', col: RD },
        { label: 'UNIQUE CUSTOMERS',  value: fmtN(data.activeUsers), sub: 'Placed at least 1 order', col: PU },
      ].forEach((s, i) => {
        const cx = m + i * (statW + 3);
        fc(255, 255, 255); pdf.roundedRect(cx, y, statW, 28, 2, 2, 'F');
        fc(...s.col); pdf.rect(cx, y, statW, 1.5, 'F');
        tc(...s.col); bold(6.5); pdf.text(s.label, cx + 4, y + 8);
        tc(...TD); bold(13); pdf.text(s.value, cx + 4, y + 18);
        tc(...TL); norm(6.5); pdf.text(s.sub, cx + 4, y + 25);
      });

      y += 34;

      // ── Kitchen Efficiency cards ───────────────────────────────────────────
      y = secTitle('Kitchen Efficiency', y);
      const fs = data.fulfillmentStats || {};
      [
        { label: 'AVG WAIT TIME', value: `${(fs.avgWaitMinutes || 0).toFixed(1)} min`, sub: 'Order placed to Ready', col: YL, pct: Math.min((fs.avgWaitMinutes || 0) / 30, 1) },
        { label: 'AVG PICKUP DELAY', value: `${(fs.avgPickupDelayMinutes || 0).toFixed(1)} min`, sub: 'Ready to Collected', col: CY, pct: Math.min((fs.avgPickupDelayMinutes || 0) / 20, 1) },
        { label: 'ORDERS ANALYZED', value: fmtN(fs.sampleCount), sub: 'Completed orders with timing', col: BL, pct: null },
      ].forEach((e, i) => {
        const cx = m + i * (statW + 3);
        fc(255, 255, 255); pdf.roundedRect(cx, y, statW, 30, 2, 2, 'F');
        fc(...e.col); pdf.rect(cx, y, statW, 1.5, 'F');
        tc(...e.col); bold(6.5); pdf.text(e.label, cx + 4, y + 8);
        tc(...TD); bold(13); pdf.text(e.value, cx + 4, y + 18);
        if (e.pct !== null) {
          fc(228, 228, 235); pdf.roundedRect(cx + 4, y + 21.5, statW - 8, 3, 1, 1, 'F');
          fc(...e.col); pdf.roundedRect(cx + 4, y + 21.5, (statW - 8) * e.pct, 3, 1, 1, 'F');
        }
        tc(...TL); norm(6); pdf.text(e.sub, cx + 4, y + 27.5);
      });

      y += 36;

      // ── Canteen Satisfaction table ─────────────────────────────────────────
      if (data.canteenSatisfaction && data.canteenSatisfaction.length && y < H - 60) {
        y = secTitle('Canteen Satisfaction Ratings', y);
        y = tableHeader(y, [
          ['Canteen', m + 4], ['Rating', m + 90], ['Reviews', m + 130], ['Score Bar', W - m - 28]
        ]);
        data.canteenSatisfaction.forEach((c, i) => {
          const ry = y;
          fc(i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
          pdf.rect(m, ry, W - m * 2, ROW_H, 'F');
          tc(...TD); bold(7.5); pdf.text((c.canteenName || '').substring(0, 35), m + 4, ry + 6);
          // Stars
          const stars = c.averageRating || 0;
          for (let s = 1; s <= 5; s++) {
            fc(s <= Math.floor(stars) ? 234 : 220, s <= Math.floor(stars) ? 179 : 220, s <= Math.floor(stars) ? 8 : 225);
            pdf.roundedRect(m + 90 + (s - 1) * 6, ry + 2.5, 5.2, 4, 0.5, 0.5, 'F');
          }
          tc(...TM); norm(6.5); pdf.text(stars.toFixed(1), m + 90 + 5*6 + 2, ry + 6);
          pdf.text(fmtN(c.reviewCount), m + 130, ry + 6);
          // Score bar
          const pct = stars / 5;
          fc(228, 228, 235); pdf.roundedRect(W - m - 28, ry + 3, 25, 3, 1, 1, 'F');
          const barClr = pct > 0.8 ? GN : pct > 0.6 ? YL : RD;
          fc(...barClr); pdf.roundedRect(W - m - 28, ry + 3, 25 * pct, 3, 1, 1, 'F');
          dc(225, 225, 232); pdf.setLineWidth(0.2); pdf.line(m, ry + ROW_H, W - m, ry + ROW_H);
          y += ROW_H;
        });
      }

      pageFooter(3, 3);

      // ── Save ──────────────────────────────────────────────────────────────
      const rawPeriod = periodLabel.replace(/ /g, '_');
      const rawCanteen = canteenLabel.replace(/ /g, '_');
      pdf.save(`CampusEats_Analytics_${rawPeriod}_${rawCanteen}.pdf`);

    } catch (err) {
      console.error('PDF export failed:', err);
      alert(`PDF generation failed: ${err.message || err}. Check the browser console for details.`);
    } finally {
      setExporting(false);
    }
  };

  // ── Fill hourly gaps (0-23) ────────────────────────────────────────────────
  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const found = (data?.hourlyDistribution || []).find(d => d.hour === h);
    const label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
    return { hour: label, orders: found?.orderCount || 0 };
  });

  // ── Pie: canteen share by revenue ─────────────────────────────────────────
  const canteenRevenuePie = (data?.topCanteens || []).map(c => ({
    name: c.canteenName,
    value: parseFloat(c.revenue?.toFixed(2) || 0)
  }));

  // ── Pie: product share by units sold ─────────────────────────────────────
  const productPie = (data?.topSellingProducts || []).slice(0, 6).map(p => ({
    name: p.productName,
    value: p.totalSold
  }));

  // ── Pie: retention ────────────────────────────────────────────────────────
  const rr = data?.repeatOrderRate ?? 0;
  const retentionPie = [
    { name: 'Repeat Customers', value: parseFloat(rr.toFixed(1)) },
    { name: 'One-Time', value: parseFloat((100 - rr).toFixed(1)) },
  ];

  // ── Pie: satisfaction distribution ───────────────────────────────────────
  const satisfactionPie = (data?.canteenSatisfaction || []).map(c => ({
    name: c.canteenName,
    value: c.reviewCount
  }));

  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-8">
      <div className="h-8 bg-white/10 rounded w-1/4" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => <div key={i} className="bg-[#111111] rounded-xl border border-white/10 h-28" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">Oops! Something went wrong</h2>
      <p className="text-white/60 mb-6">{error}</p>
      <button onClick={fetchData} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition flex items-center gap-2 font-medium">
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 pb-24" ref={printRef}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
          <p className="text-sm text-white/50 mt-1">Real-time operational intelligence for your campus</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedCanteen} onChange={e => setSelectedCanteen(e.target.value)}
            className="bg-[#111111] border border-white/10 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 p-2.5 outline-none max-w-[180px]">
            <option value="">All Canteens</option>
            {canteens.map(c => <option key={c.id} value={c.id}>{c.canteenName}</option>)}
          </select>
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="bg-[#111111] border border-white/10 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 p-2.5 outline-none">
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button onClick={fetchData} className="p-2.5 bg-[#111111] border border-white/10 text-white rounded-lg hover:bg-white/5 transition" title="Refresh">
            <RefreshCw className="w-4 h-4 text-white/70" />
          </button>
          <button
            onClick={exportPDF}
            disabled={exporting || !data}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', color: 'white', boxShadow: exporting ? 'none' : '0 0 16px rgba(249,115,22,0.35)' }}
            title="Download full analytics as PDF"
          >
            {exporting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg> Export PDF</>
            )}
          </button>
        </div>
      </div>

      {/* ── KPI Cards Row 1 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard title="Total Revenue" value={`Rs. ${data?.totalRevenue?.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          icon={<TrendingUp className="w-5 h-5 text-green-400" />} colorClass="bg-green-500/10 border-green-500/20" />
        <MetricCard title="Total Orders" value={data?.totalOrders?.toLocaleString() || '0'}
          icon={<ShoppingBag className="w-5 h-5 text-blue-400" />} colorClass="bg-blue-500/10 border-blue-500/20" />
        <MetricCard title="Active Users" value={data?.activeUsers?.toLocaleString() || '0'}
          icon={<Users className="w-5 h-5 text-purple-400" />} colorClass="bg-purple-500/10 border-purple-500/20" />
        <MetricCard title="Top Canteen" value={data?.topCanteen?.canteenName || 'N/A'}
          subtext={`Rs. ${data?.topCanteen?.revenue?.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          icon={<Store className="w-5 h-5 text-orange-400" />} colorClass="bg-orange-500/10 border-orange-500/20" />
      </div>

      {/* ── KPI Cards Row 2 (New) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard title="Best Seller" value={data?.bestSeller?.productName || 'N/A'}
          subtext={data?.bestSeller ? `${data.bestSeller.totalSold} units sold · ${data.bestSeller.canteenName}` : ''}
          icon={<Flame className="w-5 h-5 text-red-400" />} colorClass="bg-red-500/10 border-red-500/20"
          badge={{ text: '#1 Product', cls: 'bg-red-500/20 text-red-400' }} />
        <MetricCard title="Repeat Order Rate" value={`${data?.repeatOrderRate?.toFixed(1) || '0.0'}%`}
          subtext="Customers with 2+ orders in period"
          icon={<Repeat className="w-5 h-5 text-cyan-400" />} colorClass="bg-cyan-500/10 border-cyan-500/20" />
        <MetricCard title="Avg Wait Time" value={`${data?.fulfillmentStats?.avgWaitMinutes?.toFixed(1) || '0.0'} min`}
          subtext="Order placed → Ready for pickup"
          icon={<Clock className="w-5 h-5 text-yellow-400" />} colorClass="bg-yellow-500/10 border-yellow-500/20" />
        <MetricCard title="At-Risk Customers" value={data?.atRiskCustomers?.toLocaleString() || '0'}
          subtext="Ordered before, quiet for 10+ days"
          icon={<AlertTriangle className="w-5 h-5 text-orange-400" />} colorClass="bg-orange-500/10 border-orange-500/20"
          badge={(data?.atRiskCustomers > 0) ? { text: 'Needs Attention', cls: 'bg-orange-500/20 text-orange-400' } : null} />
      </div>

      {/* ── Revenue + User Growth ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard>
          <SectionHeader icon={<TrendingUp className="w-4 h-4 text-orange-400" />} title="Revenue Trend" subtitle="Daily revenue over selected period" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTrend || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `Rs.${v}`} />
                <Tooltip {...TOOLTIP_PROPS} formatter={v => [`Rs. ${v}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#f97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard>
          <SectionHeader icon={<Users className="w-4 h-4 text-purple-400" />} title="User Growth" subtitle="New registrations per day" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.userGrowth || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...TOOLTIP_PROPS} />
                <Bar dataKey="newUsers" name="New Users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Peak Hours ── */}
      <ChartCard>
        <SectionHeader icon={<Activity className="w-4 h-4 text-cyan-400" />} title="Peak Hours Traffic" subtitle="Order volume by hour of day — spot your rush times" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} interval={1} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip {...TOOLTIP_PROPS} />
              <Bar dataKey="orders" name="Orders" radius={[4, 4, 0, 0]}
                label={false}
                background={false}>
                {hourlyData.map((entry, i) => {
                  const maxOrders = Math.max(...hourlyData.map(d => d.orders), 1);
                  const intensity = entry.orders / maxOrders;
                  const r = Math.round(249 * intensity + 30 * (1 - intensity));
                  const g = Math.round(115 * intensity + 100 * (1 - intensity));
                  const b = Math.round(22 * intensity + 180 * (1 - intensity));
                  return <Cell key={i} fill={`rgb(${r},${g},${b})`} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* ── Pie Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue by Canteen Pie */}
        {canteenRevenuePie.length > 0 && (
          <ChartCard>
            <SectionHeader icon={<Store className="w-4 h-4 text-orange-400" />} title="Revenue Share by Canteen" subtitle="Which canteens are driving the most revenue" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={canteenRevenuePie} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {canteenRevenuePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_PROPS} formatter={v => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {/* Top Products Pie */}
        {productPie.length > 0 && (
          <ChartCard>
            <SectionHeader icon={<Flame className="w-4 h-4 text-red-400" />} title="Top Products by Units Sold" subtitle="Most ordered menu items" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {productPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_PROPS} formatter={v => [v, 'Units Sold']} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {/* Retention Pie */}
        <ChartCard>
          <SectionHeader icon={<Repeat className="w-4 h-4 text-cyan-400" />} title="Customer Retention" subtitle="Repeat vs one-time buyers in selected period" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={retentionPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" labelLine={false} label={renderCustomLabel}>
                  <Cell fill="#06b6d4" />
                  <Cell fill="rgba(255,255,255,0.08)" />
                </Pie>
                <Tooltip {...TOOLTIP_PROPS} formatter={v => [`${v}%`, '']} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-2">
            <span className="text-3xl font-bold text-cyan-400">{data?.repeatOrderRate?.toFixed(1) || '0.0'}%</span>
            <p className="text-xs text-white/40 mt-1">of customers ordered more than once</p>
          </div>
        </ChartCard>

        {/* Satisfaction Pie */}
        {satisfactionPie.length > 0 && (
          <ChartCard>
            <SectionHeader icon={<Star className="w-4 h-4 text-yellow-400" />} title="Review Volume by Canteen" subtitle="Who is getting the most customer feedback" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={satisfactionPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {satisfactionPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_PROPS} formatter={v => [v, 'Reviews']} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}
      </div>

      {/* ── Top Products Table ── */}
      {data?.topSellingProducts?.length > 0 && (
        <ChartCard>
          <SectionHeader icon={<Award className="w-4 h-4 text-yellow-400" />} title="Top Selling Products" subtitle="Ranked by units sold in selected period" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white/70">
              <thead className="text-xs text-white/40 uppercase">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Canteen</th>
                  <th className="px-4 py-3 text-right">Units Sold</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topSellingProducts.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: i < 3 ? PIE_COLORS[i] + '22' : 'rgba(255,255,255,0.05)', color: i < 3 ? PIE_COLORS[i] : 'rgba(255,255,255,0.5)', border: `1px solid ${i < 3 ? PIE_COLORS[i] + '55' : 'rgba(255,255,255,0.1)'}` }}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{p.productName}</td>
                    <td className="px-4 py-3 text-white/50">{p.canteenName}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">{p.totalSold}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-400">
                      Rs. {p.revenue?.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {/* ── Canteen Satisfaction Leaderboard + Fulfillment ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Satisfaction Leaderboard */}
        {data?.canteenSatisfaction?.length > 0 && (
          <ChartCard>
            <SectionHeader icon={<Star className="w-4 h-4 text-yellow-400" />} title="Satisfaction Leaderboard" subtitle="Average ratings from student reviews" />
            <div className="space-y-3">
              {data.canteenSatisfaction.map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/8 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20">{i + 1}</div>
                    <div>
                      <p className="font-medium text-white text-sm">{c.canteenName}</p>
                      <p className="text-xs text-white/40">{c.reviewCount} reviews</p>
                    </div>
                  </div>
                  <Stars rating={c.averageRating} />
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {/* Fulfillment Stats */}
        <ChartCard>
          <SectionHeader icon={<Clock className="w-4 h-4 text-yellow-400" />} title="Kitchen Efficiency" subtitle="Order processing time breakdown" />
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/5 rounded-xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Avg Wait Time (Order → Ready)</p>
              <p className="text-4xl font-bold text-yellow-400">{data?.fulfillmentStats?.avgWaitMinutes?.toFixed(1) || '—'} <span className="text-lg font-normal text-white/50">min</span></p>
              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-700"
                  style={{ width: `${Math.min(((data?.fulfillmentStats?.avgWaitMinutes || 0) / 30) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-white/30 mt-1">Target: under 15 min</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Avg Pickup Delay (Ready → Collected)</p>
              <p className="text-4xl font-bold text-cyan-400">{data?.fulfillmentStats?.avgPickupDelayMinutes?.toFixed(1) || '—'} <span className="text-lg font-normal text-white/50">min</span></p>
              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                  style={{ width: `${Math.min(((data?.fulfillmentStats?.avgPickupDelayMinutes || 0) / 20) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-white/30 mt-1">Based on {data?.fulfillmentStats?.sampleCount || 0} completed orders</p>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Top Performing Canteens Table ── */}
      {data?.topCanteens?.length > 0 && (
        <ChartCard>
          <SectionHeader icon={<Store className="w-4 h-4 text-orange-400" />} title="Top Performing Canteens" subtitle="Ranked by revenue generated in period" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white/70">
              <thead className="text-xs text-white/40 uppercase">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Canteen</th>
                  <th className="px-4 py-3 text-right">Orders</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topCanteens.map((c, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20">{i + 1}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{c.canteenName}</td>
                    <td className="px-4 py-3 text-right">{c.totalOrders?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-400">
                      Rs. {c.revenue?.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {/* ── Smart Insights ── */}
      <ChartCard>
        <SectionHeader icon={<AlertCircle className="w-4 h-4 text-orange-400" />} title="Smart Insights" subtitle="Auto-generated summary for this period" />
        <ul className="space-y-3">
          {data?.insights?.length > 0 ? data.insights.map((ins, i) => (
            <li key={i} className="flex items-start gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              <p className="text-sm font-medium text-white/90 leading-relaxed">{ins}</p>
            </li>
          )) : (
            <li className="text-white/40 bg-white/5 p-4 rounded-xl border border-white/5">No insights available for this period.</li>
          )}
        </ul>
      </ChartCard>

    </div>
  );
};

export default AdminAnalytics;
