import { useState , useEffect} from "react";
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router"; 
import { useSelector, useDispatch } from "react-redux";
import { logout, fetchMe } from "../../../Redux/auth/authSlice"; 
import ThemeController from "../ThemeController/ThemeController";
import CFlogo from "../../../assets/CFLogo.png";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Grab authentication state from Redux
  const { user, accessToken } = useSelector((state) => state.auth);
  const isAuthenticated = !!accessToken;

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
    navigate("/login");
  };

  const menuVariants = {
    closed: { opacity: 0, y: -20, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
    open: { opacity: 1, y: 0, transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
  };
  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchMe());
    }
  }, [accessToken, user, dispatch]);
  const itemVariants = {
    closed: { opacity: 0, x: -10 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <nav className="w-full bg-base-100/80 shadow-sm fixed top-0 left-0 z-50 backdrop-blur-xl border-b border-base-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 flex items-center justify-center rounded-box  text-primary-content font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              <img src={CFlogo} alt="CareerFlow Logo" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">
              CareerFlow
            </span>
          </Link>

          <div className="flex items-center gap-8">
            {/* Desktop Menu Links */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { title: "Home", link: "/" },
                { title: "FAQ", link: "/faq" },
                { title: "Our Story", link: "/our-story" },
                { title: "Why Us?", link: "/whyus" },
              ].map((item) => (
                <NavLink
                  key={item.title}
                  to={item.link}
                  className={({ isActive }) => `
                    font-medium transition-colors relative py-2 text-sm
                    ${isActive ? "text-primary" : "text-base-content/80 hover:text-primary"}
                    after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300
                    ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}
                  `}
                >
                  {item.title}
                </NavLink>
              ))}

              {/* DYNAMIC: Show Dashboard link only if logged in */}
              {isAuthenticated && (
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `
                    font-bold transition-colors flex items-center gap-2 text-sm
                    ${isActive ? "text-primary" : "text-secondary hover:text-primary"}
                  `}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </NavLink>
              )}
            </div>
            
            <div className="divider divider-horizontal mx-0 hidden md:flex h-8 self-center"></div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeController />
              
              {!isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="btn btn-ghost btn-sm font-bold text-base-content/70">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm px-6 shadow-lg rounded-xl font-bold">
                    Sign Up Free
                  </Link>
                </div>
              ) : (
                /* Logged In User Dropdown */
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100">
                    <div className="w-10 rounded-full">
                      <img 
                        alt="User Avatar" 
                        src={user?.imageUrl || "https://via.placeholder.com/150"} 
                      />
                    </div>
                  </div>
                  <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 rounded-2xl w-56 border border-base-300">
                    <li className="px-4 py-3">
                      <p className="font-bold text-base-content leading-none">{user?.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-primary font-bold mt-1">{user?.plan} Plan</p>
                    </li>
                    <div className="divider my-0 opacity-50"></div>
                    <li>
                      <Link to="/profile" className="flex items-center gap-3 py-3 font-medium">
                        <User size={18} className="text-primary" /> Profile Settings
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="flex items-center gap-3 py-3 text-error font-medium">
                        <LogOut size={18} /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeController />
              <button
                className="btn btn-ghost btn-sm btn-circle text-base-content"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="absolute top-full left-0 w-full bg-base-100 shadow-2xl border-t border-base-300 md:hidden overflow-hidden"
          >
            <div className="flex flex-col px-6 py-8 space-y-8">
              <motion.div variants={itemVariants} className="flex flex-col space-y-5">
                {isAuthenticated && (
                  <Link 
                    to="/profile" 
                    onClick={() => setIsOpen(false)}
                    className="text-xl font-bold text-primary flex items-center gap-2"
                  >
                    <LayoutDashboard size={20} /> Dashboard
                  </Link>
                )}
                 
                <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-semibold text-base-content/70">Home</Link>
                <Link to="/our-story" onClick={() => setIsOpen(false)} className="text-lg font-semibold text-base-content/70">Our Story</Link>
                <Link to="/faq" onClick={() => setIsOpen(false)} className="text-lg font-semibold text-base-content/70">FAQ</Link>
                <Link to="/whyus" onClick={() => setIsOpen(false)} className="text-lg font-semibold text-base-content/70">Why Us?</Link>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-6 border-t border-base-300 space-y-4">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-outline border-base-300 w-full rounded-2xl font-bold">Login</Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn-primary w-full rounded-2xl shadow-lg font-bold">Sign Up Free</Link>
                  </>
                ) : (
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 p-3 bg-base-200 rounded-2xl mb-4">
                        <div className="avatar">
                           <div className="w-10 rounded-full">
                              <img src={user?.imageUrl || "https://via.placeholder.com/150"} alt="User" referrerPolicy="no-referrer"/>
                           </div>
                        </div>
                        <div>
                           <p className="font-bold text-sm leading-none">{user?.name}</p>
                           <p className="text-[10px] uppercase font-bold text-primary mt-1">{user?.plan} Plan</p>
                        </div>
                     </div>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="btn btn-ghost bg-base-200 w-full rounded-2xl flex items-center justify-center gap-2 font-bold">
                      <User size={18} /> My Profile
                    </Link>
                    <button onClick={handleLogout} className="btn btn-error btn-outline w-full rounded-2xl flex items-center justify-center gap-2 font-bold">
                      <LogOut size={18} /> Logout
                    </button>
                  </div >
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}