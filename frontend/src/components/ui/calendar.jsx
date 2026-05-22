import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export const Calendar = ({ selectedDate, onSelect, className }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());

  useEffect(() => {
    if (selectedDate && !isSameMonth(new Date(selectedDate), currentMonth)) {
      setCurrentMonth(new Date(selectedDate));
    }
  }, [selectedDate]);

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-sm">{format(currentMonth, 'MMMM yyyy')}</span>
        <Button variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EE";
    const days = [];
    let startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-xs text-neutral-500 w-8">
          {format(addDays(startDate, i), dateFormat).charAt(0)}
        </div>
      );
    }
    return <div className="flex justify-between mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
        
        days.push(
          <div
            key={day.toString()}
            className={`w-8 h-8 flex items-center justify-center rounded-sm cursor-pointer text-sm
              ${!isSameMonth(day, monthStart) ? "text-neutral-400" : "text-neutral-700"}
              ${isSelected ? "bg-blue-600 text-white font-semibold" : "hover:bg-neutral-200"}
              ${isToday(day) && !isSelected ? "underline font-semibold" : ""}
            `}
            onClick={() => onSelect(cloneDay)}
          >
            <span>{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex justify-between mb-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className={`w-full ${className || ''}`}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};
