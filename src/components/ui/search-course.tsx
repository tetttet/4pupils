"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export const SearchCourse = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || searchQuery.length > 0;

  return (
    <div className="relative flex h-14 items-center rounded-[18px] border border-[#D7DDF8] bg-white px-4 transition duration-300 hover:border-[#B8C2EF] focus-within:border-[#B8C2EF]">
      <motion.label
        animate={
          isFloating
            ? { y: -27, x: -3, scale: 0.75, color: "#68719B" }
            : { y: 0, x: 0, scale: 1, color: "#7A82A8" }
        }
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        style={{
          position: "absolute",
          left: "1rem",
          top: "50%",
          translateY: "-50%",
          fontSize: "15px",
          pointerEvents: "none",
          transformOrigin: "left center",
          whiteSpace: "nowrap",
          backgroundColor: isFloating ? "#ffffff" : "transparent",
          paddingLeft: "2px",
          paddingRight: "4px",
        }}
      >
        Навык или курс
      </motion.label>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="h-full w-full bg-transparent text-[15px] text-[#202858] outline-none"
      />

      <motion.div
        animate={{ opacity: isFloating ? 1 : 0.5, scale: isFloating ? 1 : 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Search className="h-4.75 w-4.75 text-[#5D75CB]" strokeWidth={2.2} />
      </motion.div>
    </div>
  );
};
