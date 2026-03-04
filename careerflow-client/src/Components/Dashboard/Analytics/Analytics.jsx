import React, { useState, useEffect } from 'react';
import { privateApi } from '../../../Axios/axiosInstance';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Target, CheckCircle, XCircle, Briefcase, BarChart3, PieChart as PieIcon, Ghost, Clock, TrendingUp, Download } from 'lucide-react';
// import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image'; // Add this instead
import jsPDF from 'jspdf';

const STATUS_COLORS = {
  wishlist: '#94a3b8',
  applied: '#4f46e5',
  interviewing: '#9333ea',
  offered: '#16a34a',
  rejected: '#dc2626'
};

const Analytics = () => {
  const [boards, setBoards] = useState([]);
  const [selectedBoardData, setSelectedBoardData] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchData('all', true);
  }, []);

  const fetchData = async (id, isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
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

  // Pro-Level PDF Generation Logic
 // Pro-Level PDF Generation Logic (Modern CSS Compatible)
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const element = document.getElementById('analytics-report');
    
    try {
      // 1. Take snapshot using browser-native rendering (bypasses oklab error)
      const dataUrl = await toPng(element, { 
        quality: 1.0, 
        pixelRatio: 2,
        backgroundColor: '#1d232a' // Fallback for dark mode backgrounds
      });
      
      // 2. Calculate aspect ratio based on the actual DOM element
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (elementHeight * pdfWidth) / elementWidth;
      
      // 3. Add image to PDF and trigger download
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CareerFlow-Analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Generation Failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading && !selectedBoardData) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );
  }

  const { pipelineStatus, metrics, funnel, monthlyActivity } = selectedBoardData;
  console.log("Monthly Activity Data:", monthlyActivity)
  return (
    <div className="min-h-screen bg-base-100 text-base-content p-4 md:p-8 space-y-8">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Career Analytics</h1>
          <p className="opacity-60 text-sm">Data-driven insights for your job search journey.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={selectedBoardId}
            onChange={handleBoardChange}
            className="select select-bordered bg-base-200 w-full max-w-xs shadow-lg border-primary/20"
          >
            <option value="all">Total Overview (All Boards)</option>
            {boards.map(board => <option key={board._id} value={board._id}>{board.name}</option>)}
          </select>

          {/* DOWNLOAD BUTTON */}
          <button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading}
            className="btn btn-primary shadow-lg gap-2"
          >
            {isDownloading ? <span className="loading loading-spinner loading-sm"></span> : <Download size={18} />}
            {isDownloading ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* WRAPPER FOR PDF CAPTURE */}
      <div id="analytics-report" className="space-y-8 bg-base-100 p-2 rounded-xl">
        
        {/* KPI RIBBON */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Success Rate" value={metrics.successRate + '%'} desc="Applications to Offers" icon={<Target className="text-primary"/>} color="primary" />
          <StatCard title="Interview Rate" value={metrics.interviewRate} desc="Resume Effectiveness" icon={<TrendingUp className="text-secondary"/>} color="secondary" />
          <StatCard title="Ghosted Apps" value={metrics.ghostedApplications} desc="No response > 14 days" icon={<Ghost className="text-error"/>} color="error" />
          <StatCard title="Avg. Response" value={metrics.avgResponseDays + ' Days'} desc="Applied to Interview" icon={<Clock className="text-success"/>} color="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FUNNEL CHART */}
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

          {/* STATUS DISTRIBUTION */}
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

        {/* ACTIVITY TREND */}
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
      {/* END OF PDF WRAPPER */}

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
