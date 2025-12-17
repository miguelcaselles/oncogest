import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Download,
  Filter,
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
  subDays,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import type { Elaboracion } from '../types';
import styles from './Statistics.module.css';

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';
type ChartType = 'overview' | 'trend' | 'distribution';

interface StatisticsData {
  total: number;
  usado: number;
  gestionado: number;
  pendiente: number;
  caducado: number;
  aprovechado: number;
}

export function Statistics() {
  const [elaboraciones, setElaboraciones] = useState<Elaboracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [chartType, setChartType] = useState<ChartType>('overview');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchAllElaboraciones();
  }, []);

  const fetchAllElaboraciones = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('elaboraciones')
      .select('*')
      .order('created_at', { ascending: false });
    setElaboraciones(data || []);
    setLoading(false);
  };

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return { start: startOfWeek(now, { locale: es }), end: endOfWeek(now, { locale: es }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: subMonths(now, 3), end: now };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        return {
          start: customStartDate ? parseISO(customStartDate) : subDays(now, 30),
          end: customEndDate ? parseISO(customEndDate) : now,
        };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const filteredElaboraciones = useMemo(() => {
    const { start, end } = getDateRange();
    return elaboraciones.filter((e) => {
      const createdDate = parseISO(e.created_at);
      return isWithinInterval(createdDate, { start, end });
    });
  }, [elaboraciones, timeRange, customStartDate, customEndDate]);

  const statistics: StatisticsData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = filteredElaboraciones.length;
    const usado = filteredElaboraciones.filter((e) => e.usado).length;
    const gestionado = filteredElaboraciones.filter((e) => e.gestionado).length;
    const caducado = filteredElaboraciones.filter((e) => {
      const caducidadDate = parseISO(e.caducidad);
      return caducidadDate < today && !e.usado && !e.gestionado;
    }).length;
    const pendiente = filteredElaboraciones.filter(
      (e) => !e.usado && !e.gestionado && parseISO(e.caducidad) >= today
    ).length;
    const aprovechado = usado;

    return { total, usado, gestionado, pendiente, caducado, aprovechado };
  }, [filteredElaboraciones]);

  const pieData = useMemo(() => [
    { name: 'Aprovechado', value: statistics.aprovechado, color: '#0d9488' },
    { name: 'Gestionado', value: statistics.gestionado, color: '#14b8a6' },
    { name: 'Pendiente', value: statistics.pendiente, color: '#f59e0b' },
    { name: 'Caducado', value: statistics.caducado, color: '#ef4444' },
  ].filter(d => d.value > 0), [statistics]);

  const trendData = useMemo(() => {
    const days: { [key: string]: { date: string; total: number; usado: number; gestionado: number } } = {};

    filteredElaboraciones.forEach((e) => {
      const dateKey = format(parseISO(e.created_at), 'yyyy-MM-dd');
      if (!days[dateKey]) {
        days[dateKey] = { date: dateKey, total: 0, usado: 0, gestionado: 0 };
      }
      days[dateKey].total++;
      if (e.usado) days[dateKey].usado++;
      if (e.gestionado) days[dateKey].gestionado++;
    });

    return Object.values(days)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        dateLabel: format(parseISO(d.date), 'd MMM', { locale: es }),
      }));
  }, [filteredElaboraciones]);

  const preparacionData = useMemo(() => {
    const byPreparacion: { [key: string]: { name: string; total: number; usado: number } } = {};

    filteredElaboraciones.forEach((e) => {
      const name = e.preparacion.split(' ')[0]; // Get first word
      if (!byPreparacion[name]) {
        byPreparacion[name] = { name, total: 0, usado: 0 };
      }
      byPreparacion[name].total++;
      if (e.usado) byPreparacion[name].usado++;
    });

    return Object.values(byPreparacion)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredElaboraciones]);

  const exportToCSV = () => {
    const headers = ['ID', 'Preparación', 'Dosis', 'Caducidad', 'Usado', 'Gestionado', 'Fecha Creación'];
    const rows = filteredElaboraciones.map((e) => [
      e.id,
      e.preparacion,
      e.dosis,
      e.caducidad,
      e.usado ? 'Sí' : 'No',
      e.gestionado ? 'Sí' : 'No',
      format(parseISO(e.created_at), 'dd/MM/yyyy HH:mm'),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estadisticas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportStats = () => {
    const { start, end } = getDateRange();
    const report = `
INFORME DE ESTADÍSTICAS - ONCOGEST
==================================
Período: ${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}
Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}

RESUMEN GENERAL
---------------
Total elaboraciones: ${statistics.total}
Aprovechadas (usadas): ${statistics.aprovechado} (${statistics.total > 0 ? ((statistics.aprovechado / statistics.total) * 100).toFixed(1) : 0}%)
Gestionadas: ${statistics.gestionado} (${statistics.total > 0 ? ((statistics.gestionado / statistics.total) * 100).toFixed(1) : 0}%)
Pendientes: ${statistics.pendiente} (${statistics.total > 0 ? ((statistics.pendiente / statistics.total) * 100).toFixed(1) : 0}%)
Caducadas: ${statistics.caducado} (${statistics.total > 0 ? ((statistics.caducado / statistics.total) * 100).toFixed(1) : 0}%)

TASA DE APROVECHAMIENTO: ${statistics.total > 0 ? ((statistics.aprovechado / statistics.total) * 100).toFixed(1) : 0}%
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `informe_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  const aprovechamientoRate = statistics.total > 0
    ? ((statistics.aprovechado / statistics.total) * 100).toFixed(1)
    : '0';

  return (
    <div className={styles.container}>
      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Filter size={18} />
          <span className={styles.filterLabel}>Período:</span>
          <select
            className="input"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Este año</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {timeRange === 'custom' && (
          <div className={styles.customDates}>
            <input
              type="date"
              className="input"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
            />
            <span>hasta</span>
            <input
              type="date"
              className="input"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
            />
          </div>
        )}

        <div className={styles.exportButtons}>
          <button className="btn btn-secondary" onClick={exportToCSV}>
            <Download size={18} />
            Exportar CSV
          </button>
          <button className="btn btn-secondary" onClick={exportStats}>
            <Download size={18} />
            Exportar Informe
          </button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)' }}>
            <Package size={24} color="#0d9488" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.total}</div>
            <div className={styles.statLabel}>Total Elaboraciones</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)' }}>
            <CheckCircle size={24} color="#0d9488" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.aprovechado}</div>
            <div className={styles.statLabel}>Aprovechadas</div>
            <div className={styles.statPercent}>{aprovechamientoRate}%</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <Clock size={24} color="#f59e0b" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.pendiente}</div>
            <div className={styles.statLabel}>Pendientes</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <XCircle size={24} color="#ef4444" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.caducado}</div>
            <div className={styles.statLabel}>Caducadas</div>
          </div>
        </div>
      </div>

      {/* Tabs de gráficos */}
      <div className={styles.chartTabs}>
        <button
          className={`${styles.chartTab} ${chartType === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setChartType('overview')}
        >
          Distribución
        </button>
        <button
          className={`${styles.chartTab} ${chartType === 'trend' ? styles.activeTab : ''}`}
          onClick={() => setChartType('trend')}
        >
          Tendencia
        </button>
        <button
          className={`${styles.chartTab} ${chartType === 'distribution' ? styles.activeTab : ''}`}
          onClick={() => setChartType('distribution')}
        >
          Por Preparación
        </button>
      </div>

      {/* Gráficos */}
      <div className={styles.chartContainer}>
        {chartType === 'overview' && (
          <div className={styles.chartWrapper}>
            <h3 className={styles.chartTitle}>Distribución de Estados</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>No hay datos para mostrar</div>
            )}
          </div>
        )}

        {chartType === 'trend' && (
          <div className={styles.chartWrapper}>
            <h3 className={styles.chartTitle}>Tendencia Temporal</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="#0d9488"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="usado"
                    name="Usados"
                    stroke="#14b8a6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="gestionado"
                    name="Gestionados"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>No hay datos para mostrar</div>
            )}
          </div>
        )}

        {chartType === 'distribution' && (
          <div className={styles.chartWrapper}>
            <h3 className={styles.chartTitle}>Top 10 Preparaciones</h3>
            {preparacionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={preparacionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total" fill="#0d9488" />
                  <Bar dataKey="usado" name="Usados" fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>No hay datos para mostrar</div>
            )}
          </div>
        )}
      </div>

      {/* Tasa de aprovechamiento destacada */}
      <div className={styles.highlightCard}>
        <TrendingUp size={32} />
        <div>
          <div className={styles.highlightValue}>{aprovechamientoRate}%</div>
          <div className={styles.highlightLabel}>Tasa de Aprovechamiento</div>
        </div>
      </div>
    </div>
  );
}
