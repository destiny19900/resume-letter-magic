import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Close menu on ESC and trap focus
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
      // Focus trap
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a, button:not([disabled])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Cover Craft</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/cover-letters"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Cover Letters
            </Link>
            <Link
              to="/profile"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Profile
            </Link>
            {user && (
              <Button
                variant="ghost"
                onClick={signOut}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay and menu */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} md:hidden`}
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
      />
      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`fixed top-0 right-0 left-0 z-50 transform transition-transform duration-300 md:hidden bg-white border-t border-gray-200 shadow-lg ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'} focus:outline-none`}
        tabIndex={-1}
        role="menu"
        aria-label="Mobile navigation"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/dashboard"
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
            onClick={() => setIsMenuOpen(false)}
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Dashboard
          </Link>
          <Link
            to="/cover-letters"
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
            onClick={() => setIsMenuOpen(false)}
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Cover Letters
          </Link>
          <Link
            to="/profile"
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
            onClick={() => setIsMenuOpen(false)}
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Profile
          </Link>
          {user && (
            <button
              onClick={() => {
                signOut();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
              tabIndex={isMenuOpen ? 0 : -1}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
} 