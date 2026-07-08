"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { JourneyPanel as JourneyPanelData } from "@/types";
import { JourneyPanel } from "./JourneyPanel";

/**
 * S4 Spaces Journey (docs §5.2, §9.3, mockup `#spacesScroll`). The signature
 * gesture-gated page-turn slider. This is the sanctioned home for the journey's
 * bespoke GSAP timeline (CLAUDE.md); everything here matches the mockup contract
 * exactly: TURN 1.05s / DWELL .5s page turns, an engage window with a .55s
 * auto-center, per-panel rises, a directional kick, release at both ends, and a
 * champagne progress bar with a zero-padded counter.
 *
 * Below 901px, under reduced motion, or without GSAP it is a native horizontal
 * scroll-snap strip whose `scrollLeft` drives the same progress UI, with no
 * gesture capture and no hijacked vertical scroll.
 */
export function SpacesJourney({ panels }: { panels: JourneyPanelData[] }) {
  const wrapRef = useRef<HTMLElement>(null);
  const vpRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const curRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const vp = vpRef.current;
    const track = trackRef.current;
    if (!wrap || !vp || !track) return;
    const cur = curRef.current;
    const fill = fillRef.current;
    const N = track.children.length;
    if (N === 0) return;

    const setUI = (p: number) => {
      p = Math.max(0, Math.min(1, p));
      if (fill) fill.style.transform = `scaleX(${p})`;
      if (cur) cur.textContent = String(Math.round(p * (N - 1)) + 1).padStart(2, "0");
    };
    setUI(0);

    const wide = window.matchMedia("(min-width: 901px)").matches;

    // Fallback (docs §9.3): native horizontal snap drives the progress UI.
    if (reducedMotion || !wide) {
      const onScroll = () => {
        const max = vp.scrollWidth - vp.clientWidth;
        setUI(max ? vp.scrollLeft / max : 0);
      };
      vp.addEventListener("scroll", onScroll, { passive: true });
      return () => vp.removeEventListener("scroll", onScroll);
    }

    // Desktop js-pin journey (docs §9.3).
    let killed = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("gsap/Observer"),
      import("gsap/ScrollToPlugin"),
    ]).then(([{ gsap }, { ScrollTrigger }, { Observer }, { ScrollToPlugin }]) => {
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin);
      wrap.classList.add("js-pin");

      // Window scroll with CSS smooth-scrolling suspended for the ride (§9.1).
      const gscrollTo = (vars: gsap.TweenVars) => {
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        const restore = () => {
          root.style.scrollBehavior = prev;
        };
        const oc = vars.onComplete;
        const oi = vars.onInterrupt;
        vars.onComplete = () => {
          restore();
          oc?.();
        };
        vars.onInterrupt = () => {
          restore();
          oi?.();
        };
        return gsap.to(window, vars);
      };

      // Size panels to the exact viewport width so every landing is flush.
      const sizePanels = () => {
        const w = vp.clientWidth;
        for (const child of Array.from(track.children)) {
          (child as HTMLElement).style.width = `${w}px`;
        }
      };
      sizePanels();
      const W = () => vp.clientWidth;

      // Per-panel rise: big plate first, small a beat later, then the info.
      const rises: gsap.core.Timeline[] = [];
      for (const p of Array.from(track.children)) {
        const a = p.querySelector(".hp-a");
        const b = p.querySelector(".hp-b");
        const info = p.querySelector(".hp-info");
        const rise = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
        if (a) rise.fromTo(a, { y: 110, opacity: 0 }, { y: 0, opacity: 1, duration: 1.05, immediateRender: true }, 0);
        if (b) rise.fromTo(b, { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1.15, immediateRender: true }, 0.18);
        if (info) rise.fromTo(info, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, immediateRender: true }, 0.32);
        rises.push(rise);
      }

      const TURN = 1.05;
      const DWELL = 0.5;
      let idx = 0;
      let engaged = false;
      let animating = false;

      // wheelSpeed -1 unifies wheel with touch: onUp always means advance. The
      // gesture callbacks call `step` lazily, after it is defined below.
      const obs = Observer.create({
        target: window,
        type: "wheel,touch",
        wheelSpeed: -1,
        tolerance: 12,
        preventDefault: true,
        allowClicks: true,
        onUp: () => step(1),
        onDown: () => step(-1),
      });
      obs.disable();

      const goTo = (k: number, dir: number) => {
        animating = true;
        idx = k;
        setUI(k / (N - 1));
        const p = track.children[k] as HTMLElement;
        const num = p.querySelector(".hp-num");
        if (num) gsap.fromTo(num, { xPercent: 22 * dir }, { xPercent: 0, duration: TURN + 0.25, ease: "power2.out" });
        p.querySelectorAll(".hp-fill").forEach((f) => {
          gsap.fromTo(f, { xPercent: 7 * dir }, { xPercent: 0, duration: TURN + 0.3, ease: "power2.out" });
        });
        gsap.to(track, {
          x: -k * W(),
          duration: TURN,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.delayedCall(DWELL, () => {
              animating = false;
            });
          },
        });
      };

      const hardRelease = () => {
        engaged = false;
        animating = false;
        obs.disable();
        document.removeEventListener("keydown", onKey, true);
      };

      const release = (dir: number) => {
        hardRelease();
        const y = window.pageYOffset || document.documentElement.scrollTop || 0;
        gscrollTo({
          duration: 0.8,
          ease: "power2.inOut",
          scrollTo: { y: y + dir * window.innerHeight * 0.9, autoKill: true },
        });
      };

      const step = (dir: number) => {
        if (animating) return;
        const nk = idx + dir;
        if (nk < 0) {
          release(-1);
          return;
        }
        if (nk > N - 1) {
          release(1);
          return;
        }
        if (dir > 0) rises[nk]?.play();
        else rises[idx]?.reverse();
        goTo(nk, dir);
      };

      const onKey = (e: KeyboardEvent) => {
        if (!engaged) return;
        if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
          e.preventDefault();
          step(1);
        } else if (e.key === "ArrowUp" || e.key === "PageUp") {
          e.preventDefault();
          step(-1);
        }
      };

      const engage = (startIdx: number) => {
        if (engaged || gsap.isTweening(window)) return;
        engaged = true;
        animating = true;
        if (idx !== startIdx) {
          idx = startIdx;
          gsap.set(track, { x: -startIdx * W() });
          setUI(startIdx / (N - 1));
          for (let i = 0; i <= startIdx; i++) rises[i]?.progress(1);
        }
        obs.enable();
        document.addEventListener("keydown", onKey, true);
        gscrollTo({
          duration: 0.55,
          ease: "power2.inOut",
          scrollTo: { y: wrap, autoKill: false },
          onComplete: () => {
            gsap.delayedCall(0.35, () => {
              animating = false;
            });
          },
        });
      };

      const stEngage = ScrollTrigger.create({
        trigger: wrap,
        start: "top 62%",
        end: "bottom 38%",
        onEnter: () => engage(0),
        onEnterBack: () => engage(N - 1),
        onLeave: () => {
          if (engaged) hardRelease();
        },
        onLeaveBack: () => {
          if (engaged) hardRelease();
        },
      });

      // First slide rises once, as the section approaches.
      const stFirst = ScrollTrigger.create({
        trigger: wrap,
        start: "top 72%",
        once: true,
        onEnter: () => rises[0]?.play(),
      });

      // Keep the slider flush through resizes and the font-swap refresh (§9.5).
      const onRefreshInit = () => sizePanels();
      const onRefresh = () => gsap.set(track, { x: -idx * W() });
      ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
      ScrollTrigger.addEventListener("refresh", onRefresh);
      document.fonts?.ready.then(() => {
        if (!killed) ScrollTrigger.refresh();
      });

      cleanup = () => {
        obs.kill();
        stEngage.kill();
        stFirst.kill();
        ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        document.removeEventListener("keydown", onKey, true);
        for (const rise of rises) rise.kill();
        gsap.killTweensOf(window);
        gsap.killTweensOf(track);
        gsap.set(track, { clearProps: "x" });
        for (const child of Array.from(track.children)) {
          (child as HTMLElement).style.width = "";
        }
        wrap.classList.remove("js-pin");
      };
    });

    return () => {
      killed = true;
      cleanup?.();
    };
  }, [reducedMotion]);

  const total = String(panels.length).padStart(2, "0");

  return (
    <section ref={wrapRef} id="spacesScroll" className="hscroll">
      <div ref={vpRef} className="hs-viewport">
        <div ref={trackRef} className="hs-track">
          {panels.map((panel, i) => (
            <JourneyPanel key={panel.anchor} panel={panel} index={i + 1} />
          ))}
        </div>
      </div>

      <div className="hs-ui" aria-hidden="true">
        <span className="hs-count">
          <b ref={curRef}>01</b>
          <span>/ {total}</span>
        </span>
        <div className="hs-bar">
          <i ref={fillRef} />
        </div>
        <small className="hs-hint">Scroll</small>
      </div>
    </section>
  );
}
