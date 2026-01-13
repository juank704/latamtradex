import { 
  Wrench, 
  Shirt, 
  Apple, 
  Cpu, 
  Package, 
  Hammer,
  Leaf,
  Building
} from "lucide-react";

const categories = [
  { name: "Maquinaria Industrial", icon: Wrench, count: "1,200+" },
  { name: "Textiles y Confección", icon: Shirt, count: "850+" },
  { name: "Alimentos y Bebidas", icon: Apple, count: "2,100+" },
  { name: "Electrónica", icon: Cpu, count: "680+" },
  { name: "Empaques", icon: Package, count: "450+" },
  { name: "Construcción", icon: Hammer, count: "920+" },
  { name: "Agrícola", icon: Leaf, count: "780+" },
  { name: "Servicios B2B", icon: Building, count: "560+" },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Explora por Categoría
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encuentra los mejores proveedores chilenos en cada industria
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <button
              key={category.name}
              className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <category.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-left">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground text-left">
                {category.count} productos
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
