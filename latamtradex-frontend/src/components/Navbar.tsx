import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, User, Menu, X, Package, TrendingUp, LogOut } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center shadow-soft">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">LatamTradex</span>
              <span className="text-xs block text-muted-foreground -mt-1">Trade Platform</span>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar productos, proveedores o categorías..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/products')}>
              <Package className="w-4 h-4" />
              Products
            </Button>
            {isAuthenticated && (
              <>
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/orders')}>
                  <TrendingUp className="w-4 h-4" />
                  My Orders
                </Button>
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </>
            )}
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.name}
                </span>
                <Button variant="outline" size="sm" className="gap-2" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/login')}>
                  <User className="w-4 h-4" />
                  Login
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border focus:border-primary transition-all outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start gap-2" onClick={() => navigate('/products')}>
                <Package className="w-4 h-4" />
                Products
              </Button>
              {isAuthenticated && (
                <>
                  <Button variant="ghost" className="justify-start gap-2" onClick={() => navigate('/orders')}>
                    <TrendingUp className="w-4 h-4" />
                    My Orders
                  </Button>
                  <Button variant="ghost" className="justify-start gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                  </Button>
                </>
              )}
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {user?.name}
                  </div>
                  <Button variant="outline" className="justify-start gap-2" onClick={logout}>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="justify-start gap-2" onClick={() => navigate('/login')}>
                    <User className="w-4 h-4" />
                    Login
                  </Button>
                  <Button variant="hero" onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
