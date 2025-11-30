import { useState, useEffect, useCallback } from 'react';

interface NavLink {
  href: string;
  label: string;
  match: string;
  exact?: boolean;
}

interface MobileMenuProps {
  navLinks: NavLink[];
  currentPath: string;
  logoSrc: string;
  baseUrl: string;
}

export default function MobileMenu({ navLinks, currentPath, logoSrc, baseUrl }: MobileMenuProps) {
  const checkIsActive = (link: NavLink) => {
    if (link.exact) {
      return currentPath === '/' || currentPath === baseUrl || currentPath === `${baseUrl}/`;
    }
    return currentPath.includes(link.match);
  };
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeMenu]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => isOpen ? closeMenu() : openMenu()}
        className="md:hidden absolute left-4 w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-300 cursor-pointer group"
        aria-label="Menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <div className="w-6 h-5 relative flex flex-col justify-between">
          <span
            className="w-full h-0.5 bg-white rounded-full transition-all duration-300 origin-center"
            style={{
              transform: isOpen ? 'translateY(8px) rotate(45deg)' : 'none',
            }}
          />
          <span
            className="w-full h-0.5 bg-white rounded-full transition-all duration-300"
            style={{
              opacity: isOpen ? 0 : 1,
              transform: isOpen ? 'scaleX(0)' : 'scaleX(1)',
            }}
          />
          <span
            className="w-full h-0.5 bg-white rounded-full transition-all duration-300 origin-center"
            style={{
              transform: isOpen ? 'translateY(-8px) rotate(-45deg)' : 'none',
            }}
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-beaucharme-dark/80 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />

        {/* Menu Panel */}
        <div
          className={`absolute inset-y-0 left-0 w-full max-w-sm bg-beaucharme-sage-dark shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <a href={baseUrl || '/'} className="flex items-center gap-2" onClick={closeMenu}>
              <img
                src={logoSrc}
                alt="Beaucharme logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain brightness-0 invert"
              />
              <span className="text-white font-serif text-lg font-medium">beaucharme</span>
            </a>
            <button
              onClick={closeMenu}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Fermer le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col p-6">
            {navLinks.map((link, index) => {
              const isActive = checkIsActive(link);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`py-4 text-xl font-serif font-medium border-b border-white/10 transition-all duration-300 ${
                    isActive
                      ? 'text-beaucharme-cream'
                      : 'text-white hover:text-beaucharme-cream hover:pl-2'
                  }`}
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                    transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
            <p className="text-white/50 text-sm text-center">
              Cosmétiques naturels de Bourgogne
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
