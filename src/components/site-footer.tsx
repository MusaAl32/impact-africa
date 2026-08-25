import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-foreground px-4 pt-16 pb-8 text-background">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight">
          Africa is Full of Problems.
          <br />
          <span className="text-primary">Who Will Build The Solutions?</span>
        </h2>
        <Link
          to="/ecosystem"
          className="mb-12 block w-full bg-primary py-4 text-sm font-black uppercase tracking-widest text-primary-foreground"
        >
          Join The Ecosystem
        </Link>

        <div className="mb-12 grid grid-cols-2 gap-8 border-t border-background/10 pt-8 text-left">
          <div>
            <h4 className="mb-4 font-mono text-[9px] uppercase tracking-widest text-background/50">
              Intelligence
            </h4>
            <ul className="space-y-2 text-xs font-bold uppercase">
              <li>
                <Link to="/problem-map">Map</Link>
              </li>
              <li>
                <Link to="/research">Research</Link>
              </li>
              <li>
                <Link to="/insights">Insights</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-mono text-[9px] uppercase tracking-widest text-background/50">
              Community
            </h4>
            <ul className="space-y-2 text-xs font-bold uppercase">
              <li>
                <Link to="/builders">Builders</Link>
              </li>
              <li>
                <Link to="/projects">Projects</Link>
              </li>
              <li>
                <Link to="/submit">Submit</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="font-mono text-[9px] text-background/30">
          &copy; 2026 AFRICA OPPORTUNITY INTELLIGENCE ECOSYSTEM
        </div>
      </div>
    </footer>
  );
}
