'use client';

import { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart, Line, ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { Download, Filter, Calendar, Activity, TrendingUp, AlertTriangle, Database } from 'lucide-react';
import { motion } from 'framer-motion';

// Generate 30 days of detailed mock data
const generateHistoricalData = () => {
  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      MachineA: Math.floor(Math.random() * 20 + 70),
      MachineB: Math.floor(Math.random() * 20 + 70),
      MachineC: Math.floor(Math.random() * 20 + 70),
      vibrationA: Math.random() * 10 + 10,
      vibrationB: Math.random() * 10 + 10,
      vibrationC: Math.random() * 10 + 10,
      rpmA: Math.floor(Math.random() * 100 + 1400),
      rpmB: Math.floor(Math.random() * 100 + 1400),
      rpmC: Math.floor(Math.random() * 100 + 1400),
      anomalies: Math.floor(Math.random() * 5)
    });
  }
  return data;
};

const fullData = generateHistoricalData();

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30);
  
  // Filtered data based on time range
  const displayData = useMemo(() => fullData.slice(-timeRange), [timeRange]);

  const anomalyDistribution = [
    { name: 'Machine-A', value: 145, color: '#10b981' },
    { name: 'Machine-B', value: 89, color: '#14b8a6' },
    { name: 'Machine-C', value: 204, color: '#84cc16' },
  ];

  const exportToCSV = () => {
    const headers = ['Date', 'MachineA_Temp', 'MachineB_Temp', 'MachineC_Temp', 'Anomalies'];
    const csvContent = [
      headers.join(','),
      ...displayData.map(row => 
        [row.date, row.MachineA, row.MachineB, row.MachineC, row.anomalies].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historical_telemetry_${timeRange}days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-10 space-y-8 max-w-[1600px] mx-auto pb-20">
      
      {/* Header & Controls */}
      <div className="flex justify-between items-center bg-[#121214] p-6 rounded-2xl border border-zinc-800/80 shadow-[0_0_40px_-10px_rgba(16,185,129,0.1)]">
        <div>
          <h2 className="text-3xl font-black text-zinc-100 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            Historical Analytics
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Queried from AWS Athena via Parquet datasets (Petabyte Scale)</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-bold text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value={7}>Last 7 Days</option>
            <option value={15}>Last 15 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-xl text-sm font-bold text-zinc-100 hover:bg-zinc-700 transition-colors shadow-lg">
            <Filter className="w-4 h-4 text-zinc-300" />
            Advanced Filter
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Temperature Area Chart */}
        <div className="xl:col-span-2 bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-zinc-100">Temperature Trends (Avg °C)</h3>
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-2 text-zinc-300"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Machine A</span>
              <span className="flex items-center gap-2 text-zinc-300"><div className="w-3 h-3 rounded-full bg-[#14b8a6]"></div> Machine B</span>
              <span className="flex items-center gap-2 text-zinc-300"><div className="w-3 h-3 rounded-full bg-[#84cc16]"></div> Machine C</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#f4f4f5', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="MachineA" stroke="#10b981" fillOpacity={1} fill="url(#colorA)" strokeWidth={3} />
                <Area type="monotone" dataKey="MachineB" stroke="#14b8a6" fillOpacity={1} fill="url(#colorB)" strokeWidth={3} />
                <Area type="monotone" dataKey="MachineC" stroke="#84cc16" fillOpacity={1} fill="url(#colorC)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Pie Chart */}
        <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-zinc-100 mb-2">Quarantine Distribution</h3>
          <p className="text-xs text-zinc-500 mb-6">Total faulty records by machine over timeframe.</p>
          <div className="flex-1 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={anomalyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {anomalyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-[-36px]">
               <div className="text-center">
                 <p className="text-3xl font-black text-white">438</p>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total</p>
               </div>
            </div>
          </div>
        </div>

        {/* Composed Chart: Vibration vs Anomalies */}
        <div className="xl:col-span-2 bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-zinc-100">Vibration Impact on Anomalies</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                  cursor={{fill: '#27272a', opacity: 0.4}}
                />
                <Legend iconType="circle" />
                <Bar yAxisId="left" dataKey="anomalies" name="Anomalies (Count)" fill="#3f3f46" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="vibrationA" name="Avg Vibration (mm)" stroke="#14b8a6" strokeWidth={3} dot={{r: 4, fill: '#14b8a6', strokeWidth: 0}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Chart: Performance Clusters */}
        <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl">
          <h3 className="text-lg font-bold text-zinc-100 mb-2">Performance Clusters</h3>
          <p className="text-xs text-zinc-500 mb-6">RPM vs Temperature correlation</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" dataKey="rpmA" name="RPM" stroke="#71717a" fontSize={12} domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="MachineA" name="Temp" stroke="#71717a" fontSize={12} domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                <ZAxis type="number" range={[50, 400]} />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3', stroke: '#52525b' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                />
                <Scatter name="Machine A Operations" data={displayData} fill="#10b981" opacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Detailed Data Grid */}
        <div className="xl:col-span-3 bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-zinc-400" />
              Raw Aggregated Dataset
            </h3>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-full border border-zinc-700">
              Showing {timeRange} records
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#09090b] text-zinc-400 text-xs uppercase tracking-widest border-b border-zinc-800/50">
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Mach. A Temp (°C)</th>
                  <th className="px-6 py-4 font-semibold">Mach. B Temp (°C)</th>
                  <th className="px-6 py-4 font-semibold">Mach. C Temp (°C)</th>
                  <th className="px-6 py-4 font-semibold text-right">Anomalies Detected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {displayData.slice().reverse().map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-zinc-300">{row.date}</td>
                    <td className="px-6 py-3 text-sm text-zinc-200">{row.MachineA.toFixed(1)}</td>
                    <td className="px-6 py-3 text-sm text-zinc-200">{row.MachineB.toFixed(1)}</td>
                    <td className="px-6 py-3 text-sm text-zinc-200">{row.MachineC.toFixed(1)}</td>
                    <td className="px-6 py-3 text-sm font-bold text-right">
                      {row.anomalies > 3 ? (
                         <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded flex items-center justify-end gap-1 w-fit ml-auto">
                           <AlertTriangle className="w-3 h-3" /> {row.anomalies}
                         </span>
                      ) : (
                         <span className="text-zinc-400">{row.anomalies}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
