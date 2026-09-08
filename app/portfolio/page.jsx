"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import StarryNightAnimated from "@/components/StarryNightAnimated";

export default function PortfolioPage() {
  const bgWrapperRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Track the cursor globally so the animated Starry Night can stay blurred
  // everywhere except for the soft clear reveal around the pointer.
  useEffect(() => {
    const handlePointerMove = (event) => {
      const wrapper = bgWrapperRef.current;
      if (!wrapper) return;

      wrapper.style.setProperty("--cursor-x", `${event.clientX}px`);
      wrapper.style.setProperty("--cursor-y", `${event.clientY}px`);
      wrapper.style.setProperty("--cursor-radius", "175px");
      wrapper.style.setProperty("--cursor-opacity", "1");
    };

    const handlePointerLeave = () => {
      const wrapper = bgWrapperRef.current;
      if (!wrapper) return;

      wrapper.style.setProperty("--cursor-radius", "0px");
      wrapper.style.setProperty("--cursor-opacity", "0");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );
    };
  }, []);

  // Smooth scroll helpers for internal navigation
  const scrollToSection = (sectionId) => {
    const container = scrollContainerRef.current;
    const target = document.getElementById(sectionId);
    if (target && container) {
      const containerTop = container.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const offset = targetTop - containerTop + container.scrollTop;
      container.scrollTo({ top: offset, behavior: "smooth" });
    } else if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  // ======================================================
// INCOMING GLYPH NAVIGATION
// ======================================================
//
// Example:
// /portfolio?section=current-work
//
// Portfolio first opens at the top, then smoothly
// scrolls down to the requested section.
//
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const targetSection = params.get("section");

  if (!targetSection) return;

  const container = scrollContainerRef.current;

  if (!container) return;

  // Always begin from the very top.
  container.scrollTop = 0;

  // Give the portfolio and WebGL background a moment to mount
  // before beginning the visible smooth scroll.
  const timer = window.setTimeout(() => {
    const target = document.getElementById(targetSection);

    if (!target) {
      console.warn(
        `Portfolio section "${targetSection}" does not exist.`
      );
      return;
    }

    const containerTop =
      container.getBoundingClientRect().top;

    const targetTop =
      target.getBoundingClientRect().top;

    const offset =
      targetTop -
      containerTop +
      container.scrollTop;

    container.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  }, 350);

  return () => window.clearTimeout(timer);
}, []);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="portfolio-main-page">
      {/* ==================================================================
    ANIMATED STARRY NIGHT BACKGROUND
    Layer 1 = permanently blurred
    Layer 2 = sharp and revealed around cursor
    ================================================================== */}
<div
  ref={bgWrapperRef}
  className="portfolio-bg-wrapper"
  aria-label="Interactive animated Van Gogh Starry Night background"
>
  {/* BLURRED BACKGROUND */}
  <div className="portfolio-starry-layer portfolio-starry-blurred">
    <StarryNightAnimated
      intensity={1.4}
      speed={2}
    />
  </div>

  {/* SHARP BACKGROUND — only visible inside cursor radius */}
  <div className="portfolio-starry-layer portfolio-starry-clear">
    <StarryNightAnimated
      intensity={1.4}
      speed={2}
    />
  </div>

  {/* Cursor radius ring */}
  <div
    className="portfolio-cursor-spotlight"
    aria-hidden="true"
  />
</div>
     

      {/* ==================================================================
          MAIN CONTENT LAYER: Strictly centered horizontally & vertically
          ================================================================== */}
      <div className="portfolio-content-layer">
        {/* Top Floating Glass Navigation Header */}
        <header className="portfolio-top-bar">
          <Link href="/" className="portfolio-back-btn">
            <span>←</span>
            <span>Krrobius</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            
          </div>
        </header>

        {/* Centered Scrollable Translucent Blue Container */}
        <div
          ref={scrollContainerRef}
          className="portfolio-scroll-container"
        >
          {/* Top Left Title: Me, Myself and I */}
          <h1 className="portfolio-hero-title">Me, Myself and I</h1>

          {/* Hero Section Grid */}
          <section
  id="about"
  className="portfolio-hero-grid"
  aria-label="Introduction and Social Links"
>
  <div className="portfolio-profile-row portfolio-profile-row-full">

    {/* ==================================================
        LEFT: PROFILE PICTURE + SOCIAL GLYPHS
        ================================================== */}
    <div className="portfolio-profile-left">

      {/* Profile Picture */}
      <div className="portfolio-photo-frame">
        <img
          src="/picture.jpg"
          alt="Krrish Dubey"
          className="portfolio-photo-img"
        />
      </div>
      {/* Name / Playground Link */}
<a
  href="/starry-night?target=playground"
  className="portfolio-profile-name"
  title="Enter Playground"
>
  Krrish Dubey
</a>
      {/* Social glyphs directly below picture */}
      <div
        className="portfolio-social-icon-row"
        aria-label="Social connections"
      >
        {/* GitHub */}
        <a
          href="https://github.com/theskepticgeek"
          target="_blank"
          rel="noopener noreferrer"
          className="portfolio-social-icon-link"
          title="GitHub"
          aria-label="GitHub"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href="https://linkedin.com/in/krrishdubey"
          target="_blank"
          rel="noopener noreferrer"
          className="portfolio-social-icon-link"
          title="LinkedIn"
          aria-label="LinkedIn"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </a>

        {/* X */}
        <a
          href="https://x.com/0xKrrish01"
          target="_blank"
          rel="noopener noreferrer"
          className="portfolio-social-icon-link"
          title="X"
          aria-label="X"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        {/* Instagram */}
        <a
          href="https://instagram.com/krriiiiishd"
          target="_blank"
          rel="noopener noreferrer"
          className="portfolio-social-icon-link"
          title="Instagram"
          aria-label="Instagram"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
      </div>
    </div>


    {/* ==================================================
        RIGHT: WHO I AM
        ================================================== */}
    <div className="portfolio-profile-info">

      <div className="portfolio-white-box">
        <h2 className="portfolio-who-title">
          Who I am
        </h2>

        <p className="portfolio-who-desc">
          I’m a blockchain and Web3 developer exploring the intersection of decentralized systems, quantitative finance,
and AI. My work focuses on translating abstract mathematical theories such as game theory and stochastic
modeling into practical implementations for DeFi, risk prediction, and human behavior modeling. I’m currently
building an AI–VR–Blockchain integrated recruitment system to enable transparent and bias-free hiring, while
also experimenting with ML/DL-based market analysis and financial modeling.
        </p>
          <div className="portfolio-white-pills">
  <span className="portfolio-white-pill">🌐 Web3 &amp; Blockchain</span>
  
  <span className="portfolio-white-pill">📈 Quant Finance</span>
  
  <span className="portfolio-white-pill">🎲 Stochastic Modeling</span>
  <span className="portfolio-white-pill">🤖 AI &amp; Machine Learning</span>
  
  
  <span className="portfolio-white-pill">🧩 Human Behavior Modeling</span>
  <span className="portfolio-white-pill">🔗 Decentralized Systems</span>
</div>
        </div>
      

      <div className="portfolio-btn-group">

        <a
          href="#projects"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("projects");
          }}
          className="portfolio-btn-primary"
        >
          <span>View Projects</span>
          <span className="portfolio-btn-arrow">↓</span>
        </a>

        <a
          href="#current-work"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("current-work");
          }}
          className="portfolio-btn-secondary"
        >
          <span>Current Work</span>
          <span className="portfolio-btn-arrow">↓ </span>
        </a>
          
          <a
          href="/resume.pdf"
          className="portfolio-btn-secondary"
  target="_blank"
  rel="noopener noreferrer"
        >
          <span>Resume</span>
          <span className="portfolio-btn-arrow">→</span>
        </a>
      </div>
    </div>

  </div>
</section>

          {/* ==================================================================
              PROJECTS SECTION (Revealed as you scroll)
              ================================================================== */}
          <section
            id="projects"
            className="portfolio-section-divider"
            aria-label="Featured Projects"
          >
            <div className="portfolio-section-head">
              <h3 className="portfolio-section-title">Projects</h3>
              <p className="portfolio-section-sub">
                ARCHITECTING TRANSPARENT PROTOCOLS &amp; QUANTITATIVE FINANCE
              </p>
            </div>

            {/* Two Cards with the same translucent bg */}
            <div className="portfolio-projects-grid">
              {/* Card 1: EcoQuant */}
              {/* Card 1: EcoQuant */}
<article className="portfolio-project-card">
  <div>
    <span className="portfolio-card-badge">
      CELO // CARBON MARKETS // ML
    </span>

    <h4 className="portfolio-project-name">
      EcoQuant
    </h4>

    <p className="portfolio-project-quote">
      A decentralized carbon-finance platform for verifying,
  tokenizing and trading traceable carbon credits.
    </p>

    <div className="portfolio-project-details">
  <p>
    - Built a decentralized carbon-credit ecosystem on Celo Sepolia
    for verification, tokenization and investment.
  </p>

  <p>
    - Deployed EQT, an ERC-20 representing verified carbon offsets,
    with contributor and investor dashboards for geo-mapped projects,
    trading and Ubeswap V3 liquidity.
  </p>

  <p>
    - Integrated IPFS proof storage and ML-driven monitoring,
    verification and valuation with transparent on-chain tracking.
  </p>
</div>
    {/* EQT Contract */}
    <div
      style={{
        marginTop: "16px",
        marginBottom: "18px",
      }}
    >
      <span
        className="portfolio-card-badge"
        style={{
          display: "inline-block",
          marginBottom: "8px",
        }}
      >
        EQT // ERC-20 CONTRACT
      </span>

      <a
        href="https://celo-sepolia.blockscout.com/token/0xe00b540dfb16dbe12b80ef89f3172ffe3305ac7b"
        target="_blank"
        rel="noopener noreferrer"
        className="portfolio-contract-link"
        title="View EQT contract on Celo Sepolia Blockscout"
      >
        0xe00b540d...3305ac7b
        <span style={{ marginLeft: "7px" }}>↗</span>
      </a>
    </div>

    <div className="portfolio-tech-tags">
      <span className="portfolio-tech-tag">Solidity</span>
      <span className="portfolio-tech-tag">Celo</span>
      <span className="portfolio-tech-tag">Web3.js</span>
      <span className="portfolio-tech-tag">React.js</span>
      <span className="portfolio-tech-tag">ERC-20</span>
      <span className="portfolio-tech-tag">IPFS</span>
      <span className="portfolio-tech-tag">Machine Learning</span>
      <span className="portfolio-tech-tag">Ubeswap V3</span>
      <span className="portfolio-tech-tag">Smart Contracts</span>
    </div>
  </div>

  <div className="portfolio-project-links">
    {/* GitHub Repository */}
    <a
      href="https://github.com/theskepticgeek/EcoQuant"
      target="_blank"
      rel="noopener noreferrer"
      className="portfolio-repo-box"
      title="View EcoQuant repository on GitHub"
    >
      <span className="portfolio-repo-icon">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </span>

      
      
    </a>

    {/* Celo Contract */}
<a
  href="https://celo-sepolia.blockscout.com/token/0xe00b540dfb16dbe12b80ef89f3172ffe3305ac7b"
  target="_blank"
  rel="noopener noreferrer"
  className="portfolio-repo-box portfolio-celo-link"
  title="View EQT Contract on Celo Sepolia"
  aria-label="View EQT Contract on Celo Sepolia"
>
  <span className="portfolio-celo-icon">
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="16"
        r="8"
        stroke="currentColor"
        strokeWidth="2.4"
      />

      <circle
        cx="20"
        cy="16"
        r="8"
        stroke="currentColor"
        strokeWidth="2.4"
      />
    </svg>
  </span>
</a>
  </div>
</article>

              {/* Card 2: SecureDeFiLending */}
              <article className="portfolio-project-card">
  <div>
    <span className="portfolio-card-badge">
      ETHEREUM // GAME THEORY // DEFI
    </span>

    <h4 className="portfolio-project-name">
      SecureDeFiLending
    </h4>

    <p className="portfolio-project-quote">
      &ldquo;SecureDeFiLending&rdquo; — Research and prototyping of
      game-theoretic models for improving trust, transaction efficiency,
      and risk management in decentralized finance systems.
    </p>

    <div className="portfolio-project-details">
      <p>
        - Researched and prototyped game-theoretic models to enhance trust,
        optimize transactions, and minimize risks across decentralized
        financial systems.
      </p>

      <p>
        - Built mathematical models to evaluate transaction behaviour,
        participant incentives, and strategic interactions within
        blockchain networks.
      </p>
    </div>

    <div className="portfolio-tech-tags">
      <span className="portfolio-tech-tag">Blockchain</span>
      <span className="portfolio-tech-tag">Solidity</span>
      
      <span className="portfolio-tech-tag">Game Theory</span>
      <span className="portfolio-tech-tag">Probability</span>
    </div>
  </div>

  <div className="portfolio-project-links">
    {/* View Repository Box for SecureDeFiLendingOptimized */}
    <a
      href="https://github.com/theskepticgeek/SecureDeFiLendingOptimized"
      target="_blank"
      rel="noopener noreferrer"
      className="portfolio-repo-box"
      title="View SecureDeFiLendingOptimized repository on GitHub"
    >
      <span className="portfolio-repo-icon">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </span>

     
      
    </a>
  </div>
</article>
            </div>
          </section>

          {/* ==================================================================
              CURRENT WORK SECTION
              ================================================================== */}
          <section
            id="current-work"
            className="portfolio-section-divider"
            aria-label="Current Work &amp; Research"
          >
            <div className="portfolio-section-head">
              <h3 className="portfolio-section-title">Current Work</h3>
              <p className="portfolio-section-sub">
                ACTIVE QUANTITATIVE FINANCE RESEARCH &amp; PROTOCOL PROTOTYPING
              </p>
            </div>
<div className="portfolio-current-work-grid">
            <article className="portfolio-project-card">
  <div>
    <span className="portfolio-card-badge">
      RESEARCH // QUANT FINANCE // DEFI
    </span>

    <h4 className="portfolio-project-name">
      AI-Driven DeFi Agent Simulation
    </h4>

    <p className="portfolio-project-quote">
      Building an AI-driven DeFi simulation where autonomous agents perform
      transactions and make human-like decisions.
    </p>

    <div className="portfolio-project-details">
      <p>
        - Integrating game-theoretic mechanisms from my previous research
        to study how AI nodes react to incentives, risk and strategic behavior.
      </p>

      <p>
        - Simulating autonomous DeFi participants to observe how different
        agent behaviors emerge under changing market conditions and
        game-theoretic incentives.
      </p>
    </div>

    <div className="portfolio-tech-tags">
      <span className="portfolio-tech-tag">AI Agents</span>
      <span className="portfolio-tech-tag">DeFi</span>
      <span className="portfolio-tech-tag">Game Theory</span>
      <span className="portfolio-tech-tag">Multi-Agent Systems</span>
      <span className="portfolio-tech-tag">Behavior Modeling</span>
    </div>
  </div>

  <div>
    <span className="portfolio-card-badge">
      IN DEVELOPMENT
    </span>
  </div>
</article>
            <article className="portfolio-project-card">
  <div>
    <span className="portfolio-card-badge">
      OPTIONS // MARKET MICROSTRUCTURE // ALGO TRADING
    </span>

    <h4 className="portfolio-project-name">
      Options Market Microstructure &amp; Algorithmic Trading
    </h4>

    <p className="portfolio-project-quote">
      Studying how option-chain activity relates to short-term market
      movement and how those signals can be translated into systematic
      trading strategies.
    </p>

    <div className="portfolio-project-details">
      <p>
        - Analyzing changes in open interest, volume, implied volatility
        and strike positioning across the option chain.
      </p>

      <p>
        - Building an option-chain simulation and backtesting framework
        to evaluate OI-driven algorithmic trading strategies.
      </p>
    </div>

    <div className="portfolio-tech-tags">
      <span className="portfolio-tech-tag">Options</span>
      <span className="portfolio-tech-tag">Open Interest</span>
      <span className="portfolio-tech-tag">Algorithmic Trading</span>
      <span className="portfolio-tech-tag">Backtesting</span>
      <span className="portfolio-tech-tag">Python</span>
    </div>
  </div>

  <div>
    <span className="portfolio-card-badge">
      IN DEVELOPMENT
    </span>
  </div>
</article>
</div>
          </section>

          {/* ==================================================================
              1. RESEARCH SECTION
              ================================================================== */}
          <section
            id="research"
            className="portfolio-section-divider portfolio-section-research"
            aria-label="Published Research"
          >
            <div className="portfolio-section-head">
              <h3 className="portfolio-section-title">RESEARCH</h3>
              <p className="portfolio-section-sub">
                GAME THEORY // DECENTRALIZED FINANCE // INCENTIVE DESIGN
              </p>
            </div>

            <article className="portfolio-research-card">
              <div className="portfolio-research-meta-row">
                <span className="portfolio-card-badge">
                  PUBLISHED RESEARCH // BLOCKCHAIN + GAME THEORY
                </span>
                <span className="portfolio-research-springer">
                  SPRINGER // RESEARCH PUBLICATION
                </span>
              </div>

              <h4 className="portfolio-research-title">
                Strategic Game Theory Implementation in Blockchain-Based DeFi
              </h4>

              <p className="portfolio-research-para">
                My research explores how strategic game-theoretic mechanisms can improve trust,
                cooperation and risk management in decentralized financial systems.
              </p>
              <p className="portfolio-research-para">
                The work models interactions between borrowers and lenders using repeated games
                while integrating dynamic reputation, collateral requirements, interest rates and
                penalties into blockchain-based lending infrastructure.
              </p>
              <p className="portfolio-research-para">
                The objective is to design decentralized financial protocols where rational
                participant incentives naturally encourage trustworthy behaviour without
                depending on centralized intermediaries.
              </p>

              <div className="portfolio-tech-tags">
                <span className="portfolio-tech-tag">Game Theory</span>
                <span className="portfolio-tech-tag">DeFi</span>
                <span className="portfolio-tech-tag">Blockchain</span>
                <span className="portfolio-tech-tag">Dynamic Reputation</span>
                <span className="portfolio-tech-tag">Smart Contracts</span>
                <span className="portfolio-tech-tag">Mechanism Design</span>
              </div>

              <div>
                <a
                  href="https://link.springer.com/chapter/10.1007/978-3-032-18985-1_1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-research-cta"
                  title="Read published paper on Springer"
                >
                  <span>READ PUBLISHED PAPER</span>
                  <span style={{ fontSize: "14px" }}>↗</span>
                </a>
              </div>
            </article>
          </section>

          {/* ==================================================================
              2. EXPERIENCE SECTION
              ================================================================== */}
          <section
            id="experience"
            className="portfolio-section-divider portfolio-section-experience"
            aria-label="Experience"
          >
            <div className="portfolio-section-head">
              <h3 className="portfolio-section-title">EXPERIENCE</h3>
              <p className="portfolio-section-sub">
                BUILDING // RESEARCHING // LEADING
              </p>
            </div>

            <div className="portfolio-experience-list">
              {/* Experience 1: HoloRecruit — most prominent */}
              <article className="portfolio-exp-card portfolio-exp-primary">
                <div className="portfolio-exp-header">
                  <div>
                    <h4 className="portfolio-exp-title">HoloRecruit</h4>
                    <p className="portfolio-exp-role">Co-Founder &amp; Managing Director</p>
                  </div>
                  <span className="portfolio-card-badge">
                    March 2025 - Present
                  </span>
                </div>

                <p className="portfolio-exp-desc">
                  Building an immersive recruitment platform combining Virtual Reality and
                  Artificial Intelligence to create structured interview environments,
                  behavioural evaluation systems and simulated recruitment experiences.
                  My work spans product strategy, technical architecture, research,
                  prototyping and the long-term development of verifiable recruitment infrastructure.
                </p>

                <div className="portfolio-tech-tags" style={{ marginTop: "16px" }}>
                  <span className="portfolio-tech-tag">VR</span>
                  <span className="portfolio-tech-tag">Artificial Intelligence</span>
                  <span className="portfolio-tech-tag">Product Development</span>
                  <span className="portfolio-tech-tag">Research</span>
                  <span className="portfolio-tech-tag">Blockchain Verification</span>
                </div>
              </article>

              {/* Experience 2: Blockchain & DeFi Research */}
              <article className="portfolio-exp-card">
                <div className="portfolio-exp-header">
                  <div>
                    <h4 className="portfolio-exp-title">Blockchain &amp; DeFi Research</h4>
                    <p className="portfolio-exp-role">Researcher</p>
                  </div>
                  <span className="portfolio-card-badge">
                    Sept 2024 - Present
                  </span>
                </div>

                <p className="portfolio-exp-desc">
                  Researching decentralized financial systems with a focus on game theory,
                  incentive mechanisms, reputation models and trust-minimized protocol design.
                  My work combines mathematical modelling with Solidity-based implementation to
                  explore how decentralized systems can align participant incentives with protocol stability.
                </p>

                <div className="portfolio-tech-tags" style={{ marginTop: "16px" }}>
                  <span className="portfolio-tech-tag">Game Theory</span>
                  <span className="portfolio-tech-tag">DeFi</span>
                  <span className="portfolio-tech-tag">Solidity</span>
                  <span className="portfolio-tech-tag">Mechanism Design</span>
                  <span className="portfolio-tech-tag">Protocol Research</span>
                </div>
              </article>

            
            </div>
          </section>

          {/* ==================================================================
              3. TECH STACK SECTION
              ================================================================== */}
          <section
            id="tech-stack"
            className="portfolio-section-divider portfolio-section-techstack"
            aria-label="Tech Stack"
          >
            <div className="portfolio-section-head">
              <h3 className="portfolio-section-title">Tech Stack</h3>
              
            </div>

            <div className="portfolio-tech-dashboard">
              {/* Card 1: Languages */}
              <div className="portfolio-tech-card">
                <div className="portfolio-tech-cat-header">LANGUAGES</div>
                <div className="portfolio-tech-pills">
                  <span className="portfolio-tech-pill-item">Python</span>
                  <span className="portfolio-tech-pill-item">JavaScript</span>
                  <span className="portfolio-tech-pill-item">C++</span>
                  <span className="portfolio-tech-pill-item">Java</span>
                  <span className="portfolio-tech-pill-item">Solidity</span>
                </div>
              </div>

              {/* Card 2: Blockchain */}
              <div className="portfolio-tech-card">
                <div className="portfolio-tech-cat-header">BLOCKCHAIN</div>
                <div className="portfolio-tech-pills">
                  <span className="portfolio-tech-pill-item">Ethereum</span>
                  
                  <span className="portfolio-tech-pill-item">Web3.js</span>
                  <span className="portfolio-tech-pill-item">Ethers.js</span>
                  <span className="portfolio-tech-pill-item">Celo</span>
                  <span className="portfolio-tech-pill-item">Polygon</span>
                  <span className="portfolio-tech-pill-item">Hardhat</span>
                  <span className="portfolio-tech-pill-item">EVM</span>
                  <span className="portfolio-tech-pill-item">Smart Contracts</span>
                  <span className="portfolio-tech-pill-item">ERC Standards</span>
                </div>
              </div>

              {/* Card 3: Web */}
              <div className="portfolio-tech-card">
                <div className="portfolio-tech-cat-header">WEB</div>
                <div className="portfolio-tech-pills">
                  <span className="portfolio-tech-pill-item">React</span>
                  <span className="portfolio-tech-pill-item">Next.js</span>
                  <span className="portfolio-tech-pill-item">Three.js</span>
                  <span className="portfolio-tech-pill-item">WebGL</span>
                  <span className="portfolio-tech-pill-item">REST APIs</span>
                </div>
              </div>

              {/* Card 4: Machine Learning */}
              <div className="portfolio-tech-card">
                <div className="portfolio-tech-cat-header">MACHINE LEARNING</div>
                <div className="portfolio-tech-pills">
                  <span className="portfolio-tech-pill-item">PyTorch</span>
                  <span className="portfolio-tech-pill-item">TensorFlow</span>
                  <span className="portfolio-tech-pill-item">scikit-learn</span>
                </div>
              </div>

              {/* Card 5: Infrastructure */}
              <div className="portfolio-tech-card">
                <div className="portfolio-tech-cat-header">INFRASTRUCTURE</div>
                <div className="portfolio-tech-pills">
                  <span className="portfolio-tech-pill-item">Linux</span>
                  <span className="portfolio-tech-pill-item">Git</span>
                  <span className="portfolio-tech-pill-item">IPFS</span>
                  <span className="portfolio-tech-pill-item">Pinata</span>
                </div>
              </div>

              {/* Card 6: Research */}
              <div className="portfolio-tech-card">
                <div className="portfolio-tech-cat-header">RESEARCH</div>
                <div className="portfolio-tech-pills">
                  <span className="portfolio-tech-pill-item">Game Theory</span>
                  <span className="portfolio-tech-pill-item">Quantitative Modelling</span>
                  <span className="portfolio-tech-pill-item">Stochastic Processes</span>
                  <span className="portfolio-tech-pill-item">DeFi</span>
                  <span className="portfolio-tech-pill-item">Mechanism Design</span>
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================================
              4. EDUCATION SECTION
              ================================================================== */}
          <section
            id="education"
            className="portfolio-section-divider portfolio-section-education"
            aria-label="Education"
          >
            <div className="portfolio-section-head">
              <h3 className="portfolio-section-title">EDUCATION</h3>
              
            </div>

            <article className="portfolio-education-card">
              <div className="portfolio-edu-header-row">
                <div>
                  <h4 className="portfolio-edu-inst">JIS College of Engineering</h4>
                  <p className="portfolio-edu-degree">
                    B.Tech in Computer Science and Technology
                  </p>
                  <p className="portfolio-edu-loc">Kalyani, West Bengal, India</p>
                </div>
                <span className="portfolio-card-badge" style={{ alignSelf: "flex-start", whiteSpace: "nowrap" }}>
                  Sept 2024 - Ongoing
                </span>
              </div>

              <p className="portfolio-edu-desc">
                My academic work in computer science forms the foundation for my broader
                interests in decentralized systems, machine learning, mathematics and
                quantitative modelling. Much of my learning extends beyond the formal
                curriculum through research papers, independent projects, hackathons and
                experimental systems.
              </p>

              <div className="portfolio-tech-tags">
                <span className="portfolio-tech-tag">Computer Science</span>
                <span className="portfolio-tech-tag">Blockchain</span>
                <span className="portfolio-tech-tag">Mathematics</span>
                <span className="portfolio-tech-tag">Machine Learning</span>
                <span className="portfolio-tech-tag">Quantitative Finance</span>
              </div>
            </article>
          </section>

          {/* ==================================================================
              5. CONTACT SECTION
              ================================================================== */}
          <section
            id="contact"
            className="portfolio-section-divider portfolio-section-contact"
            aria-label="Contact"
          >
            <div className="portfolio-contact-card">
              <span className="portfolio-card-badge">
                OPEN TO // RESEARCH // COLLABORATION // ENGINEERING
              </span>

              <h3 className="portfolio-contact-heading">
                LET&apos;S BUILD SOMETHING INTERESTING.
              </h3>

              <p className="portfolio-contact-body">
                I am always interested in conversations around blockchain research,
                quantitative finance, decentralized infrastructure, game theory and
                experimental technology. If you are working on something unusual,
                research-driven or technically ambitious, feel free to reach out.
              </p>

              <div className="portfolio-contact-actions">
  {/* Gmail */}
  <a
    href="mailto:krrishdubey12@gmail.com"
    className="portfolio-contact-cta portfolio-contact-icon-link"
    title="Send an email"
    aria-label="Email Krrish"
  >
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="portfolio-contact-glyph"
    >
      <path d="M2 5.5A2.5 2.5 0 014.5 3h15A2.5 2.5 0 0122 5.5v13A2.5 2.5 0 0119.5 21h-15A2.5 2.5 0 012 18.5v-13zm2.15-.3L12 11.3l7.85-6.1A.9.9 0 0019.5 5h-15a.9.9 0 00-.35.2zM4 7.35V18.5c0 .28.22.5.5.5h15a.5.5 0 00.5-.5V7.35l-7.39 5.75a1 1 0 01-1.22 0L4 7.35z" />
    </svg>

    <span>GET IN TOUCH</span>
    <span style={{ fontSize: "15px" }}>↗</span>
  </a>

  {/* WhatsApp */}
  <a
    href="https://wa.me/919330754965"
    target="_blank"
    rel="noopener noreferrer"
    className="portfolio-contact-cta portfolio-contact-icon-link portfolio-contact-whatsapp"
    title="Message on WhatsApp"
    aria-label="Message Krrish on WhatsApp"
  >
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="portfolio-contact-glyph"
    >
      <path d="M12.04 2A9.87 9.87 0 003.6 17.05L2 22l5.1-1.55A9.98 9.98 0 1012.04 2zm0 17.95a8.1 8.1 0 01-4.13-1.13l-.3-.18-3.03.92.98-2.94-.2-.3a8.08 8.08 0 116.68 3.63zm4.44-6.08c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>

    <span>WHATSAPP</span>
    <span style={{ fontSize: "15px" }}>↗</span>
  </a>
</div>

              {/* Contact / Social Links below CTA */}
              <div className="portfolio-contact-socials-grid">
                {/* GitHub */}
                <a
                  href="https://github.com/theskepticgeek"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-social-link"
                  title="GitHub @theskepticgeek"
                >
                  <div className="portfolio-social-left">
                    <span className="portfolio-social-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </span>
                    <div className="portfolio-social-info">
                      <span className="portfolio-social-name">GitHub</span>
                      <span className="portfolio-social-handle">@theskepticgeek</span>
                    </div>
                  </div>
                  <span className="portfolio-social-arrow">↗</span>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/krrishdubey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-social-link"
                  title="LinkedIn /in/krrishdubey"
                >
                  <div className="portfolio-social-left">
                    <span className="portfolio-social-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </span>
                    <div className="portfolio-social-info">
                      <span className="portfolio-social-name">LinkedIn</span>
                      <span className="portfolio-social-handle">in/krrishdubey</span>
                    </div>
                  </div>
                  <span className="portfolio-social-arrow">↗</span>
                </a>

                {/* X */}
                <a
                  href="https://x.com/0xKrrish01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-social-link"
                  title="X @0xKrrish01"
                >
                  <div className="portfolio-social-left">
                    <span className="portfolio-social-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </span>
                    <div className="portfolio-social-info">
                      <span className="portfolio-social-name">X</span>
                      <span className="portfolio-social-handle">@0xKrrish01</span>
                    </div>
                  </div>
                  <span className="portfolio-social-arrow">↗</span>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/krriiiiishd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-social-link"
                  title="Instagram @krriiiiishd"
                >
                  <div className="portfolio-social-left">
                    <span className="portfolio-social-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </span>
                    <div className="portfolio-social-info">
                      <span className="portfolio-social-name">Instagram</span>
                      <span className="portfolio-social-handle">@krriiiiishd</span>
                    </div>
                  </div>
                  <span className="portfolio-social-arrow">↗</span>
                </a>
              </div>
            </div>
          </section>

          {/* ==================================================================
              6. FOOTER (Redesigned)
              ================================================================== */}
          <footer className="portfolio-footer-redesign">
            <div className="portfolio-footer-left">
              <span className="portfolio-footer-name">KRRISH DUBEY</span>
              <span className="portfolio-footer-subtitle">
                WEB3 // RESEARCH // Quantitative Finance
              </span>
            </div>

            <div className="portfolio-footer-center">
              Built somewhere between mathematics, code and curiosity.
            </div>

            <div className="portfolio-footer-right">
              <span className="portfolio-footer-copy">© 2026 Krrish Dubey</span>
              <button
                onClick={scrollToTop}
                className="portfolio-scroll-top"
                title="Return to top of portfolio"
              >
                ↑ BACK TO TOP
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
