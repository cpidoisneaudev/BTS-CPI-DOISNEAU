import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#21262d] bg-[#0d1117] px-10 py-10">
      
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-10 mb-8">
        
        {/* Logo + description */}
        <div>
          <Link href="/" className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#00b4d8] rounded-md flex items-center justify-center">
              <svg viewBox="0 0 18 18" className="w-4 h-4 fill-[#0d1117]">
                <polygon points="9,1 17,5 17,13 9,17 1,13 1,5"/>
              </svg>
            </div>
            <span className="text-[#e6edf3] font-medium text-[15px]">
              CPI <span className="text-[#00b4d8]">Doisneau</span>
            </span>
          </Link>
          <p className="text-[#8b949e] text-sm leading-relaxed">
            Plateforme pédagogique du BTS Conception de Produits Industriels du Lycée Robert Doisneau.
          </p>
        </div>

        {/* Formation */}
        <div>
          <h4 className="text-[#e6edf3] text-sm font-medium mb-4">Formation</h4>
          <div className="flex flex-col gap-2">
            <Link href="/programme" className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors">Programme</Link>
            <Link href="/equipe" className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors">Équipe éducative</Link>
            <Link href="/logiciels" className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors">Logiciels</Link>
            <Link href="/stages" className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors">Recherche de stage</Link>
          </div>
        </div>

        {/* Espace privé */}
        <div>
          <h4 className="text-[#e6edf3] text-sm font-medium mb-4">Espace privé</h4>
          <div className="flex flex-col gap-2">
            <Link href="/app/dashboard" className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors">Dashboard étudiant</Link>
            <Link href="/app/dashboard" className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors">Espace professeur</Link>
            <Link href="/login" className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors">Connexion</Link>
          </div>
        </div>

        {/* Lycée */}
        <div>
          <h4 className="text-[#e6edf3] text-sm font-medium mb-4">Lycée</h4>
          <div className="flex flex-col gap-2">
            <a href="https://lycee-doisneau.fr" target="_blank" rel="noopener noreferrer" className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors">Site du lycée</a>
            <Link href="/contact" className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors">Contact</Link>
            <Link href="/mentions-legales" className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors">Mentions légales</Link>
          </div>
        </div>

      </div>

      {/* Bas du footer */}
      <div className="max-w-6xl mx-auto flex justify-between items-center pt-6 border-t border-[#21262d]">
        <p className="text-[#8b949e] text-xs">
          © 2026 CPI Doisneau — Lycée Robert Doisneau, Corbeil-Essonnes
        </p>
        <span className="text-[#8b949e] text-xs bg-[#161b22] border border-[#21262d] rounded px-3 py-1">
          BTS CPI — Promotion 2025/2026
        </span>
      </div>

    </footer>
  );
}