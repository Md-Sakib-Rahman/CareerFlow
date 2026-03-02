import React, { useState, useEffect } from 'react';
import { privateApi } from '../../../Axios/axiosInstance';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Target, CheckCircle, XCircle, Briefcase, BarChart3, PieChart as PieIcon } from 'lucide-react';

const Analytics = () => {
  const [boards, setBoards] = useState([]);
  const [selectedBoardData, setSelectedBoardData] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState('all');
  const [loading, setLoading] = useState(true);

  // Recharts color palette
  const COLORS = ['#9333ea', '#4f46e5', '#db2777', '#16a34a', '#dc2626'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  // ১. first fetch for initial data (global overview + boards list):
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // we fetch analytics for 'all' boards to get the global overview and the list of boards for the dropdown
      const res = await privateApi.get('/api/analytics?boardId=all');
      const apiData = res.data.data; // Backend response structure: { data: { boards, pipelineStatus, ... } }

      setBoards(apiData.boards || []);
      setSelectedBoardData(apiData);
    } catch (err) { 
      console.error("Analytics Initial Fetch Error:", err); 
    } finally {
      setLoading(false);
    }
  };

  // ২. change event handler for board selection:
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

  if (loading && !selectedBoardData) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );
  }

  // ৩. Comparison Chart data preparation:we can compare the selected board with the global data (if not already selected)
  // here we prepare data for the top bar chart that compares the selected board's performance with the global average (or total)
  const comparisonData = [
    {
      name: selectedBoardId === 'all' ? 'Global' : 'Selected Board',
      interviews: selectedBoardData?.pipelineStatus?.interviewing || 0,
      offers: selectedBoardData?.pipelineStatus?.offered || 0
    }
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-4 md:p-8 transition-colors duration-300">
      
      {/* SECTION 1: TOP COMPARISON */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Board Performance Overview</h2>
        </div>
        <div className="bg-base-200 p-6 rounded-box border border-base-300 shadow-xl h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
              <XAxis dataKey="name" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1d232a', border: '1px solid #384153', borderRadius: '12px' }} 
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="interviews" fill="#9333ea" radius={[4, 4, 0, 0]} name="Interviews" barSize={60} />
              <Bar dataKey="offers" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Offers" barSize={60} />
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Success Rate" value={selectedBoardData?.successRate || "0%"} icon={<Target className="text-primary"/>} borderClass="border-primary" />
        <StatCard title="Total Applied" value={selectedBoardData?.totalJobFunnel?.totalApplied || 0} icon={<Briefcase className="text-secondary"/>} borderClass="border-secondary" />
        <StatCard title="Interviews" value={selectedBoardData?.totalJobFunnel?.totalInterviews || 0} icon={<CheckCircle className="text-success"/>} borderClass="border-success" />
        <StatCard title="Rejections" value={selectedBoardData?.pipelineStatus?.rejected || 0} icon={<XCircle className="text-error"/>} borderClass="border-error" />
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
                    { name: 'Wishlist', value: selectedBoardData?.pipelineStatus?.wishlist || 0 },
                    { name: 'Applied', value: selectedBoardData?.pipelineStatus?.applied || 0 },
                    { name: 'Interviewing', value: selectedBoardData?.pipelineStatus?.interviewing || 0 },
                    { name: 'Offered', value: selectedBoardData?.pipelineStatus?.offered || 0 },
                    { name: 'Rejected', value: selectedBoardData?.pipelineStatus?.rejected || 0 },
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

        {/* Monthly Activity */}
        <div className="bg-base-200 p-6 rounded-box border border-base-300 shadow-lg">
          <h3 className="text-lg mb-6 font-semibold uppercase tracking-widest opacity-70">Application Velocity (30d)</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedBoardData?.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                <XAxis dataKey="_id" stroke="currentColor" fontSize={10} tickLine={false} />
                <YAxis stroke="currentColor" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1d232a', border: 'none' }} />
                <Line type="monotone" dataKey="count" stroke="#9333ea" strokeWidth={4} dot={{ r: 4, fill: '#9333ea' }} />
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