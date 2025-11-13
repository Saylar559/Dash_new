import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import './EscrowAccountsReport.css';

const monthsRu = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
];
const formatMonthRu = ym => {
  const [y, m] = ym.split('-');
  return `${monthsRu[parseInt(m, 10) - 1]} '${y.slice(2)}`;
};
const currencyFormat = n =>
  typeof n === 'number'
    ? n >= 1e6
      ? Math.round(n / 1e5) / 10 + " млн"
      : n >= 1e3
        ? Math.round(n / 1e2) / 10 + " тыс"
        : n.toLocaleString("ru-RU")
    : '-';

const REPORT_SQL = `
  SELECT
    id,
    ddu_number,
    operation_date,
    amount,
    payer_name,
    object_name
  FROM escrow_entries
  ORDER BY operation_date, object_name
`;

const EscrowAccountsReport = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterObj, setFilterObj] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [theme, setTheme] = useState("light");
  const isDark = theme === "dark";

  useEffect(() => {
    setLoading(true);
    axios
      .post("/api/query/", { query: REPORT_SQL })
      .then(res => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const withMonth = data.map(r => ({
          ...r,
          month: r.operation_date?.slice(0, 7)
        }));
        setRows(withMonth);
      })
      .catch(err => setError(err?.response?.data?.detail || err.message))
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(() =>
    [...new Set(rows.map(r => r.month?.substring(0, 4)))].sort(),
    [rows]
  );
  const monthsInSelectedYear = useMemo(() => {
    if (!filterYear) return [];
    return [...new Set(
      rows.filter(row => row.month?.startsWith(filterYear))
        .map(r => r.month?.substring(5, 7))
    )].sort();
  }, [rows, filterYear]);
  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      if (filterObj && !row.object_name?.toLowerCase().includes(filterObj.trim().toLowerCase())) return false;
      if (filterYear && !row.month?.startsWith(filterYear)) return false;
      if (filterMonth && row.month !== filterMonth) return false;
      return true;
    });
  }, [rows, filterObj, filterMonth, filterYear]);

  // Итоговая таблица по объектам
  const tableData = useMemo(() => {
    const byObj = {};
    for (const row of filteredRows) {
      if (!byObj[row.object_name])
        byObj[row.object_name] = {
          object_name: row.object_name,
          total: 0,
          dduSet: new Set()
        };
      byObj[row.object_name].total += Number(row.amount) || 0;
      byObj[row.object_name].dduSet.add(row.ddu_number);
    }
    return Object.values(byObj).map(obj => ({
      object_name: obj.object_name,
      total: obj.total,
      ddu_count: obj.dduSet.size
    }));
  }, [filteredRows]);

  // Цвета/стили
  const textColor = isDark ? "#f6f6f6" : "#233";
  const bgCard = isDark ? "linear-gradient(155deg,#22252e 45%,#232428 100%)" : "#fff";

  return (
    <div className={`escrow-report-container ${isDark ? "theme-dark" : "theme-light"}`}
      style={{
        background: isDark ? "#1a1b23" : "#f8fafd",
        minHeight: "100vh"
      }}>
      <div className="escrow-report-header"
        style={{
          background: bgCard,
          color: textColor,
          borderRadius: 0,
          marginBottom: 22,
          boxShadow: isDark ? "0 2px 24px #14151a50" : "0 2px 16px #e3eafc22",
          padding: "20px 24px"
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="escrow-report-title" style={{
            fontSize: "1.32rem", color: "#2269c6", margin: 0
          }}>
            <span role="img" aria-label="Escrow" style={{ fontSize: "1.18em", marginRight: 8 }}>💰</span>
            Отчет по эскроу-счетам (escrow_entries)
          </h2>
          <button
            className="escrow-switch-theme-btn"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Переключить на светлую" : "Переключить на тёмную"}
            style={{
              background: isDark ? "#2a3141" : "#f3f6fc", border: "none", borderRadius: 9,
              color: isDark ? "#eee" : "#223", fontWeight: 600, padding: "7px 12px", marginLeft: 14,
              boxShadow: "0 2px 9px #2231a028", cursor: "pointer", fontSize: "1.09em"
            }}
          >{isDark ? "🌞 Светлая" : "🌚 Тёмная"}
          </button>
        </div>
        <div className="escrow-report-tools-row" style={{ flexWrap: "wrap", alignItems: "center", marginTop: 18, gap: 10 }}>
          <input className="escrow-report-filter-input"
            type="search" placeholder="Поиск по объекту..."
            value={filterObj} onChange={e => setFilterObj(e.target.value)}
            maxLength={48} aria-label="Поиск по объекту"
            style={{
              background: isDark ? "#272d39" : "#fafdff", color: textColor,
              border: isDark ? "1.3px solid #334556" : "1.5px solid #e2e8f0",
              padding: "8px 14px", borderRadius: 7, fontSize: "1em", outline: "none"
            }} />
          <select
            value={filterYear}
            onChange={e => { setFilterYear(e.target.value); setFilterMonth(""); }}
            style={{
              padding: "8px 12px", borderRadius: 7, fontWeight: 600,
              background: isDark ? "#272d39" : "#eef2fa", color: textColor,
              border: isDark ? "1.3px solid #334556" : "1.5px solid #dae5f6",
              cursor: "pointer", outline: "none", fontSize: "1em"
            }}>
            <option value="">Год (все)</option>
            {years.map(y => <option value={y} key={y}>{y}</option>)}
          </select>
          {filterYear && (
            <select value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              style={{
                padding: "8px 12px", borderRadius: 7,
                background: isDark ? "#272d39" : "#eef2fa", color: textColor,
                border: isDark ? "1.3px solid #334556" : "1.5px solid #dae5f6",
                fontWeight: 600, cursor: "pointer", outline: "none", fontSize: "1em"
              }}>
              <option value="">Месяц (все)</option>
              {monthsInSelectedYear.map(m => (
                <option value={`${filterYear}-${m}`} key={m}>{monthsRu[parseInt(m, 10) - 1]}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Таблица */}
      <div className="escrow-table-card" style={{
        background: bgCard,
        color: textColor,
        borderRadius: 14,
        margin: "20px auto",
        padding: "24px 8px",
        maxWidth: "92vw",
        boxShadow: isDark ? "0 2px 16px #18181b40" : "0 2px 16px #e3eafc16"
      }}>
        <table className="escrow-report-table" style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "1.05em"
        }}>
          <thead>
            <tr>
              <th>Наименование объекта</th>
              <th>Остаток на счетах ЭСКРОУ (накопит.)</th>
              <th>Кол-во ДДУ (накопит.)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={3}
                  style={{ color: "#888", textAlign: "center", padding: "18px" }}>
                  Нет данных для выбранных параметров
                </td>
              </tr>
            ) : (
              tableData.map(row => (
                <tr key={row.object_name}>
                  <td>{row.object_name}</td>
                  <td>{currencyFormat(row.total)}</td>
                  <td>{row.ddu_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="escrow-report-loading" style={{
          textAlign: "center", padding: 48, fontSize: "1.2em", color: "#2269c6"
        }}>
          Загрузка...
        </div>
      )}
      {error && (
        <div className="escrow-report-error" role="alert" style={{
          background: isDark ? "#3a1f1f" : "#fff5f5",
          border: `2px solid ${isDark ? "#c53030" : "#fc8181"}`,
          borderRadius: 12, padding: 20, margin: "20px auto",
          maxWidth: 800, width: "98%", color: isDark ? "#feb2b2" : "#c53030"
        }}>
          <span className="escrow-error-icon" style={{ fontSize: "1.3em", marginRight: 10 }}>⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default EscrowAccountsReport;
