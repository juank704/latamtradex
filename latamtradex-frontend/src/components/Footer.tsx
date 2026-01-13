import { Package, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold">LatamTradex</span>
                <span className="text-xs block opacity-70 -mt-1">Trade Platform</span>
              </div>
            </div>
            <p className="text-sm opacity-70 mb-4">
              La plataforma de comercio líder para micro pymes de Latinoamérica. Conectamos negocios con los mejores proveedores.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Categorías</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Proveedores</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Ofertas</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Nuevos Productos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Para Pymes</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Cómo Comprar</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Seguimiento de Pedidos</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Financiamiento</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Centro de Ayuda</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 opacity-70">
                <MapPin className="w-4 h-4" />
                Santiago, Chile
              </li>
              <li className="flex items-center gap-3 opacity-70">
                <Phone className="w-4 h-4" />
                +56 9 6108 4860
              </li>
              <li className="flex items-start gap-3 opacity-70">
                <Mail className="w-4 h-4 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="mailto:ventas@latamtradex.com" className="hover:opacity-100 transition-opacity">ventas@latamtradex.com</a>
                  <a href="mailto:info@latamtradex.com" className="hover:opacity-100 transition-opacity">info@latamtradex.com</a>
                  <a href="mailto:operaciones@latamtradex.com" className="hover:opacity-100 transition-opacity">operaciones@latamtradex.com</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-60">
          <p>© 2026 LatamTradex. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:opacity-100 transition-opacity">Términos</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Privacidad</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
