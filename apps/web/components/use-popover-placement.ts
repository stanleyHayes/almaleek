import { useLayoutEffect, useState, type RefObject } from "react";

export type PopoverPlacement = {
  top: number;
  left: number;
  /** Floor, not a fixed size — the popover grows to fit its longest option. */
  minWidth: number;
  maxWidth: number;
  maxHeight: number;
};

/**
 * Positions a portalled popover against its trigger, in viewport coordinates.
 * The list renders into document.body to escape overflow and stacking
 * contexts, so it needs its own measurements: flip above the trigger when
 * there is more room there, and pull left when it would run off the screen.
 * Returns null while closed, which is also the caller's signal not to render.
 */
export function usePopoverPlacement(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
): PopoverPlacement | null {
  const [placement, setPlacement] = useState<PopoverPlacement | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const gap = 6;
      const viewportPad = 8;
      const spaceBelow = window.innerHeight - rect.bottom - viewportPad;
      const spaceAbove = rect.top - viewportPad;
      const preferDown = spaceBelow >= 160 || spaceBelow >= spaceAbove;
      const maxHeight = Math.max(
        120,
        Math.min(288, preferDown ? spaceBelow - gap : spaceAbove - gap),
      );
      const top = preferDown
        ? rect.bottom + gap
        : Math.max(viewportPad, rect.top - gap - maxHeight);
      const content = contentRef.current;
      const natural = content
        ? Math.max(rect.width, content.scrollWidth + 2)
        : rect.width;
      const available = window.innerWidth - viewportPad * 2;
      const width = Math.min(natural, available);
      const left = Math.max(
        viewportPad,
        Math.min(rect.left, window.innerWidth - viewportPad - width),
      );
      setPlacement({
        top,
        left,
        minWidth: rect.width,
        maxWidth: available,
        maxHeight,
      });
    };

    // Layout is measured synchronously before paint so the popover never
    // flashes at the wrong position.
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, triggerRef, contentRef]);

  return open ? placement : null;
}
