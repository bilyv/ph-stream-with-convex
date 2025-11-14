import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { AdminPanel } from "./components/AdminPanel";
import { VideoGallery } from "./components/VideoGallery";
import { useState } from "react";

export default function App() {
  const [currentView, setCurrentView] = useState<"gallery" | "admin">("gallery");

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="sticky top-0 z-10 bg-red-900/90 backdrop-blur-sm h-16 flex justify-between items-center border-b border-red-800 shadow-lg px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">ph.videos</h1>
          <Authenticated>
            <nav className="flex gap-4">
              <button
                onClick={() => setCurrentView("gallery")}
                className={`px-4 py-2 rounded transition-colors ${
                  currentView === "gallery"
                    ? "bg-red-600 text-white"
                    : "text-red-200 hover:text-white hover:bg-red-800"
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setCurrentView("admin")}
                className={`px-4 py-2 rounded transition-colors ${
                  currentView === "admin"
                    ? "bg-red-600 text-white"
                    : "text-red-200 hover:text-white hover:bg-red-800"
                }`}
              >
                Admin Panel
              </button>
            </nav>
          </Authenticated>
        </div>
        <SignOutButton />
      </header>
      
      <main className="flex-1 p-6">
        <Content currentView={currentView} />
      </main>
      
      <Toaster />
    </div>
  );
}

function Content({ currentView }: { currentView: "gallery" | "admin" }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Welcome to ph.videos</h2>
          <p className="text-red-200 text-lg mb-8">
            Your premium video platform with secure streaming
          </p>
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {currentView === "gallery" ? <VideoGallery /> : <AdminPanel />}
      </Authenticated>
    </div>
  );
}
