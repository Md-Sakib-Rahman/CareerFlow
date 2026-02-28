import React from "react";
import { useSelector } from "react-redux";
import { Briefcase, Send, Users, Award, XCircle } from "lucide-react";

const StatCards = () => {
  const { jobs } = useSelector((state) => state.board);

  const stats = {
    total: jobs?.length || 0,
    applied: jobs?.filter(job => job.isApplied).length || 0,
    interviewing: jobs?.filter(job => job.status === "interviewing").length || 0,
    offers: jobs?.filter(job => job.status === "offer").length || 0,
    // Historical: Total rejections faced
    rejected: jobs?.filter(job => job.isRejected).length || 0,
  };

  const cards = [
    { title: "Saved Jobs", value: stats.total, icon: <Briefcase size={22} />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Applications", value: stats.applied, icon: <Send size={22} />, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Interviews", value: stats.interviewing, icon: <Users size={22} />, color: "text-warning", bg: "bg-warning/10" },
    { title: "Offers", value: stats.offers, icon: <Award size={22} />, color: "text-success", bg: "bg-success/10" },
    { title: "Rejections", value: stats.rejected, icon: <XCircle size={22} />, color: "text-error", bg: "bg-error/10" },
  ];

  return (
    // Updated to lg:grid-cols-5 to accommodate the new card
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-4 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="card bg-base-100/60 backdrop-blur-xl border border-base-300 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="card-body p-4 flex flex-row items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-base-content/60 text-[10px] font-bold uppercase tracking-wider mb-1 truncate">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-base-content tracking-tight">
                {card.value}
              </h3>
            </div>
            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${card.bg} ${card.color} shadow-inner`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;