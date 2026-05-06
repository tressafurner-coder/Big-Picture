const TEAMS = [
  "Platform Engineering",
  "Mobile — iOS",
  "Data & Analytics",
  "Customer Success Ops",
  "Design Systems",
  "Security & Compliance",
  "Release Management",
  "API Integrations",
  "Growth Experiments",
  "Technical Writing",
];

export default function GlobalTeamsPage() {
  return (
    <div className="min-h-dvh bg-[#F7F8F9]">
      <main className="mx-auto max-w-xl px-8 py-16">
        <h1 className="text-xl font-normal tracking-tight text-[#172B4D]">
          Global teams
        </h1>
        <ul className="mt-10 space-y-5">
          {TEAMS.map((name) => (
            <li key={name} className="text-sm text-[#172B4D]">
              {name}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
