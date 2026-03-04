import React, { useState, useEffect } from 'react';
import { privateApi } from '../../../Axios/axiosInstance';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Target, CheckCircle, XCircle, Briefcase, BarChart3, PieChart as PieIcon, Ghost, Clock, TrendingUp, Download, Crown, Sparkles, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify'; // Added for error handling

const STATUS_COLORS = {
  wishlist: '#94a3b8',
  applied: '#4f46e5',
  interviewing: '#9333ea',
  offered: '#16a34a',
  rejected: '#dc2626'
};

const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [boards, setBoards] = useState([]);
  const [selectedBoardData, setSelectedBoardData] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // ⚠️ NEW: AI Feature States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiBoardId, setAiBoardId] = useState('all');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const hasPremiumAccess = user?.plan === "pro" || user?.plan === "executive";
  const isStarter = user?.plan === "starter" || !user?.plan;

  useEffect(() => {
    if (hasPremiumAccess) {
      fetchData('all', true);
    }
  }, [hasPremiumAccess]);

  const fetchData = async (id, isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      // ⚠️ Notice we no longer expect AI data from this general route
      const res = await privateApi.get(`/api/analytics?boardId=${id}`);
      const apiData = res.data.data;
      if (isInitial) setBoards(apiData.boards || []);
      setSelectedBoardData(apiData);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardChange = (e) => {
    const id = e.target.value;
    setSelectedBoardId(id);
    fetchData(id);
  };

  // ==========================================
  // ⚠️ NEW: AI ON-DEMAND FETCHING
  // ==========================================
  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    setAiInsights(null); // Clear old insights
    
    try {
      // You will need to create this specific route/controller on your backend
      const res = await privateApi.get(`/api/analytics/ai-insights?boardId=${aiBoardId}`);
      
      if (res.data.success) {
        setAiInsights(res.data.data.aiInsights);
        setIsAiModalOpen(false); // Close modal on success
      }
    } catch (err) {
      console.error("AI Fetch Error:", err);
      toast.error(err.response?.data?.message || "Failed to generate AI insights.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const element = document.getElementById('analytics-report');
    
    try {
      const dataUrl = await toPng(element, { 
        quality: 1.0, 
        pixelRatio: 2,
        backgroundColor: '#1d232a' 
      });
      
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (elementHeight * pdfWidth) / elementWidth;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CareerFlow-Analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Generation Failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isStarter) {
    return (
      <div className="min-h-screen bg-base-100 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-base-200 border border-secondary/20 p-12 rounded-[2rem] shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary to-primary"></div>
          
          <div className="w-24 h-24 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown size={48} />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Pro Feature</h1>
          <p className="text-base-content/70 mb-8 leading-relaxed">
            Data-driven insights are available exclusively on Pro and Executive plans. Upgrade to visualize your job search funnel, track success rates, and identify bottlenecks.
          </p>
          
          <button 
            onClick={() => navigate('/upgrade')}
            className="btn btn-secondary btn-lg rounded-xl shadow-xl shadow-secondary/20 text-white w-full gap-2"
          >
            Upgrade to Pro <TrendingUp size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (loading || !selectedBoardData) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );
  }

  const { pipelineStatus, metrics, funnel, monthlyActivity } = selectedBoardData;

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-4 md:p-8 space-y-8 relative">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Career Analytics</h1>
          <p className="opacity-60 text-sm">Data-driven insights for your job search journey.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <select 
            value={selectedBoardId}
            onChange={handleBoardChange}
            className="select select-bordered bg-base-200 w-full md:w-auto max-w-xs shadow-lg border-primary/20"
          >
            <option value="all">Total Overview</option>
            {boards.map(board => <option key={board._id} value={board._id}>{board.name}</option>)}
          </select>

          {/* ⚠️ NEW: AI INSIGHTS BUTTON */}
          <button 
            onClick={() => setIsAiModalOpen(true)} 
            className="btn bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30 text-primary hover:from-primary hover:to-secondary hover:text-white shadow-lg gap-2"
          >
            <Sparkles size={18} />
            AI Insights
          </button>

          <button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading}
            className="btn btn-primary shadow-lg gap-2"
          >
            {isDownloading ? <span className="loading loading-spinner loading-sm"></span> : <Download size={18} />}
            {isDownloading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      <div id="analytics-report" className="space-y-8 bg-base-100 p-2 rounded-xl">
        
        {/* KPI RIBBON */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Success Rate" value={metrics.successRate + '%'} desc="Applications to Offers" icon={<Target className="text-primary"/>} color="primary" />
          <StatCard title="Interview Rate" value={metrics.interviewRate} desc="Resume Effectiveness" icon={<TrendingUp className="text-secondary"/>} color="secondary" />
          <StatCard title="Ghosted Apps" value={metrics.ghostedApplications} desc="No response > 14 days" icon={<Ghost className="text-error"/>} color="error" />
          <StatCard title="Avg. Response" value={metrics.avgResponseDays + ' Days'} desc="Applied to Interview" icon={<Clock className="text-success"/>} color="success" />
        </div>

        {/* ⚠️ NEW: AI INSIGHTS CARD (Only shows if data exists) */}
        {aiInsights && (
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-6 rounded-3xl border border-primary/20 shadow-lg relative overflow-hidden">
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-base-100 rounded-2xl text-primary shadow-sm">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content mb-1 flex items-center gap-2">
                  AI Pipeline Analysis
                  <span className="badge badge-primary badge-sm">Beta</span>
                </h3>
                <p className="text-base-content/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {aiInsights}
                </p>
              </div>
            </div>
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-base-200 p-6 rounded-3xl border border-base-300 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="text-primary" size={20} />
              <h3 className="font-bold uppercase text-xs tracking-widest opacity-70">Application Funnel</h3>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel} layout="vertical" margin={{ left: 30, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="step" type="category" axisLine={false} tickLine={false} stroke="currentColor" />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1d232a', borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 10, 10, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-base-200 p-6 rounded-3xl border border-base-300 shadow-xl">
            <h3 className="font-bold uppercase text-xs tracking-widest opacity-70 mb-6">Current Pipeline</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={Object.keys(pipelineStatus).map(key => ({ name: key, value: pipelineStatus[key] })).filter(d => d.value > 0)}
                    innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value"
                  >
                    {Object.keys(pipelineStatus).map((key, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[key] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-base-200 p-8 rounded-3xl border border-base-300 shadow-xl">
          <h3 className="font-bold uppercase text-xs tracking-widest opacity-70 mb-8 text-center">Application Velocity (30 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="_id" stroke="currentColor" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1d232a', border: 'none', borderRadius: '12px' }} />
                <Line type="stepAfter" dataKey="count" stroke="#9333ea" strokeWidth={4} dot={{ r: 6, fill: '#9333ea', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ==========================================
          ⚠️ NEW: AI GENERATION MODAL
          ========================================== */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm p-4">
          <div className="bg-base-100 p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-primary/20">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-primary" /> Generate Insights
              </h2>
              <button 
                onClick={() => setIsAiModalOpen(false)} 
                className="btn btn-ghost btn-sm btn-circle"
                disabled={isAiLoading}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-base-content/70 mb-6">
              Select a board to analyze. Our AI will review your metrics, identify funnel bottlenecks, and provide actionable advice.
            </p>

            <div className="space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-base-content/80">Target Board</span>
                </label>
                <select 
                  className="select select-bordered bg-base-200 w-full"
                  value={aiBoardId}
                  onChange={(e) => setAiBoardId(e.target.value)}
                  disabled={isAiLoading}
                >
                  <option value="all">Total Overview (All Boards)</option>
                  {boards.map(board => <option key={board._id} value={board._id}>{board.name}</option>)}
                </select>
              </div>

              <div className="flex w-full gap-4 mt-6">
                <button 
                  onClick={() => setIsAiModalOpen(false)} 
                  className="btn flex-1 rounded-xl"
                  disabled={isAiLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleGenerateAI} 
                  className="btn btn-primary flex-1 rounded-xl shadow-lg shadow-primary/20 text-white"
                  disabled={isAiLoading}
                >
                  {isAiLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Analyzing...
                    </>
                  ) : (
                    "Get Insights"
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, desc, icon, color }) => (
  <div className={`bg-base-200 p-6 rounded-3xl border border-base-300 shadow-lg relative overflow-hidden group hover:border-${color} transition-all duration-500`}>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-base-300 group-hover:bg-${color}/10 transition-colors`}>{icon}</div>
      </div>
      <h2 className="text-3xl font-black mb-1">{value}</h2>
      <p className="font-bold text-sm uppercase tracking-tighter">{title}</p>
      <p className="text-xs opacity-50 mt-1">{desc}</p>
    </div>
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${color}/5 rounded-full blur-2xl group-hover:bg-${color}/10 transition-all`}></div>
  </div>
);

export default Analytics;
