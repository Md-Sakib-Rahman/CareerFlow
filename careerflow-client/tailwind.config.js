/** @type {import('tailwindcss').Config} */
module.exports = {
  experimental: {
    colorFormat: "rgb", // <-- এইটা যোগ করুন
  },
  theme: {
    extend: {},
    colors: require("tailwindcss/colors"),
  },
};
