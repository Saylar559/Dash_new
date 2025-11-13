import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardBlock from './CardBlock';
import Footer from './Footer';

const cards = [
  {
    title: "Анализ Эскроу",
    icon: "📊",
    desc: "Анализируйте отчёты строительных объектов",
    route: "/accountant/escrow"
  },
  {
    title: "Движение по счетам",
    icon: "💸",
    desc: "Просматривайте списания и поступления средств",
    route: "/accountant/flow"
  },
  {
    title: "Отчёты",
    icon: "🗂️",
    desc: "Скачайте отчёты для руководства",
    route: "/accountant/reports"
  },
  {
    title: "Загрузка Excel",
    icon: "📁",
    desc: "Импортируйте новые файлы — быстро и просто",
    external: true,
    url: "http://10.10.3.58:5000/",
  },
];

export default function AccountantPage() {
  const navigate = useNavigate();
  const logout = () => navigate('/login');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white shadow sticky top-0 z-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Панель бухгалтера</h1>
        <button onClick={logout}
          className="text-blue-700 border-2 border-blue-500 px-4 py-2 rounded-full hover:bg-blue-100 hover:shadow transition font-semibold">
          Выйти
        </button>
      </header>

      {/* Cards */}
      <main className="flex-1 py-8">
        <div className="grid gap-8 px-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {cards.map((card) =>
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition border hover:border-blue-400 cursor-pointer flex flex-col justify-between p-6 group"
              onClick={() => card.external ? window.open(card.url, "_blank") : navigate(card.route)}
              tabIndex={0}
              role="button"
              aria-label={`Перейти: ${card.title}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">{card.icon}</span>
                <span className="text-lg font-semibold text-gray-900">{card.title}</span>
              </div>
              <div className="text-gray-500 group-hover:text-blue-800 transition">{card.desc}</div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
