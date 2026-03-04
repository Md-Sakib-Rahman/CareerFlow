import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReminders, dismissReminderAction } from "../../Redux/reminder/reminderSlice";
import { Bell, Check, CalendarClock, Crown } from "lucide-react"; // ⚠️ Added Crown
import { useNavigate } from "react-router"; // ⚠️ Added for upgrade routing

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // 1. ⚠️ Pull user state to check the plan
  const { user } = useSelector((state) => state.auth);
  const { notifications, loading } = useSelector((state) => state.reminder);
  const hasPremiumAccess = user?.plan === "pro" || user?.plan === "executive";
  const isStarter = user?.plan?.toLowerCase() === "starter";

  // 2. ⚠️ PREVENT API CALLS FOR STARTER USERS
  useEffect(() => {
    if (hasPremiumAccess) {
      dispatch(fetchReminders());
    }
  }, [dispatch, hasPremiumAccess]);

  const handleDismiss = (e, id) => {
    e.stopPropagation(); 
    dispatch(dismissReminderAction(id));
  };

  const unreadCount = notifications?.length || 0;

  return (
    <div className="dropdown dropdown-end">
      {/* Trigger: The Bell Icon */}
      <label tabIndex={0} className="btn btn-ghost btn-circle relative">
        <Bell size={20} className="text-base-content/80" />
        
        {/* ⚠️ Only show the red pulse badge if they have access AND have unread notifications */}
        {!isStarter && unreadCount > 0 && (
          <span className="badge badge-sm badge-primary absolute top-1 right-1 px-1.5 animate-pulse border-base-100">
            {unreadCount}
          </span>
        )}
      </label>

      {/* Dropdown Content */}
      <div
        tabIndex={0}
        className="dropdown-content z-50 menu p-4 shadow-2xl bg-base-100 border border-base-300 rounded-2xl w-80 md:w-96 mt-4"
      >
        <div className="flex justify-between items-center mb-4 border-b border-base-200 pb-2">
          <h3 className="font-bold text-lg text-base-content">Reminders</h3>
          {!isStarter && (
            <span className="text-xs text-base-content/50 font-medium bg-base-200 px-2 py-1 rounded-full">
              {unreadCount} pending
            </span>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {/* ==========================================
              ⚠️ STATE 1: PAYWALL (Starter Users)
              ========================================== */}
          {isStarter ? (
            <div className="text-center py-8 text-base-content flex flex-col items-center gap-3">
              <div className="p-4 bg-secondary/10 rounded-full text-secondary mb-2">
                <Crown size={32} />
              </div>
              <h4 className="font-bold text-lg">Pro Feature</h4>
              <p className="text-sm opacity-70 px-4 mb-4">
                Upgrade to unlock smart reminders and never miss an interview or deadline again.
              </p>
              <button 
                onClick={() => navigate('/upgrade')}
                className="btn btn-secondary btn-sm rounded-xl shadow-lg shadow-secondary/20 text-white w-full"
              >
                Upgrade Now
              </button>
            </div>
          ) : 
          
          /* STATE 2: Loading */
          loading && unreadCount === 0 ? (
            <div className="text-center py-6 text-base-content/50 text-sm">
              <span className="loading loading-spinner loading-md mb-2 text-primary"></span>
              <p>Checking pipeline...</p>
            </div>
          ) : 
          
          /* STATE 3: Empty */
          unreadCount === 0 ? (
            <div className="text-center py-8 text-base-content/50 text-sm flex flex-col items-center gap-3">
              <div className="p-4 bg-base-200 rounded-full">
                <CalendarClock size={28} className="opacity-50" />
              </div>
              <p className="font-medium">You're all caught up!</p>
            </div>
          ) : 
          
          /* STATE 4: Populated List */
          (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className="flex gap-3 p-3 bg-base-200/40 hover:bg-base-200 rounded-xl transition-colors border border-base-300/50 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-base-content truncate">
                    {notif.title || "Job Reminder"}
                  </p>
                  <p className="text-xs text-base-content/70 mt-1 line-clamp-2 leading-relaxed">
                    {notif.description || "Follow up on this application."}
                  </p>
                  
                  {notif.jobId?.company && (
                    <p className="text-[10px] font-bold text-primary mt-2 uppercase tracking-wider">
                      {notif.jobId.company}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={(e) => handleDismiss(e, notif._id)}
                  className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-success hover:bg-success/20 self-center opacity-0 group-hover:opacity-100 transition-all"
                  title="Mark as Done"
                >
                  <Check size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchReminders, dismissReminderAction } from "../../Redux/reminder/reminderSlice";
// import { Bell, Check, CalendarClock } from "lucide-react";

// const NotificationBell = () => {
//   const dispatch = useDispatch();
//   const { notifications, loading } = useSelector((state) => state.reminder);

//   // 1. Fetch reminders when the bell component mounts
//   useEffect(() => {
//     dispatch(fetchReminders());
//   }, [dispatch]);

//   // 2. Handle Dismissal 
//   const handleDismiss = (e, id) => {
//     // stopPropagation prevents the DaisyUI dropdown from closing when clicking the button
//     e.stopPropagation(); 
//     dispatch(dismissReminderAction(id));
//   };

//   // 3. Defensive counting
//   const unreadCount = notifications?.length || 0;

//   return (
//     <div className="dropdown dropdown-end">
//       {/* Trigger: The Bell Icon */}
//       <label tabIndex={0} className="btn btn-ghost btn-circle relative">
//         <Bell size={20} className="text-base-content/80" />
        
//         {/* Only show the red pulse badge if there are unread notifications */}
//         {unreadCount > 0 && (
//           <span className="badge badge-sm badge-primary absolute top-1 right-1 px-1.5 animate-pulse border-base-100">
//             {unreadCount}
//           </span>
//         )}
//       </label>

//       {/* Dropdown Content */}
//       <div
//         tabIndex={0}
//         className="dropdown-content z- menu p-4 shadow-2xl bg-base-100 border border-base-300 rounded-2xl w-80 md:w-96 mt-4"
//       >
//         <div className="flex justify-between items-center mb-4 border-b border-base-200 pb-2">
//           <h3 className="font-bold text-lg text-base-content">Reminders</h3>
//           <span className="text-xs text-base-content/50 font-medium bg-base-200 px-2 py-1 rounded-full">
//             {unreadCount} pending
//           </span>
//         </div>

//         <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2 pr-1">
//           {/* State 1: Loading */}
//           {loading && unreadCount === 0 ? (
//             <div className="text-center py-6 text-base-content/50 text-sm">
//               <span className="loading loading-spinner loading-md mb-2 text-primary"></span>
//               <p>Checking pipeline...</p>
//             </div>
//           ) : unreadCount === 0 ? (
//             /* State 2: Empty */
//             <div className="text-center py-8 text-base-content/50 text-sm flex flex-col items-center gap-3">
//               <div className="p-4 bg-base-200 rounded-full">
//                 <CalendarClock size={28} className="opacity-50" />
//               </div>
//               <p className="font-medium">You're all caught up!</p>
//             </div>
//           ) : (
//             /* State 3: Populated List */
//             notifications.map((notif) => (
//               <div
//                 key={notif._id}
//                 className="flex gap-3 p-3 bg-base-200/40 hover:bg-base-200 rounded-xl transition-colors border border-base-300/50 group"
//               >
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-bold text-base-content truncate">
//                     {notif.title || "Job Reminder"}
//                   </p>
//                   <p className="text-xs text-base-content/70 mt-1 line-clamp-2 leading-relaxed">
//                     {notif.description || "Follow up on this application."}
//                   </p>
                  
//                   {/* Gracefully handle populated Job data if it exists */}
//                   {notif.jobId?.company && (
//                     <p className="text-[10px] font-bold text-primary mt-2 uppercase tracking-wider">
//                       {notif.jobId.company}
//                     </p>
//                   )}
//                 </div>
                
//                 {/* Dismiss Button - appears on hover */}
//                 <button
//                   onClick={(e) => handleDismiss(e, notif._id)}
//                   className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-success hover:bg-success/20 self-center opacity-0 group-hover:opacity-100 transition-all"
//                   title="Mark as Done"
//                 >
//                   <Check size={16} />
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotificationBell;