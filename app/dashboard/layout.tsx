"use client";
import { useState, ReactNode } from "react";
import SidebarLink from "@/components/sidebar-link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { CircleUser, Home, Menu, Package, Search, Users, Map, Calendar, Layers2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import logo from "@/public/media/image/logo_homecyclhome_grayscale.png";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { setTheme } = useTheme()

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src={logo}
                alt="Logo Homecyclhome"
              />
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <SidebarLink href="/dashboard" label="Accueil" icon={Home} />
              <SidebarLink href="/dashboard/carte" label="Carte" icon={Map} />
              <SidebarLink href="/dashboard/plannings" label="Plannings" icon={Calendar} />
              <SidebarLink href="/dashboard/plannings/modeles" label="Modèles de planning" icon={Layers2} />
              <SidebarLink href="/dashboard/produits" label="Produits" icon={Package} />
              <SidebarLink href="/dashboard/utilisateurs" label="Utilisateurs" icon={Users} />
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Image
                    src={logo}
                    alt="Logo Homecyclhome"
                  />
                </Link>
              </div>
              <nav className="grid gap-2 text-lg font-medium">
                <SidebarLink href="/dashboard" label="Accueil" icon={Home} />
                <SidebarLink href="/dashboard/carte" label="Carte" icon={Map} />
                <SidebarLink href="/dashboard/plannings" label="Plannings" icon={Calendar} />
                <SidebarLink href="/dashboard/plannings/modeles" label="Modèles de planning" icon={Layers2} />
                <SidebarLink href="/dashboard/produits" label="Produits" icon={Package} />
                <SidebarLink href="/dashboard/utilisateurs" label="Utilisateurs" icon={Users} />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Recherche..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form> */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Paramètres</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      Clair
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      Sombre
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      Système
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Link href="/logout">Déconnexion</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}