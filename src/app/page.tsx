export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-6">
            Bienvenido a{' '}
            <span className="text-primary">ContentFlow</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Una aplicación moderna para gestión de contenido construida con Next.js 14, 
            TypeScript y Tailwind CSS.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">🚀 Next.js 14</h3>
              <p className="text-sm text-muted-foreground">
                App Router con TypeScript estricto
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">🎨 Tailwind CSS</h3>
              <p className="text-sm text-muted-foreground">
                Estilos modernos y responsivos
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">⚡ shadcn/ui</h3>
              <p className="text-sm text-muted-foreground">
                Componentes reutilizables
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-sm text-muted-foreground">
            <p>Proyecto configurado y listo para desarrollo</p>
          </div>
        </div>
      </div>
    </main>
  )
} 