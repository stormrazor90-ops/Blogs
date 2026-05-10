import { useRef, useEffect, useCallback, useState } from "react";

// ── constants ────────────────────────────────────────────────────────────────
const FONT_FAMILIES = [
  { label: "Default",      value: ""              },
  { label: "Sans-serif",   value: "Arial, sans-serif"          },
  { label: "Serif",        value: "Georgia, serif"             },
  { label: "Monospace",    value: "'Courier New', monospace"   },
  { label: "Cursive",      value: "'Comic Sans MS', cursive"   },
  { label: "Impact",       value: "Impact, fantasy"            },
  { label: "Trebuchet",    value: "'Trebuchet MS', sans-serif" },
  { label: "Verdana",      value: "Verdana, sans-serif"        },
];

const FONT_SIZES = ["10", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48", "64"];

const TEXT_COLORS = [
  "#000000","#374151","#6B7280","#EF4444","#F97316","#EAB308",
  "#22C55E","#3B82F6","#8B5CF6","#EC4899","#14B8A6","#FFFFFF",
];

const HIGHLIGHT_COLORS = [
  "#FEF08A","#BBF7D0","#BFDBFE","#FDE68A","#FBCFE8","#DDD6FE",
  "#FCA5A5","#6EE7B7","#93C5FD","#F9A8D4","transparent",
];

// ── toolbar button ────────────────────────────────────────────────────────────
function Btn({ title, active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`
        w-7 h-7 flex items-center justify-center rounded text-sm transition select-none
        ${active
          ? "bg-indigo-600 text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// ── color swatch picker ───────────────────────────────────────────────────────
function ColorPicker({ colors, onPick, title, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title={title}
        onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className="w-7 h-7 flex items-center justify-center rounded text-sm text-gray-600 hover:bg-gray-100 transition select-none"
      >
        {children}
      </button>
      {open && (
        <div className="absolute top-8 left-0 z-30 bg-white border border-gray-200 rounded-lg shadow-xl p-2 grid grid-cols-6 gap-1 w-40">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onMouseDown={(e) => { e.preventDefault(); onPick(c); setOpen(false); }}
              className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition"
              style={{ background: c === "transparent" ? "none" : c, border: c === "transparent" ? "1px dashed #9CA3AF" : undefined }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── link dialog ───────────────────────────────────────────────────────────────
function LinkDialog({ onInsert, onClose }) {
  const [url, setUrl] = useState("https://");
  return (
    <div className="absolute top-10 left-0 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-72">
      <p className="text-xs font-semibold text-gray-700 mb-2">Insert Link</p>
      <input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onInsert(url); } if (e.key === "Escape") onClose(); }}
        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
        placeholder="https://example.com"
      />
      <div className="flex gap-2 justify-end">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); onClose(); }} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">Cancel</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); onInsert(url); }} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition">Insert</button>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function RichTextEditor({ value, onChange, placeholder = "Write here…", minHeight = 160 }) {
  const editorRef = useRef(null);
  const [showLink, setShowLink] = useState(false);
  const [savedRange, setSavedRange] = useState(null);
  const [fontFamily, setFontFamily] = useState("");
  const [fontSize, setFontSize] = useState("16");
  const isInternalChange = useRef(false);

  // sync external value → editor (only on mount or external reset)
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      isInternalChange.current = true;
      editorRef.current.innerHTML = value || "";
      isInternalChange.current = false;
    }
  }, [value]);

  const emit = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    emit();
  }, [emit]);

  const isActive = (cmd) => {
    try { return document.queryCommandState(cmd); } catch { return false; }
  };

  // save selection before opening link dialog
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) setSavedRange(sel.getRangeAt(0).cloneRange());
  };

  const restoreSelection = () => {
    if (!savedRange) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  };

  const handleInsertLink = (url) => {
    restoreSelection();
    if (url && url !== "https://") exec("createLink", url);
    setShowLink(false);
  };

  const handleFontFamily = (val) => {
    setFontFamily(val);
    if (val) exec("fontName", val);
  };

  const handleFontSize = (val) => {
    setFontSize(val);
    // execCommand fontSize only accepts 1-7; use a workaround via span
    editorRef.current?.focus();
    document.execCommand("fontSize", false, "7");
    const spans = editorRef.current.querySelectorAll('font[size="7"]');
    spans.forEach((s) => {
      s.removeAttribute("size");
      s.style.fontSize = val + "px";
    });
    emit();
  };

  const toolbarDivider = <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />;

  return (
    <div className="border border-gray-300 rounded-xl overflow-visible focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition bg-white">

      {/* ── toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">

        {/* headings */}
        <select
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => { exec("formatBlock", e.target.value); e.target.value = ""; }}
          defaultValue=""
          className="h-7 text-xs border border-gray-200 rounded px-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
          title="Heading / Paragraph"
        >
          <option value="" disabled>Style</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Blockquote</option>
          <option value="pre">Code Block</option>
        </select>

        {toolbarDivider}

        {/* font family */}
        <select
          value={fontFamily}
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => handleFontFamily(e.target.value)}
          className="h-7 text-xs border border-gray-200 rounded px-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer max-w-[90px]"
          title="Font Family"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* font size */}
        <select
          value={fontSize}
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => handleFontSize(e.target.value)}
          className="h-7 text-xs border border-gray-200 rounded px-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer w-14"
          title="Font Size"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>

        {toolbarDivider}

        {/* bold / italic / underline / strikethrough */}
        <Btn title="Bold (Ctrl+B)"      active={isActive("bold")}          onClick={() => exec("bold")}>          <b>B</b>  </Btn>
        <Btn title="Italic (Ctrl+I)"    active={isActive("italic")}        onClick={() => exec("italic")}>        <i>I</i>  </Btn>
        <Btn title="Underline (Ctrl+U)" active={isActive("underline")}     onClick={() => exec("underline")}>     <u>U</u>  </Btn>
        <Btn title="Strikethrough"      active={isActive("strikeThrough")} onClick={() => exec("strikeThrough")}> <s>S</s>  </Btn>

        {toolbarDivider}

        {/* text color */}
        <ColorPicker colors={TEXT_COLORS} title="Text Color" onPick={(c) => exec("foreColor", c)}>
          <span className="flex flex-col items-center leading-none">
            <span className="text-xs font-bold">A</span>
            <span className="w-4 h-1 rounded-sm mt-0.5 bg-red-500" />
          </span>
        </ColorPicker>

        {/* highlight */}
        <ColorPicker colors={HIGHLIGHT_COLORS} title="Highlight Color" onPick={(c) => exec("hiliteColor", c)}>
          <span className="flex flex-col items-center leading-none">
            <span className="text-xs">🖊</span>
          </span>
        </ColorPicker>

        {toolbarDivider}

        {/* lists */}
        <Btn title="Bullet List"   active={isActive("insertUnorderedList")} onClick={() => exec("insertUnorderedList")}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /><circle cx="2" cy="6" r="1" fill="currentColor"/><circle cx="2" cy="12" r="1" fill="currentColor"/><circle cx="2" cy="18" r="1" fill="currentColor"/></svg>
        </Btn>
        <Btn title="Numbered List" active={isActive("insertOrderedList")}   onClick={() => exec("insertOrderedList")}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
        </Btn>

        {toolbarDivider}

        {/* alignment */}
        <Btn title="Align Left"    onClick={() => exec("justifyLeft")}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h8a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd"/></svg>
        </Btn>
        <Btn title="Align Center"  onClick={() => exec("justifyCenter")}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm3 4h8a1 1 0 010 2H6a1 1 0 010-2zm-3 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd"/></svg>
        </Btn>
        <Btn title="Align Right"   onClick={() => exec("justifyRight")}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm6 4h8a1 1 0 010 2H9a1 1 0 010-2zm-6 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd"/></svg>
        </Btn>
        <Btn title="Justify"       onClick={() => exec("justifyFull")}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd"/></svg>
        </Btn>

        {toolbarDivider}

        {/* indent / outdent */}
        <Btn title="Indent"  onClick={() => exec("indent")}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7M3 5v14" /></svg>
        </Btn>
        <Btn title="Outdent" onClick={() => exec("outdent")}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l-7 7 7 7M21 5v14" /></svg>
        </Btn>

        {toolbarDivider}

        {/* link */}
        <div className="relative">
          <Btn
            title="Insert Link"
            onClick={() => { saveSelection(); setShowLink((v) => !v); }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </Btn>
          {showLink && (
            <LinkDialog
              onInsert={handleInsertLink}
              onClose={() => setShowLink(false)}
            />
          )}
        </div>

        {/* unlink */}
        <Btn title="Remove Link" onClick={() => exec("unlink")}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M9 9l6 6m0-6l-6 6" />
          </svg>
        </Btn>

        {toolbarDivider}

        {/* horizontal rule */}
        <Btn title="Horizontal Rule" onClick={() => exec("insertHorizontalRule")}>
          <span className="text-xs font-bold">—</span>
        </Btn>

        {/* superscript / subscript */}
        <Btn title="Superscript" active={isActive("superscript")} onClick={() => exec("superscript")}>
          <span className="text-xs">x<sup>2</sup></span>
        </Btn>
        <Btn title="Subscript" active={isActive("subscript")} onClick={() => exec("subscript")}>
          <span className="text-xs">x<sub>2</sub></span>
        </Btn>

        {toolbarDivider}

        {/* undo / redo */}
        <Btn title="Undo (Ctrl+Z)" onClick={() => exec("undo")}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
        </Btn>
        <Btn title="Redo (Ctrl+Y)" onClick={() => exec("redo")}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
        </Btn>

        {toolbarDivider}

        {/* clear formatting */}
        <Btn title="Clear Formatting" onClick={() => exec("removeFormat")}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </Btn>

      </div>

      {/* ── editable area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="
          px-4 py-3 text-gray-800 text-sm leading-relaxed outline-none
          prose prose-sm max-w-none
          [&_h1]:text-2xl [&_h1]:font-black [&_h1]:mt-3 [&_h1]:mb-1
          [&_h2]:text-xl  [&_h2]:font-bold  [&_h2]:mt-3 [&_h2]:mb-1
          [&_h3]:text-lg  [&_h3]:font-bold  [&_h3]:mt-2 [&_h3]:mb-1
          [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-2 [&_h4]:mb-1
          [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-2
          [&_pre]:bg-gray-900 [&_pre]:text-green-400 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-2 [&_pre]:overflow-x-auto
          [&_a]:text-indigo-600 [&_a]:underline [&_a]:cursor-pointer
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1
          [&_hr]:border-gray-300 [&_hr]:my-3
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none
        "
      />
    </div>
  );
}
