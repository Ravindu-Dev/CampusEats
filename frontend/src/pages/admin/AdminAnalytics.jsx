import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingBag, Store, RefreshCw, AlertCircle } from 'lucide-react';
import canteenAdminService from '../../services/canteenAdminService';
import adminAuthService from '../../services/adminAuthService';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);
  const [canteens, setCanteens] = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:8081/api/admin/analytics/overview?days=${days}${selectedCanteen ? `&canteenId=${selectedCanteen}` : ''}`;
      const response = await axios.get(url, {
        headers: adminAuthService.getAuthHeader()
      });
      setData(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCanteens = async () => {
    try {
      const allCanteens = await canteenAdminService.getAllCanteens();
      setCanteens(allCanteens);
    } catch (err) {
      console.error('Error fetching canteens for analytics:', err);
    }
  };

  useEffect(() => {
    fetchCanteens();
  }, []);

  useEffect(() => {
    fetchData();
  }, [days, selectedCanteen]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#111111] rounded-xl border border-white/10 p-6 h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#111111] rounded-xl border border-white/10 p-6 h-96"></div>
          <div className="bg-[#111111] rounded-xl border border-white/10 p-6 h-96"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center h-full text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-white/60 mb-6">{error}</p>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition flex items-center justify-center gap-2 font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
          <p className="text-sm text-white/50 mt-1">Real-time overview of your platform's performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedCanteen}
            onChange={(e) => setSelectedCanteen(e.target.value)}
            className="bg-[#111111] border border-white/10 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 outline-none transition-colors max-w-[200px]"
          >
            <option value="">All Canteens</option>
            {canteens.map(c => (
              <option key={c.id} value={c.id}>{c.canteenName}</option>
            ))}
          </select>

          <select 
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-[#111111] border border-white/10 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 outline-none transition-colors"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          
          <button 
            onClick={fetchData}
            className="p-2.5 bg-[#111111] border border-white/10 text-white rounded-lg hover:bg-white/5 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 text-white/70 hover:text-white" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={`Rs. ${data?.totalRevenue?.toLocaleString('en-LK', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}`}
          icon={<TrendingUp className="w-6 h-6 text-green-400" />}
          colorClass="bg-green-500/10 border-green-500/20"
        />
        <MetricCard 
          title="Total Orders" 
          value={data?.totalOrders?.toLocaleString() || '0'}
          icon={<ShoppingBag className="w-6 h-6 text-blue-400" />}
          colorClass="bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard 
          title="Active Users" 
          value={data?.activeUsers?.toLocaleString() || '0'}
          icon={<Users className="w-6 h-6 text-purple-400" />}
          colorClass="bg-purple-500/10 border-purple-500/20"
        />
        <MetricCard 
          title="Top Canteen" 
          value={data?.topCanteen?.canteenName || 'N/A'}
          icon={<Store className="w-6 h-6 text-orange-400" />}
          colorClass="bg-orange-500/10 border-orange-500/20"
          subtext={`Revenue: Rs. ${data?.topCanteen?.revenue?.toLocaleString('en-LK', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}`}
        />
      </div>

      {/* Charts Section */}
      <div className="flex flex-col gap-8">
        <div className="bg-[#111111] p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
             Revenue Trend
          </h3>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.revenueTrend || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => [`Rs. ${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#111111' }} activeDot={{ r: 6, fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
             User Growth
          </h3>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.userGrowth || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="newUsers" name="New Users" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Insights and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Smart Insights Panel */}
        <div className="bg-gradient-to-br from-[#1c1c1c] to-[#111111] border border-orange-500/20 p-6 rounded-2xl text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            Smart Insights
          </h3>
          <ul className="space-y-4">
            {data?.insights && data.insights.length > 0 ? (
              data.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  <p className="text-sm font-medium leading-relaxed text-white/90">{insight}</p>
                </li>
              ))
            ) : (
              <li className="text-white/60 bg-white/5 p-4 rounded-xl border border-white/5">No insights available for this period.</li>
            )}
          </ul>
        </div>

        {/* Top Canteens Table */}
        <div className="lg:col-span-2 bg-[#111111] p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-semibold text-white/90 mb-6">Top Performing Canteens</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/60">
              <thead className="text-xs text-white/40 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4 rounded-tl-lg">Canteen Name</th>
                  <th scope="col" className="px-6 py-4">Total Orders</th>
                  <th scope="col" className="px-6 py-4 rounded-tr-lg text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data?.topCanteens && data.topCanteens.length > 0 ? (
                  data.topCanteens.map((canteen, idx) => (
                    <tr key={idx} className="bg-transparent border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white/90 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xs shadow-sm">
                          {idx + 1}
                        </div>
                        {canteen.canteenName}
                      </td>
                      <td className="px-6 py-4">{canteen.totalOrders?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-medium text-green-400">
                        Rs. {canteen.revenue?.toLocaleString('en-LK', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-white/40">
                      No canteen data available for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Metric Card Component
const MetricCard = ({ title, value, icon, colorClass, subtext }) => (
  <div className="bg-[#111111] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-white/50">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-2 mb-1">{value}</h3>
        {subtext && <p className="text-xs text-white/40">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl border ${colorClass}`}>
        {icon}
      </div>
    </div>
  </div>
);

export default AdminAnalytics;
