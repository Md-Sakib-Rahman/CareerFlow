import React from "react";
import { Briefcase, Send, Users, Award } from "lucide-react";

const StatCards = ({ jobs }) => {
  // Calculate analytics directly from the Redux state
  const stats = {
    total: jobs?.length || 0,
    applied: jobs?.filter(job => job.isApplied).length || 0,
    interviewing: jobs?.filter(job => job.isInterviewing).length || 0,
    offers: jobs?.filter(job => job.isOffered).length || 0,
  };

  const cards = [
    { title: "Saved Jobs", value: stats.total, icon: <Briefcase size={24} />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Applications Sent", value: stats.applied, icon: <Send size={24} />, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Active Interviews", value: stats.interviewing, icon: <Users size={24} />, color: "text-warning", bg: "bg-warning/10" },
    { title: "Offers Received", value: stats.offers, icon: <Award size={24} />, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="card bg-base-100/60 backdrop-blur-xl border border-base-300 shadow-sm hover:shadow-md transition-all">
          <div className="card-body p-5 flex flex-row items-center justify-between">
            <div>
              <p className="text-base-content/60 text-sm font-medium mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold text-base-content">{card.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;