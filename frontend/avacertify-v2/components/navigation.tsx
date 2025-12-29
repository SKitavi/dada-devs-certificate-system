"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, LayoutDashboard, CheckCircle, Info, User, Bell, Settings, LogOut } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { WalletConnect } from "./wallet-connect"
import { motion } from "framer-motion"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { name: "Home", href: "/", icon: Home, roles: ["GUEST"] }, // Only show for guests
  { name: "Admin", href: "/admin", icon: Settings, roles: ["ADMIN"] }, // Admin only, no Dashboard
  { name: "Verify", href: "/verify", icon: CheckCircle, roles: ["USER", "ADMIN"] },
  { name: "About", href: "/about", icon: Info, roles: ["GUEST"] }, // Only show for guests
  { name: "Profile", href: "/profile", icon: User, roles: ["USER", "ADMIN"] },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()
  const { user, logout } = useAuth()

  const handleConnect = () => {
    toast({
      title: "Connecting Wallet",
      description: "Please approve the connection request in your wallet.",
    })
  }

  const handleLogout = () => {
    logout()
  }

  // Filter navigation items based on user role
  const visibleNavItems = navItems.filter(item => {
    if (!user) return item.roles.includes("GUEST")
    return item.roles.includes(user.role)
  })

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
            <motion.div
              className="text-lg sm:text-xl md:text-2xl font-bold"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-dada-orange">&lt;/</span>
              <span className="text-yellow-500">&gt;</span>
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base md:text-xl text-dada-orange">Dada Devs</span>
              <span className="text-xs text-dada-orange/70 hidden sm:block">Buidl for Africa</span>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-1">
            {visibleNavItems.map((item) => (
              <motion.div key={item.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                    ${
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/5 text-foreground/60 hover:text-primary"
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notification Button - Hidden on small screens */}
          {user && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block"
            >
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() =>
                  toast({
                    title: "Notifications",
                    description: "You have no new notifications",
                  })
                }
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
              </Button>
            </motion.div>
          )}
          
          <ThemeToggle />
          <WalletConnect />

          {/* User Menu or Auth Buttons */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email
                      }
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary" : "text-foreground/60"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {user ? (
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild onClick={() => setIsOpen(false)}>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
                
                <Button variant="default" onClick={handleConnect}>
                  Connect Wallet
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}