"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles, Plus, User, LogIn, LogOut, Menu, ChevronDown, LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged Out", {
            description: "You have been successfully signed out.",
          });
          router.push("/login");
        },
        onError: () => {
          toast.error("Logout Failed", {
            description: "Something went wrong. Please try again.",
          });
        },
      },
    });
  };

  const links = [
    { href: "/explore", label: "Discover", icon: Sparkles },
    { href: "/create", label: "Create Event", icon: Plus },
  ];

  if (!session) {
    links.push({ href: "/login", label: "Log In", icon: LogIn });
  }

  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="brutal-border border-t-0 border-x-0 bg-card">
      <div className="mx-auto max-w-site px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-tight">
          Event<span className="text-brutal-pink">ify</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-2">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`brutal-border brutal-shadow-sm brutal-hover flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold ${isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground hover:bg-secondary"
                  }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}

          {session && (
            <div className="flex items-stretch brutal-border brutal-shadow-sm brutal-hover rounded-md overflow-hidden bg-card mx-1">
              <Link href="/profile" className="flex">
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-bold border-r border-black outline-none focus:outline-none hover:bg-secondary transition-colors">
                  <User size={16} /> Profile
                </button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center px-2 py-2 font-bold self-stretch outline-none focus:outline-none hover:bg-secondary transition-colors">
                  <ChevronDown size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="brutal-border brutal-shadow-sm w-56 mt-2 bg-card">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 font-bold cursor-pointer py-2 px-3">
                      <User size={16} /> View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold cursor-pointer py-2 px-3">
                      <LayoutDashboard size={16} /> View Analytics Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 font-bold text-red-600 focus:text-red-700 cursor-pointer py-2 px-3"
                  >
                    <LogOut size={16} /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="brutal-border brutal-shadow-sm brutal-hover ml-2 rounded-md bg-brutal-yellow p-2 font-bold text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} className="text-black" /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className="sm:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="brutal-border brutal-shadow-sm brutal-hover rounded-md bg-card p-2 text-card-foreground">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="brutal-border-l bg-card sm:max-w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-black">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                {links.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={`brutal-border brutal-shadow-sm active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-3 rounded-md px-4 py-3 text-base font-bold ${isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground"
                        }`}
                    >
                      <Icon size={20} />
                      {label}
                    </Link>
                  );
                })}

                {session && (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="brutal-border brutal-shadow-sm active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-3 rounded-md px-4 py-3 text-base font-bold bg-card text-card-foreground"
                    >
                      <User size={20} />
                      View Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="brutal-border brutal-shadow-sm active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-3 rounded-md px-4 py-3 text-base font-bold bg-card text-card-foreground"
                    >
                      <LayoutDashboard size={20} />
                      Analytics Dashboard
                    </Link>
                  </>
                )}

                <div className="my-2 h-[1px] bg-border" />

                <button
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                    setIsOpen(false);
                  }}
                  className="brutal-border brutal-shadow-sm active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-3 rounded-md bg-brutal-yellow px-4 py-3 text-base font-bold text-black"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>

                {session && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="brutal-border brutal-shadow-sm active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-3 rounded-md bg-red-100 px-4 py-3 text-base font-bold text-red-600"
                  >
                    <LogOut size={20} />
                    Log Out
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
