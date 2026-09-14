import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState as useVimeoState, useEffect as useVimeoEffect } from "react";

function VimeoThumbnail({ videoId, alt }) {
  const [thumb, setThumb] = useVimeoState(null);
  useVimeoEffect(() => {
    fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}&width=1920&_t=${Date.now()}`).
    then((r) => r.json()).
    then((d) => {
      if (d.thumbnail_url) {
        const hiRes = d.thumbnail_url.replace(/_\d+x\d+(\.\w+)$/, '_1920x1080$1');
        setThumb(hiRes);
      }
    }).
    catch(() => {});
  }, [videoId]);
  return thumb ?
  <img src={thumb} alt={alt} className="w-full h-full object-cover" /> :
  <div className="w-full h-full bg-black" />;
}
import { useScrollMemory } from "@/hooks/useScrollMemory";
import { useState, useEffect, useRef } from "react";
import { House, LogOut, Menu, X, Gift, MessageCircle, Bot, BookOpen, Layers, ChevronLeft, Trash2, Pencil } from "lucide-react";

import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import CartSheet from "./CartSheet";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";
import AppTour, { startTour } from "@/components/AppTour";

const navItems = [
{ path: "/give", label: "Give", icon: Gift },
{ path: "/go-coach", label: "GO! AI Assistant", icon: Bot }];


const adminNavItems = [];


const ROOT_PATHS = ["/", "/home", "/shop", "/go-chat", "/my-estuary", "/go-coach", "/preps-and-practices", "/preps-and-practices/preps", "/preps-and-practices/practices", "/pray-impact-invite", "/guide-training", "/give"];

const TAB_ROOTS = ["/home", "/my-estuary", "/go-coach"];

const PAGE_TITLES = {
  "/go-coach": "GO! AI Assistant",
  "/guide-training": "Guide Training",
  "/shop": "Shop",
  "/go-chat": "GO! Chat"
};

const slideVariants = {
  initial: { x: 30, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -30, opacity: 0 }
};

export default function Layout() {
  const { user } = useAuth();
  const syncAttempted = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    if (user?.email && user?.full_name?.trim().includes(' ') && !user.monday_synced && !syncAttempted.current) {
      syncAttempted.current = true;
      base44.functions.invoke('addUserToMonday', { email: user.email, full_name: user.full_name || user.email }).
      then(() => base44.auth.updateMe({ monday_synced: true })).
      catch((err) => console.error('Monday sync failed:', err));
    }
  }, [user?.email, user?.monday_synced]);

  useScrollMemory();

  const autoStartTour = false;

  const isRootPath = ROOT_PATHS.includes(location.pathname);

  const pageText = location.pathname === "/home" ?
  "Welcome to GO! where you can find videos and resources to help you join Jesus mission in the world!" :
  "Chat here with those in your GO! Group and other GO! groups in your church!";

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setNameSaving(true);
    await base44.auth.updateMe({ full_name: nameInput.trim() });
    setNameSaving(false);
    setEditNameOpen(false);
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    try {
      // Delete all user progress data, then log out
      const progress = await base44.entities.VideoProgress.list();
      await Promise.all(progress.map((p) => base44.entities.VideoProgress.delete(p.id)));
      const cartItems = await base44.entities.CartItem.list();
      await Promise.all(cartItems.map((c) => base44.entities.CartItem.delete(c.id)));
    } catch (e) {




      // best-effort cleanup
    }await base44.auth.logout();};return (
    <div className="min-h-screen bg-background">
      {/* Header with safe area top inset */}
      <header
        className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        
        <div className="max-w-7xl flex items-center h-16 md:px-6 py-4 px-2 rounded gap-4 w-full">
          {/* Back button on child routes (mobile only) */}
          {!isRootPath &&
          <button
            onClick={() => navigate(-1)}
            className="select-none flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors md:hidden">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          }



          <Link to="/" className="flex items-center gap-1.5 select-none">
            <img src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/6ca653584_goLogo.png" alt="GO! Logo" className="h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-auto">
            {navItems.map(({ path, label, icon: Icon, href }) =>
            href ?
            <a
              key={path}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="select-none flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary">
              
                  <Icon className="h-4 w-4" />
                  {label}
                </a> :

            <Link
              key={path}
              to={path}
              className={`select-none flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === path ?
              "bg-primary text-primary-foreground" :
              "text-muted-foreground hover:text-foreground hover:bg-secondary"}`
              }>
              
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>

            )}
            {user?.role === 'admin' && adminNavItems.map(({ path, label, icon: Icon }) =>
            <Link
              key={path}
              to={path}
              className={`select-none flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === path ?
              "bg-primary text-primary-foreground" :
              "text-muted-foreground hover:text-foreground hover:bg-secondary"}`
              }>
              
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="select-none relative p-2 rounded-lg hover:bg-secondary transition-colors" />
            
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border">
              <span className="text-sm text-muted-foreground select-none">{user?.full_name || user?.email}</span>
              <button
                onClick={() => base44.auth.logout()}
                className="select-none flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors text-sm text-muted-foreground">
                
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="select-none flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-sm text-destructive">
                
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
            




            
            <button id="tour-hamburger" className="select-none md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen &&
        <div className="md:hidden border-t border-border bg-card p-4 space-y-1">
            {/* GO! Logo + pithy statement */}
            <div className="flex items-center gap-2 px-4 py-3">
              <img src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/6ca653584_goLogo.png" alt="GO! Logo" className="h-9 w-auto" />
              <span className="text-xs text-muted-foreground">Live missionally every day.</span>
            </div>
            {/* GO! Pray. Love. Invite. */}
            <Link
            to="/pray-impact-invite"
            onClick={() => setMobileOpen(false)}
            className={`select-none flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${location.pathname === "/pray-impact-invite" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
              <BookOpen className="h-4 w-4" />
              GO! Pray. Love. Invite.
            </Link>
            {/* GO! Preps + Practices */}
            <Link
            to="/preps-and-practices"
            onClick={() => setMobileOpen(false)}
            className={`select-none flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${location.pathname === "/preps-and-practices" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
              <Layers className="h-4 w-4" />
              GO! Preps + Practices
            </Link>

            {/* Sign Out */}
            <button
            onClick={() => base44.auth.logout()}
            className="select-none flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary w-full">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
            {/* Edit Name */}
            <button
            onClick={() => {setMobileOpen(false);setNameInput(user?.full_name || "");setEditNameOpen(true);}}
            className="select-none flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary w-full">
              <Pencil className="h-4 w-4" />
              Edit My Name
            </button>
            {/* Take A Tour */}
            <button
            onClick={() => {setMobileOpen(false);startTour(navigate, () => base44.auth.updateMe({ has_completed_tour: true }));}}
            className="select-none flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 w-full">
              <span>🗺️</span>
              Take A Tour
            </button>
            {/* Footer row */}
            <div className="pt-2 border-t border-border flex gap-4 px-4 flex-wrap items-center">
              <Link to="/privacy" onClick={() => setMobileOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" onClick={() => setMobileOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Terms of Service</Link>
              <button
              onClick={() => {setMobileOpen(false);setDeleteDialogOpen(true);}}
              className="select-none text-xs text-destructive hover:text-destructive/80">
                Delete Account
              </button>
            </div>
          </div>
        }
      </header>

      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />

      {(location.pathname === "/home" || location.pathname === "/") &&
      <div className="w-screen relative left-1/2 -translate-x-1/2 bg-black">
        {!videoPlaying ?
        <button
          onClick={() => setVideoPlaying(true)}
          className="select-none relative w-full aspect-video block group">
            <VimeoThumbnail videoId="1226689717" alt="Welcome to GO!" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="h-6 w-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          </button> :
        <iframe
          src="https://player.vimeo.com/video/1226689717?autoplay=1&playsinline=1&muted=0&autopause=0"
          className="w-full aspect-video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          playsInline />
        }
      </div>
      }



      {(location.pathname === "/home" || location.pathname === "/") &&
      <div className="bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">This Month's GO! Story</p>
          </div>
        </div>
      }

      {/* Page transitions */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-1 pb-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}>
            
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating bottom nav with safe area bottom inset */}
      <AppTour autoStart={autoStartTour} onDone={() => {}} />

      <nav
        id="tour-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        
        <div className="flex items-center justify-center w-full px-2 py-2">
          {[
          { to: "/home", label: "Home", Icon: House },
          { to: "/my-estuary", label: "My Estuary", Icon: null },
          { to: "/go-coach", label: "GO! AI", Icon: Bot },
          { to: "/give", label: "Give", Icon: Gift }].

          map(({ to, label, Icon, external }) => {
            const isActive = !external && (location.pathname === to || (to === "/home" && location.pathname === "/"));
            const isTabActive = isActive || (!external && location.pathname.startsWith(to === "/" ? "/home" : to));
            return (
              <button
                key={to}
                id={to === "/my-estuary" ? "tour-estuary-nav" : undefined}
                onClick={() => {
                  if (external) {
                    window.open(to, "_blank", "noopener,noreferrer");
                    return;
                  }
                  if (isActive) {
                    // Re-selecting active tab — reset scroll to top
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    navigate(to);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={`select-none flex-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${isTabActive ? "text-primary" : "text-muted-foreground"}`}>
                
                {to === "/my-estuary" ?
                <>
                    <img src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/e16740db9_icon.png" alt="My Estuary" className={`h-5 w-5 object-contain dark:hidden ${isActive ? "opacity-100" : "opacity-40"}`} />
                    <img src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/f63fcb251_whiteicon.png" alt="My Estuary" className={`h-5 w-5 object-contain hidden dark:block ${isActive ? "opacity-100" : "opacity-40"}`} />
                  </> :
                <Icon className="h-5 w-5" />}
                <span className="text-[10px] font-medium">{label}</span>
              </button>);

          })}

        </div>
      </nav>

      {/* Edit Name Dialog */}
      <AlertDialog open={editNameOpen} onOpenChange={setEditNameOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit My Name</AlertDialogTitle>
            <AlertDialogDescription>Enter the name you'd like to display in the app.</AlertDialogDescription>
          </AlertDialogHeader>
          <input
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground mt-1"
            placeholder="Your full name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()} />
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveName} disabled={nameSaving}>
              {nameSaving ? "Saving…" : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);

}