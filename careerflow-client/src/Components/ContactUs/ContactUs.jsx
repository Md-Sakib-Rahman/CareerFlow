import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Navbar from "../../Components/Shared/Navbar/Navbar";
import Footer from "../../Components/Shared/Footer/Footer";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-base-100 py-20">

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        
        {/* background blur effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6"
          >
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">CareerFlow</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-base-content/60"
          >
            Have questions or feedback? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>

            <div className="flex items-center gap-4">
              <Mail className="text-primary" />
              <span className="text-base-content/70">support@careerflow.com</span>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="text-secondary" />
              <span className="text-base-content/70">+880 1234 567890</span>
            </div>

            <div className="flex items-center gap-4">
              <MapPin className="text-accent" />
              <span className="text-base-content/70">Dhaka, Bangladesh</span>
            </div>

            <p className="text-base-content/60 pt-4">
              Our support team usually replies within 24 hours. For urgent issues,
              please email us directly.
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-base-200/50 backdrop-blur-md border border-base-300 p-8 rounded-2xl space-y-5"
          >
            <h2 className="text-2xl font-bold mb-2">Send Message</h2>

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              onChange={handleChange}
              value={formData.name}
              className="w-full px-4 py-3 rounded-xl bg-base-100 border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              onChange={handleChange}
              value={formData.email}
              className="w-full px-4 py-3 rounded-xl bg-base-100 border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />

            <textarea
              name="message"
              rows="5"
              placeholder="Your Message"
              onChange={handleChange}
              value={formData.message}
              className="w-full px-4 py-3 rounded-xl bg-base-100 border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition"
            >
              <Send size={18} />
              Send Message
            </button>
          </motion.form>

        </div>
      </section>

    </div>
  );
};

export default ContactUs;