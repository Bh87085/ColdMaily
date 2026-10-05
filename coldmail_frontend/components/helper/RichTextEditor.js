"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";

/* ─── Gmail colour palette ────────────────────────────────────────────── */
const PALETTE = [
  ["#000000","#434343","#666666","#999999","#b7b7b7","#cccccc","#d9d9d9","#ffffff"],
  ["#ff0000","#ff9900","#ffff00","#00ff00","#00ffff","#4a86e8","#9900ff","#ff00ff"],
  ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#c9daf8","#d9d2e9","#ead1dc"],
  ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#a4c2f4","#b4a7d6","#d5a6bd"],
  ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6d9eeb","#8e7cc3","#c27ba0"],
  ["#cc0000","#e69138","#f1c232","#6aa84f","#45818e","#3c78d8","#674ea7","#a64d79"],
  ["#990000","#b45f06","#bf9000","#38761d","#134f5c","#1155cc","#351c75","#741b47"],
  ["#660000","#783f04","#7f6000","#274e13","#0c343d","#1c4587","#20124d","#4c1130"],
];

/* ─── helpers ────────────────────────────────────────────────────────── */
function Btn({ onMouseDown, title, active, children }) {
  return (
    <button type="button" title={title} onMouseDown={onMouseDown}
      className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors text-[#444746] ${
        active ? "bg-[#dde3ea]" : "hover:bg-[#e0e0e0]"}`}>
      {children}
    </button>
  );
}
function Sep() { return <span className="w-px h-4 bg-[#c4c7c5] mx-0.5 self-center" />; }
const Chevron = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
);

/* ─── Colour swatch ──────────────────────────────────────────────────── */
function SwatchGrid({ label, selectedColor, onPick }) {
  const isLight = (hex) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return (r*299 + g*587 + b*114)/1000 > 170;
  };
  return (
    <div>
      <p className="text-[13px] text-[#3c4043] mb-2">{label}</p>
      <div className="flex flex-col gap-[2px]">
        {PALETTE.map((row, ri) => (
          <div key={ri} className="flex gap-[2px]">
            {row.map((hex) => {
              const active = hex.toLowerCase() === selectedColor?.toLowerCase();
              return (
                <button key={hex} type="button" title={hex}
                  onMouseDown={(e) => { e.preventDefault(); onPick(hex); }}
                  className="w-4 h-4 rounded-none relative hover:scale-110 hover:ring-1 hover:ring-black/60 transition-all flex-shrink-0 flex items-center justify-center"
                  style={{ background: hex, border: hex==="  #ffffff"?"1px solid #c4c7c5":"1px solid transparent",
                    outline: active?"2px solid #1a73e8":undefined, outlineOffset: active?"1px":undefined }}>
                  {active && (
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill={isLight(hex)?"#000":"#fff"}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SVG icons ──────────────────────────────────────────────────────── */
const UndoIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>;
const RedoIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>;
const FontSizeIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>;
const AlignIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg>;
const IndentMoreIcon    = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>;
const IndentLessIcon    = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M11 17h10v-2H11v2zM3 12l4 4V8l-4 4zm0-9v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>;
const AlignLeftIcon     = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg>;
const AlignCenterIcon   = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z"/></svg>;
const AlignRightIcon    = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z"/></svg>;
const AlignJustifyIcon  = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/></svg>;

/* ─── Font options (each rendered in its own font) ───────────────────── */
const FONTS = [
  { value: "Arial, sans-serif",       label: "Sans Serif"  },
  { value: "Georgia, serif",          label: "Serif"        },
  { value: "'Courier New', monospace",label: "Fixed Width"  },
  { value: "'Comic Sans MS', cursive",label: "Comic Sans"   },
  { value: "Garamond, serif",         label: "Garamond"     },
  { value: "Tahoma, sans-serif",      label: "Tahoma"       },
  { value: "Verdana, sans-serif",     label: "Verdana"      },
];

/* ─── Main component ─────────────────────────────────────────────────── */
const RichTextEditor = forwardRef(function RichTextEditor({
  value,
  onChange,
  name = "body",
  placeholder = "Write your email here...",
  minHeight = "200px",
  className = "",
  showToolbar = true,
  children,
  footerSlot,
}, ref) {
  const editorRef    = useRef(null);
  const popupRef     = useRef(null);
  const linkPopupRef = useRef(null);
  const linkTooltipRef = useRef(null);

  const [showLinkInput,   setShowLinkInput]   = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAlignMenu,   setShowAlignMenu]   = useState(false);
  const [showFontMenu,    setShowFontMenu]    = useState(false);
  const [showSizeMenu,    setShowSizeMenu]    = useState(false);
  const alignMenuRef = useRef(null);
  const fontMenuRef  = useRef(null);
  const sizeMenuRef  = useRef(null);
  const [linkUrl,         setLinkUrl]         = useState("");
  const [linkText,        setLinkText]        = useState("");
  const [linkTooltip,     setLinkTooltip]     = useState(null); // { url, el, x, y }
  const [fontFamily,      setFontFamily]      = useState(FONTS[0].value);
  const [fontSize,        setFontSize]        = useState("3");
  const [textColor,       setTextColor]       = useState("#000000");
  const [bgColor,         setBgColor]         = useState(null);
  const [activeFmt,       setActiveFmt]       = useState({ bold: false, italic: false, underline: false });

  const savedRangeRef = useRef(null);

  /* track bold/italic/underline active state on selection change */
  useEffect(() => {
    const update = () => {
      if (!editorRef.current?.contains(document.activeElement)) return;
      setActiveFmt({
        bold:      document.queryCommandState("bold"),
        italic:    document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  /* initial value */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // Wrap initial content in a div so lists always have a block element to attach to
    editor.innerHTML = value ? value : "<div><br></div>";
    document.execCommand("defaultParagraphSeparator", false, "div");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* close link popup on outside click */
  useEffect(() => {
    if (!showLinkInput) return;
    const handler = (e) => {
      if (!linkPopupRef.current?.contains(e.target)) {
        setShowLinkInput(false); setLinkUrl(""); setLinkText("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLinkInput]);

  /* close link tooltip on outside click */
  useEffect(() => {
    if (!linkTooltip) return;
    const handler = (e) => {
      if (!linkTooltipRef.current?.contains(e.target) && !e.target.closest("a"))
        setLinkTooltip(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [linkTooltip]);

  const handleEditorClick = (e) => {
    const anchor = e.target.closest("a");
  
    if (!anchor) {
      setLinkTooltip(null);
      return;
    }
  
    e.preventDefault();
  
    const rect = anchor.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();
  
    const TOOLTIP_WIDTH = 420;
    const PADDING = 12;
  
    let left = rect.left;
  
    const viewportRight = window.innerWidth - PADDING;
    const viewportLeft = PADDING;
  
    /* prevent overflow right */
    if (left + TOOLTIP_WIDTH > viewportRight) {
      left = viewportRight - TOOLTIP_WIDTH;
    }
  
    /* prevent overflow left */
    if (left < viewportLeft) {
      left = viewportLeft;
    }
  
    setLinkTooltip({
      url: anchor.href,
      el: anchor,
      x: left,
      y: rect.bottom + 8,
    });
  };

  /* close colour picker on outside click */
  useEffect(() => {
    if (!showColorPicker) return;
    const handler = (e) => {
      if (!popupRef.current?.contains(e.target)) setShowColorPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColorPicker]);

  /* close align menu on outside click */
  useEffect(() => {
    if (!showAlignMenu) return;
    const handler = (e) => {
      if (!alignMenuRef.current?.contains(e.target)) setShowAlignMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAlignMenu]);

  /* close font menu on outside click */
  useEffect(() => {
    if (!showFontMenu) return;
    const handler = (e) => {
      if (!fontMenuRef.current?.contains(e.target)) setShowFontMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFontMenu]);

  /* close size menu on outside click */
  useEffect(() => {
    if (!showSizeMenu) return;
    const handler = (e) => {
      if (!sizeMenuRef.current?.contains(e.target)) setShowSizeMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSizeMenu]);

  /* expose openLink() for parent (footer link button) */
  useImperativeHandle(ref, () => ({
    openLink: () => {
      saveSelection();
      const sel = window.getSelection();
      setLinkText(sel?.toString() || "");
      setShowLinkInput(true);
    },
  }));

  const notifyChange = useCallback(() => {
    if (editorRef.current)
      onChange?.({ target: { name, value: editorRef.current.innerHTML } });
  }, [onChange, name]);

  const exec = useCallback((cmd, val = null) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const sel = window.getSelection();

    // If selection is empty or outside the editor, place cursor at end of editor
    if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) {
      const range = document.createRange();
      // If editor is empty add a text node so the cursor has somewhere to sit
      if (!editor.firstChild) editor.appendChild(document.createTextNode(""));
      range.selectNodeContents(editor);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    document.execCommand(cmd, false, val);
    notifyChange();
    setActiveFmt({
      bold:      document.queryCommandState("bold"),
      italic:    document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  }, [notifyChange]);

  const handleInput = (e) =>
    onChange?.({ target: { name, value: e.currentTarget.innerHTML } });

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const html  = e.clipboardData?.getData("text/html");
    const plain = e.clipboardData?.getData("text/plain");

    let content = "";
    if (html) {
      // Use HTML from clipboard — preserves paragraph/line structure from web/docs
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      content = doc.body.innerHTML;
    } else if (plain) {
      // Convert plain text: double-newlines → paragraph divs, single newlines → <br>
      const esc = plain
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      content = esc
        .split(/\n\n+/)
        .map((para) => `<div>${para.replace(/\n/g, "<br>") || "<br>"}</div>`)
        .join("");
    }

    if (content) {
      document.execCommand("insertHTML", false, content);
      notifyChange();
    }
  }, [notifyChange]);

  const prevent = (fn) => (e) => { e.preventDefault(); fn(); };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel?.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const insertLink = () => {
    restoreSelection();
    const url = linkUrl.trim();
    if (!url) { setShowLinkInput(false); setLinkUrl(""); setLinkText(""); return; }
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (linkText.trim()) {
      document.execCommand("insertHTML", false, `<a href="${fullUrl}">${linkText.trim()}</a>`);
    } else if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand("createLink", false, fullUrl);
    } else {
      document.execCommand("insertHTML", false, `<a href="${fullUrl}">${fullUrl}</a>`);
    }
    notifyChange();
    setShowLinkInput(false);
    setLinkUrl("");
    setLinkText("");
  };

  const applyTextColor = (hex) => {
    setTextColor(hex);
    editorRef.current?.focus();
    document.execCommand("foreColor", false, hex);
    notifyChange();
    setShowColorPicker(false);
  };
  const applyBgColor = (hex) => {
    setBgColor(hex);
    editorRef.current?.focus();
    document.execCommand("hiliteColor", false, hex);
    notifyChange();
    setShowColorPicker(false);
  };

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-[#c4c7c5] overflow-visible ${className}`}>

      {/* ── Editable body ── */}
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        onClick={handleEditorClick}
        style={{ direction: "ltr", minHeight, outline: "none", fontFamily }}
        className="flex-1 min-h-0 px-4 py-3 text-[13px] text-gray-900 overflow-y-auto rounded-t-2xl
          [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer
          [&_p]:mt-0 [&_p]:mb-[1em]
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-[0.5em]
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-[0.5em]
          empty:before:content-[attr(data-placeholder)]
          empty:before:text-gray-400
          empty:before:pointer-events-none"
        suppressContentEditableWarning={true}
      />

      {/* ── Slot for attachments / any content above the toolbar ── */}
      {children}


      {/* ── Formatting toolbar — shown only when showToolbar is true ── */}
      {showToolbar && (
        <div className={`relative px-3 py-2 bg-white flex-shrink-0 ${!footerSlot ? "rounded-b-2xl" : ""}`}>

          {/* Link popup — floating card above toolbar */}
          {showLinkInput && (
            <div ref={linkPopupRef} className="absolute bottom-full left-4 mb-2 z-50 w-[320px] bg-white rounded-2xl shadow-2xl border border-[#e0e0e0] p-3 flex flex-col gap-2"
              onMouseDown={(e) => e.stopPropagation()}>
              {/* Text field */}
              <div className="flex items-center gap-2 px-3 py-2 border-2 border-[#1a73e8] rounded-lg">
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 text-[#5f6368]" fill="currentColor">
                  <path d="M2 17h20v2H2v-2zm1.15-4.05L4 11.47l.85 1.48H5l1.3-2.26L7.6 13h.7l1.7-3 1.7 3h.7l1.3-2.26L14.3 12h.15l.85-1.48.85 1.48H16l1.85-3.22.85 1.49L20 9h-1l-1 1.74L17 9h-1l-1.55 2.7L13 9h-1l-1.45 2.7L9 9H8L6.55 11.7 5 9H4L2 13h1.15zM22 5H2v2h20V5z"/>
                </svg>
                <input type="text" placeholder="Text" value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                  autoFocus />
              </div>
              {/* URL field + Apply */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1 px-3 py-2 border border-[#c4c7c5] rounded-lg focus-within:border-[#1a73e8] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 text-[#5f6368]" fill="currentColor">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                  </svg>
                  <input type="url" placeholder="Type or paste a link" value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && insertLink()}
                    className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent" />
                </div>
                <button type="button" onClick={insertLink}
                  className="text-sm px-2 py-2 text-[#5f6368] hover:text-[#1a73e8] font-medium transition-colors flex-shrink-0">
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Pill toolbar */}
          <div className="flex items-center gap-0.5 px-2 py-1 bg-[#f1f3f4] rounded-full w-fit max-w-full">

            <Btn title="Undo (Ctrl+Z)" onMouseDown={prevent(() => exec("undo"))}><UndoIcon /></Btn>
            <Btn title="Redo (Ctrl+Y)" onMouseDown={prevent(() => exec("redo"))}><RedoIcon /></Btn>

            <Sep />

            {/* Font family — custom dropdown */}
            <div className="relative" ref={fontMenuRef}>
              <button type="button"
                onMouseDown={(e) => { e.preventDefault(); setShowFontMenu((v) => !v); }}
                style={{ fontFamily, minWidth: 86 }}
                className="flex items-center gap-0.5 text-xs pl-2 pr-1 py-1 text-[#444746] font-medium rounded-md hover:bg-[#e0e0e0] transition-colors">
                <span className="truncate max-w-[80px]">
                  {FONTS.find((f) => f.value === fontFamily)?.label ?? "Sans Serif"}
                </span>
                <Chevron />
              </button>

              {showFontMenu && (
                <div className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-2xl shadow-2xl border border-[#e0e0e0] py-2 min-w-[180px]"
                  onMouseDown={(e) => e.stopPropagation()}>
                  {FONTS.map((f) => {
                    const active = f.value === fontFamily;
                    return (
                      <button key={f.value} type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFontFamily(f.value);
                          exec("fontName", f.value);
                          setShowFontMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f1f3f4] transition-colors text-left">
                        <span className="w-4 flex-shrink-0 text-[#444746]">
                          {active && (
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                          )}
                        </span>
                        <span className="text-sm text-[#3c4043]" style={{ fontFamily: f.value }}>
                          {f.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Sep />

            {/* Font size — custom dropdown */}
            <div className="relative" ref={sizeMenuRef}>
              <button type="button"
                onMouseDown={(e) => { e.preventDefault(); setShowSizeMenu((v) => !v); }}
                className="flex items-center gap-0.5 h-7 px-1 text-[#444746] rounded-md hover:bg-[#e0e0e0] transition-colors">
                <FontSizeIcon /><Chevron />
              </button>

              {showSizeMenu && (
                <div className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-2xl shadow-2xl border border-[#e0e0e0] py-2 min-w-[140px]"
                  onMouseDown={(e) => e.stopPropagation()}>
                  {[
                    { value: "1", label: "Small"    },
                    { value: "3", label: "Normal"   },
                    { value: "4", label: "Large"    },
                    { value: "5", label: "X-Large"  },
                    { value: "6", label: "XX-Large" },
                  ].map((s) => {
                    const active = s.value === fontSize;
                    return (
                      <button key={s.value} type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFontSize(s.value);
                          exec("fontSize", s.value);
                          setShowSizeMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f1f3f4] transition-colors text-left">
                        <span className="w-4 flex-shrink-0 text-[#444746]">
                          {active && (
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                          )}
                        </span>
                        <span className="text-sm text-[#3c4043]">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Sep />

            <Btn title="Bold (Ctrl+B)"      active={activeFmt.bold}      onMouseDown={prevent(() => exec("bold"))}><Bold className="w-4 h-4" /></Btn>
            <Btn title="Italic (Ctrl+I)"    active={activeFmt.italic}    onMouseDown={prevent(() => exec("italic"))}><Italic className="w-4 h-4" /></Btn>
            <Btn title="Underline (Ctrl+U)" active={activeFmt.underline} onMouseDown={prevent(() => exec("underline"))}><Underline className="w-4 h-4" /></Btn>

            {/* Colour trigger + popup centered above button */}
            <div className="relative">
              <button type="button" title="Text & background colour"
                onMouseDown={(e) => { e.preventDefault(); setShowColorPicker((v) => !v); }}
                className="flex items-center gap-0.5 h-7 px-1 rounded-full hover:bg-[#e0e0e0] transition-colors text-[#444746]">
                <span className="flex flex-col items-center leading-none">
                  <span className="text-[13px] font-bold" style={{ fontFamily: "Arial, sans-serif" }}>A</span>
                  <span className="block h-[3px] w-4 rounded-sm" style={{ background: textColor }} />
                </span>
                <Chevron />
              </button>

              {showColorPicker && (
                <div ref={popupRef}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-white rounded-2xl shadow-2xl border border-[#e0e0e0] p-4"
                  onMouseDown={(e) => e.stopPropagation()}>
                  <div className="flex gap-6">
                    <SwatchGrid label="Background colour" selectedColor={bgColor}   onPick={applyBgColor} />
                    <div className="w-px bg-[#e0e0e0] self-stretch" />
                    <SwatchGrid label="Text colour"        selectedColor={textColor} onPick={applyTextColor} />
                  </div>
                </div>
              )}
            </div>

            <Sep />

            {/* Alignment trigger + popup (relative wrapper so popup sits directly above) */}
            <div className="relative" ref={alignMenuRef}>
              <button type="button" title="Alignment"
                onMouseDown={(e) => { e.preventDefault(); setShowAlignMenu((v) => !v); }}
                className={`flex items-center gap-0.5 h-7 px-1 rounded-full hover:bg-[#e0e0e0] transition-colors text-[#444746] ${showAlignMenu ? "bg-[#e0e0e0]" : ""}`}>
                <AlignIcon /><Chevron />
              </button>

              {showAlignMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 flex flex-col bg-white border border-[#e0e0e0] rounded-2xl shadow-xl p-1.5 gap-0.5"
                  onMouseDown={(e) => e.stopPropagation()}>
                  {[
                    { cmd: "justifyLeft",   Icon: AlignLeftIcon,    title: "Align left"   },
                    { cmd: "justifyCenter", Icon: AlignCenterIcon,  title: "Align center" },
                    { cmd: "justifyRight",  Icon: AlignRightIcon,   title: "Align right"  },
                    { cmd: "justifyFull",   Icon: AlignJustifyIcon, title: "Justify"      },
                  ].map(({ cmd, Icon, title }) => (
                    <button key={cmd} type="button" title={title}
                      onMouseDown={(e) => { e.preventDefault(); exec(cmd); setShowAlignMenu(false); }}
                      className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-[#f1f3f4] transition-colors text-[#444746]">
                      <Icon />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Btn title="Numbered list"   onMouseDown={prevent(() => exec("insertOrderedList"))}><ListOrdered className="w-4 h-4" /></Btn>
            <Btn title="Bullet list"     onMouseDown={prevent(() => exec("insertUnorderedList"))}><List className="w-4 h-4" /></Btn>
            <Btn title="Decrease indent" onMouseDown={prevent(() => exec("outdent"))}><IndentLessIcon /></Btn>
            <Btn title="Increase indent" onMouseDown={prevent(() => exec("indent"))}><IndentMoreIcon /></Btn>

          </div>
        </div>
      )}

      {/* ── Footer slot (e.g. campaign mini action bar) ── */}
      {footerSlot && (
        <div className="border-t border-[#e8eaed] bg-white rounded-b-2xl flex-shrink-0">
          {footerSlot}
        </div>
      )}

      {/* ── Link tooltip (portalled to body so CSS transforms don't affect fixed positioning) ── */}
      {linkTooltip && typeof document !== "undefined" && createPortal(
        <div
          ref={linkTooltipRef}
          style={{ position: "fixed", top: linkTooltip.y, left: linkTooltip.x, zIndex: 9999 }}
          className="bg-white border border-[#dadce0] rounded-lg shadow-lg px-3 py-2 flex items-center gap-1.5 text-sm max-w-[420px]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span className="text-[#3c4043]">Go to link:</span>
          <a href={linkTooltip.url} target="_blank" rel="noopener noreferrer"
            className="text-[#1a73e8] hover:underline max-w-[180px] truncate">
            {linkTooltip.url}
          </a>
          <span className="text-[#dadce0] mx-0.5">|</span>
          <button type="button"
            className="text-[#1a73e8] hover:underline font-medium"
            onMouseDown={(e) => {
              e.preventDefault();
              setLinkText(linkTooltip.el.textContent);
              setLinkUrl(linkTooltip.url);
              saveSelection();
              // select the anchor node so insertHTML replaces it
              const range = document.createRange();
              range.selectNode(linkTooltip.el);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
              savedRangeRef.current = range.cloneRange();
              setLinkTooltip(null);
              setShowLinkInput(true);
            }}>
            Change
          </button>
          <span className="text-[#dadce0] mx-0.5">|</span>
          <button type="button"
            className="text-[#1a73e8] hover:underline font-medium"
            onMouseDown={(e) => {
              e.preventDefault();
              const range = document.createRange();
              range.selectNode(linkTooltip.el);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
              document.execCommand("unlink");
              notifyChange();
              setLinkTooltip(null);
            }}>
            Remove
          </button>
        </div>,
        document.body
      )}
    </div>
  );
});

export default RichTextEditor;
