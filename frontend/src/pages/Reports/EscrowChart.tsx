import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, X } from "lucide-react";

interface Row {
  object_name: string;
  month: string;
  amount: number;
  ddu_number: string;
}

interface ChartData {
  month: string;
  [key: string]: number | string;
}

interface EscrowChartProps {
  rawData: Row[];
  loading: boolean;
  allYears: string[];
}

const getMonthName = (m: string) => {
  const names = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  return names[parseInt(m, 10) - 1] || m;
};

const formatValue = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000) return `${(n / 1_000).toFixed(0)} млрд ₽`;
  if (abs >= 1) return `${n.toFixed(1).replace(/\.0$/, "")} млн ₽`;
  return `${n.toFixed(1)} млн ₽`;
};

// === КАСТОМНЫЙ TOOLTIP ===
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const [year, month] = label.split("-");
  const monthName = getMonthName(month);
  const isCumulative = payload[0]?.payload?.__isCumulative ?? true;

  // Сортируем по убыванию
  const sortedPayload = [...payload]
    .filter((p: any) => p.value != null)
    .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

  const total = sortedPayload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);

  return (
    <div
      className="bg-white/96 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-gray-100"
      style={{
        animation: "tooltipFadeIn 0.25s ease-out",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
      }}
    >
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-sm font-semibold text-gray-900">
          {monthName} {year}
        </p>
      </div>

      {/* Объекты */}
      <div className="space-y-2.5">
        {sortedPayload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium text-gray-700 truncate max-w-36">
                {entry.name}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {formatValue(entry.value)}
              </p>
              <p className="text-xs text-gray-500">
                {isCumulative ? "накоп." : "месяц"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Итог */}
      {sortedPayload.length > 1 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-600">Итого</span>
            <span className="text-sm font-bold text-blue-600">
              {formatValue(total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function EscrowChart({ rawData = [], loading, allYears }: EscrowChartProps) {
  const [chartYear, setChartYear] = useState<string>("");
  const [chartMonth, setChartMonth] = useState<string>("");
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [cumulative, setCumulative] = useState(true);

  const safeData = rawData || [];

  // === Фильтры ===
  const chartMonths = useMemo(() => {
    if (!chartYear) return [];
    const set = new Set(
      safeData
        .filter((r) => r.month.startsWith(chartYear))
        .map((r) => r.month.slice(5, 7))
    );
    return Array.from(set).sort();
  }, [safeData, chartYear]);

  const dataUpToSelected = useMemo(() => {
    if (!chartYear) return safeData;
    const cutoff = chartMonth ? `${chartYear}-${chartMonth}` : `${chartYear}-12`;
    return safeData.filter((r) => r.month <= cutoff);
  }, [safeData, chartYear, chartMonth]);

  const allObjects = useMemo(() => {
    const set = new Set<string>();
    dataUpToSelected.forEach((r) => set.add(r.object_name));
    return Array.from(set).sort();
  }, [dataUpToSelected]);

  // === Данные графика ===
  const chartData = useMemo((): ChartData[] => {
    if (dataUpToSelected.length === 0) return [];

    const monthsMap = new Map<string, Map<string, number>>();
    const sortedMonths = new Set<string>();

    dataUpToSelected.forEach((r) => {
      const m = r.month;
      sortedMonths.add(m);
      if (!monthsMap.has(m)) monthsMap.set(m, new Map());
      const objMap = monthsMap.get(m)!;
      objMap.set(r.object_name, (objMap.get(r.object_name) || 0) + Number(r.amount));
    });

    const result: ChartData[] = [];
    const cumulativeTotals: { [key: string]: number } = {};
    const months = Array.from(sortedMonths).sort();

    months.forEach((fullMonth) => {
      const objects = monthsMap.get(fullMonth)!;
      const entry: ChartData = { month: fullMonth, __isCumulative: cumulative };
      const targetObjects = selectedObjects.length === 0 ? allObjects : selectedObjects;

      targetObjects.forEach((obj) => {
        const monthly = (objects.get(obj) || 0) / 1_000_000;
        if (cumulative) {
          cumulativeTotals[obj] = (cumulativeTotals[obj] || 0) + monthly;
          entry[obj] = cumulativeTotals[obj];
        } else {
          entry[obj] = monthly;
        }
      });
      result.push(entry);
    });

    return result;
  }, [dataUpToSelected, selectedObjects, cumulative, allObjects]);

  // === Динамический размер ===
  const dataPointsCount = chartData.length;

  const getDynamicHeight = () => {
    if (dataPointsCount === 0) return 300;
    if (dataPointsCount <= 3) return 340;
    if (dataPointsCount <= 6) return 400;
    if (dataPointsCount <= 12) return 460;
    if (dataPointsCount <= 24) return 520;
    return 580;
  };

  const getXAxisAngle = () => {
    if (dataPointsCount <= 4) return 0;
    if (dataPointsCount <= 8) return -30;
    return -45;
  };

  const getXAxisHeight = () => {
    if (dataPointsCount <= 4) return 60;
    if (dataPointsCount <= 8) return 75;
    return 95;
  };

  const dynamicHeight = getDynamicHeight();
  const xAxisAngle = getXAxisAngle();
  const xAxisHeight = getXAxisHeight();

  const toggleObject = (obj: string) => {
    setSelectedObjects((prev) =>
      prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj]
    );
  };

  const resetChartFilters = () => {
    setChartYear("");
    setChartMonth("");
  };

  // === Цвета ===
  const colors = ["#3b82f6", "#ef4444", "#f97316", "#a855f7", "#10b981", "#06b6d4"];

  // === Загрузка / Пусто ===
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-full w-48 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-2 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (safeData.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="text-gray-400 mb-3">
          <TrendingUp className="w-10 h-10 mx-auto" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Нет данных</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
      {/* Заголовок + Фильтры */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          Динамика остатков
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={chartYear}
            onChange={(e) => {
              setChartYear(e.target.value);
              setChartMonth("");
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">Все годы</option>
            {allYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {chartYear && (
            <select
              value={chartMonth}
              onChange={(e) => setChartMonth(e.target.value)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Все месяцы</option>
              {chartMonths.map((m) => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
          )}
          {(chartYear || chartMonth) && (
            <button
              onClick={resetChartFilters}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-2xl hover:bg-red-100 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Чипы объектов */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allObjects.map((obj, i) => (
          <button
            key={obj}
            onClick={() => toggleObject(obj)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
              selectedObjects.includes(obj)
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            {obj}
            {selectedObjects.includes(obj) && <X className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* Переключатель "Накопительно" */}
      <div className="flex justify-end mb-5">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={cumulative}
              onChange={(e) => setCumulative(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-10 h-6 rounded-full shadow-inner transition-all duration-300 ${
                cumulative ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                  cumulative ? "translate-x-4" : ""
                }`}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">Накопительно</span>
        </label>
      </div>

      {/* График с АВТОМАТИЧЕСКОЙ высотой */}
      <div
        className="transition-all duration-500 ease-out -mx-4"
        style={{ height: `${dynamicHeight}px` }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: xAxisHeight - 40 }}
          >
            <CartesianGrid strokeDasharray="6 6" stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => {
                const [year, month] = value.split("-");
                const shortYear = `'${year.slice(2)}`;
                const monthName = getMonthName(month);
                return dataPointsCount <= 4 ? `${monthName} ${year}` : `${monthName} ${shortYear}`;
              }}
              tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              angle={xAxisAngle}
              textAnchor={xAxisAngle === 0 ? "middle" : "end"}
              height={xAxisHeight}
            />
            <YAxis
              tickFormatter={(v) => {
                if (v >= 1000) return `${(v / 1000).toFixed(0)}млрд`;
                return `${v.toFixed(0)}млн`;
              }}
              tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
              wrapperStyle={{
                paddingBottom: dataPointsCount <= 4 ? "8px" : "16px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#48484a",
              }}
            />
            {(selectedObjects.length === 0 ? allObjects : selectedObjects).map((obj, i) => (
              <Line
                key={obj}
                type="monotone"
                dataKey={obj}
                stroke={colors[i % colors.length]}
                strokeWidth={dataPointsCount <= 6 ? 2.4 : 2}
                dot={{
                  r: dataPointsCount <= 6 ? 5 : 4.5,
                  fill: colors[i % colors.length],
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                activeDot={{ r: dataPointsCount <= 6 ? 7.5 : 6.5 }}
                name={obj}
                animationDuration={1400}
                connectNulls
                strokeLinecap="round"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <style jsx>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}