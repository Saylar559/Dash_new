import React, { useEffect, useState, useMemo } from "react";
import {
  IconDashboard,
  IconFileAnalytics,
  IconArrowRight,
  IconArrowLeft,
  IconLogout,
  IconLoader2,
  IconWallet,
  IconUsers,
  IconChartLine,
  IconSearch,
} from "@tabler/icons-react";
import { useDashboardFiles } from "./DeveloperPanel/hooks/useDashboardFiles";
import DashboardPreview from "./DeveloperPanel/components/DashboardPreview";
import EscrowAccountsReport from "./Reports/EscrowAccountsReport"; // Новый компонент
import "./style_page/ViewerPanel.css";

// === Конфигурация ===
const TABS = [
  { label: "Дашборды", value: "dashboards" as const, icon: <IconDashboard size={20} /> },
  { label: "Отчеты", value: "reports" as const, icon: <IconFileAnalytics size={20} /> },
] as const;

const REPORT_CARDS = [
  {
    id: "report-escrow",
    title: "Отчет по счетам ЭСКРОУ",
    description: "Детальная информация по эскроу-счетам",
    icon: <IconWallet size={32} />,
    color: "emerald",
    available: true, // Доступен для открытия
  },
  {
    id: "report-finance",
    title: "Финансовый отчет",
    description: "Анализ доходов и расходов",
    icon: <IconChartLine size={32} />,
    color: "blue",
    available: false,
  },
  {
    id: "report-users",
    title: "Активность пользователей",
    description: "Статистика и метрики",
    icon: <IconUsers size={32} />,
    color: "violet",
    available: false,
  },
  {
    id: "report-analytics",
    title: "Аналитика данных",
    description: "Глубокий анализ трендов",
    icon: <IconSearch size={32} />,
    color: "amber",
    available: false,
  },
] as const;

// === Типы ===
interface DashboardDetail {
  id: string;
  config: any;
  title: string;
  desc: string;
}

type TabValue = "dashboards" | "reports";
type ViewMode = "list" | "dashboard" | "report";

const PublicDashboardsPage: React.FC = () => {
  const { dashboards, loading, fetchDashboards, getDashboard } = useDashboardFiles();
  const [list, setList] = useState<any[]>([]);
  const [selected, setSelected] = useState<DashboardDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("dashboards");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // === Загрузка ===
  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  useEffect(() => {
    setList(Array.isArray(dashboards) ? dashboards : []);
  }, [dashboards]);

  // === Опубликованные дашборды ===
  const published = useMemo(
    () =>
      list.filter(
        (d) => d && (d.is_published === true || d.is_published === "true")
      ),
    [list]
  );

  // === Обработчики дашбордов ===
  const handleShow = async (d: any) => {
    try {
      const detail = await getDashboard(d.id);
      setSelected({
        id: d.id,
        config: detail.config,
        title: typeof d.title === "string" ? d.title : "[Без названия]",
        desc: typeof d.description === "string" ? d.description : "",
      });
      setViewMode("dashboard");
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Ошибка загрузки дашборда:", error);
      alert("Не удалось загрузить дашборд. Попробуйте позже.");
    }
  };

  // === Обработчики отчетов ===
  const handleShowReport = (reportId: string) => {
    const report = REPORT_CARDS.find((r) => r.id === reportId);
    if (report && report.available) {
      setSelectedReport(reportId);
      setViewMode("report");
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const handleExit = () => {
    setSelected(null);
    setSelectedReport(null);
    setViewMode("list");
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    if (window.confirm("Вы уверены, что хотите выйти?")) {
      window.location.href = "/login";
    }
  };

  // === UI Helpers ===
  const getPageTitle = () => {
    if (viewMode === "dashboard" && selected) return selected.title;
    if (viewMode === "report" && selectedReport) {
      const report = REPORT_CARDS.find((r) => r.id === selectedReport);
      return report?.title || "Отчет";
    }
    return activeTab === "dashboards" ? "Ваши дашборды" : "Отчеты";
  };

  const getPageDescription = () => {
    if (viewMode === "dashboard" && selected) return selected.desc;
    if (viewMode === "report" && selectedReport) {
      const report = REPORT_CARDS.find((r) => r.id === selectedReport);
      return report?.description || "";
    }
    return activeTab === "dashboards"
      ? "Выберите дашборд для просмотра аналитики"
      : "Выберите тип отчета для детального анализа";
  };

  // === Рендер отчета ===
  const renderReport = () => {
    switch (selectedReport) {
      case "report-escrow":
        return <EscrowAccountsReport />;
      // Добавьте другие отчеты здесь
      default:
        return <div>Отчет не найден</div>;
    }
  };

  // === Рендер ===
  return (
    <div className="viewer-page">
      {/* Header */}
      <header className="viewer-header">
        <div className="viewer-header-content">
          <div className="viewer-logo-section">
            <div className="viewer-logo">
              <span>D</span>
            </div>
            <div className="viewer-brand">
              <h1>Dashboard</h1>
              <p>Панель управления</p>
            </div>
          </div>
          <button
            className="viewer-logout-btn"
            onClick={handleLogout}
            aria-label="Выйти из системы"
            type="button"
          >
            <span>Выйти</span>
            <IconLogout size={18} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="viewer-main">
        {viewMode === "list" ? (
          <>
            {/* Page Header */}
            <div className="viewer-page-header">
              <h2>{getPageTitle()}</h2>
              <p>{getPageDescription()}</p>
            </div>

            {/* Tabs */}
            <nav className="viewer-tabs" role="tablist" aria-label="Навигация по разделам">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab(tab.value)}
                  className={`viewer-tab ${activeTab === tab.value ? "viewer-tab-active" : ""}`}
                  aria-selected={activeTab === tab.value}
                  aria-controls={`${tab.value}-panel`}
                >
                  <span className="viewer-tab-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Dashboards Tab */}
            {activeTab === "dashboards" && (
              <div
                className="viewer-content"
                role="tabpanel"
                id="dashboards-panel"
                aria-labelledby="dashboards-tab"
              >
                {loading && (
                  <div className="viewer-loading">
                    <IconLoader2 className="viewer-spinner" size={48} />
                    <span className="viewer-sr-only">Загрузка...</span>
                  </div>
                )}

                {!loading && published.length === 0 && (
                  <div className="viewer-empty">
                    <div className="viewer-empty-icon">
                      <IconDashboard size={64} />
                    </div>
                    <h3>Нет доступных дашбордов</h3>
                    <p>Дашборды появятся здесь после публикации</p>
                  </div>
                )}

                {!loading && published.length > 0 && (
                  <div className="viewer-grid">
                    {published.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleShow(d)}
                        className="viewer-card"
                        aria-label={`Открыть дашборд ${d.title || "без названия"}`}
                      >
                        <div className="viewer-card-header">
                          <div className="viewer-card-icon">
                            <IconDashboard size={28} />
                          </div>
                          <div className="viewer-card-info">
                            <h3>{typeof d.title === "string" ? d.title : "[Без названия]"}</h3>
                            <p>{d.description || "Описание отсутствует"}</p>
                          </div>
                        </div>
                        <div className="viewer-card-action">
                          <span>Открыть</span>
                          <IconArrowRight size={16} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div
                className="viewer-content"
                role="tabpanel"
                id="reports-panel"
                aria-labelledby="reports-tab"
              >
                <div className="viewer-reports-grid">
                  {REPORT_CARDS.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      className={`viewer-report-card viewer-report-${card.color} ${
                        card.available ? "viewer-report-available" : ""
                      }`}
                      aria-label={`${card.title}: ${card.description}`}
                      disabled={!card.available}
                      onClick={() => card.available && handleShowReport(card.id)}
                    >
                      <div className="viewer-report-header">
                        <div className="viewer-report-icon">{card.icon}</div>
                        <div className="viewer-report-info">
                          <h3>{card.title}</h3>
                          <p>{card.description}</p>
                        </div>
                      </div>
                      {card.available ? (
                        <div className="viewer-report-action">
                          <span>Открыть отчет</span>
                          <IconArrowRight size={16} />
                        </div>
                      ) : (
                        <div className="viewer-report-badge">Скоро доступно</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : viewMode === "dashboard" && selected ? (
          /* Dashboard Viewer */
          <div className="viewer-dashboard">
            <div className="viewer-dashboard-header">
              <div className="viewer-dashboard-info">
                <button
                  type="button"
                  onClick={handleExit}
                  className="viewer-back-btn"
                  aria-label="Вернуться к списку дашбордов"
                >
                  <IconArrowLeft size={20} />
                </button>
                <div>
                  <h2>{selected.title}</h2>
                  {selected.desc && <p>{selected.desc}</p>}
                </div>
              </div>
            </div>
            <div className="viewer-dashboard-content">
              <DashboardPreview config={selected.config} isPublished canEdit={false} />
            </div>
          </div>
        ) : viewMode === "report" && selectedReport ? (
          /* Report Viewer */
          <div className="viewer-dashboard">
            <div className="viewer-dashboard-header">
              <div className="viewer-dashboard-info">
                <button
                  type="button"
                  onClick={handleExit}
                  className="viewer-back-btn"
                  aria-label="Вернуться к списку отчетов"
                >
                  <IconArrowLeft size={20} />
                </button>
                <div>
                  <h2>{getPageTitle()}</h2>
                  <p>{getPageDescription()}</p>
                </div>
              </div>
            </div>
            <div className="viewer-dashboard-content">{renderReport()}</div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default PublicDashboardsPage;
