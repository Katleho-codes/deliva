"use client"

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

interface AccordionCtx {
  openIds: string[];
  toggle: (id: string) => void;
}

const Ctx = createContext<AccordionCtx | null>(null);

function useAccordionCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Accordion compound parts must be used inside <Accordion>");
  return ctx;
}


export interface AccordionItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  /** DATA-DRIVEN: pass items array to auto-render */
  items?: AccordionItem[];
  /** COMPOUND: nest <Accordion.Item> children instead */
  children?: ReactNode;
  /** Allow multiple open at once */
  multiple?: boolean;
  /** Uncontrolled default open — id or id[] */
  defaultOpen?: string | string[];
  /** Controlled open ids */
  openIds?: string[];
  /** Fires on any toggle */
  onChange?: (openIds: string[]) => void;
  className?: string;
}

function AccordionRoot({
  items,
  children,
  multiple = false,
  defaultOpen,
  openIds: controlled,
  onChange,
  className = "",
}: AccordionProps) {
  const init = (): string[] => {
    if (!defaultOpen) return [];
    return Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  };

  const [internal, setInternal] = useState<string[]>(init);
  const isControlled = controlled !== undefined;
  const openIds = isControlled ? controlled! : internal;

  const toggle = (id: string) => {
    const next = openIds.includes(id)
      ? openIds.filter((x) => x !== id)
      : multiple
        ? [...openIds, id]
        : [id];
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <Ctx.Provider value={{ openIds, toggle }}>
      <div
        className={[
          "border border-gray-300 rounded-sm overflow-hidden divide-y",
          className,
        ].join(" ")}

      >
        {items
          ? items.map((item, i) => (
            <Item key={item.id} id={item.id} disabled={item.disabled} index={i}>
              <Trigger id={item.id}>{item.label}</Trigger>
              <Content id={item.id}>{item.content}</Content>
            </Item>
          ))
          : children}
      </div>
    </Ctx.Provider>
  );
}
interface ItemProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
  index?: number;
}

interface ItemCtxValue {
  id: string;
  isOpen: boolean;
  disabled: boolean;
  index: number;
}
const ItemCtx = createContext<ItemCtxValue | null>(null);

function useItemCtx() {
  const ctx = useContext(ItemCtx);
  if (!ctx) throw new Error("Accordion.Trigger / Accordion.Content must be inside Accordion.Item");
  return ctx;
}

// Auto-index for compound usage
let _autoIndex = 0;

function Item({ id, children, disabled = false, index }: ItemProps) {
  const { openIds } = useAccordionCtx();
  const idx = useRef(index ?? _autoIndex++).current;

  return (
    <ItemCtx.Provider value={{ id, isOpen: openIds.includes(id), disabled, index: idx }}>
      <div className={disabled ? "opacity-40 pointer-events-none select-none" : ""}>
        {children}
      </div>
    </ItemCtx.Provider>
  );
}


interface TriggerProps {
  id: string;
  children: ReactNode;
  className?: string;
}

function Trigger({ id, children, className = "" }: TriggerProps) {
  const { toggle } = useAccordionCtx();
  const { isOpen, disabled, index } = useItemCtx();
  const padded = String(index + 1).padStart(2, "0");

  return (
    <button
      type="button"
      id={`acc-trigger-${id}`}
      aria-expanded={isOpen}
      aria-controls={`acc-body-${id}`}
      disabled={disabled}
      onClick={() => toggle(id)}
      className={[
        "group w-full flex items-center gap-4 px-6 py-5 text-left cursor-pointer",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400",
        isOpen ? "bg-white border-b" : "bg-white",
        className,
      ].join(" ")}
    >


      <span
        className={[
          "flex-1 font-semibold text-sm  transition-colors duration-200",
          isOpen ? "text-gray-500" : "text-zinc-800",
        ].join(" ")}
      >
        {children}
      </span>

      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className={[
          "shrink-0 transition-transform duration-300",
          isOpen ? "rotate-180 text-amber-400" : "text-zinc-600",
        ].join(" ")}
      >
        <path
          d="M2.5 5L7 9.5L11.5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}


interface ContentProps {
  id: string;
  children: ReactNode;
  className?: string;
}

function Content({ id, children, className = "" }: ContentProps) {
  const { isOpen } = useItemCtx();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    // Sync height whenever the inner content resizes (inputs, dynamic content, etc.)
    const ro = new ResizeObserver(() => {
      setHeight(isOpen ? el.scrollHeight : 0);
    });

    ro.observe(el);
    // Set immediately on open/close too
    setHeight(isOpen ? el.scrollHeight : 0);

    return () => ro.disconnect();
  }, [isOpen]);

  return (
    <div
      id={`acc-body-${id}`}
      role="region"
      aria-labelledby={`acc-trigger-${id}`}
      style={{
        height,
        overflow: "hidden",
        transition: "height 280ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div ref={bodyRef} className="bg-white px-6 pt-4 pb-6">
        <div className={["text-sm leading-relaxed py-3", className].join(" ")}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SectionLabel({ tag, sub }: { tag: string; sub: string }) {
  return (
    <div>
      <span className="text-xs text-amber-400 uppercase tracking-widest">{tag}</span>
      <span className="text-xs text-zinc-600"> — {sub}</span>
    </div>
  );
}
export const Accordion = Object.assign(AccordionRoot, {
  Item,
  Trigger,
  Content,
});
