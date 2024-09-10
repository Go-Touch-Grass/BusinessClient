import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        //edit this object upon confirmation of colour scheme
        //add in corresponding hex codes
        //eg. text-primary: "#4B4B4B"
      },
    },
  },
  plugins: [],
};
export default config;
