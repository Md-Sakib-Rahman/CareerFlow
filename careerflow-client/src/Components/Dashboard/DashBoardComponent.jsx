import { Briefcase, Send, Users, BadgeCheck, XCircle } from "lucide-react";

export default function Dashboard() {
  return (
    <section className="bg-base-200/30 py-24">
      <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-center text-3xl font-bold">Dashboard</h1>
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, <span>👋</span>
            </h1>
            <p className="text-base-content/60">
              Managing search: <span className="font-semibold">My Job Search</span>
            </p>
          </div>

          <button className="btn btn-primary rounded-box">
            + Add New Job
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card */}
          <div className="bg-base-100 p-6 rounded-box shadow border border-base-300/50 flex justify-between items-center">
            <div>
              <p className="text-sm text-base-content/60">Saved Jobs</p>
              <h2 className="text-3xl font-bold">0</h2>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Briefcase size={22} />
            </div>
          </div>

          {/* Card */}
          <div className="bg-base-100 p-6 rounded-box shadow border border-base-300/50 flex justify-between items-center">
            <div>
              <p className="text-sm text-base-content/60">Applications</p>
              <h2 className="text-3xl font-bold">0</h2>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <Send size={22} />
            </div>
          </div>

          {/* Card */}
          <div className="bg-base-100 p-6 rounded-box shadow border border-base-300/50 flex justify-between items-center">
            <div>
              <p className="text-sm text-base-content/60">Interviews</p>
              <h2 className="text-3xl font-bold">0</h2>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Users size={22} />
            </div>
          </div>

          {/* Card */}
          <div className="bg-base-100 p-6 rounded-box shadow border border-base-300/50 flex justify-between items-center">
            <div>
              <p className="text-sm text-base-content/60">Offers</p>
              <h2 className="text-3xl font-bold">0</h2>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-success/10 text-success">
              <BadgeCheck size={22} />
            </div>
          </div>

          {/* Card */}
          <div className="bg-base-100 p-6 rounded-box shadow border border-base-300/50 flex justify-between items-center">
            <div>
              <p className="text-sm text-base-content/60">Rejections</p>
              <h2 className="text-3xl font-bold">0</h2>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-error/10 text-error">
              <XCircle size={22} />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}