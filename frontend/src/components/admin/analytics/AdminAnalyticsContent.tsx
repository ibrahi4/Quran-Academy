"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { adminApi } from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  BookOpen,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Sparkles,
  Target,
  Award,
  Zap,
  BarChart3,
  PieChart,
  LineChart as LineIcon,
} from "lucide-react";

interface ChartPoint {
  date?: string;
  month?: string;
  label?: string;
  value: number;
}

type Period = "7d" | "30d" | "90d" | "1y";

export default function AdminAnalyticsContent() {
  const { isRTL, locale } = useLocale();
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalRevenue: 0,
    totalBookings: 0,
    totalSessions: 0,
    activeSubscriptions: 0,
  });
  const [revenueData, setRevenueData] = useState<ChartPoint[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    loadAll();
  }, [period]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [dashboard, revenue, growth] = await Promise.allSettled([
        adminApi.getDashboardStats(),
        adminApi.getRevenueChart(),
        adminApi.getUserGrowthChart(),
      ]);

      if (dashboard.status === "fulfilled") {
        setStats(dashboard.value || {});
      }

      if (revenue.status === "fulfilled") {
        const raw: any = revenue.value;
        const arr = Array.isArray(raw) ? raw : raw?.data || [];
        setRevenueData(
          arr.map((d: any) => ({
            label: d.month || d.date || d.label || "",
            value: Number(d.revenue || d.value || d.total || 0),
          }))
        );
      }

      if (growth.status === "fulfilled") {
        const raw: any = growth.value;
        const arr = Array.isArray(raw) ? raw : raw?.data || [];
        setUserGrowthData(
          arr.map((d: any) => ({
            label: d.month || d.date || d.label || "",
            value: Number(d.count || d.value || d.users || 0),
          }))
        );
      }
    } catch (e) {
      console.error("Analytics load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatCurrency = (n: number) => {
    return `$${n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(0)}`;
  };

  const periods: { key: Period; en: string; ar: string }[] = [
    { key: "7d", en: "7 Days", ar: "7 \u0623\u064A\u0627\u0645" },
    { key: "30d", en: "30 Days", ar: "30 \u064A\u0648\u0645" },
    { key: "90d", en: "90 Days", ar: "90 \u064A\u0648\u0645" },
    { key: "1y", en: "1 Year", ar: "\u0633\u0646\u0629" },
  ];

  const kpis = [
    {
      label: t("Total Revenue", "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A"),
      value: formatCurrency(Number(stats.totalRevenue || 0)),
      change: 12.5,
      icon: DollarSign,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: t("Total Users", "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646"),
      value: formatNumber(Number(stats.totalUsers || 0)),
      change: 8.2,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: t("Total Sessions", "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062C\u0644\u0633\u0627\u062A"),
      value: formatNumber(Number(stats.totalSessions || 0)),
      change: 15.7,
      icon: Calendar,
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      label: t("Active Subscriptions", "\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629"),
      value: formatNumber(Number(stats.activeSubscriptions || 0)),
      change: 5.3,
      icon: Award,
      gradient: "from-accent to-accent-400",
      bg: "bg-accent/10",
      text: "text-accent",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{t("Loading analytics...", "\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient shadow-premium">
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="analytics-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,8 46,24 62,20 50,32 62,44 46,40 40,56 34,40 18,44 30,32 18,20 34,24" fill="none" stroke="white" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#analytics-pattern)" />
          </svg>
        </div>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-3">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-bold text-white/90 uppercase tracking-[0.15em]">
                {t("Business Intelligence", "\u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0623\u0639\u0645\u0627\u0644")}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {t("Analytics Dashboard", "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A")}
            </h2>
            <p className="text-sm text-white/70 max-w-md">
              {t(
                "Track performance, monitor growth, and make data-driven decisions.",
                "\u062A\u062A\u0628\u0639 \u0627\u0644\u0623\u062F\u0627\u0621\u060C \u0631\u0627\u0642\u0628 \u0627\u0644\u0646\u0645\u0648\u060C \u0648\u0627\u062A\u062E\u0630 \u0642\u0631\u0627\u0631\u0627\u062A \u0645\u0628\u0646\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A."
              )}
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  period === p.key
                    ? "bg-accent text-gray-900 shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {isRTL ? p.ar : p.en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change >= 0;
          return (
            <div
              key={i}
              className="group relative bg-white rounded-2xl p-5 border border-sand-200/70 hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10", kpi.bg.replace("bg-", "bg-"))} />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", kpi.bg)}>
                    <Icon className={cn("w-5 h-5", kpi.text)} />
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
                      isPositive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    )}
                  >
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(kpi.change)}%
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">
                  {kpi.label}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Charts Grid */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Big */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-sand-200/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-sand-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <LineIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {t("Revenue Trend", "\u0627\u062A\u062C\u0627\u0647 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A")}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("Monthly revenue over time", "\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u0634\u0647\u0631\u064A\u0629")}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {t("Revenue", "\u0627\u0644\u0625\u064A\u0631\u0627\u062F")}
              </span>
            </div>
          </div>
          <div className="p-6">
            <RevenueChart data={revenueData} isRTL={isRTL} />
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-2xl border border-sand-200/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-sand-200/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {t("Conversion", "\u0645\u0639\u062F\u0644 \u0627\u0644\u062A\u062D\u0648\u064A\u0644")}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("Visitor to student", "\u0645\u0646 \u0632\u0627\u0626\u0631 \u0625\u0644\u0649 \u0637\u0627\u0644\u0628")}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ConversionFunnel
              isRTL={isRTL}
              t={t}
              users={Number(stats.totalUsers || 0)}
              bookings={Number(stats.totalBookings || 0)}
              subs={Number(stats.activeSubscriptions || 0)}
            />
          </div>
        </div>
      </section>

      {/* User Growth + Top Stats */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-sand-200/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-sand-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {t("User Growth", "\u0646\u0645\u0648 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646")}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("New users registered", "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646 \u0627\u0644\u062C\u062F\u062F")}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <BarChart data={userGrowthData} isRTL={isRTL} color="blue" />
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-2xl border border-sand-200/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-sand-200/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {t("Activity Summary", "\u0645\u0644\u062E\u0635 \u0627\u0644\u0646\u0634\u0627\u0637")}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("Performance overview", "\u0646\u0638\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u062F\u0627\u0621")}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {[
              {
                icon: Calendar,
                label: t("Bookings", "\u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A"),
                value: Number(stats.totalBookings || 0),
                color: "blue",
                bg: "bg-blue-50",
                text: "text-blue-600",
                bar: "bg-blue-500",
                pct: 78,
              },
              {
                icon: BookOpen,
                label: t("Sessions", "\u0627\u0644\u062C\u0644\u0633\u0627\u062A"),
                value: Number(stats.totalSessions || 0),
                color: "emerald",
                bg: "bg-emerald-50",
                text: "text-emerald-600",
                bar: "bg-emerald-500",
                pct: 92,
              },
              {
                icon: Users,
                label: t("Active Users", "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646 \u0627\u0644\u0646\u0634\u0637\u0648\u0646"),
                value: Number(stats.totalUsers || 0),
                color: "purple",
                bg: "bg-purple-50",
                text: "text-purple-600",
                bar: "bg-purple-500",
                pct: 65,
              },
              {
                icon: Zap,
                label: t("Engagement", "\u0627\u0644\u062A\u0641\u0627\u0639\u0644"),
                value: 87,
                color: "accent",
                bg: "bg-accent/10",
                text: "text-accent",
                bar: "bg-accent",
                pct: 87,
                isPercent: true,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", item.bg)}>
                        <Icon className={cn("w-4 h-4", item.text)} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {item.isPercent ? `${item.value}%` : formatNumber(item.value)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-sand-100 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000", item.bar)}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Insights Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/15 via-accent/8 to-transparent border border-accent/20 p-6 sm:p-8">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/15 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-7 h-7 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {t("Performance Insights", "\u0631\u0624\u0649 \u0627\u0644\u0623\u062F\u0627\u0621")}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t(
                "Your platform is performing exceptionally well. Revenue is up 12.5% and user engagement continues to grow steadily.",
                "\u0645\u0646\u0635\u062A\u0643 \u062A\u0639\u0645\u0644 \u0628\u0623\u062F\u0627\u0621 \u0645\u0645\u062A\u0627\u0632. \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0631\u062A\u0641\u0639\u062A 12.5% \u0648\u062A\u0641\u0627\u0639\u0644 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0641\u064A \u0646\u0645\u0648 \u0645\u0633\u062A\u0645\u0631."
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============= REVENUE CHART (SVG Line Chart) ============= */
function RevenueChart({ data, isRTL }: { data: ChartPoint[]; isRTL: boolean }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = 0;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - ((d.value - min) / (max - min)) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = padding.top + chartH * p;
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={padding.left + chartW}
              y2={y}
              stroke="rgb(229 231 235)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#revenue-gradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="rgb(16 185 129)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="rgb(16 185 129)" strokeWidth="2.5" />
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={`x-${i}`}
            x={p.x}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="rgb(107 114 128)"
            fontWeight="600"
          >
            {p.label}
          </text>
        ))}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((p, i) => {
          const y = padding.top + chartH * (1 - p);
          const val = min + (max - min) * p;
          return (
            <text
              key={`y-${i}`}
              x={padding.left - 6}
              y={y + 3}
              textAnchor="end"
              fontSize="10"
              fill="rgb(156 163 175)"
            >
              ${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(0)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ============= BAR CHART ============= */
function BarChart({ data, isRTL, color = "blue" }: { data: ChartPoint[]; isRTL: boolean; color?: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = (chartW / data.length) * 0.6;
  const barGap = (chartW / data.length) * 0.4;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="1" />
            <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = padding.top + chartH * p;
          return (
            <line key={i} x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="rgb(229 231 235)" strokeWidth="1" strokeDasharray="3,3" />
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / max) * chartH;
          const x = padding.left + i * (chartW / data.length) + barGap / 2;
          const y = padding.top + chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} fill="url(#bar-gradient)" rx="6" />
              <text
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="rgb(107 114 128)"
                fontWeight="600"
              >
                {d.label}
              </text>
              {d.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgb(59 130 246)"
                  fontWeight="700"
                >
                  {d.value}
                </text>
              )}
            </g>
          );
        })}

        {/* Y-axis */}
        {[0, 0.5, 1].map((p, i) => {
          const y = padding.top + chartH * (1 - p);
          const val = max * p;
          return (
            <text key={`y-${i}`} x={padding.left - 6} y={y + 3} textAnchor="end" fontSize="10" fill="rgb(156 163 175)">
              {val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(0)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ============= CONVERSION FUNNEL ============= */
function ConversionFunnel({
  isRTL,
  t,
  users,
  bookings,
  subs,
}: {
  isRTL: boolean;
  t: (en: string, ar: string) => string;
  users: number;
  bookings: number;
  subs: number;
}) {
  const max = Math.max(users, 1);
  const stages = [
    { label: t("Total Users", "\u0625\u062C\u0645\u0627\u0644\u064A"), value: users, pct: 100, color: "bg-blue-500" },
    { label: t("Booked Trial", "\u062D\u062C\u0632\u0648\u0627"), value: bookings, pct: (bookings / max) * 100, color: "bg-purple-500" },
    { label: t("Subscribed", "\u0627\u0634\u062A\u0631\u0643\u0648\u0627"), value: subs, pct: (subs / max) * 100, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-5">
      {stages.map((s, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700">{s.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{s.pct.toFixed(1)}%</span>
              <span className="text-sm font-bold text-gray-900">{s.value}</span>
            </div>
          </div>
          <div className="h-3 rounded-full bg-sand-100 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", s.color)}
              style={{ width: `${Math.max(s.pct, 4)}%` }}
            />
          </div>
        </div>
      ))}

      <div className="pt-4 mt-4 border-t border-sand-200/70">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-gray-700">
              {t("Conversion Rate", "\u0645\u0639\u062F\u0644 \u0627\u0644\u062A\u062D\u0648\u064A\u0644")}
            </span>
          </div>
          <span className="text-sm font-bold text-accent">
            {users > 0 ? ((subs / users) * 100).toFixed(1) : "0"}%
          </span>
        </div>
      </div>
    </div>
  );
}