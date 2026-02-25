import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import {motion} from 'framer-motion'
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function HeroSection() {
  const slides = [
    {
      url: "https://i.ibb.co.com/GvqJzV19/hero-1.avif",
      alt: "Laptop and coffee",
    },
    {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
      alt: "Analytics Dashboard",
    },
    {
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
      alt: "Students working together",
    },
    {
      url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
      alt: "Modern workspace",
    },
  ];

  return (
    // section bg uses base-200 to differentiate from navbar in dark mode
    <section className="relative overflow-hidden bg-base-100 transition-colors duration-300 pt-10">
      {/* Ambient Blur 1 - Top Left */}
          <motion.div 
            animate={{ x: [0, 30, -50, 0], y: [0, -20, 40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[100px] pointer-events-none z-0"
          />

          {/* Ambient Blur 2 - Bottom Right */}
          <motion.div 
            animate={{ x: [0, -40, 30, 0], y: [0, 50, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[120px] pointer-events-none z-0"
          />

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          
          {/* LEFT CONTENT */}
          <div>
            {/* Badge - Uses secondary/primary mix from theme */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              ✨ Free for students & new grads 🎓
            </div>

            {/* Heading - Uses primary and base-content */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-primary">Land Your Dream</span>
              <br />
              <span className="text-base-content  ">Tech Job Faster</span>
            </h1>

            {/* Description - Uses content color with opacity */}
            <p className="mt-6 text-base-content/70 text-lg leading-relaxed max-w-xl">
              Stop juggling spreadsheets and sticky notes. Track every
              application, interview, and coding challenge in one slick
              dashboard built by students, for students. 🚀
            </p>

            {/* Buttons - Modular theme classes */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="btn btn-primary px-8 h-14 rounded-box text-lg">
                Start Tracking for Free →
              </button>

              <button className="btn btn-outline px-8 h-14 rounded-box text-lg">
                Watch Demo
              </button>
            </div>

            {/* Bottom Info - Muted content text */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-base-content/50">
              <span>✨ No credit card</span>
              <span>⚡ Setup in 2 minutes</span>
              <span>🎯 100% free for students</span>
            </div>
          </div>

          {/* RIGHT IMAGE SLIDER */}
          <div className="relative">
            {/* Wrapper uses primary/secondary variables for decorative border */}
            <div className="rounded-[2.5rem] p-2 bg-gradient-to-br from-primary/30 to-secondary/30 shadow-2xl">
              <Swiper
                spaceBetween={30}
                effect={"fade"}
                centeredSlides={true}
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                modules={[Autoplay, Pagination, EffectFade]}
                className="rounded-[2rem] overflow-hidden"
              >
                {slides.map((slide, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={slide.url}
                      alt={slide.alt}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Decorative elements - Uses primary/secondary for theme-safe glow */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Pagination, EffectFade } from "swiper/modules";

// // Import Swiper styles
// import "swiper/css";
// import "swiper/css/pagination";
// import "swiper/css/effect-fade";

// export default function HeroSection() {
//   const slides = [
//     {
//       url: "https://i.ibb.co.com/GvqJzV19/hero-1.avif",
//       alt: "Laptop and coffee",
//     },
//     {
//       url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
//       alt: "Analytics Dashboard",
//     },
//     {
//       url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
//       alt: "Students working together",
//     },
//     {
//       url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
//       alt: "Modern workspace",
//     },
//   ];

//   return (
//     <section className="relative overflow-hidden bg-gradient-to-r from-purple-100 via-blue-50 to-purple-200">
//       <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
//         <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
//           {/* LEFT CONTENT */}
//           <div>
//             {/* Badge */}
//             <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-purple-100 text-purple-700 text-sm font-medium border border-purple-200">
//               ✨ Free for students & new grads 🎓
//             </div>

//             {/* Heading */}
//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
//               <span className="text-purple-600">Land Your Dream</span>
//               <br />
//               <span className="text-gray-900">Tech Job Faster</span>
//             </h1>

//             {/* Description */}
//             <p className="mt-6 text-gray-600 text-lg leading-relaxed max-w-xl">
//               Stop juggling spreadsheets and sticky notes. Track every
//               application, interview, and coding challenge in one slick
//               dashboard built by students, for students. 🚀
//             </p>

//             {/* Buttons */}
//             <div className="mt-8 flex flex-col sm:flex-row gap-4">
              
//               <button className="btn btn-primary rounded-xl px-6 py-6 font-medium shadow-lg ">
//                 Start Tracking for Free →
//               </button>

//               <button className="px-6 py-3 rounded-xl border-2 border-purple-600 text-purple-600 font-medium hover:bg-purple-50 transition">
//                 Watch Demo
//               </button>
//               <button className="btn btn-outline rounded-xl px-6 py-6 font-medium shadow-lg ">
//                 Watch Demo
//               </button>
//             </div>

//             {/* Bottom Info */}
//             <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-500">
//               <span>✨ No credit card</span>
//               <span>⚡ Setup in 2 minutes</span>
//               <span>🎯 100% free for students</span>
//             </div>
//           </div>

//           {/* RIGHT IMAGE SLIDER */}
//           <div className="relative">
//             <div className="rounded-3xl p-2 bg-gradient-to-br from-purple-400/40 to-blue-400/40 shadow-2xl">
//               <Swiper
//                 spaceBetween={30}
//                 effect={"fade"}
//                 centeredSlides={true}
//                 autoplay={{
//                   delay: 3500,
//                   disableOnInteraction: false,
//                 }}
//                 pagination={{
//                   clickable: true,
//                   dynamicBullets: true,
//                 }}
//                 modules={[Autoplay, Pagination, EffectFade]}
//                 className="rounded-2xl overflow-hidden"
//               >
//                 {slides.map((slide, index) => (
//                   <SwiperSlide key={index}>
//                     <img
//                       src={slide.url}
//                       alt={slide.alt}
//                       className="w-full aspect-[4/3] object-cover rounded-2xl"
//                     />
//                   </SwiperSlide>
//                 ))}
//               </Swiper>
//             </div>

//             {/* Decorative elements */}
//             <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
//             <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
