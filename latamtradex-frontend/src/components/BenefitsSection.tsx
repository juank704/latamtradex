import { 
  ShieldCheck, 
  Truck, 
  Wallet, 
  HeadphonesIcon,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Pagos Seguros",
    description: "Transacciones protegidas con garantía de devolución si no recibes tu pedido.",
  },
  {
    icon: Truck,
    title: "Tracking Completo",
    description: "Sigue tu pedido desde el proveedor hasta tu puerta con actualizaciones en tiempo real.",
  },
  {
    icon: Wallet,
    title: "Mejores Precios",
    description: "Accede a precios mayoristas directos de fábrica sin intermediarios.",
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte 24/7",
    description: "Equipo de atención en Chile listo para ayudarte en cada paso del proceso.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
            ¿Por qué elegir LatamTradex?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            La plataforma diseñada para que las micro pymes crezcan sin límites
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <benefit.icon className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-primary-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-primary-foreground/70 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="accent" size="xl" className="gap-2">
            Comenzar Ahora
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
