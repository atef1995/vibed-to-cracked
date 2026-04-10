"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useMood } from "@/components/providers/MoodProvider";
import { getMoodIcon } from "@/lib/getMoodIcon";
import {
  User,
  LogOut,
  Home,
  BookOpen,
  Code,
  Brain,
  Settings,
  Crown,
  Trophy,
  Users,
  Building,
  Map,
  Menu,
  X,
  ChevronUp,
  ChevronDown,
  FileText,
  Newspaper,
  ShoppingBag,
  GraduationCap,
  BookA,
  ArrowLeftRight,
  Video,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const { currentMood } = useMood();
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Collapse all menus on route change
  useEffect(() => {
    setShowMobileNav(false);
    setIsExpanded(false);
    setShowDropdownMenu(false);
  }, [pathname]);

  const publicLinks = [
    { href: "/tutorials", label: "Tutorials", icon: BookOpen },
    { href: "/learn", label: "Learn", icon: GraduationCap },
    { href: "/glossary", label: "Glossary", icon: BookA },
    { href: "/compare", label: "Compare", icon: ArrowLeftRight },
    { href: "/blog", label: "Blog", icon: Newspaper },
  ];

  const navigationItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
        mobile:
          "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
      },
    },
    {
      href: "/tutorials",
      label: "Tutorials",
      icon: BookOpen,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
        mobile:
          "text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
      },
    },
    {
      href: "/study-plan",
      label: "Study Plan",
      icon: Map,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
        mobile:
          "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
      },
    },
    {
      href: "/achievements",
      label: "Achievements",
      icon: Trophy,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
        mobile:
          "text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
      },
    },
    {
      href: "/mock-interview",
      label: "Mock Interview",
      icon: Video,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20",
        mobile:
          "text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20",
      },
    },
    {
      href: "/social",
      label: "Social",
      icon: Users,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20",
        mobile:
          "text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20",
      },
    },
    {
      href: "/pricing",
      label: "Pricing",
      icon: Crown,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
        mobile:
          "text-amber-600 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
      },
    },
    {
      href: "/store",
      label: "Store",
      icon: ShoppingBag,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
        mobile:
          "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
      },
    },
    {
      href: "/blog",
      label: "Blog",
      icon: Newspaper,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20",
        mobile:
          "text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20",
      },
    },
    {
      href: "/certificates",
      label: "Certificates",
      icon: FileText,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
        mobile:
          "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
      },
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      colors: {
        desktop:
          "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
        mobile:
          "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
      },
    },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div
          className={`flex items-center justify-between transition-all duration-1000 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-96" : "max-h-16"
          }`}
        >
          {/* Logo - Make it smaller on mobile */}
          <Link href="/" className="text-xl sm:text-2xl font-bold">
            <span className="text-blue-600">Vibed</span>{" "}
            <span className="inline">to </span>
            <span className="text-red-600">Cracked</span>
          </Link>

          <div className="flex flex-col gap-5">
            {/* Public Navigation - Always visible on desktop */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                    pathname?.startsWith(link.href)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Navigation - Desktop Only */}
            {session && isExpanded && (
              <nav
                className={`hidden lg:grid grid-cols-3 grid-rows-3 gap-4 xl:gap-6 max-w-3xl `}
              >
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${item.colors.desktop}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Right Side - Compact on mobile */}
          <div className="flex items-center gap-2 sm:gap-4 ">
            {/* Mood Indicator - Only on larger screens */}
            {session && (
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ">
                <span>Learning in</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {currentMood.name}
                </span>
                {(() => {
                  const Icon = getMoodIcon(currentMood.icon);
                  return <Icon className="w-5 h-5" />;
                })()}
              </div>
            )}

            {/* Expand/Collapse Toggle - Desktop */}
            {session && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden lg:flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? "Minimize header" : "Expand header"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="md:hidden flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              title={showMobileNav ? "Close menu" : "Open menu"}
            >
              {showMobileNav ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* User Menu */}
            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowDropdownMenu(!showDropdownMenu)}
                  className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline text-sm">
                    {session.user?.name?.split(" ")[0] || session.user?.email}
                  </span>
                </button>

                {/* User Dropdown */}
                {showDropdownMenu && (
                  <div className="fixed left-1/2 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2">
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base active:scale-95"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Collapsible */}
        <div
          ref={mobileNavRef}
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            showMobileNav ? "max-h-128 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="mt-3 pt-3 border-t dark:border-gray-700">
            {/* Public links - always visible */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-w-2xl mx-auto">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMobileNav(false)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                    pathname?.startsWith(link.href)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-xs text-center font-medium leading-tight">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Authenticated nav items */}
            {session && (
              <>
                <div className="mt-3 pt-3 border-t dark:border-gray-700 grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                  {navigationItems
                    .filter(
                      (item) => !publicLinks.some((p) => p.href === item.href)
                    )
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowMobileNav(false)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 transform active:scale-95 ${item.colors.mobile}`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-xs text-center font-medium leading-tight">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  <button
                    title="logout"
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 transform active:scale-95 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-xs text-center font-medium leading-tight">
                      Logout
                    </span>
                  </button>
                </div>

                {/* Mobile Mood Indicator */}
                <div className="mt-4 pt-3 border-t dark:border-gray-700 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Learning in</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {currentMood.name}
                    </span>
                    {(() => {
                      const Icon = getMoodIcon(currentMood.icon);
                      return <Icon className="w-4 h-4" />;
                    })()}
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
