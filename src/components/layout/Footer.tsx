import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#2C1F18] text-cream pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Col 1 */}
          <div className="space-y-4">
            <h3 className="font-heading text-3xl mb-6">Skønhedsklinik Aarhus</h3>
            <p className="text-cream/80 max-w-xs">
              Hvor naturlig skønhed møder professionel pleje.
            </p>
            <div className="inline-flex items-center gap-2 border border-success/30 bg-success/10 text-success px-3 py-1 rounded-full text-xs font-medium tracking-wide">
              <span>✓</span> Registreret hos Styrelsen for Patientsikkerhed
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-medium mb-6 tracking-wide uppercase text-sm">Behandlinger</h4>
            <ul className="space-y-3 text-cream/80">
              <li><Link href="/behandlinger/laser-haarfjerning" className="hover:text-cream transition-colors">Laser hårfjerning</Link></li>
              <li><Link href="/behandlinger/tattoo-fjernelse" className="hover:text-cream transition-colors">Tattoo fjernelse</Link></li>
              <li><Link href="/behandlinger/ansigtsbehandling" className="hover:text-cream transition-colors">Ansigtsbehandling</Link></li>
              <li><Link href="/behandlinger/sugaring" className="hover:text-cream transition-colors">Sugaring</Link></li>
              <li><Link href="/behandlinger/tandblegning" className="hover:text-cream transition-colors">Tandblegning</Link></li>
              <li><Link href="/behandlinger" className="hover:text-cream transition-colors underline underline-offset-4 mt-2 block">Se alle behandlinger</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-medium mb-6 tracking-wide uppercase text-sm">Information</h4>
            <ul className="space-y-3 text-cream/80">
              <li><Link href="/priser" className="hover:text-cream transition-colors">Priser</Link></li>
              <li><Link href="/om-os" className="hover:text-cream transition-colors">Om os</Link></li>
              <li><Link href="/kontakt" className="hover:text-cream transition-colors">Kontakt</Link></li>
              <li><Link href="/gavekort" className="hover:text-cream transition-colors">Gavekort</Link></li>
              <li><Link href="/cookies-og-privatlivspolitik" className="hover:text-cream transition-colors">Cookies & privatlivspolitik</Link></li>
              <li><Link href="/handelsbetingelser" className="hover:text-cream transition-colors">Handelsbetingelser</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-medium mb-6 tracking-wide uppercase text-sm">Kontakt</h4>
            <ul className="space-y-3 text-cream/80 mb-6">
              <li>Tordenskjoldsgade 61, st. th.</li>
              <li>8000 Aarhus C</li>
              <li>
                <a href="tel:+4561445999" className="hover:text-cream transition-colors">
                  +45 61 44 59 99
                </a>
              </li>
              <li>
                <a href="mailto:info@skoenhedsklinik-aarhus.dk" className="hover:text-cream transition-colors">
                  info@skoenhedsklinik-aarhus.dk
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/skonhedsklinikaarhus" target="_blank" rel="noreferrer" className="text-cream/80 hover:text-cream transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-cream/80 hover:text-cream transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-cream/60 text-sm">
          <p>© {new Date().getFullYear()} Skønhedsklinik Aarhus · CVR: 33091982</p>
          <p>Udviklet af Sonorous Digital</p>
        </div>
      </div>
    </footer>
  );
}
