"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used within Tabs.");
  }

  return context;
}

function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}: React.PropsWithChildren<{
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}>) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const selectedValue = value ?? internalValue;

  return (
    <TabsContext.Provider
      value={{
        value: selectedValue,
        setValue: (nextValue) => {
          if (value === undefined) {
            setInternalValue(nextValue);
          }

          onValueChange?.(nextValue);
        },
      }}
    >
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "inline-flex h-12 items-center gap-2 rounded-2xl bg-[#131313] p-1 text-white shadow-lg shadow-black/10",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  value,
  ...props
}: React.ComponentProps<"button"> & {
  value: string;
}) {
  const { value: selectedValue, setValue } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition-all",
        isActive
          ? "bg-white text-black shadow-sm"
          : "text-white/70 hover:text-white",
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & {
  value: string;
}) {
  const { value: selectedValue } = useTabsContext();

  if (selectedValue !== value) {
    return null;
  }

  return <div className={className} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
