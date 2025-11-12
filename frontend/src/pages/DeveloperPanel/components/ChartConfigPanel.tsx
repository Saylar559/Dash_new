import React, { useState, useEffect, useRef } from "react";
import "../styles/ChartConfigPanel.css";

const CHART_TYPES = [
  { value: "line", label: "Линейный" },
  { value: "bar", label: "Гистограмма" },
  { value: "area", label: "Площадной" },
  { value: "pie", label: "Круговая" },
  { value: "doughnut", label: "Кольцевая" },
  { value: "radar", label: "Радар" },
  { value: "scatter", label: "Точечный" },
  { value: "bubble", label: "Пузырьковый" },
  { value: "polarArea", label: "Полярная" },
];

const PALETTE = [
  "#8BC540", "#4EC3E0", "#2F444E", "#F89445", "#FF6E84", "#76787A", "#E9F5DF"
];
const MARKER_TYPES = [
  { value: "circle", label: "Круг" },
  { value: "rect", label: "Квадрат" },
  { value: "diamond", label: "Ромб" },
  { value: "star", label: "Звезда" },
];

const LEGEND_POSITIONS = [
  { value: "top", label: "Сверху" },
  { value: "bottom", label: "Снизу" },
  { value: "left", label: "Слева" },
  { value: "right", label: "Справа" },
  { value: "hidden", label: "Скрыть" },
];

interface ChartConfig {
  type: string;
  colors: string[];
  legendPosition: string;
  showTitle: boolean;
  titleText: string;
  dark: boolean;
  borderWidth: number;
  fill: boolean;
  smoothing: number;
  fontSize: number;
  xAxisLabel: string;
  yAxisLabel: string;
  showGrid: boolean;
  legendFontSize: number;
  tooltipFormat: string;
  markerType?: string;
}

interface Props {
  onChange: (cfg: ChartConfig) => void;
  initial?: Partial<ChartConfig>;
}

const BIG_FIELD_STYLE: React.CSSProperties = {
  minWidth: 220, padding: 14, marginBottom: 18, background: '#f8fafd', borderRadius: 10,
  display: 'flex', flexDirection: 'column', gap: 8,
  boxShadow: '0 2px 8px rgba(47,68,78,0.06)'
};

const FULL_ROW_STYLE: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 18, marginBottom: 12, flexWrap: 'wrap'
};

const ChartConfigPanel: React.FC<Props> = ({ onChange, initial }) => {
  const [type, setType] = useState(initial?.type ?? "line");
  const [colors, setColors] = useState<string[]>(initial?.colors ?? [PALETTE[0], PALETTE[1]]);
  const [legendPosition, setLegendPosition] = useState(initial?.legendPosition ?? "top");
  const [showTitle, setShowTitle] = useState(initial?.showTitle ?? false);
  const [titleText, setTitleText] = useState(initial?.titleText ?? "");
  const [dark, setDark] = useState(initial?.dark ?? false);
  const [markerType, setMarkerType] = useState(initial?.markerType ?? "circle");

  const [borderWidth, setBorderWidth] = useState(initial?.borderWidth ?? 2);
  const [fill, setFill] = useState(initial?.fill ?? (type === "area"));
  const [smoothing, setSmoothing] = useState(initial?.smoothing ?? 0.3);
  const [fontSize, setFontSize] = useState(initial?.fontSize ?? 16);
  const [xAxisLabel, setXAxisLabel] = useState(initial?.xAxisLabel ?? "");
  const [yAxisLabel, setYAxisLabel] = useState(initial?.yAxisLabel ?? "");
  const [showGrid, setShowGrid] = useState(initial?.showGrid ?? true);
  const [legendFontSize, setLegendFontSize] = useState(initial?.legendFontSize ?? 15);
  const [tooltipFormat, setTooltipFormat] = useState(initial?.tooltipFormat || "{y}");

  const prevConfigRef = useRef<ChartConfig>();

  useEffect(() => {
    const nextConfig: ChartConfig = {
      type, colors, legendPosition, showTitle, titleText, dark,
      borderWidth, fill, smoothing, fontSize,
      xAxisLabel, yAxisLabel, showGrid, legendFontSize, tooltipFormat, markerType
    };
    if (JSON.stringify(prevConfigRef.current) !== JSON.stringify(nextConfig)) {
      prevConfigRef.current = nextConfig;
      onChange(nextConfig);
    }
    // Без onChange в зависимостях!
    // eslint-disable-next-line
  }, [
    type, colors, legendPosition, showTitle, titleText, dark,
    borderWidth, fill, smoothing, fontSize, xAxisLabel, yAxisLabel,
    showGrid, legendFontSize, tooltipFormat, markerType
  ]);

  return (
    <div className={`chart-config-panel card-shadow${dark ? " chart-dark" : ""}`} style={{maxWidth: 820, margin: '0 auto'}}>
      <div style={{display: "flex", gap: 32, flexWrap: "wrap"}}>
        <div style={BIG_FIELD_STYLE}>
          <label className="chart-config-label">Тип графика:</label>
          <select value={type} onChange={e => setType(e.target.value)} className="chart-config-select" style={{fontSize:17,height:38}}>
            {CHART_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div style={BIG_FIELD_STYLE}>
          <label className="chart-config-label">Цвета серий:</label>
          <div style={FULL_ROW_STYLE}>
            {colors.map((col, idx) => (
              <input
                key={idx}
                type="color"
                value={col}
                style={{width: 38, height: 38}}
                onChange={e => {
                  const next = [...colors];
                  next[idx] = e.target.value;
                  setColors(next);
                }}
              />
            ))}
            <button type="button" className="chart-config-color-btn"
              onClick={() => setColors([...colors, PALETTE[colors.length % PALETTE.length]])}
              style={{fontSize: 23, padding: '0 13px'}}>+</button>
            {colors.length > 1 &&
              <button type="button" className="chart-config-color-btn"
                onClick={() => setColors(colors.slice(0, -1))}
                style={{fontSize: 23, padding: '0 13px'}}>−</button>
            }
          </div>
        </div>
        {(type === "line" || type === "area" || type === "scatter" || type === "bubble") &&
          <div style={BIG_FIELD_STYLE}>
            <label className="chart-config-label">Тип маркера:</label>
            <select value={markerType} onChange={e => setMarkerType(e.target.value)} className="chart-config-select" style={{fontSize:17, height:38}}>
              {MARKER_TYPES.map(mt => (
                <option key={mt.value} value={mt.value}>{mt.label}</option>
              ))}
            </select>
          </div>
        }
      </div>
      <div style={{marginTop:18, display:'flex', gap: 30, flexWrap: "wrap"}}>
        <div style={BIG_FIELD_STYLE}>
          <label>
            <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />
            <span style={{marginLeft:8}}>Тёмная тема</span>
          </label>
          <label className="chart-config-label" style={{marginTop:12}}>Показать сетку осей:&nbsp;
            <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
          </label>
        </div>
        <div style={BIG_FIELD_STYLE}>
          <label className="chart-config-label">Позиция легенды:</label>
          <select
            value={legendPosition}
            onChange={e => setLegendPosition(e.target.value)}
            className="chart-config-select" style={{fontSize:17,height:38}}
          >
            {LEGEND_POSITIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <label className="chart-config-label" style={{marginTop:8}}>Шрифт легенды:</label>
          <input
            type="number"
            min={8}
            max={22}
            value={legendFontSize}
            onChange={e => setLegendFontSize(Number(e.target.value))}
            className="chart-config-input"
            style={{ width: 60, fontSize:17 }}
          />
        </div>
        <div style={BIG_FIELD_STYLE}>
          <label>
            <input type="checkbox" checked={showTitle} onChange={e => setShowTitle(e.target.checked)} />
            <span style={{marginLeft:8}}>Заголовок графика</span>
          </label>
          {showTitle &&
            <input
              className="chart-config-input"
              type="text"
              value={titleText}
              onChange={e => setTitleText(e.target.value)}
              placeholder="Введите заголовок"
              style={{ marginTop: 8, fontSize:18, height:38 }}
            />
          }
        </div>
      </div>
      <div style={{marginTop:18, display:'flex', gap: 30, flexWrap: "wrap"}}>
        <div style={BIG_FIELD_STYLE}>
          <label>Толщина линии/бара:</label>
          <input
            type="number"
            min={1}
            max={10}
            value={borderWidth}
            onChange={e => setBorderWidth(Number(e.target.value))}
            className="chart-config-input"
            style={{ width: 60, fontSize:16 }}
          />
          {(type === "line" || type === "area") && (
            <>
              <label style={{marginTop:10}}>Сглаживание:</label>
              <input
                type="number"
                min={0} step={0.05} max={1}
                value={smoothing}
                onChange={e => setSmoothing(Number(e.target.value))}
                className="chart-config-input"
                style={{ width: 80, fontSize:16 }}
              />
              <label style={{marginTop:10}}>
                <input type="checkbox" checked={fill} onChange={e => setFill(e.target.checked)} />
                <span style={{marginLeft:8}}>Заливка (Area)</span>
              </label>
            </>
          )}
        </div>
        <div style={BIG_FIELD_STYLE}>
          <label>Размер осного шрифта (ось):</label>
          <input
            type="number"
            min={10}
            max={26}
            value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
            className="chart-config-input"
            style={{ width: 80, fontSize:16 }}
          />
          <label style={{marginTop:10}}>Подписи осей:</label>
          <input
            type="text"
            className="chart-config-input"
            value={xAxisLabel}
            onChange={e => setXAxisLabel(e.target.value)}
            placeholder="X-ось"
            style={{ width: 130, marginTop: 4, fontSize:16 }}
          />
          <input
            type="text"
            className="chart-config-input"
            value={yAxisLabel}
            onChange={e => setYAxisLabel(e.target.value)}
            placeholder="Y-ось"
            style={{ width: 130, marginTop: 7, fontSize:16 }}
          />
        </div>
        <div style={BIG_FIELD_STYLE}>
          <label>Шаблон тултипа:</label>
          <input
            className="chart-config-input"
            type="text"
            value={tooltipFormat}
            onChange={e => setTooltipFormat(e.target.value)}
            placeholder="{y} / {label}"
            style={{ width: 200, fontSize:17 }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartConfigPanel;
