"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      duration={5000}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-black group-[.toaster]:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-[.toaster]:p-6 group-[.toaster]:text-base group-[.toaster]:font-bold",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:font-normal group-[.toast]:mt-1",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:!bg-green-500 group-[.toaster]:!text-white group-[.toaster]:!border-green-700 [&_[data-description]]:!text-green-100",
          error: "group-[.toaster]:!bg-red-500 group-[.toaster]:!text-white group-[.toaster]:!border-red-700 [&_[data-description]]:!text-red-100",
          info: "group-[.toaster]:!bg-background group-[.toaster]:!text-foreground",
          closeButton: "!bg-black !text-white !border-black dark:!bg-white dark:!text-black dark:!border-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
