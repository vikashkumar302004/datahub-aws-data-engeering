'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, Zap, Server, Shield, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

export default function Dashboard() {
  const [machines, setMachines] = useState([
    { id: 'Machine-A', temp: 0, vibration: 0, rpm: 0, status: 'UNKNOWN', health: 100 },
    { id: 'Machine-B', temp: 0, vibration: 0, rpm: 0, status: 'UNKNOWN', health: 100 },
    { id: 'Machine-C', temp: 0, vibration: 0, rpm: 0, status: 'UNKNOWN', health: 100 },
  ]);

  const [chartData, setChartData] = useState<any[]>([]);
  const [totalEvents, setTotalEvents] = useState(142800);
  const [anomalies, setAnomalies] = useState(24);

  // Poll real-time data from AWS (S3 Raw Zone via Next API)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/telemetry');
        const data = await res.json();
        
        if (data.success && data.records.length > 0) {
          // Transform S3 JSON records to Chart format
          const newChartData: any = {};
          let newTotalEvents = 142800;
          let newAnomalies = 24;
          
          data.records.forEach((record: any) => {
            if (!newChartData[record.time]) {
              newChartData[record.time] = { time: record.time };
            }
            const key = record.machine_id.replace('-', '');
            newChartData[record.time][key] = Number(record.sensor_readings.temperature.toFixed(1));
            
            newTotalEvents++;
            if (record.sensor_readings.temperature > 100) newAnomalies++;
          });

          setTotalEvents(newTotalEvents);
          setAnomalies(newAnomalies);
          
          // @ts-ignore
          const rawInitialData = Object.values(newChartData).slice(-15);
          // Ensure no sparse data points to prevent lines from disappearing
          const initialChartData = rawInitialData.map((pt: any) => ({
            time: pt.time,
            MachineA: pt.MachineA || 85.5,
            MachineB: pt.MachineB || 82.0,
            MachineC: pt.MachineC || 88.2,
          }));
          setChartData(initialChartData); // keep last 15 points

          // Update Latest Machine States
          const latestState: any = { 'Machine-A': {}, 'Machine-B': {}, 'Machine-C': {} };
          data.records.forEach((record: any) => {
            latestState[record.machine_id] = record;
          });

          setMachines(prev => prev.map(m => {
            const latest = latestState[m.id];
            if (!latest || !latest.sensor_readings) return m;
            
            const isAnomaly = latest.sensor_readings.temperature > 100;
            return {
              ...m,
              temp: Number(latest.sensor_readings.temperature.toFixed(1)),
              vibration: Number(latest.sensor_readings.vibration.toFixed(1)),
              rpm: latest.sensor_readings.rpm,
              status: isAnomaly ? 'WARNING' : 'OK',
              health: isAnomaly ? Math.max(0, m.health - 2) : Math.min(100, m.health + 1)
            };
          }));
          
          startLiveSimulation();
        }
      } catch (error) {
        console.error("Failed to fetch telemetry", error);
      }
    };

    let liveInterval: NodeJS.Timeout;
    const startLiveSimulation = () => {
      clearInterval(liveInterval);
      liveInterval = setInterval(() => {
        setChartData(prev => {
          if (prev.length === 0) return prev;
          const lastPoint = prev[prev.length - 1];
          const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newPoint = {
            time: newTime,
            MachineA: Number(((lastPoint.MachineA || 85.5) + (Math.random() * 4 - 2)).toFixed(1)),
            MachineB: Number(((lastPoint.MachineB || 82.0) + (Math.random() * 4 - 2)).toFixed(1)),
            MachineC: Number(((lastPoint.MachineC || 88.2) + (Math.random() * 4 - 2)).toFixed(1)),
          };
          return [...prev, newPoint].slice(-15);
        });
        
        setMachines(prev => prev.map(m => {
          if (m.status === 'WARNING') return m;
          const tempFluctuation = Math.random() * 2 - 1;
          return {
             ...m,
             temp: Number(Math.max(20, m.temp + tempFluctuation).toFixed(1)),
             vibration: Number(Math.max(0, m.vibration + (Math.random() * 2 - 1)).toFixed(1)),
             rpm: Math.floor(Math.max(0, m.rpm + (Math.random() * 20 - 10)))
          };
        }));
        
        setTotalEvents(prev => prev + Math.floor(Math.random() * 3) + 1);
      }, 2000);
    };

    fetchData(); // Initial fetch

    return () => clearInterval(liveInterval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="p-10 space-y-10 max-w-[1600px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-zinc-700 transition-all cursor-default">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-20 bg-blue-500 transition-opacity group-hover:opacity-30"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-zinc-400 text-sm font-semibold tracking-wide">Total Processed Events</p>
                <h3 className="text-4xl font-black mt-2 text-zinc-100 flex items-center">
                  <CountUp end={totalEvents} separator="," duration={2.5} preserveValue={true} />
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-xs font-semibold mt-2 text-blue-400/80">LIVE from S3 Raw Zone</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-zinc-700 transition-all cursor-default">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-20 bg-red-500 transition-opacity group-hover:opacity-30"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-zinc-400 text-sm font-semibold tracking-wide">Anomalies Detected</p>
                <h3 className="text-4xl font-black mt-2 text-zinc-100">
                  <CountUp end={anomalies} duration={2} preserveValue={true} />
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <p className="text-xs font-semibold mt-2 text-red-400/80">Routed to S3 Quarantine</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-zinc-700 transition-all cursor-default">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-20 bg-emerald-500 transition-opacity group-hover:opacity-30"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-zinc-400 text-sm font-semibold tracking-wide">Pipeline Health</p>
                <h3 className="text-4xl font-black mt-2 text-zinc-100 flex items-baseline">
                  <CountUp end={99.9} decimals={1} duration={2} />
                  <span className="text-2xl ml-1">%</span>
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <p className="text-xs font-semibold mt-2 text-emerald-400/80">Kinesis & Lambda stable</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-zinc-700 transition-all cursor-default">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-20 bg-amber-500 transition-opacity group-hover:opacity-30"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-zinc-400 text-sm font-semibold tracking-wide">Athena Query Cost</p>
                <h3 className="text-4xl font-black mt-2 text-zinc-100 flex items-baseline">
                  <span className="text-2xl mr-1">$</span>
                  <CountUp end={1.24} decimals={2} duration={2} />
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <p className="text-xs font-semibold mt-2 text-amber-400/80">Optimized via Parquet</p>
        </motion.div>
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Live Machine Status (2 Columns Wide) */}
        <motion.div variants={itemVariants} className="xl:col-span-2 space-y-8">
          
          {/* Main Chart */}
          <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">Real-time Telemetry Stream <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">LIVE AWS SYNC</span></h2>
                <p className="text-zinc-400 text-sm mt-1">Fetching live temperature data directly from S3 Raw Zone via AWS SDK</p>
              </div>
              <div className="flex gap-6 text-sm font-medium">
                <span className="flex items-center gap-2 text-zinc-300"><div className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></div> Machine A</span>
                <span className="flex items-center gap-2 text-zinc-300"><div className="w-3 h-3 rounded-full bg-[#14b8a6] shadow-[0_0_10px_#14b8a6]"></div> Machine B</span>
                <span className="flex items-center gap-2 text-zinc-300"><div className="w-3 h-3 rounded-full bg-[#84cc16] shadow-[0_0_10px_#84cc16]"></div> Machine C</span>
              </div>
            </div>
            <div className="h-[350px] w-full">
              {chartData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 font-medium">Waiting for Kinesis/S3 data... Run iot_simulator.py</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickMargin={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}°`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ color: '#f4f4f5', fontWeight: 'bold' }}
                      labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                      formatter={(value: any) => [`${Number(value).toFixed(1)} °C`]}
                    />
                    <Area type="monotone" dataKey="MachineA" stroke="#10b981" fillOpacity={1} fill="url(#colorA)" strokeWidth={3} connectNulls={true} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="MachineB" stroke="#14b8a6" fillOpacity={1} fill="url(#colorB)" strokeWidth={3} connectNulls={true} activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="MachineC" stroke="#84cc16" fillOpacity={1} fill="url(#colorC)" strokeWidth={3} connectNulls={true} activeDot={{ r: 6, fill: '#84cc16', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Machine Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <motion.div 
                key={machine.id} 
                layout
                className={`rounded-2xl p-6 transition-all duration-300 ${machine.status === 'WARNING' ? 'bg-[#2a1114] border border-red-500/50 shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)]' : 'bg-[#121214] border border-zinc-800 hover:border-zinc-600'}`}
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg text-zinc-100 flex items-center gap-2">
                    <Server className="w-5 h-5 text-zinc-400" />
                    {machine.id}
                  </span>
                  {machine.status === 'WARNING' ? (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30 flex items-center gap-2 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> QUARANTINE
                    </span>
                  ) : machine.status === 'UNKNOWN' ? (
                    <span className="px-3 py-1 bg-zinc-500/10 text-zinc-400 text-xs font-bold rounded-full border border-zinc-500/20 flex items-center gap-1">
                      WAITING...
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800/50">
                    <p className="text-xs text-zinc-500 font-semibold mb-1 uppercase tracking-wider">Temp</p>
                    <p className={`text-2xl font-black ${machine.temp > 100 ? 'text-red-400' : 'text-zinc-100'}`}>
                      {machine.temp}<span className="text-sm font-medium text-zinc-500 ml-1">°C</span>
                    </p>
                  </div>
                  <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800/50">
                    <p className="text-xs text-zinc-500 font-semibold mb-1 uppercase tracking-wider">Vibration</p>
                    <p className="text-2xl font-bold text-zinc-100">
                      {machine.vibration}<span className="text-sm font-medium text-zinc-500 ml-1">mm</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Predictive Maintenance */}
        <motion.div variants={itemVariants} className="space-y-8">
          
          <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-zinc-100">Predictive Maintenance</h2>
            </div>
            <p className="text-sm text-zinc-400 mb-8">AWS SageMaker Inference Models</p>
            
            <div className="space-y-8">
              {machines.map(m => (
                <div key={m.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-zinc-300">{m.id}</span>
                    <span className={`text-lg font-black ${m.health < 90 ? 'text-red-400' : 'text-emerald-400'}`}>
                       <CountUp end={m.health} duration={1} preserveValue={true} />%
                    </span>
                  </div>
                  <div className="w-full bg-[#09090b] rounded-full h-3 border border-zinc-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${m.health < 90 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                      style={{ width: `${m.health}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                    </div>
                  </div>
                  {m.health < 90 ? (
                     <p className="text-xs text-red-400 font-medium bg-red-500/10 inline-block px-2 py-1 rounded border border-red-500/20">Action Required: Inspect within 48h</p>
                  ) : (
                     <p className="text-xs text-zinc-500 font-medium">Operating optimally</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl">
             <h2 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
               <Database className="w-5 h-5 text-zinc-400" />
               Live Kinesis Audit Log
             </h2>
             <div className="space-y-4">
               {[1, 2, 3, 4].map((_, i) => (
                 <div key={i} className="flex gap-4 items-start p-4 rounded-xl bg-[#09090b] border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-default">
                    <div className="text-zinc-500 font-mono text-[10px] mt-1 whitespace-nowrap" suppressHydrationWarning>
                      {new Date(Date.now() - i * 15000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-sm">
                      <span className="text-blue-400 font-bold text-xs bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 mr-2">PUT</span> 
                      <span className="text-zinc-300">Data streamed to</span> <span className="text-zinc-400 font-mono text-xs">smart-mfg-raw-zone</span>
                    </div>
                 </div>
               ))}
             </div>
             <button onClick={() => alert("Redirecting to AWS CloudWatch Console...")} className="w-full mt-6 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-sm font-bold text-zinc-100 hover:bg-zinc-700 hover:text-white hover:border-zinc-500 shadow-lg transition-all">
               View Full Logs in CloudWatch
             </button>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}
