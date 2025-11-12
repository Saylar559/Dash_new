import React, { useRef, useState } from "react";
import '../styles/ChartPreview.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  BubbleController,
  ScatterController,
} from 'chart.js';
import {
  Line, Bar, Pie, Radar, Doughnut, PolarArea, Bubble, Scatter
} from "react-chartjs-2";

// Компактная палитра
const PALETTES = {
  light: {
    green: '#8BC540', blue: '#4EC3E0', gray: '#2F444E',
    neutral: '#76787A', white: '#FFFFFF', black: '#232426', bg: '#F9FAFB',
  },
  dark: {
    green: '#74B52A', blue: '#359EB9', gray: '#232426',
    neutral: '#ABB5BE', white: '#292C2E', black: '#1A1B1F', bg: '#17181C',
  },
};

ChartJS.defaults.font.family = "Verdana,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif";
ChartJS.defaults.color = PALETTES.light.neutral;
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, RadialLinearScale, BubbleController, ScatterController,
);

const chartMap = {
  line: Line, bar: Bar, pie: Pie, area: Line, radar: Radar,
  doughnut: Doughnut, polarArea: PolarArea, bubble: Bubble, scatter: Scatter
};

// ========== ChartSettingsPanel COMPACT ==========

const ChartSettingsPanel = ({
  chartType, setChartType, options, setOptions, theme, setTheme, data
}: any) => {
  const handlePalette = (v: keyof typeof PALETTES) => setTheme({ ...theme, palette: v });

  return (
    <div className="chart-settings-panel" style={{maxWidth:560,margin:'20px auto 10px',padding:'18px 18px',borderRadius:16}}>
      <div style={{display:'flex',gap:18,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:160}}>
          <label>Тип:</label>
          <select value={chartType} onChange={e=>setChartType(e.target.value)} style={{width:'100%',height:32,fontSize:15}}>
            <option value="line">Линия</option><option value="bar">Столбцы</option><option value="area">Площадь</option>
            <option value="pie">Круг</option><option value="doughnut">Пончик</option><option value="radar">Радар</option>
            <option value="scatter">Точки</option><option value="bubble">Пузыри</option><option value="polarArea">Polar Area</option>
          </select>
        </div>
        <div style={{flex:1,minWidth:150}}>
          <label>Палитра:</label>
          <button onClick={()=>handlePalette('light')}
            className={theme.palette==='light'?"palette-btn selected":"palette-btn"}>Светлая</button>
          <button onClick={()=>handlePalette('dark')}
            className={theme.palette==='dark'?"palette-btn selected":"palette-btn"}>Тёмная</button>
        </div>
        <div style={{flex:1,minWidth:120}}>
          <label>Заголовок:</label>
          <input type="text" style={{width:'100%',height:30,fontSize:15}}
            value={theme.titleText||""}
            onChange={e=>setTheme({...theme,showTitle:!!e.target.value,titleText:e.target.value})}
            placeholder="Заголовок"/>
        </div>
      </div>
      <div style={{display:'flex',gap:16,marginTop:15,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:120}}>
          <label>Цвета:</label>
          <div style={{display:'flex',gap:6}}>
          {(data?.datasets||[]).map((ds:any,idx:number)=>
            <input key={idx} type="color"
              style={{width:28,height:28,borderRadius:8}}
              value={(theme.colors&&theme.colors[idx])||PALETTES[theme.palette??'light']?.green}
              onChange={e=>setTheme({...theme,colors:[
                ...(theme.colors||[]).slice(0,idx),e.target.value,...(theme.colors||[]).slice(idx+1)
              ]})}
            />)}
          </div>
        </div>
        <div style={{flex:1,minWidth:120}}>
          <label>Легенда:</label>
          <select value={theme.legendPosition??'top'} onChange={e=>setTheme({...theme,legendPosition:e.target.value})}
            style={{width:'100%',height:30,fontSize:15}}>
            <option value="top">Сверху</option><option value="bottom">Снизу</option>
            <option value="left">Слева</option><option value="right">Справа</option>
            <option value="hidden">Скрыть</option>
          </select>
        </div>
        <div style={{flex:1,minWidth:120}}>
          <label>Толщина:</label>
          <input type="number" min={1} max={10}
            style={{width:50,height:30,fontSize:15}}
            value={options.elements?.line?.borderWidth??2}
            onChange={e=>setOptions({
              ...options,
              elements: {...options.elements,line:{...options.elements?.line,borderWidth:Number(e.target.value)}}
            })}
          />
        </div>
        <div style={{flex:1,minWidth:100}}>
          <label style={{display:'block'}}>Скрыть сетку:</label>
          <input type="checkbox" checked={!(theme.showGrid??false)}
            onChange={e=>setTheme({...theme,showGrid:!e.target.checked})}/>
        </div>
        <div style={{flex:1,minWidth:120}}>
          <label>Tooltip:</label>
          <input type="text" style={{width:'100%',height:30,fontSize:14}}
            value={theme.tooltipFormat||"{y}"}
            onChange={e=>setTheme({...theme,tooltipFormat:e.target.value})}
            placeholder="{y} / {label}"/>
        </div>
      </div>
    </div>
  );
}

// --- Chart logic and rendering ---

const FallbackChart: React.FC = () => (
  <div className="chart-fallback">Тип графика не поддерживается (или нет данных)</div>
);

const getDefaultOptions = (theme?: any) => {
  const pal = PALETTES[theme?.palette ?? 'light'];
  const fontSize = theme?.fontSize || 15;
  return {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{position:theme?.legendPosition??'top',labels:{boxWidth:12,font:{size:theme?.legendFontSize||14},color:pal.neutral,usePointStyle:true}},
      title:{display:!!theme?.showTitle,text:theme?.titleText??'',font:{weight:'bold',size:17},color:pal.gray},
      tooltip:{
        mode: 'index', intersect: false, backgroundColor: pal.gray,
        titleColor: pal.white, bodyColor:pal.white, borderColor:pal.green, borderWidth: 1, displayColors:true,
        callbacks:{label:(ctx:any)=>{
          const val=ctx.dataset.data[ctx.dataIndex], tmpl=theme?.tooltipFormat||'{y}';
          return tmpl.replace('{y}',val).replace('{label}',ctx.label||'');
        }}
      }
    },
    elements:{
      point:{radius:4,hoverRadius:7},
      line:{borderWidth:2},
      bar:{borderRadius:10,borderSkipped:false as const},
      arc:{borderWidth:0}
    },
    scales:{
      x:{title:{display:!!theme?.xAxisLabel,text:theme?.xAxisLabel||'',font:{size:fontSize+1}},
        ticks:{maxRotation:33,minRotation:0,autoSkip:true,autoSkipPadding:6,color:pal.neutral,font:{size:fontSize}}},
      y:{beginAtZero:true,title:{display:!!theme?.yAxisLabel,text:theme?.yAxisLabel||'',font:{size:fontSize+1}},
        ticks:{precision:0,color:pal.neutral,font:{size:fontSize}},
      }
    }
  };
};

const withAreaStyling=(data:any,pal:any)=>({...data,
  datasets:(data.datasets||[]).map((d:any,idx:number)=>({
    ...d,fill:true,tension:d.tension??0.3,borderColor:d.borderColor??(idx===0?pal.green:pal.blue),
    backgroundColor:d.backgroundColor??(idx===0?'rgba(139,197,64,0.18)':'rgba(78,195,224,0.18)'),
    pointBackgroundColor:d.pointBackgroundColor??pal.white,
    pointBorderColor:d.pointBorderColor??(idx===0?pal.green:pal.blue),
  })),
});

const normalizeDatasetsColors=(type:string,data:any,theme?:any)=>{
  if(!data?.datasets)return data;
  const pal=PALETTES[theme?.palette??'light'];
  const customColors=theme?.colors;
  const next={...data};
  next.datasets=data.datasets.map((d:any,idx:number)=>{
    const baseStroke=customColors?.[idx]??(idx===0?pal.green:idx===1?pal.blue:pal.gray);
    const baseFill=theme?.dark?pal.gray:idx===0?'rgba(139,197,64,0.85)':idx===1?'rgba(78,195,224,0.85)':'rgba(47,68,78,0.85)';
    if(type==='bar'){return{...d,backgroundColor:d.backgroundColor??baseFill,borderColor:d.borderColor??baseStroke};}
    if(type==='line'||type==='scatter'){return{...d,borderColor:d.borderColor??baseStroke,pointBackgroundColor:d.pointBackgroundColor??pal.white,pointBorderColor:d.pointBorderColor??baseStroke,pointStyle:theme?.markerType||"circle"};}
    return d;
  });
  return next;
};

// ========== Основной компонент ChartPreview ==========

const ChartPreview: React.FC<any> = ({
  type,data,options,theme:extTheme,onExport
})=>{
  const pal=PALETTES[extTheme?.palette??'light'];
  const chartRef=useRef<any>(null);
  const [showSettings,setShowSettings]=useState(false);
  const [chartType,setChartType]=useState(type);
  const [theme,setTheme]=useState<any>(extTheme||{palette:'light',dark:false});
  const [userOptions,setUserOptions]=useState<any>(options||{});
  const [innerData,setInnerData]=useState<any>(data);

  const C=chartMap[chartType]||null;

  if(!innerData||!innerData.labels||!innerData.datasets||innerData.labels.length===0||innerData.datasets.length===0)
    return <FallbackChart/>;
  if(!C)return <FallbackChart/>;

  const prepared=chartType==="area"
    ?withAreaStyling(normalizeDatasetsColors('line',innerData,theme),pal)
    :normalizeDatasetsColors(chartType,innerData,theme);

  const mergedOptions={
    ...getDefaultOptions(theme),...(userOptions||{}),
    plugins:{
      ...getDefaultOptions(theme).plugins,
      ...(userOptions?.plugins||{}),
      legend:{
        ...(getDefaultOptions(theme).plugins.legend),
        ...(userOptions?.plugins?.legend||{}),
        display:theme.legendPosition!=="hidden",
      },
      title:{
        ...getDefaultOptions(theme).plugins.title,
        ...(userOptions?.plugins?.title||{}),
        display:!!(theme.showTitle&&theme.titleText),
        text:theme.titleText||"",
      }
    },
  };

  const handleExport=()=>{if(chartRef.current&&onExport){
    const chartInstance=chartRef.current;
    const img=chartInstance?.toBase64Image?.();
    if(img)onExport(img);}
  };

  return (
    <div className={`chart-container${theme?.dark?' chart-dark':''}`}>
      <div className="chart-toolbar" style={{gap:10,marginBottom:7}}>
        <button onClick={()=>setShowSettings(v=>!v)}>
          {showSettings?"Скрыть настройки":"Настроить график"}
        </button>
        {onExport&&<button onClick={handleExport}>Экспорт PNG</button>}
      </div>
      {showSettings && (
        <ChartSettingsPanel
          chartType={chartType} setChartType={setChartType}
          options={userOptions} setOptions={setUserOptions}
          theme={theme} setTheme={setTheme}
          data={innerData} setData={setInnerData}
        />
      )}
      <div style={{height:375,background:theme.dark?pal.bg:"#fff",borderRadius:12,boxShadow:'0 3px 16px rgba(47,68,78,0.08)',padding:8,marginTop:showSettings?0:24,transition:'margin .18s'}}>
        <C
          ref={chartRef}
          data={prepared}
          options={mergedOptions}
          height={350}
        />
      </div>
    </div>
  );
};
export default ChartPreview;
