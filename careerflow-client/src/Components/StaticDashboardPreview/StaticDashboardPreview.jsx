import React from "react";
import { FaPlus, FaBriefcase, FaCalendarAlt, FaBuilding, FaCheckCircle, FaChartLine } from "react-icons/fa";

const StaticDashboardPreview = () => {
  return (
    <section className="py-24 bg-base-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-base-content">
            Your job search, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">beautifully organized.</span>
          </h2>
          <p className="text-lg text-base-content/70">
            Ditch the messy spreadsheets. Drag, drop, and track every application from wishlist to offer in one seamless, automated dashboard.
          </p>
        </div>

        {/* Browser Mockup Window */}
        <div className="mockup-browser border border-base-300 bg-base-200/50 shadow-2xl backdrop-blur-sm rounded-[2rem]">
          <div className="mockup-browser-toolbar">
            <div className="input border border-base-300">app.careerflow.com/dashboard</div>
          </div>
          
          {/* Static Dashboard Content */}
          <div className="p-6 md:p-8 bg-base-100 flex flex-col gap-8 rounded-b-[2rem]">
            
            {/* Fake Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold text-base-content tracking-tight mb-2">
                  Welcome back, <span className="text-primary">Alex</span> 👋
                </h3>
                <p className="text-base-content/70">
                  Managing search: <strong className="text-base-content">Full Stack Roles 2024</strong>
                </p>
              </div>
              <button className="btn btn-primary shadow-lg shadow-primary/20 gap-2 pointer-events-none">
                <FaPlus size={14} /> Add New Job
              </button>
            </div>

            {/* Fake Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Total Applications" value="42" trend="+3 this week" color="text-info" bg="bg-info/10" />
              <StatCard title="Interviewing" value="5" trend="2 upcoming" color="text-warning" bg="bg-warning/10" />
              <StatCard title="Offers Received" value="1" trend="Negotiating" color="text-success" bg="bg-success/10" />
              <StatCard title="Success Rate" value="12%" trend="Top 10%" color="text-primary" bg="bg-primary/10" />
            </div>

            {/* Fake Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x">
              
              {/* Column 1: Applied */}
              <div className="min-w-[320px] w-[320px] flex-shrink-0 bg-base-200/50 rounded-3xl p-4 border border-base-300 snap-center">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="font-bold text-base-content/80 uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-info"></span> Applied
                  </h4>
                  <span className="badge badge-sm badge-ghost font-bold">2</span>
                </div>
                <div className="space-y-3">
                  <KanbanCard company="Stripe" role="Frontend Engineer" date="Applied 2d ago" salary="$140k - $160k" logo="S" logoColor="bg-indigo-500" />
                  <KanbanCard company="Spotify" role="React Developer" date="Applied 5d ago" salary="$130k - $150k" logo="Sp" logoColor="bg-green-500" />
                </div>
              </div>

              {/* Column 2: Interviewing */}
              <div className="min-w-[320px] w-[320px] flex-shrink-0 bg-base-200/50 rounded-3xl p-4 border border-base-300 snap-center">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="font-bold text-base-content/80 uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning"></span> Interviewing
                  </h4>
                  <span className="badge badge-sm badge-ghost font-bold">2</span>
                </div>
                <div className="space-y-3">
                  <KanbanCard company="Google" role="UI Engineer" date="Tech Screen tomorrow" salary="$160k - $190k" logo="G" logoColor="bg-red-500" isActive={true} />
                  <KanbanCard company="Discord" role="Full Stack Eng" date="Behavioral next week" salary="$150k+" logo="D" logoColor="bg-blue-500" />
                </div>
              </div>

              {/* Column 3: Offer */}
              <div className="min-w-[320px] w-[320px] flex-shrink-0 bg-base-200/50 rounded-3xl p-4 border border-base-300 snap-center">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="font-bold text-base-content/80 uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success"></span> Offer
                  </h4>
                  <span className="badge badge-sm badge-ghost font-bold">1</span>
                </div>
                <div className="space-y-3">
                  <KanbanCard company="Vercel" role="Software Engineer" date="Offer expires in 3 days" salary="$175k Base" logo="V" logoColor="bg-base-content text-base-100" />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

// Mini Component for the Stat Cards
const StatCard = ({ title, value, trend, color, bg }) => (
  <div className="bg-base-200 rounded-2xl p-5 border border-base-300 max-sm:flex max-sm:flex-col max-sm:items-start max-sm:gap-3">
    <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-2">{title}</p>
    <div className="flex items-end justify-between">
      <h4 className="text-3xl font-black text-base-content">{value}</h4>
      {/* <span className={`text-xs font-bold ${color} bg-base-100 px-2 py-1 rounded-md shadow-sm`}>{trend}</span> */}
    </div>
  </div>
);

// Mini Component for the Kanban Cards
const KanbanCard = ({ company, role, date, salary, logo, logoColor, isActive }) => (
  <div className={`bg-base-100 rounded-2xl p-4 border ${isActive ? 'border-primary shadow-md shadow-primary/10 scale-[1.02] transition-transform' : 'border-base-300 shadow-sm'} hover:border-primary/50 transition-colors cursor-default`}>
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner ${logoColor}`}>
          {logo}
        </div>
        <div>
          <h5 className="font-bold text-base-content leading-tight">{company}</h5>
          <p className="text-xs text-base-content/60 font-medium">{role}</p>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-base-200">
      <div className="flex items-center gap-1 text-xs text-base-content/50 font-medium">
        <FaCalendarAlt /> {date}
      </div>
      <div className="badge badge-sm badge-outline font-semibold opacity-70">{salary}</div>
    </div>
  </div>
);

export default StaticDashboardPreview;