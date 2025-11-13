import React from "react";
import './ReportEscrowTable.css'; // Можно вынести базовые стили, либо использовать общий CSS

interface TableRow {
  object_name: string;
  total: number;
  ddu_count: number;
}

interface Props {
  tableData: TableRow[];
  textColor?: string;
  subLabelColor?: string;
  bgCard?: string;
  theme?: string;
}

const currencyFormat = (n: number) =>
  typeof n === 'number'
    ? n >= 1e6
      ? Math.round(n / 1e5) / 10 + " млн"
      : n >= 1e3
        ? Math.round(n / 1e2) / 10 + " тыс"
        : n.toLocaleString("ru-RU")
    : '-';

const ReportEscrowTable: React.FC<Props> = ({
  tableData,
  textColor = "#233",
  bgCard = "#fff",
  theme = "light",
}) => (
  <div style={{
    background: bgCard,
    color: textColor,
    borderRadius: 14,
    margin: "20px auto",
    padding: "24px 8px",
    maxWidth: "92vw",
    boxShadow: theme === "dark"
      ? "0 2px 16px #18181b40"
      : "0 2px 16px #e3eafc16"
  }}>
    <table className="report-table" style={{
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
            <td colSpan={3} style={{ color: "#888", textAlign: "center", padding: "16px" }}>
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
);

export default ReportEscrowTable;
