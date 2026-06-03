'use client';

import { useState } from 'react';
import { Shield, Key, Bell, Server, HardDrive, Save, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('iam');
  const [saved, setSaved] = useState(false);
  const [days, setDays] = useState('30');
  const [isApplying, setIsApplying] = useState(false);

  // Kinesis Paid Setting Confirmation
  const [showKinesisConfirm, setShowKinesisConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleApplyLifecycle = async () => {
    setIsApplying(true);
    try {
      const res = await fetch('/api/settings/lifecycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 5000);
      } else {
        alert("Failed: " + data.error);
      }
    } catch (error) {
      console.error(error);
    }
    setIsApplying(false);
  };

  return (
    <div className="p-10 space-y-8 max-w-[1200px] mx-auto">
      
      <div className="mb-10">
        <h2 className="text-3xl font-black text-zinc-100">System Settings</h2>
        <p className="text-zinc-400 mt-2">Manage AWS Configurations and Rules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Nav */}
        <div className="space-y-2" suppressHydrationWarning>
          <button 
            suppressHydrationWarning
            onClick={() => setActiveTab('iam')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold border transition-all ${activeTab === 'iam' ? 'bg-[#121214] text-zinc-100 border-zinc-700 shadow-lg' : 'hover:bg-[#121214] text-zinc-400 border-transparent hover:border-zinc-800'}`}
          >
            <Key className={`w-5 h-5 ${activeTab === 'iam' ? 'text-blue-400' : 'text-zinc-500'}`} />
            IAM Roles & Access
          </button>
          <button 
            suppressHydrationWarning
            onClick={() => setActiveTab('sns')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold border transition-all ${activeTab === 'sns' ? 'bg-[#121214] text-zinc-100 border-zinc-700 shadow-lg' : 'hover:bg-[#121214] text-zinc-400 border-transparent hover:border-zinc-800'}`}
          >
            <Bell className={`w-5 h-5 ${activeTab === 'sns' ? 'text-amber-400' : 'text-zinc-500'}`} />
            Alerts & SNS
          </button>
          <button 
            suppressHydrationWarning
            onClick={() => setActiveTab('kinesis')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold border transition-all ${activeTab === 'kinesis' ? 'bg-[#121214] text-zinc-100 border-zinc-700 shadow-lg' : 'hover:bg-[#121214] text-zinc-400 border-transparent hover:border-zinc-800'}`}
          >
            <Server className={`w-5 h-5 ${activeTab === 'kinesis' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            Kinesis Configuration
          </button>
          <button 
            suppressHydrationWarning
            onClick={() => setActiveTab('s3')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold border transition-all ${activeTab === 's3' ? 'bg-[#121214] text-zinc-100 border-zinc-700 shadow-lg' : 'hover:bg-[#121214] text-zinc-400 border-transparent hover:border-zinc-800'}`}
          >
            <HardDrive className={`w-5 h-5 ${activeTab === 's3' ? 'text-purple-400' : 'text-zinc-500'}`} />
            S3 Lifecycle Rules
          </button>
        </div>

        {/* Right Content */}
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            
            {activeTab === 'iam' && (
              <motion.div 
                key="iam"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800/50">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100">IAM Role Configuration</h3>
                    <p className="text-sm text-zinc-400">Configure the execution roles for Lambda and Glue.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Lambda Execution Role ARN</label>
                    <input 
                      type="text" 
                      defaultValue="arn:aws:iam::484395055440:role/smart-mfg-lambda-role"
                      className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Glue ETL Service Role ARN</label>
                    <input 
                      type="text" 
                      defaultValue="arn:aws:iam::484395055440:role/smart-mfg-glue-role"
                      className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end items-center gap-4">
                    {saved && <span className="text-emerald-400 text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Saved successfully!</span>}
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">
                      <Save className="w-4 h-4" />
                      Save Configuration
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sns' && (
              <motion.div 
                key="sns"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800/50">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <Bell className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100">Alerts & Notifications</h3>
                    <p className="text-sm text-zinc-400">Manage AWS SNS topics for anomaly alerts.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Admin Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="admin@manufacturing.com"
                      className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">SMS Alert Phone Number</label>
                    <input 
                      type="text" 
                      defaultValue="+1 (555) 019-2831"
                      className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end items-center gap-4">
                    {saved && <span className="text-emerald-400 text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Saved successfully!</span>}
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all">
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'kinesis' && (
              <motion.div 
                key="kinesis"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800/50">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <Server className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100">Kinesis Shard Configuration</h3>
                    <p className="text-sm text-zinc-400">Scale your streaming data pipeline capacity.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Number of Provisioned Shards</label>
                    <input 
                      type="number" 
                      defaultValue="4"
                      min="1"
                      className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                    <p className="text-xs text-zinc-500 mt-2">Current capacity: 4MB/second ingest, 8MB/second egress.</p>
                  </div>
                  
                  <div className="pt-4 flex justify-end items-center gap-4">
                    {saved && <span className="text-emerald-400 text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Saved successfully!</span>}
                    <button 
                      onClick={() => setShowKinesisConfirm(true)} 
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Update Shards
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 's3' && (
              <motion.div 
                key="s3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800/50">
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <HardDrive className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100">S3 Lifecycle Rules</h3>
                    <p className="text-sm text-zinc-400">Optimize storage costs by archiving old telemetry data.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Transition to Glacier (Days)</label>
                    <select 
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    >
                      <option value="30">30 Days (Maximum Savings)</option>
                      <option value="60">60 Days (Balanced)</option>
                      <option value="90">90 Days (High Availability)</option>
                    </select>
                    
                    <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
                      <div className="mt-0.5">
                        <HardDrive className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-100">Lifecycle Benefit Analysis</h4>
                        <p className="text-xs text-zinc-300 mt-1">
                          {days === '30' && "Transitioning to Glacier Deep Archive after 30 days reduces AWS S3 storage costs by up to 95%, ideal for strict compliance logging where immediate access is rarely needed."}
                          {days === '60' && "A 60-day transition provides a balanced approach, keeping recent historical data in standard S3 for fast Athena querying while archiving older data to save up to 80% on costs."}
                          {days === '90' && "Keeping data in standard S3 for 90 days maximizes fast query availability for ML models and quarterly reporting, while still providing long-term cost savings via Glacier."}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end items-center gap-4">
                    {saved && <span className="text-emerald-400 text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> S3 Rules Applied to AWS!</span>}
                    <button 
                      onClick={handleApplyLifecycle} 
                      disabled={isApplying}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
                    >
                      {isApplying ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                      {isApplying ? 'Applying...' : 'Apply Rules'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
      {/* Kinesis Paid Confirmation Modal */}
      {showKinesisConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#09090b]/80 backdrop-blur-sm">
          <div className="bg-[#121214] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/10 max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-zinc-800/80 flex items-center gap-3 bg-[#09090b]/50">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-bold text-zinc-100">Paid Configuration Change</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-zinc-400 mb-4">
                Updating the number of provisioned Kinesis shards will directly increase your AWS hourly billing rate.
              </p>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-2">
                Type "CONFIRM" to proceed
              </label>
              <input 
                type="text" 
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="CONFIRM"
                className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>
            <div className="p-4 border-t border-zinc-800/80 bg-[#09090b]/50 flex justify-end gap-3">
              <button 
                onClick={() => { setShowKinesisConfirm(false); setConfirmText(''); }} 
                className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={confirmText !== 'CONFIRM'}
                onClick={() => {
                  setShowKinesisConfirm(false);
                  setConfirmText('');
                  handleSave();
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Paid Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
