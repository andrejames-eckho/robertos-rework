"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: number | string;
  color?: string;
}

export const Icon = forwardRef<HTMLDivElement, IconProps>(
  ({ className, children, size = 24, color, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          "shrink-0",
          className
        )}
        style={{
          width: size,
          height: size,
          color: color,
          ...props.style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Icon.displayName = "Icon";
