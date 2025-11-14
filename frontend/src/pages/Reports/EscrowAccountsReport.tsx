import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Search, Building2, DollarSign, Users, AlertCircle, X } from "lucide-react";
import EscrowChart from "./EscrowChart";
import "./EscrowAccountsReport.css";

const REPORT_SQL = `
  SELECT
    object_name,
    TO_CHAR(operation_date, 'YYYY-MM') as month,
    amount,
    ddu_number
  FROM escrow_entries
  WHERE operation_date IS NOT NULL
  ORDER BY operation_date ASC
`;

interface Row {
  object_name: string;
  month: string;
  amount: number;
  ddu_number: string;
}

interface AggregatedRow {
  object_name: string;
  total: number;
  ddu_count: number;
}

const useEscrowData = () => {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.post("/api/query/", { query: REPORT_SQL });
        if (isMounted) {
          setData(Array.isArray(res.data.data) ? res.data.data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Ошибка загрузки данных");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
};

const formatAmount = (n: number): string => {
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + " млн ₽";
};

const getMonthName = (m: string): string => {
  const names = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  return names[parseInt(m, 10) - 1] || m;
};

export default function EscrowAccountsReport() {
  const { data, loading, error } = useEscrowData();
  const [tableSearch, setTableSearch] = useState("");
  const [tableYear, setTableYear] = useState("");
  const [tableMonth, setTableMonth] = useState("");

  const years = useMemo(() => {
    const set = new Set(data.map((r) => r.month.slice(0, 4)));
    return Array.from(set).sort().reverse();
  }, [data]);

  const tableMonths = useMemo(() => {
    if (!tableYear) return [];
    const set = new Set(
      data
        .filter((r) => r.month.startsWith(tableYear))
        .map((r) => r.month.slice(5, 7))
    );
    return Array.from(set).sort();
  }, [data, tableYear]);

  const dataUpToSelected = useMemo(() => {
    if (!tableYear) return data;
    const cutoff = tableMonth ? `${tableYear}-${tableMonth}` : `${tableYear}-12`;
    return data.filter((r) => r.month <= cutoff);
  }, [data, tableYear, tableMonth]);

  const filteredTableData = useMemo(() => {
    return dataUpToSelected.filter((r) => {
      const matchesSearch = !tableSearch || r.object_name.toLowerCase().includes(tableSearch.toLowerCase());
      return matchesSearch;
    });
  }, [dataUpToSelected, tableSearch]);

  const tableRows = useMemo((): AggregatedRow[] => {
    const objectData = new Map<string, { total: number; dduSet: Set<string> }>();
    filteredTableData.forEach((r) => {
      if (!objectData.has(r.object_name)) {
        objectData.set(r.object_name, { total: 0, dduSet: new Set() });
      }
      const entry = objectData.get(r.object_name)!;
      entry.total += Number(r.amount) || 0;
      entry.dduSet.add(r.ddu_number);
    });
    return Array.from(objectData.entries())
      .map(([object_name, { total, dduSet }]) => ({
        object_name,
        total,
        ddu_count: dduSet.size,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredTableData]);

  const resetTableFilters = useCallback(() => {
    setTableSearch("");
    setTableYear("");
    setTableMonth("");
  }, []);

  if (error) {
    return (
      <div className="grok-report">
        <div className="grok-container">
          <div className="grok-card p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
            <p className="text-xl font-semibold text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
            >
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grok-report">
      <div className="grok-container">
        {/* Заголовок */}
        <div className="grok-header">
          <div>
            <h1 className="grok-title">Эскроу-счета</h1>
            <p className="grok-subtitle">
              {loading
                ? "Загрузка данных..."
                : `${tableRows.length} ${tableRows.length === 1 ? "объект" : "объектов"}`}
              {tableYear && tableMonth && (
                <span className="grok-period">
                  • до {getMonthName(tableMonth)} {tableYear}
                </span>
              )}
            </p>
          </div>
          {(tableSearch || tableYear || tableMonth) && (
            <button
              onClick={resetTableFilters}
              className="grok-reset-btn"
            >
              <X className="w-5 h-5" />
              Сбросить
            </button>
          )}
        </div>

        {/* Фильтры */}
        <div className="grok-filters">
          <div className="grok-search-wrapper">
            <Search className="grok-search-icon" />
            <input
              type="text"
              placeholder="Поиск объекта..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="grok-search"
            />
          </div>

          <select
            value={tableYear}
            onChange={(e) => {
              setTableYear(e.target.value);
              setTableMonth("");
            }}
            className="grok-select"
          >
            <option value="">Все годы</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {tableYear && (
            <select
              value={tableMonth}
              onChange={(e) => setTableMonth(e.target.value)}
              className="grok-select"
            >
              <option value="">Все месяцы</option>
              {tableMonths.map((m) => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
          )}
        </div>

        {/* Таблица */}
        <div className="grok-card mt-8">
          <div className="p-6">
            {loading ? (
              <div className="grok-skeleton">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="grok-skeleton-row">
                    <div className="grok-skeleton-line w-3/5"></div>
                    <div className="grok-skeleton-line w-1/5"></div>
                    <div className="grok-skeleton-line w-1/6"></div>
                  </div>
                ))}
              </div>
            ) : tableRows.length === 0 ? (
              <div className="grok-empty">
                <Building2 className="grok-empty-icon" />
                <p className="grok-empty-text">Нет данных</p>
              </div>
            ) : (
              <table className="grok-table w-full">
                <thead>
                  <tr className="grok-table-header">
                    <th className="grok-th-left">
                      <Building2 className="inline w-5 h-5 mr-2" />
                      Объект
                    </th>
                    <th className="grok-th-right">
                      <DollarSign className="inline w-5 h-5 mr-1" />
                      Остаток
                    </th>
                    <th className="grok-th-right">
                      <Users className="inline w-5 h-5 mr-1" />
                      ДДУ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, idx) => (
                    <tr key={row.object_name} className="grok-table-row">
                      <td className="grok-td-object">{row.object_name}</td>
                      <td className="grok-td-amount">{formatAmount(row.total)}</td>
                      <td className="grok-td-count">{row.ddu_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* График */}
        {!loading && data && data.length > 0 && (
          <EscrowChart rawData={data} loading={loading} allYears={years} />
        )}
      </div>
    </div>
  );
}