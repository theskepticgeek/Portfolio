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
          <section id="about" className="portfolio-hero-grid" aria-label="Introduction and Social Links">
            {/* Left Column: Picture + White Who I am Box + Buttons */}
            <div className="portfolio-profile-row">
              {/* Profile Picture in Circle Frame */}
              <div className="portfolio-photo-frame">
                <img
                  src="/picture.jpg"
                  alt="Krrish Dubey"
                  className="portfolio-photo-img"
                />
              </div>

              {/* Information Column */}
              <div className="portfolio-profile-info">
                {/* White Box for 'Who I am' with complementing text fonts and color */}
                <div className="portfolio-white-box">
                  <h2 className="portfolio-who-title">Who I am</h2>
                  <p className="portfolio-who-desc">
                    I am a web3 developer and B.tech CS student. My work
                    focusses on building DeFi protocols and blockchain based
                    systems that promote transparency and sustainability in
                    finance and resource management. I am also researching and
                    working on various quant finance projects .
                  </p>

                  <div className="portfolio-white-pills">
                    <span className="portfolio-white-pill">⚡ DeFi Protocols</span>
                    <span className="portfolio-white-pill">🌐 Web3 &amp; Blockchain</span>
                    <span className="portfolio-white-pill">📈 Quant Finance</span>
                    <span className="portfolio-white-pill">🌱 Sustainability</span>
                    <span className="portfolio-white-pill">🎓 B.Tech CS</span>
                  </div>
                </div>

                {/* Beneath Who I am box: "View Projects" and "Current Work" */}
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
                    <span className="portfolio-btn-arrow">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Social Elements Box (GitHub, LinkedIn, X, Instagram) */}
            <aside className="portfolio-social-card" aria-label="Social connections">
              <span className="portfolio-social-label">
                <span>✦</span> CONNECT // SOCIALS
              </span>

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
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
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
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
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

              {/* X (formerly Twitter) */}
              <a
                href="https://x.com/0xKrrish01"
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-social-link"
                title="X @0xKrrish01"
              >
                <div className="portfolio-social-left">
                  <span className="portfolio-social-icon">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
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
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
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
            </aside>
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
                ARCHITECTING TRANSPARENT PROTOCOLS &amp; QUANTITATIVE SYSTEMS
              </p>
            </div>

            {/* Two Cards with the same translucent bg */}
            <div className="portfolio-projects-grid">
              {/* Card 1: EcoQuant */}
              <article className="portfolio-project-card">
                <div>
                  <span className="portfolio-card-badge">REFI // AI AUDITING</span>
                  <h4 className="portfolio-project-name">EcoQuant</h4>
                  <p className="portfolio-project-quote">
                    &ldquo;EcoQuant&rdquo; - Revolutionizing Carbon Credits through
                    Transparent Tokenization &amp; AI-Driven Verification
                  </p>
                  <p className="portfolio-project-details">
                    Eliminates greenwashing and double-counting in carbon credit
                    markets. Couples automated satellite data telemetry and
                    machine-learning verification pipelines with on-chain token
                    minting, establishing immutable provenance and auditable
                    ecological metrics.
                  </p>

                  <div className="portfolio-tech-tags">
                    <span className="portfolio-tech-tag">AI Verification</span>
                    <span className="portfolio-tech-tag">Tokenization</span>
                    <span className="portfolio-tech-tag">Carbon Credits</span>
                    <span className="portfolio-tech-tag">Solidity</span>
                    <span className="portfolio-tech-tag">IPFS</span>
                  </div>
                </div>

                <div>
                  {/* View Repository Box for EcoQuant */}
                  <a
                    href="https://github.com/theskepticgeek/EcoQuant"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portfolio-repo-box"
                    title="View EcoQuant repository on GitHub"
                  >
                    <span className="portfolio-repo-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </span>
                    <span>View Repository</span>
                    <span className="portfolio-repo-arrow">↗</span>
                  </a>
                </div>
              </article>

              {/* Card 2: SecureDeFiLending */}
              <article className="portfolio-project-card">
                <div>
                  <span className="portfolio-card-badge">ETHEREUM // GAME THEORY</span>
                  <h4 className="portfolio-project-name">SecureDeFiLending</h4>
                  <p className="portfolio-project-quote">
                    &ldquo;SecureDeFiLending&rdquo; - A Game-Theoretic Smart
                    Contract for Decentralized Lending on Ethereum, integrating
                    dynamic reputation systems, collateral-backed loans, and
                    trust-based incentives.
                  </p>
                  <p className="portfolio-project-details">
                    Engineers non-cooperative game theory into decentralized loan
                    origination. Dynamically updates borrower reputation metrics
                    based on historical repayment behavior, minimizing capital
                    inefficiency from extreme over-collateralization while
                    enforcing mathematical solvency.
                  </p>

                  <div className="portfolio-tech-tags">
                    <span className="portfolio-tech-tag">Game Theory</span>
                    <span className="portfolio-tech-tag">DeFi Lending</span>
                    <span className="portfolio-tech-tag">Ethereum</span>
                    <span className="portfolio-tech-tag">Dynamic Reputation</span>
                    <span className="portfolio-tech-tag">Smart Contracts</span>
                  </div>
                </div>

                <div>
                  {/* View Repository Box for SecureDeFiLendingOptimized */}
                  <a
                    href="https://github.com/theskepticgeek/SecureDeFiLendingOptimized"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portfolio-repo-box"
                    title="View SecureDeFiLendingOptimized repository on GitHub"
                  >
                    <span className="portfolio-repo-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </span>
                    <span>View Repository</span>
                    <span className="portfolio-repo-arrow">↗</span>
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

            <article className="portfolio-current-card">
              <span className="portfolio-card-badge">RESEARCH // QUANT FINANCE</span>
              <h4 className="portfolio-project-name" style={{ marginTop: "12px" }}>
                Quantitative Finance &amp; Decentralized Protocol Modeling
              </h4>
              <p className="portfolio-project-quote" style={{ color: "#cbd5e1" }}>
                Currently researching mathematical models for Automated Market Makers
                (AMMs), concentrated liquidity efficiency, and stochastic volatility
                forecasting across decentralized exchange topologies. Exploring
                game-theoretic incentives to build trust-minimized, sustainable
                financial infrastructure.
              </p>

              <div className="portfolio-tech-tags">
                <span className="portfolio-tech-tag">AMM Curves</span>
                <span className="portfolio-tech-tag">Quant Finance</span>
                <span className="portfolio-tech-tag">Stochastic Models</span>
                <span className="portfolio-tech-tag">Protocol Mechanics</span>
                <span className="portfolio-tech-tag">Mechanism Design</span>
              </div>
            </article>
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
                    STARTUP // PRODUCT &amp; RESEARCH
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
                    ACADEMIC &amp; PROTOCOL RESEARCH
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

              {/* Experience 3: Research Paper Review — slightly smaller / compact */}
              <article className="portfolio-exp-card portfolio-exp-compact">
                <div className="portfolio-exp-header">
                  <div>
                    <h4 className="portfolio-exp-title" style={{ fontSize: "18px" }}>
                      Research Paper Review &amp; Technical Research
                    </h4>
                  </div>
                  <span className="portfolio-card-badge" style={{ fontSize: "8.5px" }}>
                    LITERATURE ANALYSIS
                  </span>
                </div>

                <p className="portfolio-exp-desc">
                  Worked on reviewing technical and academic literature across computer
                  science and emerging technology domains, strengthening my ability to
                  evaluate methodology, system design, research claims and experimental results.
                </p>
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
              <h3 className="portfolio-section-title">TECH STACK</h3>
              <p className="portfolio-section-sub">
                TOOLS // SYSTEMS // LANGUAGES
              </p>
            </div>

            <div className="portfolio-tech-dashboard">
              {/* Card 1: Languages */}
              <div className="portfolio-tech-card">
                <div className="portfolio-tech-cat-header">01 // LANGUAGES</div>
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
                <div className="portfolio-tech-cat-header">02 // BLOCKCHAIN</div>
                <div className="portfolio-tech-pills">
                  <span className="portfolio-tech-pill-item">Ethereum</span>
                  <span className="portfolio-tech-pill-item">EVM</span>
                  <span className="portfolio-tech-pill-item">Celo</span>
                  <span className="portfolio-tech-pill-item">Polygon</span>
                  <span className="portfolio-tech-pill-item">Hardhat</span>
                  <span className="portfolio-tech-pill-item">Smart Contracts</span>
                  <span className="portfolio-tech-pill-item">ERC Standards</span>
                </div>
              </div>

              {/* Card 3: Web */}
              <div className="portfolio-tech-card">
                <div className="portfolio-tech-cat-header">03 // WEB</div>
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
                <div className="portfolio-tech-cat-header">04 // MACHINE LEARNING</div>
                <div className="portfolio-tech-pills">
                  <span className="portfolio-tech-pill-item">PyTorch</span>
                  <span className="portfolio-tech-pill-item">TensorFlow</span>
                  <span className="portfolio-tech-pill-item">scikit-learn</span>
                </div>
              </div>

              {/* Card 5: Infrastructure */}
              <div className="portfolio-tech-card">
                <div className="portfolio-tech-cat-header">05 // INFRASTRUCTURE</div>
                <div className="portfolio-tech-pills">
                  <span className="portfolio-tech-pill-item">Linux</span>
                  <span className="portfolio-tech-pill-item">Git</span>
                  <span className="portfolio-tech-pill-item">IPFS</span>
                  <span className="portfolio-tech-pill-item">Pinata</span>
                </div>
              </div>

              {/* Card 6: Research */}
              <div className="portfolio-tech-card">
                <div className="portfolio-tech-cat-header">06 // RESEARCH</div>
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
              <p className="portfolio-section-sub">
                COMPUTER SCIENCE // MATHEMATICS // RESEARCH
              </p>
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
                  B.TECH // CS
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
                quantitative systems, decentralized infrastructure, game theory and
                experimental technology. If you are working on something unusual,
                research-driven or technically ambitious, feel free to reach out.
              </p>

              <div>
                <a
                  href="mailto:krrishdubey12@gmail.com"
                  className="portfolio-contact-cta"
                  title="Send an email"
                >
                  <span>GET IN TOUCH</span>
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
                WEB3 // RESEARCH // QUANTITATIVE SYSTEMS
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
