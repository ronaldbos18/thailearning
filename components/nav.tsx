import Link from "next/link";

const links = [
  ["Home", "/"],
  ["Learn", "/learn"],
  ["Practice", "/practice"],
  ["Progress", "/progress"],
  ["Characters", "/characters"],
  ["Logout", "/logout"]
];

export function Nav() {
  return (
    <nav className="mb-8 flex flex-wrap gap-2 rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-slate-200">
      {links.map(([label, href]) => (
        <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          {label}
        </Link>
      ))}
    </nav>
  );
}
