import React, { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { 
  LayoutDashboard, 
  Briefcase, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { motion } from "framer-motion"; 
import { logout, fetchMe } from "../../Redux/auth/authSlice";
import ThemeController from "../../Components/Shared/ThemeController/ThemeController";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchMe());
    }
  }, [accessToken, user, dispatch]);  

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={22} /> },
    { name: "Applications", path: "/applications", icon: <Briefcase size={22} /> },
    { name: "Profile", path: "/profile", icon: <User size={22} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={22} /> },
  ];

  return (
    <div className="flex h-screen bg-base-100 overflow-hidden font-sans text-base-content selection:bg-primary selection:text-white">
      
      {/* ========================================== */}
      {/* 1. SIDEBAR (Desktop & Mobile) */}
      {/* ========================================== */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-base-100/90 backdrop-blur-xl border-r border-base-300 shadow-xl flex flex-col transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
        md:relative md:translate-x-0 ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* Sidebar Header / Logo */}
        <div className={`h-16 flex items-center px-4 border-b border-base-300 transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <Link to="/" className="flex items-center gap-3 cursor-pointer group truncate">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content font-bold shadow-md group-hover:scale-105 transition-transform">
              🎁
            </div>
            <span className={`text-xl font-bold tracking-tight transition-opacity duration-200 ${isCollapsed ? "md:hidden opacity-0 w-0" : "opacity-100 w-auto"}`}>
              Career<span className="text-primary">Flow</span>
            </span>
          </Link>
          
          <button 
            className="md:hidden p-1 text-base-content/50 hover:text-primary transition-colors rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navLinks.map((link) => {
            const tooltipClass = isCollapsed ? "md:tooltip md:tooltip-right md:tooltip-primary" : "";

            return (
              <div key={link.name} className={`${tooltipClass} w-full`} data-tip={link.name}>
                <NavLink
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden
                    ${isCollapsed ? "md:justify-center" : "justify-start"}
                    ${isActive 
                      ? "text-primary bg-primary/10 font-bold shadow-sm border border-primary/20" 
                      : "text-base-content/60 hover:bg-base-200 hover:text-base-content border border-transparent"
                    }
                  `}
                >
                  {/* Active Indicator Bar (Only visible when active & not collapsed) */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full transition-transform duration-300 ${isCollapsed ? "hidden" : "block"} scale-y-0 group-[.active]:scale-y-100`}></div>
                  
                  <span className={`${isCollapsed ? "" : "group-hover:scale-110"} transition-transform duration-200 z-10`}>
                    {link.icon}
                  </span>
                  <span className={`whitespace-nowrap transition-all duration-200 z-10 ${isCollapsed ? "md:hidden opacity-0 w-0" : "opacity-100 w-auto"}`}>
                    {link.name}
                  </span>
                </NavLink>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="relative p-4 border-t border-base-300">
            <motion.div 
            animate={{ x: [0, 30, -50, 0], y: [0, -20, 40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"
          />

          {/* Ambient Blur 2 - Bottom Right */}
          <motion.div 
            animate={{ x: [0, -40, 30, 0], y: [0, 50, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none z-0"
          />
          <div className={isCollapsed ? "md:tooltip md:tooltip-right md:tooltip-error w-full" : "w-full"} data-tip="Logout">
            <button 
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-3 w-full text-error/80 rounded-xl hover:bg-error/10 hover:text-error transition-all font-medium border border-transparent hover:border-error/20
              ${isCollapsed ? "md:justify-center" : "justify-start"}`}
            >
              <LogOut size={22} className={`${isCollapsed ? "" : "hover:scale-110"} transition-transform duration-200`} />
              <span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? "md:hidden opacity-0 w-0" : "opacity-100 w-auto"}`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay Background */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-base-300/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* ========================================== */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-base-200/40">
        
        {/* Top Header */}
        <header className="h-16 bg-base-100/60 backdrop-blur-xl border-b border-base-300 flex items-center px-4 md:px-6 shrink-0 z-30 shadow-sm relative">
          
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-base-content/70 hover:text-primary transition-colors bg-base-200 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>

            <button 
              className="hidden md:flex p-2 text-base-content/70 hover:text-primary transition-colors hover:bg-base-200 rounded-lg"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-5 ml-auto">
            <ThemeController />
            
            <button className="btn btn-ghost btn-circle btn-sm md:btn-md hover:bg-base-200 transition-colors">
              <div className="indicator">
                <Bell size={20} className="text-base-content/70" />
                <span className="badge badge-xs badge-primary indicator-item ring-2 ring-base-100 animate-pulse"></span>
              </div>
            </button>

            <div className="w-px h-8 bg-base-300 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity bg-base-200/50 p-1 pr-3 rounded-full border border-base-300">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full">
                  <img src={user?.imageUrl || "https://via.placeholder.com/150"} alt="User" className="object-cover" />
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-base-content leading-none mb-0.5">{user?.name?.split(' ')[0]}</p>
                <p className="text-[9px] font-bold tracking-widest uppercase text-primary">{user?.plan}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================== */}
        {/* Main Scrollable Content with Ambient Blurs */}
        {/* ========================================== */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          
          
          {/* Actual View Content Container */}
          <div className="relative z-10 w-full h-full  ">
            <Outlet /> 
          </div>
          
        </main>
        
      </div>
    </div>
  );
};

export default DashboardLayout;
