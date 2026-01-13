import { 
  FileText, 
  CreditCard, 
  Package, 
  Truck, 
  Ship, 
  ClipboardCheck,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const trackingSteps = [
  { 
    id: 1, 
    name: "Cotización", 
    icon: FileText, 
    status: "completed",
    description: "Solicitud enviada al proveedor"
  },
  { 
    id: 2, 
    name: "Pago", 
    icon: CreditCard, 
    status: "completed",
    description: "Pago procesado exitosamente"
  },
  { 
    id: 3, 
    name: "Preparación", 
    icon: Package, 
    status: "completed",
    description: "Pedido siendo preparado"
  },
  { 
    id: 4, 
    name: "En Tránsito", 
    icon: Ship, 
    status: "current",
    description: "Producto en camino desde origen"
  },
  { 
    id: 5, 
    name: "Distribución", 
    icon: Truck, 
    status: "pending",
    description: "Entrega local en Chile"
  },
  { 
    id: 6, 
    name: "Entregado", 
    icon: ClipboardCheck, 
    status: "pending",
    description: "Recibido y confirmado"
  },
];

const OrderTrackingSection = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Seguimiento en Tiempo Real
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Rastrea tu Pedido de Inicio a Fin
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Visibilidad completa del estado de tus compras internacionales
          </p>
        </div>

        {/* Tracking Demo Card */}
        <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-card border border-border p-6 md:p-8">
          {/* Order Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Orden #CHL-2024-8847</p>
              <h3 className="text-xl font-bold text-foreground">Maquinaria Industrial - 50 unidades</h3>
              <p className="text-sm text-muted-foreground">Proveedor: Industrias Guangzhou</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                En Tránsito
              </div>
              <Button variant="outline" size="sm">Ver Detalle</Button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="relative">
            {/* Progress Line */}
            <div className="hidden md:block absolute top-8 left-8 right-8 h-1 bg-border rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: '58%' }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {trackingSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className="relative flex flex-col items-center text-center"
                >
                  <div 
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all
                      ${step.status === 'completed' 
                        ? 'bg-primary text-primary-foreground shadow-soft' 
                        : step.status === 'current'
                        ? 'bg-accent text-accent-foreground shadow-soft animate-pulse-soft'
                        : 'bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <step.icon className="w-7 h-7" />
                    )}
                  </div>
                  <h4 className={`font-semibold text-sm mb-1 ${
                    step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {step.name}
                  </h4>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ETA */}
          <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/50 rounded-xl p-4 -mx-2">
            <div className="flex items-center gap-3">
              <Truck className="w-10 h-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Llegada estimada a Santiago</p>
                <p className="text-lg font-bold text-foreground">15 - 18 Enero 2024</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Contactar Proveedor</Button>
              <Button variant="hero" size="sm">Ver Documentos</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderTrackingSection;
