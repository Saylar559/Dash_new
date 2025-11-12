/* ========================================
   ChartWidget – ДОРАБОТАННЫЙ DOM.RF UI Kit (senior)
   ======================================== */

/* ---- Общая карточка, крупные поля ---- */
.chart-widget {
  background: #ffffff;
  border-radius: 18px;
  padding: 32px 26px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #232426;
  box-shadow: 0 4px 22px rgba(47,68,78,.11);
  transition: box-shadow .22s, background .22s, color .18s;
  max-width: 100%;
  box-sizing: border-box;
}
.chart-widget.chart-dark {
  background: #19191c;
  color: #ececec;
  box-shadow: 0 6px 36px rgba(41,41,51,.22);
}

/* ---- Header ---- */
.chart-widget__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 22px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.chart-widget__title {
  font-weight: 700;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 9px;
}
.chart-widget__saved-badge {
  background: #e6f4ea;
  color: #137333;
  font-size: 14px;
  padding: 3px 10px;
  border-radius: 7px;
  letter-spacing: .01em;
}
.chart-widget.chart-dark .chart-widget__saved-badge {
  background: #23723a;
  color: #a9eab2;
}
.chart-widget__stats {
  font-size: 15px;
  color: #76787a;
}

.chart-widget__label {
  display: block;
  font-weight: 500;
  color: #2d2d2d;
  margin-bottom: 10px;
  font-size: 15px;
}
.chart-widget.chart-dark .chart-widget__label { color: #bbb; }

/* ---- Секции ---- */
.chart-widget__section {
  margin-bottom: 22px;
}
.chart-widget__section--large {
  background: #f8fafd;
  border-radius: 16px;
  padding: 14px 18px;
  margin-bottom: 18px;
  box-shadow: 0 1px 8px rgba(85,120,140,.06);
}
.chart-widget.chart-dark .chart-widget__section--large {
  background: #23242a;
  box-shadow: 0 2px 14px rgba(41,41,51,.13);
}

/* ---- SQL текстовое поле ---- */
.chart-widget__sql-input {
  width: 100%;
  min-height: 95px;
  padding: 12px 16px;
  border: 2px solid #d0d5dd;
  border-radius: 10px;
  background: #fff;
  font-family: 'Courier New', monospace;
  font-size: 15px;
  resize: vertical;
  transition: all .22s;
}
.chart-widget__sql-input:focus {
  outline: none;
  border-color: #0052cc;
  box-shadow: 0 0 0 4px rgba(0,82,204,.15);
}
.chart-widget__sql-input::placeholder {
  color: #888;
  font-style: italic;
}
.chart-widget.chart-dark .chart-widget__sql-input {
  background: #29292e;
  border-color: #363646;
  color: #ececec;
}
.chart-widget.chart-dark .chart-widget__sql-input::placeholder {
  color: #888;
}

/* ---- Кнопки выбора типа графика ---- */
.chart-widget__chart-types {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
}
.chart-widget__chart-type-btn {
  padding: 10px 20px;
  border: 2px solid #d0d5dd;
  border-radius: 10px;
  background: #f9faff;
  color: #232426;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background .19s, color .19s, border-color .18s;
  white-space: nowrap;
}
.chart-widget__chart-type-btn:hover {
  background: #f0f8ff;
  border-color: #0052cc;
}
.chart-widget__chart-type-btn.active {
  background: #0052cc;
  color: #fff;
  border-color: #0052cc;
  font-weight: 700;
}
.chart-widget.chart-dark .chart-widget__chart-type-btn {
  background: #303036;
  border-color: #363646;
  color: #e0e0e0;
}
.chart-widget.chart-dark .chart-widget__chart-type-btn:hover {
  background: #4a8eff;
  border-color: #4a8eff;
}
.chart-widget.chart-dark .chart-widget__chart-type-btn.active {
  background: #4a8eff;
  color: #fff;
  border-color: #4a8eff;
}

/* ---- Крупные селекты ---- */
.chart-widget__select {
  padding: 12px 15px;
  border: 2px solid #d0d5dd;
  border-radius: 10px;
  background: #fff;
  font-size: 16px;
  color: #232426;
  cursor: pointer;
  transition: border-color .18s;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23666' viewBox='0 0 24 24'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 32px;
}
.chart-widget__select:focus {
  outline: none;
  border-color: #0052cc;
  box-shadow: 0 0 0 3px rgba(0,82,204,.16);
}
.chart-widget.chart-dark .chart-widget__select {
  background-color: #29292e;
  border-color: #363646;
  color: #e0e0e0;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23ccc' viewBox='0 0 24 24'><path d='M7 10l5 5 5-5z'/></svg>");
}
.chart-widget.chart-dark .chart-widget__select:focus {
  border-color: #4a8eff;
  box-shadow: 0 0 0 3px rgba(74,142,255,.18);
}

/* ---- Крупные action buttons ---- */
.chart-widget__actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 24px;
}
.chart-widget__btn {
  padding: 12px 24px;
  border: 2px solid #d0d5dd;
  border-radius: 10px;
  background: #f9faff;
  color: #232426;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 9px;
  transition: background .2s, color .2s, border-color .22s;
}
.chart-widget__btn:hover {
  background: #0052cc;
  color: #fff;
  border-color: #0052cc;
}
.chart-widget__btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}
.chart-widget__save-btn {
  background: #0052cc;
  color: #fff;
  border-color: #0052cc;
  font-weight: 700;
}
.chart-widget__save-btn:hover {
  background: #003d99;
}
.chart-widget.chart-dark .chart-widget__btn {
  background: #29292e;
  border-color: #363646;
  color: #ececec;
}
.chart-widget.chart-dark .chart-widget__btn:hover {
  background: #4a8eff;
  color: #fff;
  border-color: #4a8eff;
}
.chart-widget.chart-dark .chart-widget__save-btn {
  background: #4a8eff;
  border-color: #4a8eff;
  color: #fff;
}
.chart-widget.chart-dark .chart-widget__save-btn:hover {
  background: #3578e5;
}

/* ---- Загрузка ---- */
.chart-widget__loading {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #76787a;
  font-size: 16px;
}
.chart-widget__spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #d0d5dd;
  border-top-color: #0052cc;
  border-radius: 50%;
  animation: spin 0.88s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.chart-widget.chart-dark .chart-widget__spinner {
  border-color: #363646;
  border-top-color: #4a8eff;
}

/* ---- Ошибки ---- */
.chart-widget__error {
  background: #ffece7;
  color: #d24d2b;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 16px;
}
.chart-widget.chart-dark .chart-widget__error {
  background: #5a2a2a;
  color: #ffbbaa;
}

/* ---- Пустой вид ---- */
.chart-widget__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 290px;
  color: #76787a;
  text-align: center;
}
.chart-widget__empty-icon {
  font-size: 54px;
  margin-bottom: 16px;
}
.chart-widget__empty-text {
  font-size: 17px;
}

/* ---- Контейнер графика ---- */
.chart-widget__chart-container {
  margin-top: 24px;
  min-height: 350px;
  border-radius: 16px;
  background: #f8fafd;
  box-shadow: 0 2px 16px rgba(47,68,78,.10);
}
.chart-widget.chart-dark .chart-widget__chart-container {
  background: #23242a;
  box-shadow: 0 2px 14px rgba(41,41,51,.16);
}

/* ---- Адаптивность ---- */
@media (max-width: 900px) {
  .chart-widget { padding: 18px 8px; }
  .chart-widget__header { flex-direction: column; align-items: flex-start; }
  .chart-widget__controls { grid-template-columns: 1fr; }
  .chart-widget__actions button { flex: 1; }
}
@media (max-width: 600px) {
  .chart-widget__title { font-size: 17px; }
  .chart-widget__btn, .chart-widget__save-btn { font-size: 14px; padding: 9px 15px; }
}

/* ---- Фокусы (a11y) ---- */
.chart-widget *:focus-visible {
  outline: 3px solid #0052cc;
  outline-offset: 2px;
}
.chart-widget.chart-dark *:focus-visible {
  outline-color: #4a8eff;
}
