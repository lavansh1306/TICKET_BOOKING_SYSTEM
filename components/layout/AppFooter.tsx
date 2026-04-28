import Link from "next/link";

const EVENT_LINKS = ["Movies", "Concerts", "Sports", "Theatre", "Comedy", "Festivals"];
const SUPPORT_LINKS = ["Help Center", "Cancellation Policy", "Contact Us", "About"];
const LEGAL_LINKS = ["Privacy Policy", "Terms of Service", "Cookie Policy"];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm font-semibold text-[#0A0A0A]">{children}</p>;
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-[#6B6B6B] hover:text-[#0A0A0A]">
        {children}
      </Link>
    </li>
  );
}

export default function AppFooter() {
  return (
    <footer className="border-t border-[#E4E4E7] bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="mb-3 font-sans text-base font-bold tracking-widest text-[#0A0A0A]">BOOKING_SYSTEM</p>
            <p className="mb-2 text-sm leading-relaxed text-[#6B6B6B]">
              Book tickets for movies, concerts, sports and live events.
            </p>
            <p className="text-xs text-[#9B9B9B]">Built for 21CSC205P · SRM IST</p>
          </div>

          {/* Events */}
          <div>
            <FooterHeading>Events</FooterHeading>
            <ul className="space-y-2">
              {EVENT_LINKS.map((name) => (
                <FooterLink key={name} href={`/events?category=${name.toLowerCase()}`}>
                  {name}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <FooterHeading>Support</FooterHeading>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((name) => (
                <FooterLink key={name} href="#">
                  {name}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <FooterHeading>Legal</FooterHeading>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((name) => (
                <FooterLink key={name} href="#">
                  {name}
                </FooterLink>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#E4E4E7] pt-6 sm:flex-row">
          <p className="text-xs text-[#9B9B9B]">© 2026 BOOKING_SYSTEM. All rights reserved.</p>
          <p className="text-xs text-[#9B9B9B]">Lavansh Choubey &amp; Aiyana Sehgal · SRM IST</p>
        </div>
      </div>
    </footer>
  );
}
