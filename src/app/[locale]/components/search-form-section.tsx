"use client";

import React from "react";
import { THEME } from "@/shared/constants/theme";
import { useCategories } from "@/features/services/hooks/use-categories";

export default function SearchFormSection() {
  const [location, setLocation] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [category, setCategory] = React.useState("");
  
  const { categories, isLoading } = useCategories();

  const handleSubmit = () => {
    console.log("Search submitted", { location, startTime, category });
  };

  return (
    <div className="flex flex-col items-center self-stretch mb-4 sm:mb-5 md:mb-6 px-4 sm:px-6 md:px-8 lg:px-0">
      <div 
        className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white py-4 sm:py-5 md:py-[11px] w-full sm:w-auto rounded-[2rem] shadow-md border border-solid border-gray-200 gap-3 sm:gap-0"
      >
        {/* Location Field */}
        <div className="flex flex-col items-start w-full sm:w-[140px] md:w-[151px] sm:ml-[16px] md:ml-[20px] lg:ml-[31px] gap-2 sm:gap-[9px] px-3 sm:px-2 md:px-0">
          <span className="text-xs font-bold" style={{ color: THEME.colors.text.darkBlue }}>
            Location
          </span>
          <input
            type="text"
            placeholder="Enter your address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-xs sm:text-[13px] w-full bg-transparent border-0 outline-none placeholder:opacity-60 py-2.5 sm:py-2 md:py-0.5"
            style={{ color: THEME.colors.text.darkBlue }}
          />
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-12 bg-gray-200 mx-4 md:mx-6"></div>

        {/* Start Time Field */}
        <div className="flex flex-col items-start w-full sm:w-[140px] md:w-[151px] gap-2 sm:gap-[9px] px-3 sm:px-2 md:px-0">
          <span className="text-xs font-bold" style={{ color: THEME.colors.text.darkBlue }}>
            Start time
          </span>
          <input
            type="text"
            placeholder="dd/mm/yy"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="text-xs sm:text-[13px] w-full bg-transparent border-0 outline-none placeholder:opacity-60 py-2.5 sm:py-2 md:py-0.5"
            style={{ color: THEME.colors.text.darkBlue }}
          />
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-12 bg-gray-200 mx-4 md:mx-6"></div>

        {/* Category Select */}
        <div className="flex flex-col items-start w-full sm:w-[140px] md:w-[151px] gap-2 sm:gap-[9px] px-3 sm:px-2 md:px-0">
          <span className="text-xs font-bold" style={{ color: THEME.colors.text.darkBlue }}>
            Find help today
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs sm:text-[13px] w-full bg-transparent border-0 outline-none cursor-pointer py-2.5 sm:py-2 md:py-0.5 appearance-none"
            style={{ color: THEME.colors.text.darkBlue }}
            disabled={isLoading}
          >
            <option value="" disabled>
              {isLoading ? "Loading categories..." : "Select category"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-12 bg-gray-200 mx-4 md:mx-6"></div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="flex items-center justify-center w-[80%] sm:w-[100px] md:w-[120px] py-3 sm:py-3 md:py-3 sm:mr-[8px] md:mr-[11px] rounded-[9999px] border-0 cursor-pointer mt-2 sm:mt-0 mx-auto sm:mx-0 transition-colors hover:opacity-90"
          style={{ 
            backgroundColor: THEME.colors.primary,
            color: THEME.colors.text.white
          }}
        >
          <span className="text-sm font-bold">Submit</span>
        </button>
      </div>
    </div>
  );
}
