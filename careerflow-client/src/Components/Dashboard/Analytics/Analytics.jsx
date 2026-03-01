import React, { useState, useEffect } from 'react';
import { privateApi } from '../../../Axios/axiosInstance';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Target, CheckCircle, XCircle, Briefcase, BarChart3, PieChart as PieIcon } from 'lucide-react';

const Analytics = () => {
  const [globalData, setGlobalData] = useState(null);
  const [boardWiseComparison, setBoardWiseComparison] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedBoardData, setSelectedBoardData] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState('all');
  const [loading, setLoading] = useState(true);

  // Recharts color palette - can be customized or extended as needed
  const COLORS = ['#9333ea', '#4f46e5', '#db2777', '#16a34a', '#dc2626'];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const boardRes = await privateApi.get('/api/boards');
      const allBoards = boardRes.data.boards || [];
      setBoards(allBoards);

      const globalRes = await privateApi.get('/api/analytics?boardId=all');
      setGlobalData(globalRes.data.data);
      setSelectedBoardData(globalRes.data.data);

      const comparisonData = await Promise.all(allBoards.map(async (b) => {
        try {
          const res = await privateApi.get(`/api/analytics?boardId=${b._id}`);
          return {
            name: b.name,
            interviews: res.data.data.pipelineStatus.interviewing || 0,
            offers: res.data.data.pipelineStatus.offered || 0
          };
        } catch (err) {
          return { name: b.name, interviews: 0, offers: 0 };
        }
      }));
      setBoardWiseComparison(comparisonData);
    } catch (err) { 
      console.error("Analytics Main Fetch Error:", err); 
    } finally {
      setLoading(false);
    }
  };

  const handleBoardChange = async (e) => {
    const id = e.target.value;
    setSelectedBoardId(id);
    setLoading(true);
    try {
      const res = await privateApi.get(`/api/analytics?boardId=${id}`);
      setSelectedBoardData(res.data.data);
    } catch (err) { 
      console.error("Board Filter Error:", err); 
    } finally {
      setLoading(false);
    }
  };

  if (loading && !globalData) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-4 md:p-8 transition-colors duration-300">
      
      {/* SECTION 1: TOP COMPARISON */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Board Comparison Performance</h2>
        </div>
        <div className="bg-base-200 p-6 rounded-box border border-base-300 shadow-xl h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={boardWiseComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
              <XAxis dataKey="name" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-base-200)', border: '1px solid var(--color-base-300)', borderRadius: '12px' }} 
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="interviews" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Interviews" barSize={30} />
              <Bar dataKey="offers" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} name="Offers" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="divider opacity-10"></div>

      {/* SECTION 2: SPECIFIC ANALYTICS & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <PieIcon className="text-secondary" />
          <h2 className="text-2xl font-bold">
            {selectedBoardId === 'all' ? "Global Lifetime Insights" : "Detailed Board Performance"}
          </h2>
        </div>
        
        <select 
          value={selectedBoardId}
          onChange={handleBoardChange}
          className="select select-bordered bg-base-200 w-full max-w-xs focus:ring-2 focus:ring-primary transition-all shadow-md"
        >
          <option value="all">Total Overview (All Boards)</option>
          {boards.map(board => (
            <option key={board._id} value={board._id}>{board.name}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards - Updated to use theme variables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Success Rate" value={selectedBoardData?.successRate || "0%"} icon={<Target className="text-primary"/>} borderClass="border-primary" />
        <StatCard title="Total Applied" value={selectedBoardData?.totalJobFunnel.totalApplied || 0} icon={<Briefcase className="text-secondary"/>} borderClass="border-secondary" />
        <StatCard title="Interviews" value={selectedBoardData?.totalJobFunnel.totalInterviews || 0} icon={<CheckCircle className="text-success"/>} borderClass="border-success" />
        <StatCard title="Rejections" value={selectedBoardData?.pipelineStatus.rejected || 0} icon={<XCircle className="text-error"/>} borderClass="border-error" />
      </div>

      {/* Charts Detail Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-base-200 p-6 rounded-box border border-base-300 shadow-lg">
          <h3 className="text-lg mb-6 font-semibold uppercase tracking-widest opacity-70">Application Distribution</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Wishlist', value: selectedBoardData?.pipelineStatus.wishlist || 0 },
                    { name: 'Applied', value: selectedBoardData?.pipelineStatus.applied || 0 },
                    { name: 'Interviewing', value: selectedBoardData?.pipelineStatus.interviewing || 0 },
                    { name: 'Offered', value: selectedBoardData?.pipelineStatus.offered || 0 },
                    { name: 'Rejected', value: selectedBoardData?.pipelineStatus.rejected || 0 },
                  ].filter(d => d.value > 0)} 
                  innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value"
                >
                  {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-base-200 p-6 rounded-box border border-base-300 shadow-lg">
          <h3 className="text-lg mb-6 font-semibold uppercase tracking-widest opacity-70">Application Velocity (30d)</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedBoardData?.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                <XAxis dataKey="_id" stroke="currentColor" fontSize={10} tickLine={false} />
                <YAxis stroke="currentColor" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-base-200)', border: 'none' }} />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={4} dot={{ r: 4, fill: 'var(--color-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, borderClass }) => (
  <div className={`bg-base-200 p-6 rounded-box border-l-4 ${borderClass} shadow-lg hover:translate-y-[-5px] transition-all duration-300 group`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-base-content opacity-60 text-xs uppercase tracking-widest font-medium mb-1">{title}</p>
        <h2 className="text-3xl font-bold text-base-content">{value}</h2>
      </div>
      <div className="bg-base-300 p-3 rounded-box shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  </div>
);

export default Analytics;