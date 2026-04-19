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
    <div className="relative flex items-center rounded-sm border border-[#d0d0d0] bg-transparent px-4 py-3.5 focus-within:border-[#cdcdcd]">
      <motion.label
        animate={
          isFloating
            ? { y: -26, x: -4, scale: 0.75, color: "#b0b0b0" }
            : { y: 0, x: 0, scale: 1, color: "#9d9d9d" }
        }
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        style={{
          position: "absolute",
          left: "1rem",
          top: "50%",
          translateY: "-50%",
          fontSize: "16px",
          pointerEvents: "none",
          transformOrigin: "left center",
          whiteSpace: "nowrap",
          backgroundColor: "#ffffff",
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
        className="h-full w-full bg-transparent text-[18px] text-[#2f2f2f] outline-none"
      />

      <motion.div
        animate={{ opacity: isFloating ? 1 : 0.5, scale: isFloating ? 1 : 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Search className="h-4.75 w-4.75 text-[#8d8d8d]" strokeWidth={2.2} />
      </motion.div>
    </div>
  );
};