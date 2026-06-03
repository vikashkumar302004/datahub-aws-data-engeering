'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [toastAlert, setToastAlert] = useState<any | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  
  // Keep track of IDs we've already seen so we only alert on new ones
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDone = useRef(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/quarantine');
        const data = await res.json();
        if (data.success && data.records) {
          const newAlerts = [];
          for (const record of data.records) {
            if (!seenIdsRef.current.has(record.id)) {
              seenIdsRef.current.add(record.id);
              if (initialFetchDone.current) {
                // It's a genuinely new alert after initial load!
                const alertObj = {
                  id: record.id,
                  machine: record.machine,
                  text: `${record.machine} Critical Anomaly! Sent to Quarantine.`,
                  time: 'Just now',
                  details: record.details
                };
                newAlerts.push(alertObj);
              }
            }
          }
          
          if (initialFetchDone.current && newAlerts.length > 0) {
            setAlerts(prev => [...newAlerts, ...prev]);
            // Show toast for the most recent one
            setToastAlert(newAlerts[0]);
            setTimeout(() => setToastAlert(null), 5000); // Hide toast after 5s
          }
          
          initialFetchDone.current = true;
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    };

    fetchAlerts(); // Initial fetch
    const interval = setInterval(fetchAlerts, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="relative z-[100]">
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-10 bg-red-600 border-2 border-red-400 text-white p-4 rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.6)] flex items-center gap-4 z-[9999]"
          >
             <div className="p-2 bg-white/20 rounded-full animate-pulse">
               <AlertTriangle className="w-6 h-6 text-white" />
             </div>
             <div>
               <h4 className="font-black text-lg">CRITICAL ALERT DETECTED</h4>
               <p className="text-sm font-medium text-red-100">{toastAlert.text}</p>
             </div>
             <button onClick={() => setToastAlert(null)} className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors">
               <X className="w-5 h-5" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all group"
      >
        <Bell className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
        {alerts.length > 0 && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#09090b] animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-3 w-80 bg-[#121214] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-zinc-800/80 flex justify-between items-center bg-[#09090b]/50">
              <h3 className="font-bold text-zinc-100 text-sm">Recent Alerts</h3>
              <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30">
                {alerts.length} NEW
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">No new alerts from S3 Quarantine</div>
              ) : (
                alerts.map(alert => (
                  <div 
                    key={alert.id} 
                    onClick={() => setSelectedAlert(alert)}
                    className="p-4 border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors cursor-pointer flex gap-3 relative group"
                  >
                    <div className="mt-0.5 p-1.5 bg-red-500/10 rounded-lg h-fit border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 pr-6">
                      <p className="text-sm font-medium text-zinc-200 leading-snug">{alert.text}</p>
                      <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">{alert.time}</p>
                    </div>
                    <button 
                      onClick={(e) => dismissAlert(alert.id, e)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-red-500/80 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 text-center bg-[#09090b]/50 hover:bg-zinc-900 transition-colors cursor-pointer">
              <a href="/quarantine" className="text-xs text-blue-400 font-bold">View Quarantine Zone</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Details Modal */}
      {selectedAlert && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#09090b]/80 backdrop-blur-sm">
          <div className="bg-[#121214] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/10 max-w-xl w-full overflow-hidden">
            <div className="p-4 border-b border-zinc-800/80 flex justify-between items-center bg-[#09090b]/50">
              <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Alert Details: {selectedAlert.machine}
              </h3>
              <button onClick={() => setSelectedAlert(null)} className="text-zinc-500 hover:text-zinc-300 font-bold">✕</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-zinc-400 mb-4">{selectedAlert.text}</p>
              <div className="bg-[#09090b] rounded-xl p-4 border border-zinc-800/80 font-mono text-xs text-green-400 whitespace-pre-wrap overflow-x-auto shadow-inner">
                {selectedAlert.details ? JSON.stringify(selectedAlert.details, null, 2) : 'No payload details available.'}
              </div>
            </div>
            <div className="p-4 border-t border-zinc-800/80 bg-[#09090b]/50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedAlert(null)} 
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
