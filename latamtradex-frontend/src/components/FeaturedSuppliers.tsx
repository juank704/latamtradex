import { Star, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const suppliers = [
  {
    id: 1,
    name: "Industrias Metálicas Valparaíso",
    category: "Maquinaria Industrial",
    location: "Valparaíso, Chile",
    rating: 4.9,
    reviews: 234,
    verified: true,
    yearsActive: 12,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Textiles del Sur SpA",
    category: "Textiles y Confección",
    location: "Temuco, Chile",
    rating: 4.8,
    reviews: 189,
    verified: true,
    yearsActive: 8,
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Agroindustrial O'Higgins",
    category: "Alimentos y Bebidas",
    location: "Rancagua, Chile",
    rating: 4.9,
    reviews: 412,
    verified: true,
    yearsActive: 15,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "TechParts Santiago",
    category: "Electrónica",
    location: "Santiago, Chile",
    rating: 4.7,
    reviews: 156,
    verified: true,
    yearsActive: 5,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  },
];

const FeaturedSuppliers = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Verificados
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Proveedores Destacados
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Empresas chilenas con las mejores calificaciones y entregas garantizadas
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start">
            Ver Todos
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suppliers.map((supplier, index) => (
            <div
              key={supplier.id}
              className="group bg-card rounded-2xl border border-border shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={supplier.image}
                  alt={supplier.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {supplier.verified && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-success text-success-foreground text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verificado
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {supplier.category}
                </span>
                <h3 className="font-bold text-foreground mt-3 mb-2 line-clamp-1">
                  {supplier.name}
                </h3>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  {supplier.location}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-semibold text-foreground">{supplier.rating}</span>
                    <span className="text-xs text-muted-foreground">({supplier.reviews})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {supplier.yearsActive} años
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSuppliers;
