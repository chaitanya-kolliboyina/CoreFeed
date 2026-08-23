"use client";

import { useState, useRef, MouseEvent } from "react";

export default function LandingView({ isLoggedIn }: { isLoggedIn: boolean }) {
  // 3D Card Tilt States
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState("");

  // Live Relevance Simulator States
  const [interestsSelected, setInterestsSelected] = useState<string[]>(["Semiconductors"]);
  const [isFollowingSource, setIsFollowingSource] = useState(true);
  const [hoursElapsed, setHoursElapsed] = useState(6);
  const [isAlreadyRead, setIsAlreadyRead] = useState(false);

  // Mouse tilt calculator
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element

    // Calculate rotation angles relative to center (range: -15deg to 15deg)
    const rotateX = ((y / rect.height) - 0.5) * -20;
    const rotateY = ((x / rect.width) - 0.5) * 20;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  // Relevance Score Calculator
  const tagOverlapPoints = interestsSelected.length * 50;
  const followBoostPoints = isFollowingSource ? 100 : 0;
  const recencyPenaltyPoints = -hoursElapsed;
  const readPenaltyPoints = isAlreadyRead ? -100 : 0;
  const simulatedScore = tagOverlapPoints + followBoostPoints + recencyPenaltyPoints + readPenaltyPoints;

  const toggleInterest = (tag: string) => {
    setInterestsSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Landing Navigation Header */}
      <header className="border-b border-[#21262d] bg-[#161b22]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xl font-black text-white tracking-widest bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            COREFEED
          </span>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <a
                href="/feed"
                className="text-xs font-bold text-white px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                Go to Feed →
              </a>
            ) : (
              <a
                href="/login"
                className="text-xs font-bold text-white px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                Get Started (Dev Sandbox)
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest self-center lg:self-start bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            Next-Gen Tech Feed
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white">
            The Feed Reader for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Elite Engineering
            </span>{" "}
            Minds.
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-lg leading-relaxed mx-auto lg:mx-0">
            Tailored specifically for deep research, semiconductors, space telemetry, quantum computing, and nuclear engineering. No noise. Just ranked, high-fidelity publications.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-2">
            {isLoggedIn ? (
              <a
                href="/feed"
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-extrabold text-sm transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02]"
              >
                Enter Feed Dashboard
              </a>
            ) : (
              <a
                href="/login"
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-extrabold text-sm transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02]"
              >
                Enter Dev Sandbox
              </a>
            )}
            <a
              href="#simulator"
              className="px-6 py-3.5 rounded-2xl border border-[#30363d] hover:bg-[#161b22] font-bold text-sm text-gray-300 transition-all hover:text-white"
            >
              See Relevance Scoring
            </a>
          </div>
        </div>

        {/* 3D Perspective Card Container */}
        <div className="flex items-center justify-center">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-md bg-gradient-to-br from-[#1d2432] to-[#111622] border border-[#30363d] rounded-3xl p-6 shadow-2xl transition-all duration-200 ease-out cursor-pointer relative overflow-hidden group select-none"
            style={{ transform: transformStyle }}
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none group-hover:scale-150 transition-all duration-700"></div>

            {/* Mock Dashboard Header */}
            <div className="flex items-center justify-between border-b border-[#21262d] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Relevance Radar
              </span>
            </div>

            {/* Mock Article Cards */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#161b22] border border-[#21262d] p-4 rounded-2xl flex flex-col gap-2 relative">
                <span className="absolute top-4 right-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                  Score: 194
                </span>
                <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold">
                  <span>TSMC Technical Blog</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">1h ago</span>
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  ASML Twinscan High-NA EUV Lithography: Nanometer Overlay Control
                </h4>
                <div className="flex gap-1.5 mt-1">
                  <span className="bg-[#21262d] text-gray-300 text-[8px] font-bold px-2 py-0.5 rounded-full">
                    Semiconductors
                  </span>
                  <span className="bg-[#21262d] text-gray-300 text-[8px] font-bold px-2 py-0.5 rounded-full">
                    Quantum Dot
                  </span>
                </div>
              </div>

              <div className="bg-[#161b22]/60 border border-[#21262d]/60 p-4 rounded-2xl flex flex-col gap-2 opacity-60">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                  <span>NASA JPL News</span>
                  <span className="text-gray-600">•</span>
                  <span>14h ago</span>
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  Autonomous Pathfinding Systems for Nuclear Thermal Rockets
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Relevance Simulator Widget */}
      <section
        id="simulator"
        className="bg-[#161b22] border-t border-b border-[#21262d] py-16 md:py-24"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Controls Panel */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Scoring Engine
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Personalized Relevance Simulator
              </h2>
              <p className="text-xs text-gray-400 mt-2">
                Experiment with the ranking variables below to see how our scoring engine evaluates and sorts core articles.
              </p>
            </div>

            {/* Select Interests (Tags) */}
            <div className="flex flex-col gap-2 bg-[#0d1117] p-4 rounded-2xl border border-[#21262d]">
              <span className="text-xs font-bold text-gray-300">
                1. Select User Interests (Matching Tag = +50 pts):
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {["Semiconductors", "Astrophysics", "Quantum Computing"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleInterest(tag)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                      interestsSelected.includes(tag)
                        ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400"
                        : "border-[#21262d] text-gray-400 hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Followed Company Toggle */}
            <div className="flex items-center justify-between bg-[#0d1117] p-4 rounded-2xl border border-[#21262d]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-300">2. Subscribe to Company Channel:</span>
                <span className="text-[10px] text-gray-500">Following the source grants a +100 pts boost</span>
              </div>
              <input
                type="checkbox"
                checked={isFollowingSource}
                onChange={(e) => setIsFollowingSource(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Hour elapsed slider */}
            <div className="flex flex-col gap-2 bg-[#0d1117] p-4 rounded-2xl border border-[#21262d]">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-300">3. Article Age (Recency Decay = -1 pt / hour elapsed):</span>
                <span className="text-indigo-400">{hoursElapsed} hours ago</span>
              </div>
              <input
                type="range"
                min="0"
                max="48"
                value={hoursElapsed}
                onChange={(e) => setHoursElapsed(parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-[#161b22] h-1.5 rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>

            {/* Read state toggle */}
            <div className="flex items-center justify-between bg-[#0d1117] p-4 rounded-2xl border border-[#21262d]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-300">4. Article Read History:</span>
                <span className="text-[10px] text-gray-500">Already read articles suffer a -100 pts penalty</span>
              </div>
              <input
                type="checkbox"
                checked={isAlreadyRead}
                onChange={(e) => setIsAlreadyRead(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-[#0d1117] border border-[#21262d] rounded-3xl p-6 shadow-xl flex flex-col gap-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#21262d] pb-2">
              Relevance Outcome
            </span>

            {/* Live calculated card */}
            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-2xl flex flex-col gap-3 relative">
              <div className="absolute top-5 right-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg shadow-indigo-500/10">
                Score: {simulatedScore}
              </div>

              <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold">
                <span>Intel Labs Research</span>
                <span className="text-gray-600">•</span>
                <span>{hoursElapsed} hours ago</span>
              </div>

              <h4 className="text-base font-extrabold text-white pr-20 leading-snug">
                Co-Packaged Silicon Photonics for Scaling Distributed Multi-Chip Modules
              </h4>

              <div className="flex gap-1.5 mt-1">
                <span className="bg-[#21262d] text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Semiconductors
                </span>
                <span className="bg-[#21262d] text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Quantum Computing
                </span>
              </div>
            </div>

            {/* Calculation details list */}
            <div className="flex flex-col gap-2 bg-[#161b22] p-4 rounded-2xl border border-[#21262d] text-xs">
              <span className="font-bold text-gray-300 border-b border-[#21262d] pb-2 mb-1">
                Breakdown calculation
              </span>
              <div className="flex justify-between">
                <span className="text-gray-400">Tag Matches ({interestsSelected.length} tag{interestsSelected.length !== 1 ? "s" : ""})</span>
                <span className="font-bold text-green-400">+{tagOverlapPoints} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Followed Source Boost</span>
                <span className="font-bold text-green-400">+{followBoostPoints} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recency Decay (-1 pt/hr)</span>
                <span className="font-bold text-red-400">{recencyPenaltyPoints} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Read History Penalty</span>
                <span className="font-bold text-red-400">{readPenaltyPoints} pts</span>
              </div>
              <div className="flex justify-between border-t border-[#21262d] pt-2 mt-1 font-extrabold text-white">
                <span>Final Dynamic Score</span>
                <span>{simulatedScore} pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced field showcases */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col gap-12">
        <div className="text-center">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            Broad Disciplines
          </span>
          <h2 className="text-3xl font-black text-white mt-1">
            Engineered For Niche Fields
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6 flex flex-col gap-3 hover:border-indigo-500/40 transition-all hover:translate-y-[-2px] duration-300 shadow-md">
            <span className="text-3xl">🔌</span>
            <h4 className="font-bold text-white">Semiconductors</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Chip layouts, lithography updates, fabrication chemistry, and cleanroom physics logs.
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6 flex flex-col gap-3 hover:border-indigo-500/40 transition-all hover:translate-y-[-2px] duration-300 shadow-md">
            <span className="text-3xl">🚀</span>
            <h4 className="font-bold text-white">Astrophysics</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Cosmological models, telemetry from probes, rocket engines, orbital mechanics.
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6 flex flex-col gap-3 hover:border-indigo-500/40 transition-all hover:translate-y-[-2px] duration-300 shadow-md">
            <span className="text-3xl">⚛️</span>
            <h4 className="font-bold text-white">Nuclear Science</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Magnetic containment fusion research, fission reactor materials, neutron irradiation data.
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6 flex flex-col gap-3 hover:border-indigo-500/40 transition-all hover:translate-y-[-2px] duration-300 shadow-md">
            <span className="text-3xl">🧬</span>
            <h4 className="font-bold text-white">Bioengineering</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              CRISPR advancements, computational biology pipelines, neural networks for protein structures.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#161b22] border-t border-[#21262d] py-8 text-center text-xs text-gray-500 mt-auto">
        <p>© 2026 CoreFeed. Built for advanced technology aggregation.</p>
      </footer>
    </div>
  );
}
