import React, { useEffect, useRef, useState, useMemo } from "react";
import { FullPageScroller } from "./components/FullPageScroller";
import { Section } from "./components/Section";
import { NavigationDots } from "./components/NavigationDots";
import { ChevronDownIcon, IterationCcw, RefreshCw } from "lucide-react";
import { ValueRow } from "./components/ValueRow";
import { buildDisplay, type Display } from "./utils/deckDisplay";
import type { FullDeckV1 } from "./types/deck";
import { ValueRowBalanced } from "./components/ValueRowBalanced";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorScreen } from "./components/ErrorScreen";
import SnapshotTrend from "./components/SnapshotTrend";
import CagrContrastChart from "./components/CagrContrastChart";

export function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showDots, setShowDots] = useState(true);
  const hideTimer = useRef<number | null>(null);

  // NEW: deck state
  const [deck, setDeck] = useState<FullDeckV1 | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const API_BASE = String(import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");
  const DEFAULT_DECK_ID = Number.parseInt(String(import.meta.env.VITE_DEFAULT_DECK_ID ?? ""), 10);
  const HAS_DEFAULT_DECK = Number.isFinite(DEFAULT_DECK_ID);
  const UNITS_PER_100_THRESHOLD = Number(import.meta.env.VITE_UNITS_PER_100_THRESHOLD ?? 2);
  const BASE = import.meta.env.BASE_URL ?? "/"; // from Vite's `base`

  // Turn "items/x.png" or "/items/x.png" into "/inflation-effect/items/x.png"
  const asset = (p: string) => `${BASE}${String(p).replace(/^\/+/, "")}`;
  // Make item.image_url robust (handles http(s), data:, or relative)
  const resolveImage = (src?: string) => {
    if (!src) return asset("items/bitcoin.png");
    if (/^(https?:|data:)/i.test(src)) return src; // already absolute
    return asset(src);
  };

  async function fetchRandomDeck(signal?: AbortSignal) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/v1/deck/random`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: FullDeckV1 = await res.json();
      setDeck(json);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDeckById(id: number, signal?: AbortSignal) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/v1/deck/${id}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: FullDeckV1 = await res.json();
      setDeck(json);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  const nextItem = async () => {
    if (loading) return; // guard against double-clicks
    setShowDots(true);
    setActiveSection(0);

    // Scroll the scroller (not the window) back to the top
    scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });

    // Clear current deck so the LoadingScreen can show while we fetch
    setDeck(null);

    // Optionally cancel an in-flight request
    const ac = new AbortController();
    await fetchRandomDeck(ac.signal);
  };

  // On mount: get a random deck
  useEffect(() => {
    const ac = new AbortController();
    if (HAS_DEFAULT_DECK) {
      fetchDeckById(DEFAULT_DECK_ID, ac.signal);
    } else {
      fetchRandomDeck(ac.signal);
    }
    return () => ac.abort();
  }, []);

  // Build the formatted overlay only when deck is ready
  const display: Display | null = useMemo(
    () => (deck ? buildDisplay(deck) : null),
    [deck]
  );

  // EFFECT #1: track which section is closest while scrolling
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (!showDots) setShowDots(true);
      const sections = Array.from(el.querySelectorAll(".section"));
      let closest = 0, min = Infinity;
      sections.forEach((s, idx) => {
        const rect = s.getBoundingClientRect();
        const dist = Math.abs(rect.top);
        if (dist < min) { min = dist; closest = idx; }
      });
      setActiveSection(closest);
      scheduleHide();
    };
    const showNow = () => { setShowDots(true); scheduleHide(); };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", showNow, { passive: true });
    el.addEventListener("touchstart", showNow, { passive: true });
    window.addEventListener("keydown", showNow);
    scheduleHide();
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", showNow);
      el.removeEventListener("touchstart", showNow);
      window.removeEventListener("keydown", showNow);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [showDots]); // runs every render but always in the same order

  // EFFECT #2: track total sections
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const countSections = () => {
      const count = el.querySelectorAll("section.section").length;
      setTotalSections(count);
      setActiveSection(prev => Math.max(0, Math.min(prev, count - 1)));
    };
    countSections();
    const mo = new MutationObserver(countSections);
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  // Simple loading/error gate (rendered inside the same render pass,
  // AFTER we’ve already called our hooks)
  if (loading && !display) { return <LoadingScreen />; }
  if (err && !display) { return <ErrorScreen err={err} onRetry={() => fetchRandomDeck()} />; }
  if (!display) return null;

  // Convenience
  const ITEM_NAME = display.item.name.toLowerCase();

  // All derived metrics come from buildDisplay
  const { metrics } = display;

  // $100 purchasing power availability
  const hasUnitsPer100 = [
    Number(display.snapshots.y10.unitsPer100 ?? 0),
    Number(display.snapshots.y5.unitsPer100 ?? 0),
    Number(display.snapshots.y0.unitsPer100 ?? 0),
  ].some(v => v >= UNITS_PER_100_THRESHOLD);

  const scheduleHide = (delay = 500) => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowDots(false), delay);
  };

  const handleDotClick = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const sections = el.querySelectorAll("section.section");
    const target = sections[index] as HTMLElement | undefined;

    setShowDots(true);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    scheduleHide();
  };

  return (
    <div className="bg-black text-gray-200 min-h-screen">
      <FullPageScroller ref={scrollerRef}>
        {/* Hook / Hero (image-forward, no snapshots) */}
        <Section id="section-0" className="flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-bold text-subheader leading-tight mb-6">
            What does <span className="text-brandGold">inflation</span> really mean for you?
          </h1>

          {/* Image-first hero */}
          <div className="w-full max-w-3xl mb-6">
            <img
              src={resolveImage(display.item.image_url)}
              alt={`Image of ${ITEM_NAME}`}
              className="w-full h-[38vh] object-cover rounded-2xl shadow-xl mx-auto"
            />
          </div>

          <p className="text-body opacity-85 max-w-[65ch]">
            Let’s look at <span className="font-semibold">{ITEM_NAME}</span>.
          </p>
          <button
            onClick={nextItem}
            aria-label="Show another item"
            className="mt-2 text-sm text-brandGold hover:text-gray-200
                      inline-flex items-center gap-1 no-underline hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            View a different item
          </button>

          <div className="absolute bottom-8 sm:bottom-10 animate-bounce">
            <ChevronDownIcon size={28} className="text-brandGold" />
          </div>
        </Section>

        {/* Reality Check (Fiat View) */}
        <Section id="section-1" className="flex flex-col items-center justify-center px-6">
          <h2 className="text-subheader font-bold mb-6 text-center">
            Your {ITEM_NAME} <span className="text-brandGold">{display.item.unit}</span> keeps getting more <span className="text-brandGold">expensive</span>.
          </h2>
          <div className="w-full max-w-3xl space-y-3">
            <ValueRow left={`${display.snapshots.y10.year}`} right={display.snapshots.y10.fiat} middle="10 yrs ago"/>
            <ValueRow left={`${display.snapshots.y5.year}`} right={display.snapshots.y5.fiat} middle="5 yrs ago"/>
            <ValueRow left={`${display.snapshots.y0.year}`} right={display.snapshots.y0.fiat} middle="Today"/>
          </div>
          <details className="mt-4 text-xs opacity-70">
            <summary className="cursor-pointer text-center">Source</summary>
            <div className="mt-2 opacity-60">{display.item.source_method}</div>
          </details>
        </Section>

        {/* The Pain in % Terms */}
        <Section id="section-2" className="flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-subheader font-bold mb-3">
            The same {ITEM_NAME} now costs much more.
          </h2>
          <p className="text-body opacity-85">
            {metrics.pctChange5Text} price increase in the last 5 years.
          </p>
          <p className="text-body opacity-85 mb-6">
            {metrics.pctChange10Text} price increase in the last 10 years.
          </p>
          <div className="w-full max-w-3xl h-52 sm:h-64 md:h-72">
            <SnapshotTrend points={metrics.snapshotTrendPoints} currency="CAD" />
          </div>
          <p className="mt-3 text-xs opacity-60">
            Trend of average price of {ITEM_NAME} across the last 15 years.
          </p>
        </Section>

        {/* $100 Bill – purchasing power (Conditional) */}
        {hasUnitsPer100 && (
          <Section id="section-3" className="flex flex-col items-center justify-center px-6">
            <h2 className="text-subheader font-bold text-center mb-2">
              What happened to your <span className="text-brandGold">$100</span> bill?
            </h2>
            <p className="opacity-85 text-body text-center mb-6">
              How many {ITEM_NAME} could $100 buy?
            </p>

            <div className="w-full max-w-3xl space-y-3">
              <ValueRow
                left={`${display.snapshots.y10.year}`}
                middle="10 yrs ago"
                right={`${display.snapshots.y10.unitsPer100} units`}
              />
              <ValueRow
                left={`${display.snapshots.y5.year}`}
                middle="5 yrs ago"
                right={`${display.snapshots.y5.unitsPer100} units`}
              />
              <ValueRow
                left={`${display.snapshots.y0.year}`}
                middle="Today"
                right={`${display.snapshots.y0.unitsPer100} units`}
              />
            </div>

            <p className="mt-4 text-small opacity-60 text-center mb-6">
              Computed as 100 ÷ price_at_year.
            </p>
            <p className="opacity-85 text-body text-center">
              Your $100 is <span className="text-brandGold">getting weaker</span> vs {ITEM_NAME}!
            </p>
          </Section>
        )}

        {/* Why prices rise (Item-specific list)
        <Section id="section-4" className="flex flex-col items-center justify-center px-6">
          <h2 className="text-subheader font-bold mb-6 text-center">
            Why {ITEM_NAME} gets more expensive
          </h2>
          <ul className="text-body space-y-3 max-w-[60ch]">
            <li>• Supply chain and fuel costs pass through to retail</li>
            <li>• Climate/weather shocks tighten supply</li>
            <li>• Wage and rent increases raise operating costs</li>
            <li>• Currency debasement increases input costs</li>
          </ul>
          <details className="mt-4 text-xs opacity-70">
            <summary className="cursor-pointer">Sources</summary>
            <div className="mt-2 opacity-60">item.inflation_explanation_sources (MVP placeholder)</div>
          </details>
        </Section> */}

        {/* Currency debasement (Macro contrast) */}
        <Section id="section-5" className="flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-subheader font-bold mb-3">
            This isn’t just about {ITEM_NAME}. It’s about your money.
          </h2>
          <p className="text-body opacity-85 max-w-[70ch]">
            The Bank of Canada targets 2% annual inflation.
            <br /> 
            But {ITEM_NAME} rose at ~{metrics.cagr5Text} per year over 5 years (and ~{metrics.cagr10Text} over 10 years).
          </p>
          <div className="w-full max-w-3xl h-52 sm:h-64 md:h-72 mt-4 mb-16 md:mb-24">
            <CagrContrastChart
              cagr5={metrics.cagr5}     // decimal (e.g., 0.087), not "8.7%"
              cagr10={metrics.cagr10}   // decimal (e.g., 0.064), not "6.4%"
              target={0.02}
            />
          </div>
        </Section>

        {/* Dollar burn */}
        <Section id="section-6a" className="flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-subheader font-bold mb-3">
            The money you know and trust is slowly <span className="text-brandGold">burning</span>..
          </h2>
          {/* <img
            src="items/20_dollar_burn.png"
            alt={`Image of slowly burning 20 dollar bill`}
            className="w-full h-screen object-contain mx-auto bg-black"
          /> */}
          <h2 className="text-subheader font-bold mb-3">
            It is losing value over time, and <span className="text-brandGold">no one can stop it</span>.
          </h2>
        </Section>

        {/* Projections — Fiat + BTC */}
        <Section id="section-6b" className="flex flex-col items-center justify-center px-6">
          <h2 className="text-subheader font-bold text-center mb-6">
            If this trend continues, take a look at the potential <span className="text-brandGold">future cost</span> of {ITEM_NAME}..
          </h2>
          <div className="w-full max-w-3xl space-y-3">
            <ValueRow
              left={`${display.snapshots.y0.year}`}
              middle="Today"
              right={display.snapshots.y0.fiat}
            />
            <ValueRow
              left={`${metrics.y0Plus5}`}
              middle ="In 5 years"
              right={display.projections.y5.fiat}
            />
            <ValueRow
              left={`${metrics.y0Plus10}`}
              middle ="In 10 years"
              right={display.projections.y10.fiat}
            />
          </div>
          {/* calc explanation */}
          <details className="mt-4 text-xs opacity-70">
            <summary className="cursor-pointer text-center">Projection Calculation</summary>
            <div className="mt-2 opacity-60">
              <p className="mt-4 text-caption text-center max-w-[70ch]">
                Projections use the item’s compound annual growth from the past:
                <br />
                5-year: <code>price_today × (1 + {metrics.cagr5Text})^5</code>
                <br />
                10-year: <code>price_today × (1 + {metrics.cagr10Text})^10</code>
              </p>
            </div>
          </details>
        </Section>


        {/* Turning Point Question */}
        <Section id="section-7" className="flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-subheader font-bold mb-10">
            What are you going to do about it?
          </h2>
          <p className="text-body opacity-85 mb-10">
            How will you <span className="text-brandGold">protect your family and your future</span> from inflation?
          </p>
          <p className="text-body opacity-85 mb-10">
            How can you store your $100 today so that it <span className="text-brandGold">preserves its value</span> 10 years from now?
          </p>
          <p className="text-body opacity-85 mb-10">
            Will your <span className="text-brandGold">wages</span> ever keep up?
          </p>
        </Section>

        {/* Common Advice */}
        <Section id="section-8" className="flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-subheader font-bold mb-4">
            The usual advice:
          </h2>
          <p className="text-body opacity-85 mb-6">
            Buy scarce assets like stocks, real estate, gold, and silver.
          </p>
          <p className="text-body opacity-75 mt-2">These help… but they’re not the whole story.</p>
        </Section>

        {/* The Digital Age */}
        <Section id="section-9a" className="flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-subheader font-bold mb-3">
            We live in a digitized world.
          </h2>
          <p className="text-body opacity-85 max-w-[70ch] mb-6">
            It makes sense to own the most <span className="text-brandGold">secure and finite digital asset</span> of the 21st century:
          </p>
        </Section>

        {/* The Digital Age */}
        <Section id="section-9b" className="flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-header text-brandGold font-bold mb-3">
            Bitcoin
          </h1>
          <img
            src={asset("/items/bitcoin.png")}
            alt={`Image of bitcoin`}
            className="w-full h-screen object-contain mx-auto bg-black"
          />
        </Section>

        {/* Bitcoin View (BTC) */}
        <Section id="section-10" className="flex flex-col items-center justify-center px-6">
          <h2 className="text-subheader font-bold mb-6 text-center">
            In Bitcoin terms, your {ITEM_NAME} gets cheaper.
          </h2>
          <div className="w-full max-w-3xl space-y-3">
            <ValueRow left={`${display.snapshots.y10.year}`} middle="10 years ago" right={display.snapshots.y10.btc} />
            <ValueRow left={`${display.snapshots.y5.year}`} middle="5 years ago" right={display.snapshots.y5.btc} />
            <ValueRow left={`${display.snapshots.y0.year}`} middle="Today" right={display.snapshots.y0.btc} />
          </div>
        </Section>

        {/* Sats View */}
        <Section id="section-11a" className="flex flex-col items-center justify-center px-6">
          <h2 className="text-subheader font-bold mb-6 text-center">
            Or measured in sats (satoshis)
          </h2>
          <p className="text-caption opacity-85 mb-4">
            A satoshi is the smallest unit of Bitcoin.
          </p>
          <p className="text-caption opacity-85 mb-4">
            1 BTC = 100,000,000 sats
          </p>
          <div className="w-full max-w-3xl space-y-3 mb-40">
            <ValueRow left={`${display.snapshots.y10.year}`} middle="10 years ago" right={display.snapshots.y10.sats} />
            <ValueRow left={`${display.snapshots.y5.year}`} middle="5 years ago" right={display.snapshots.y5.sats} />
            <ValueRow left={`${display.snapshots.y0.year}`} middle="Today" right={display.snapshots.y0.sats} />
          </div>
        </Section>

        {/* Sats View */}
        <Section id="section-11b" className="flex flex-col items-center justify-center px-6">
          <h2 className="text-subheader font-bold mb-6 text-center">
            Side by side comparison ({ITEM_NAME}): <br/> Fiat vs <span className="text-brandGold">Bitcoin</span>
          </h2>
          <p className="text-caption opacity-85 mb-4">
            A satoshi is the smallest unit of Bitcoin.
          </p>
          <p className="text-caption opacity-85 mb-4">
            1 BTC = 100,000,000 sats
          </p>
          <div className="w-full max-w-3xl space-y-3 mb-6">
            <ValueRowBalanced left="CAD" middle=" " right="SATS" />
            <ValueRowBalanced left={display.snapshots.y10.fiat} middle={`${display.snapshots.y10.year}`} right={display.snapshots.y10.sats} />
            <ValueRowBalanced left={display.snapshots.y5.fiat} middle={`${display.snapshots.y5.year}`} right={display.snapshots.y5.sats} />
            <ValueRowBalanced left={display.snapshots.y0.fiat} middle="Today" right={display.snapshots.y0.sats} />
            <p className="text-caption opacity-85 text-center mt-2">
              Projections if trends continue:
            </p>  
            <ValueRowBalanced left={display.projections.y5.fiat} middle={`${metrics.y0Plus5}*`} right={display.projections.y5.sats} />
            <ValueRowBalanced left={display.projections.y10.fiat} middle={`${metrics.y0Plus10}*`} right={display.projections.y10.sats} />
          </div>
          <p className="text-xs opacity-60 mb-4 text-center">
            * Projections assume the same CAGR continues for item in CAD (see earlier for details) and 30% CAGR for Bitcoin, based on leading instututional research.
          </p>
        </Section>

        {/* Why Bitcoin works */}
        <Section id="section-12" className="flex flex-col items-center justify-center px-6">
          <h2 className="text-subheader font-bold mb-6 text-center">
            Why Bitcoin increases in value over time:
          </h2>
          <div className="text-body space-y-3 opacity-90 max-w-[60ch]">
            <p>• Fixed supply. Only 21 million will ever exist and no one can print more of it</p>
            <p>• Global adoption and network effects</p>
            <p>• Money printing everywhere. Always. Forever.</p>
          </div>
        </Section>

        {/* 14. Call to action */}
        <Section id="section-13" className="flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-subheader font-bold mb-12">
            <span className="text-brandGold">Act now.</span> Don’t wait.
          </h2>
          <p className="text-body opacity-85 mb-12">
            Start saving in sound money, especially <span className="text-brandGold">Bitcoin</span>. Or at least start learning more about why it matters.
          </p>
          <h2 className="text-subheader font-bold mb-20">
            Your future self will thank you.
          </h2>
          <button
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#D4AF37] text-black font-semibold hover:opacity-90 transition"
            onClick={nextItem}
            aria-label="Show me another item"
          >
            <RefreshCw size={18} />
            Show me another item
          </button>
        </Section>

        {/* Outro / Support */}
        {/* <Section id="section-14" className="flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-[clamp(1.6rem,5.4vw,2.6rem)] font-bold mb-3">
            Enjoyed this?
          </h2>
          <p className="opacity-85 mb-6">
            Consider buying me a coffee or sending a tip ⚡ (Lightning).
          </p>
          <button
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#D4AF37] text-black font-semibold hover:opacity-90 transition"
            onClick={nextItem}
            aria-label="Show me another item"
          >
            <RefreshCw size={18} />
            Show me another item
          </button>
          <div className="mt-8 text-xs opacity-60">
            <p>MVP: Add Buy Me a Coffee link and a Lightning address here.</p>
          </div>
        </Section> */}

      </FullPageScroller>

      {/* <NavigationDots
        totalSections={totalSections}
        activeSection={activeSection}
        onDotClick={handleDotClick}
        visible={showDots}
      /> */}
    </div>
  );
}
