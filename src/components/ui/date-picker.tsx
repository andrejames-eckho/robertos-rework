"use client";

import { useState, useRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  mode?: "date" | "time" | "datetime";
  min?: Date;
  max?: Date;
  className?: string;
}

export function DatePickerComponent({
  value,
  onChange,
  placeholder = "Select date",
  mode = "date",
  min,
  max,
  className = "",
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDateSelect = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.click();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.value) {
      const selectedDate = new Date(target.value);
      onChange(selectedDate);
    } else {
      onChange(undefined);
    }
  };

  const clearDate = () => {
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const getInputType = () => {
    switch (mode) {
      case "time":
        return "time";
      case "datetime":
        return "datetime-local";
      default:
        return "date";
    }
  };

  const getInputValue = () => {
    if (!value) return "";
    switch (mode) {
      case "time":
        return format(value, "HH:mm");
      case "datetime":
        return format(value, "yyyy-MM-dd'T'HH:mm");
      default:
        return format(value, "yyyy-MM-dd");
    }
  };

  const getMinValue = () => {
    if (!min) return "";
    switch (mode) {
      case "time":
        return format(min, "HH:mm");
      case "datetime":
        return format(min, "yyyy-MM-dd'T'HH:mm");
      default:
        return format(min, "yyyy-MM-dd");
    }
  };

  const getMaxValue = () => {
    if (!max) return "";
    switch (mode) {
      case "time":
        return format(max, "HH:mm");
      case "datetime":
        return format(max, "yyyy-MM-dd'T'HH:mm");
      default:
        return format(max, "yyyy-MM-dd");
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        ref={inputRef}
        type={getInputType()}
        value={getInputValue()}
        onChange={handleInputChange}
        min={getMinValue()}
        max={getMaxValue()}
        className="hidden"
        placeholder={placeholder}
      />
      <Button
        variant="outline"
        onClick={handleDateSelect}
        className="flex-1 justify-start text-left font-normal border-white/10 bg-white/5 hover:bg-white/10"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, mode === "time" ? "HH:mm" : mode === "datetime" ? "MMM dd, yyyy HH:mm" : "PPP") : placeholder}
      </Button>
      {value && (
        <Button
          variant="ghost"
          onClick={clearDate}
          className="px-3 hover:bg-destructive/20 hover:text-destructive"
        >
          Clear
        </Button>
      )}
    </div>
  );
}

interface DateRangePickerProps {
  value?: { start?: Date; end?: Date };
  onChange: (range: { start?: Date; end?: Date } | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className = "",
}: DateRangePickerProps) {
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const handleStartDateSelect = () => {
    if (startInputRef.current) {
      if (typeof startInputRef.current.showPicker === 'function') {
        startInputRef.current.showPicker();
      } else {
        startInputRef.current.click();
      }
    }
  };

  const handleEndDateSelect = () => {
    if (endInputRef.current) {
      if (typeof endInputRef.current.showPicker === 'function') {
        endInputRef.current.showPicker();
      } else {
        endInputRef.current.click();
      }
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.value) {
      const selectedDate = new Date(target.value);
      onChange({
        start: selectedDate,
        end: value?.end,
      });
    } else {
      onChange({
        start: undefined,
        end: value?.end,
      });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.value) {
      const selectedDate = new Date(target.value);
      onChange({
        start: value?.start,
        end: selectedDate,
      });
    } else {
      onChange({
        start: value?.start,
        end: undefined,
      });
    }
  };

  const clearRange = () => {
    onChange(undefined);
    if (startInputRef.current) startInputRef.current.value = "";
    if (endInputRef.current) endInputRef.current.value = "";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <input
          ref={startInputRef}
          type="date"
          value={value?.start ? format(value.start, "yyyy-MM-dd") : ""}
          onChange={handleStartDateChange}
          max={value?.end ? format(value.end, "yyyy-MM-dd") : undefined}
          className="hidden"
        />
        <input
          ref={endInputRef}
          type="date"
          value={value?.end ? format(value.end, "yyyy-MM-dd") : ""}
          onChange={handleEndDateChange}
          min={value?.start ? format(value.start, "yyyy-MM-dd") : undefined}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={handleStartDateSelect}
          className="flex-1 justify-start text-left font-normal border-white/10 bg-white/5 hover:bg-white/10"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.start ? format(value.start, "PPP") : "Start date"}
        </Button>
        <Button
          variant="outline"
          onClick={handleEndDateSelect}
          className="flex-1 justify-start text-left font-normal border-white/10 bg-white/5 hover:bg-white/10"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.end ? format(value.end, "PPP") : "End date"}
        </Button>
        {value && (
          <Button
            variant="ghost"
            onClick={clearRange}
            className="px-3 hover:bg-destructive/20 hover:text-destructive"
          >
            Clear
          </Button>
        )}
      </div>
      {value?.start && value?.end && (
        <p className="text-sm text-muted-foreground">
          {format(value.start, "PPP")} - {format(value.end, "PPP")}
        </p>
      )}
    </div>
  );
}
