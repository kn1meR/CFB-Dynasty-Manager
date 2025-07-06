"use client"

import React, { memo } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export const ThemeToggle = memo(() => {
  const { setTheme, theme } = useTheme()

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="relative h-10 w-10 dark:bg-white dark:text-black dark:hover:bg-gray-200 bg-gray-900 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background">
        <Sun className="h- w-5 absolute rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100" />
        <Moon className="h-5 w-5 absolute rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
      </Button>
  )
})

ThemeToggle.displayName = 'ThemeToggle';
