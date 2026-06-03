'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, RefreshCw, Eye } from 'lucide-react';
import { DashedBackground } from '@/components/ui/background-components';

export default function QuarantinePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quarantine');
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error("Failed to fetch quarantine records", error);
    }
    setLoading(false);
  };

  const handleDelete = async (key: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/quarantine?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRecords(prev => prev.filter(r => r.id !== key));
      }
    } catch (error) {
      console.error("Failed to delete record", error);
    }
    setIsDeleting(false);
  };

  return (
    <DashedBackground>
      <div className="p-10 space-y-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-[#121214] p-6 rounded-2xl border border-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-100">S3 Quarantine Zone (Live AWS Sync)</h2>
            <p className="text-red-400/80 text-sm mt-1 font-medium">Data Quality Enforcement: {records.length} Faulty Records Detected in AWS S3</p>
          </div>
        </div>
        <div className="relative z-10 flex gap-4">
          <button onClick={() => { if(confirm('Are you sure you want to permanently delete ALL quarantine records?')) setRecords([]) }} className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Purge All
          </button>
          <button onClick={fetchRecords} disabled={loading} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync S3
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-lg flex justify-between items-center">
           <div>
             <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Total Quarantined</p>
             <h3 className="text-3xl font-black text-zinc-100">{records.length}</h3>
           </div>
           <div className="p-3 bg-zinc-800/50 rounded-xl"><ShieldAlert className="w-6 h-6 text-zinc-400" /></div>
        </div>
        <div className="bg-[#121214] border border-red-500/20 rounded-2xl p-6 shadow-lg flex justify-between items-center">
           <div>
             <p className="text-red-400/80 text-xs font-bold uppercase tracking-widest mb-1">Critical Temp Alerts</p>
             <h3 className="text-3xl font-black text-red-500">{records.filter(r => r.reason?.includes('Temp')).length || records.length}</h3>
           </div>
           <div className="p-3 bg-red-500/10 rounded-xl"><ShieldAlert className="w-6 h-6 text-red-500" /></div>
        </div>
        <div className="bg-[#121214] border border-amber-500/20 rounded-2xl p-6 shadow-lg flex justify-between items-center">
           <div>
             <p className="text-amber-400/80 text-xs font-bold uppercase tracking-widest mb-1">Pending Review</p>
             <h3 className="text-3xl font-black text-amber-500">{records.length}</h3>
           </div>
           <div className="p-3 bg-amber-500/10 rounded-xl"><Eye className="w-6 h-6 text-amber-500" /></div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-[#121214]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-zinc-800/80 flex justify-between items-center">
          <input 
            type="text" 
            placeholder="Search by Machine ID or Reason..."
            className="w-80 bg-[#09090b] border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
          <span className="text-xs font-medium text-zinc-500">Sorted by newest</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#09090b] border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-widest">
                <th className="px-6 py-4 font-semibold">S3 Object Key</th>
                <th className="px-6 py-4 font-semibold">Source Machine</th>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Failure Reason</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {records.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    No faulty records found in S3 Quarantine bucket.
                  </td>
                </tr>
              )}
              {records.map((record, idx) => (
                <tr key={record.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-300">{record.id}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-100">{record.machine}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{record.timestamp}</td>
                  <td className="px-6 py-4 text-sm text-red-400 font-medium">{record.reason || 'Temp exceeded 100°C'}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20 whitespace-nowrap">
                      {record.status || 'Pending Review'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => setSelectedRecord(record)} className="p-2 bg-zinc-800/50 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-zinc-400 transition-colors" title="View Payload">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      disabled={isDeleting}
                      className="p-2 bg-zinc-800/50 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-zinc-400 transition-colors disabled:opacity-50" 
                      title="Delete permanently from S3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#09090b]/80 backdrop-blur-sm">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-4 border-b border-zinc-800/80 flex justify-between items-center bg-[#09090b]/50">
              <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Quarantine Object Details
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="text-zinc-500 hover:text-zinc-300 font-bold">✕</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="mb-4 space-y-1 text-sm">
                <p><span className="text-zinc-500 w-24 inline-block">Machine ID:</span> <span className="font-mono text-zinc-300">{selectedRecord.machine}</span></p>
                <p><span className="text-zinc-500 w-24 inline-block">S3 Key:</span> <span className="font-mono text-zinc-300">{selectedRecord.id}</span></p>
                <p><span className="text-zinc-500 w-24 inline-block">Timestamp:</span> <span className="text-zinc-300">{selectedRecord.timestamp}</span></p>
              </div>
              <div className="bg-[#09090b] rounded-xl p-4 border border-zinc-800/80 font-mono text-xs text-green-400 whitespace-pre-wrap overflow-x-auto shadow-inner">
                {selectedRecord.details ? JSON.stringify(selectedRecord.details, null, 2) : 'Loading or No Details Available...'}
              </div>
            </div>
            <div className="p-4 border-t border-zinc-800/80 bg-[#09090b]/50 flex justify-end gap-3">
              <button onClick={() => setSelectedRecord(null)} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors">
                Close
              </button>
              <button 
                onClick={() => { handleDelete(selectedRecord.id); setSelectedRecord(null); }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                Delete from S3
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashedBackground>
  );
}
