import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Building2, Truck, Shield } from "lucide-react";

const tradePlatforms = ["B2B", "B2C", "C2C", "C2B"];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tradePlatforms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden gradient-hero py-20 lg:py-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
            <span className="text-sm font-medium text-primary-foreground">
              +5,000 proveedores verificados en Chile
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-slide-up">
            <span className="inline-block overflow-hidden h-[1.2em] align-bottom">
              <span 
                key={currentIndex}
                className="inline-block animate-fade-in"
              >
                {tradePlatforms[currentIndex]}
              </span>
            </span>{" "}
            Trade Platform
            <br />
            <span className="text-accent">para Micro Pymes de Latam</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-slide-up">
            Conecta con proveedores confiables, rastrea tus pedidos de inicio a fin y haz crecer tu negocio con las mejores condiciones del mercado.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-10 animate-slide-up">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="¿Qué estás buscando?"
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-card text-foreground shadow-lg focus:ring-4 focus:ring-primary-foreground/20 transition-all outline-none text-base"
                />
              </div>
              <Button variant="accent" size="xl" className="gap-2">
                Buscar
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm text-primary-foreground/70">
              <span>Popular:</span>
              <button className="hover:text-primary-foreground transition-colors">Maquinaria</button>
              <span>•</span>
              <button className="hover:text-primary-foreground transition-colors">Insumos</button>
              <span>•</span>
              <button className="hover:text-primary-foreground transition-colors">Textiles</button>
              <span>•</span>
              <button className="hover:text-primary-foreground transition-colors">Alimentos</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto animate-fade-in">
            <div className="flex flex-col items-center p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <Building2 className="w-6 h-6 text-accent mb-2" />
              <span className="text-2xl font-bold text-primary-foreground">5K+</span>
              <span className="text-xs text-primary-foreground/70">Proveedores</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <Truck className="w-6 h-6 text-accent mb-2" />
              <span className="text-2xl font-bold text-primary-foreground">24h</span>
              <span className="text-xs text-primary-foreground/70">Tracking</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <Shield className="w-6 h-6 text-accent mb-2" />
              <span className="text-2xl font-bold text-primary-foreground">100%</span>
              <span className="text-xs text-primary-foreground/70">Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
