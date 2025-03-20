"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarsProps {
  calendars: {
    name: string;
    items: string[];
  }[];
}

export function Calendars({ calendars }: CalendarsProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(Object.fromEntries(calendars.map((cal) => [cal.name, true])));

  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    Object.fromEntries(
      calendars.flatMap((cal) =>
        cal.items.map((item) => [`${cal.name}-${item}`, true])
      )
    )
  );

  const toggleSection = (name: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleItem = (section: string, item: string) => {
    const key = `${section}-${item}`;
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3">Calendars</h3>
      <div className="space-y-2">
        {calendars.map((calendar) => (
          <div key={calendar.name} className="space-y-1">
            <button
              className="flex items-center w-full text-sm hover:text-white"
              onClick={() => toggleSection(calendar.name)}
            >
              {expandedSections[calendar.name] ? (
                <ChevronDown className="h-4 w-4 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1" />
              )}
              <span>{calendar.name}</span>
            </button>

            {expandedSections[calendar.name] && (
              <div className="ml-5 space-y-1">
                {calendar.items.map((item) => {
                  const key = `${calendar.name}-${item}`;
                  return (
                    <button
                      key={item}
                      className="flex items-center w-full text-sm text-gray-400 hover:text-white"
                      onClick={() => toggleItem(calendar.name, item)}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 mr-2 rounded-sm border flex items-center justify-center",
                          selectedItems[key]
                            ? "bg-orange-500 border-orange-500"
                            : "border-gray-600"
                        )}
                      >
                        {selectedItems[key] && (
                          <Check className="h-3 w-3 text-black" />
                        )}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
