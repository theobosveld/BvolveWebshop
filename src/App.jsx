import { useState, useEffect, useMemo, useRef } from "react";
import {
  ShoppingCart, Plus, Minus, X, Trash2, Pencil, Settings,
  Check, Loader2, ImageOff, Mail, ChevronRight, ChevronLeft, Copy, Sparkles, Upload
} from "lucide-react";

const MAX_IMAGE_DIMENSION = 900;
const IMAGE_JPEG_QUALITY = 0.8;

function resizeImageFile(file, maxDimension = MAX_IMAGE_DIMENSION, quality = IMAGE_JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Bestand kon niet worden gelezen"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Afbeelding kon niet worden geladen"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const CATEGORIES = [
  { id: "kwartet", label: "Kwartetspellen", chip: "bg-orange-100 text-orange-900", dot: "bg-orange-500", solid: "bg-orange-500 hover:bg-orange-600" },
  { id: "kinderboek", label: "Kinderboeken", chip: "bg-teal-100 text-teal-900", dot: "bg-teal-500", solid: "bg-teal-600 hover:bg-teal-700" },
  { id: "escaperoom", label: "Escaperooms", chip: "bg-purple-100 text-purple-900", dot: "bg-purple-500", solid: "bg-purple-600 hover:bg-purple-700" },
  { id: "Merchandise", label: "Merchandise", chip: "bg-blue-100 text-blue-900", dot: "bg-blue-500", solid: "bg-purple-600 hover:bg-blue-700" },
];

const catInfo = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

const SEED_PRODUCTS = [
  { id: "p1", name: "Kwartet Dieren van de Wereld", category: "kwartet", price: 9.95, description: "Vrolijk kwartetspel met 32 kaarten vol dieren van alle continenten. Voor 2-6 spelers vanaf 5 jaar.", image: "https://placehold.co/600x600/fbf3e3/b45309?text=Kwartet%0ADieren" },
  { id: "p2", name: "Kwartet Beroepen", category: "kwartet", price: 9.95, description: "Ontdek samen welke beroepen er allemaal zijn. Leerzaam en leuk voor het hele gezin.", image: "https://placehold.co/600x600/fbf3e3/b45309?text=Kwartet%0ABeroepen" },
  { id: "p3", name: "Het Grote Zoekboek", category: "kinderboek", price: 14.95, description: "Een vrolijk geïllustreerd zoekboek vol verstopte figuren. Uren speurplezier voor kinderen vanaf 4 jaar.", image: "https://placehold.co/600x600/e6f3ee/0f6e56?text=Het+Grote%0AZoekboek" },
  { id: "p4", name: "Avonturen in het Bos", category: "kinderboek", price: 12.50, description: "Een warm voorleesboek over vriendschap en avontuur, met prachtige illustraties.", image: "https://placehold.co/600x600/e6f3ee/0f6e56?text=Avonturen%0Ain+het+Bos" },
  { id: "p5", name: "Escaperoom in a Box: Het Geheime Lab", category: "escaperoom", price: 29.95, description: "Een compacte escaperoom-ervaring voor thuis. Los puzzels op en ontsnap binnen 60 minuten.", image: "https://placehold.co/600x600/f1ecfb/533ab6?text=Het%0AGeheime+Lab" },
  { id: "p6", name: "Escaperoom Mini: De Verloren Schat", category: "escaperoom", price: 19.95, description: "Een kleinere escapebox, ideaal als verrassing of cadeau. Voor 1-4 spelers.", image: "https://placehold.co/600x600/f1ecfb/533ab6?text=De+Verloren%0ASchat" },
];

const DEFAULT_SETTINGS = { shopName: "Bvolve Webshop", recipientEmail: "" };

const euro = (n) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n || 0);

const emptyForm = { id: null, name: "", category: "kwartet", price: "", description: "", image: "" };

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState({});
  const [qtyDraft, setQtyDraft] = useState({});

  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState("cart"); // cart | form | done
  const [customer, setCustomer] = useState({ naam: "", straat: "", postcode: "", plaats: "", email: "", telefoon: "", opmerking: "" });
  const [orderText, setOrderText] = useState("");
  const [copied, setCopied] = useState(false);

  const [adminOpen, setAdminOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [emailDraft, setEmailDraft] = useState("");
  const [shopNameDraft, setShopNameDraft] = useState("");
  const [savedFlash, setSavedFlash] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      let p = null;
      try {
        const raw = localStorage.getItem("webshop:products");
        p = raw ? JSON.parse(raw) : null;
      } catch {
        p = null;
      }
      if (!p || !Array.isArray(p) || p.length === 0) {
        p = SEED_PRODUCTS;
        localStorage.setItem("webshop:products", JSON.stringify(p));
      }
      setProducts(p);

      let s = null;
      try {
        const raw = localStorage.getItem("webshop:settings");
        s = raw ? JSON.parse(raw) : null;
      } catch {
        s = null;
      }
      if (!s) {
        s = DEFAULT_SETTINGS;
        localStorage.setItem("webshop:settings", JSON.stringify(s));
      }
      setSettings(s);
      setEmailDraft(s.recipientEmail || "");
      setShopNameDraft(s.shopName || "Bvolve Webshop");
    } catch (e) {
      console.error("Laden mislukt", e);
      setProducts(SEED_PRODUCTS);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistProducts = (next) => {
    setProducts(next);
    try {
      localStorage.setItem("webshop:products", JSON.stringify(next));
    } catch (e) {
      console.error("Opslaan artikelen mislukt", e);
    }
  };

  const persistSettings = (next) => {
    setSettings(next);
    try {
      localStorage.setItem("webshop:settings", JSON.stringify(next));
    } catch (e) {
      console.error("Opslaan instellingen mislukt", e);
    }
  };

  const filteredProducts = useMemo(
    () => (activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)),
    [products, activeCategory]
  );

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const product = products.find((p) => p.id === id);
          if (!product || qty <= 0) return null;
          return { ...product, qty, lineTotal: product.price * qty };
        })
        .filter(Boolean),
    [cart, products]
  );

  const cartCount = cartLines.reduce((sum, l) => sum + l.qty, 0);
  const cartTotal = cartLines.reduce((sum, l) => sum + l.lineTotal, 0);

  const setQty = (id, qty) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const addToCart = (id) => {
    const add = qtyDraft[id] || 1;
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + add }));
    setQtyDraft((prev) => ({ ...prev, [id]: 1 }));
    setCartOpen(true);
    setCartStep("cart");
  };

  const buildOrderText = () => {
    const lines = cartLines
      .map((l) => `- ${l.qty}x ${l.name} (${euro(l.price)} per stuk) = ${euro(l.lineTotal)}`)
      .join("\n");
    return [
      `Nieuwe bestelling via ${settings.shopName || "de webshop"}`,
      "",
      "Klantgegevens:",
      `Naam: ${customer.naam}`,
      `Adres: ${customer.straat}, ${customer.postcode} ${customer.plaats}`,
      `E-mail: ${customer.email}`,
      `Telefoon: ${customer.telefoon}`,
      "",
      "Bestelling:",
      lines,
      "",
      `Totaal: ${euro(cartTotal)}`,
      customer.opmerking ? `\nOpmerking:\n${customer.opmerking}` : "",
    ].join("\n");
  };

  const submitOrder = () => {
    const text = buildOrderText();
    setOrderText(text);
    const to = settings.recipientEmail || "";
    const subject = `Nieuwe bestelling - ${customer.naam}`;
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailto;
    setCartStep("done");
  };

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const startNewOrder = () => {
    setCart({});
    setCustomer({ naam: "", straat: "", postcode: "", plaats: "", email: "", telefoon: "", opmerking: "" });
    setCartStep("cart");
    setCartOpen(false);
  };

  const customerValid =
    customer.naam.trim() && customer.straat.trim() && customer.postcode.trim() &&
    customer.plaats.trim() && customer.email.trim() && customer.telefoon.trim();

  const resetForm = () => setForm(emptyForm);

  const saveProduct = () => {
    if (!form.name.trim() || !form.price) return;
    const priceNum = parseFloat(String(form.price).replace(",", "."));
    if (isNaN(priceNum)) return;
    const image = form.image.trim() || `https://placehold.co/600x600/eee/999?text=${encodeURIComponent(form.name)}`;
    if (form.id) {
      const next = products.map((p) =>
        p.id === form.id ? { ...p, name: form.name, category: form.category, price: priceNum, description: form.description, image } : p
      );
      persistProducts(next);
      setSavedFlash("Artikel bijgewerkt");
    } else {
      const next = [...products, { id: "p" + Date.now(), name: form.name, category: form.category, price: priceNum, description: form.description, image }];
      persistProducts(next);
      setSavedFlash("Artikel toegevoegd");
    }
    resetForm();
    setTimeout(() => setSavedFlash(""), 2000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Kies een afbeeldingsbestand (jpg, png, webp).");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const dataUrl = await resizeImageFile(file);
      setForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      console.error("Uploaden mislukt", err);
      setUploadError("De afbeelding kon niet worden verwerkt. Probeer een ander bestand.");
    } finally {
      setUploading(false);
    }
  };

  const editProduct = (p) => {
    setForm({ id: p.id, name: p.name, category: p.category, price: String(p.price), description: p.description, image: p.image });
    setAdminOpen(true);
  };

  const deleteProduct = (id) => {
    persistProducts(products.filter((p) => p.id !== id));
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (form.id === id) resetForm();
  };

  const saveSettings = () => {
    persistSettings({ shopName: shopNameDraft.trim() || "Bvolve Webshop", recipientEmail: emailDraft.trim() });
    setSavedFlash("Instellingen opgeslagen");
    setTimeout(() => setSavedFlash(""), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-gray-600 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-orange-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gray-600" />
            </span>
            <span className="font-semibold text-lg tracking-tight">{settings.shopName}</span>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-1.5 rounded-full text-sm transition ${activeCategory === "all" ? "bg-orange-400 text-gray-600 font-medium" : "text-gray-200 hover:text-white"}`}
            >
              Alles
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-1.5 rounded-full text-sm transition ${activeCategory === c.id ? "bg-orange-400 text-gray-600 font-medium" : "text-gray-200 hover:text-white"}`}
              >
                {c.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-200 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition"
            >
              <Settings className="w-4 h-4" />
              Beheer
            </button>
            <button
              onClick={() => { setCartOpen(true); setCartStep("cart"); }}
              className="relative flex items-center gap-2 bg-orange-400 hover:bg-orange-300 text-gray-600 font-medium px-4 py-2 rounded-full transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Winkelwagen</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* mobile category scroller */}
        <div className="md:hidden flex gap-2 overflow-x-auto px-4 pb-3">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm ${activeCategory === "all" ? "bg-orange-400 text-gray-600 font-medium" : "bg-white/10 text-slate-200"}`}
          >
            Alles
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm ${activeCategory === c.id ? "bg-orange-400 text-gray-600 font-medium" : "bg-white/10 text-slate-200"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gray-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 pt-2 sm:pb-16">
          <div className="max-w-3xl">
            <p className="text-orange-400 text-sm font-medium mb-2">Kwartetspellen · Kinderboeken · Escaperooms · Merchandise</p>
            <h1 className="text-xl sm:text-4xl font-semibold tracking-tight leading-tight mb-3">
              Speelse producten, <span className="text-orange-400">recht naar jouw deur.</span>
            </h1>
            <p className="text-slate-300 text-base mb-2">
              
            </p>
          </div>
        </div>
      </section>

      {/* Admin save flash */}
      {savedFlash && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-600 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 text-orange-400" />
          {savedFlash}
        </div>
      )}

      {/* Product grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="mb-2">Nog geen artikelen in deze categorie.</p>
            <button onClick={() => setAdminOpen(true)} className="text-orange-600 font-medium hover:underline">
              Voeg een artikel toe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => {
              const info = catInfo(p.category);
              const draft = qtyDraft[p.id] || 1;
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col">
                  <div className="aspect-square bg-stone-100 overflow-hidden relative">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageOff className="w-8 h-8" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${info.chip}`}>
                      {info.label}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-600 mb-1 leading-snug">{p.name}</h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2 flex-1">{p.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-gray-600">{euro(p.price)}</span>
                      <div className="flex items-center border border-stone-200 rounded-full">
                        <button
                          onClick={() => setQtyDraft((prev) => ({ ...prev, [p.id]: Math.max(1, draft - 1) }))}
                          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-gray-600"
                          aria-label="Aantal verlagen"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{draft}</span>
                        <button
                          onClick={() => setQtyDraft((prev) => ({ ...prev, [p.id]: draft + 1 }))}
                          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-gray-600"
                          aria-label="Aantal verhogen"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(p.id)}
                      className={`w-full text-white font-medium text-sm py-2.5 rounded-full transition ${info.solid}`}
                    >
                      In winkelwagen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-slate-400">
        {settings.shopName} · Bestellingen worden per e-mail verwerkt, geen account nodig.
      </footer>

      {/* Cart / checkout slide-over */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-gray-600/40" onClick={() => setCartOpen(false)} />
          <div className="relative w-full sm:w-[420px] bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
              <h2 className="font-semibold text-gray-600">
                {cartStep === "cart" && "Winkelwagen"}
                {cartStep === "form" && "Jouw gegevens"}
                {cartStep === "done" && "Bestelling verzonden"}
              </h2>
              <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-slate-700" aria-label="Sluiten">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartStep === "cart" && (
                cartLines.length === 0 ? (
                  <p className="text-slate-400 text-sm mt-8 text-center">Je winkelwagen is nog leeg.</p>
                ) : (
                  <div className="space-y-4">
                    {cartLines.map((l) => (
                      <div key={l.id} className="flex gap-3">
                        <img src={l.image} alt={l.name} className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 truncate">{l.name}</p>
                          <p className="text-xs text-slate-400 mb-1.5">{euro(l.price)} per stuk</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-stone-200 rounded-full">
                              <button onClick={() => setQty(l.id, l.qty - 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-gray-600" aria-label="Aantal verlagen">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-medium">{l.qty}</span>
                              <button onClick={() => setQty(l.id, l.qty + 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-gray-600" aria-label="Aantal verhogen">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{euro(l.lineTotal)}</span>
                          </div>
                        </div>
                        <button onClick={() => setQty(l.id, 0)} className="text-slate-300 hover:text-red-500 shrink-0" aria-label="Verwijderen">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}

              {cartStep === "form" && (
                <div className="space-y-3">
                  <div className="bg-stone-50 rounded-xl p-3 mb-2 text-sm">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>{cartCount} artikel{cartCount !== 1 ? "en" : ""}</span>
                      <span className="font-medium text-gray-600">{euro(cartTotal)}</span>
                    </div>
                  </div>
                  <Field label="Naam">
                    <input value={customer.naam} onChange={(e) => setCustomer({ ...customer, naam: e.target.value })} className="input" placeholder="Voor- en achternaam" />
                  </Field>
                  <Field label="Straat en huisnummer">
                    <input value={customer.straat} onChange={(e) => setCustomer({ ...customer, straat: e.target.value })} className="input" placeholder="Hoofdstraat 1" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Postcode">
                      <input value={customer.postcode} onChange={(e) => setCustomer({ ...customer, postcode: e.target.value })} className="input" placeholder="1234 AB" />
                    </Field>
                    <Field label="Plaats">
                      <input value={customer.plaats} onChange={(e) => setCustomer({ ...customer, plaats: e.target.value })} className="input" placeholder="Amsterdam" />
                    </Field>
                  </div>
                  <Field label="E-mailadres">
                    <input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="input" placeholder="naam@email.nl" />
                  </Field>
                  <Field label="Telefoonnummer">
                    <input value={customer.telefoon} onChange={(e) => setCustomer({ ...customer, telefoon: e.target.value })} className="input" placeholder="06 12345678" />
                  </Field>
                  <Field label="Opmerking (optioneel)">
                    <textarea value={customer.opmerking} onChange={(e) => setCustomer({ ...customer, opmerking: e.target.value })} className="input min-h-[70px]" placeholder="Bijvoorbeeld een bezorgwens" />
                  </Field>
                  {!settings.recipientEmail && (
                    <p className="text-xs text-orange-700 bg-orange-50 rounded-lg px-3 py-2">
                      Er is nog geen bestel-e-mailadres ingesteld. Stel dit in via Beheer voordat klanten bestellen.
                    </p>
                  )}
                </div>
              )}

              {cartStep === "done" && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-sm text-slate-600 mb-1">Je e-mailprogramma is geopend met de bestelling klaar om te versturen.</p>
                  <p className="text-xs text-slate-400 mb-4">Niets geopend? Kopieer de bestelling hieronder en stuur 'm handmatig.</p>
                  <button onClick={copyOrder} className="inline-flex items-center gap-1.5 text-sm text-slate-700 border border-stone-200 rounded-full px-4 py-2 hover:bg-stone-50">
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "Gekopieerd" : "Kopieer bestelling"}
                  </button>
                  <pre className="text-left text-xs bg-stone-50 rounded-lg p-3 mt-4 whitespace-pre-wrap text-slate-500 max-h-48 overflow-y-auto">{orderText}</pre>
                </div>
              )}
            </div>

            {cartStep !== "done" && (
              <div className="border-t border-stone-200 px-5 py-4">
                {cartStep === "cart" && (
                  <>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-500">Totaal</span>
                      <span className="font-semibold text-gray-600">{euro(cartTotal)}</span>
                    </div>
                    <button
                      disabled={cartLines.length === 0}
                      onClick={() => setCartStep("form")}
                      className="w-full bg-orange-400 hover:bg-orange-300 disabled:opacity-40 disabled:hover:bg-orange-400 text-gray-600 font-medium py-3 rounded-full flex items-center justify-center gap-1.5"
                    >
                      Naar bestelgegevens
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                {cartStep === "form" && (
                  <div className="flex gap-2">
                    <button onClick={() => setCartStep("cart")} className="px-4 py-3 rounded-full border border-stone-200 text-slate-600 flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={!customerValid}
                      onClick={submitOrder}
                      className="flex-1 bg-orange-400 hover:bg-orange-300 disabled:opacity-40 text-gray-600 font-medium py-3 rounded-full flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-4 h-4" />
                      Bestelling versturen
                    </button>
                  </div>
                )}
              </div>
            )}
            {cartStep === "done" && (
              <div className="border-t border-stone-200 px-5 py-4">
                <button onClick={startNewOrder} className="w-full bg-gray-600 hover:bg-slate-800 text-white font-medium py-3 rounded-full">
                  Nieuwe bestelling starten
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin panel */}
      {adminOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-gray-600/40" onClick={() => { setAdminOpen(false); resetForm(); }} />
          <div className="relative w-full sm:w-[440px] bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
              <h2 className="font-semibold text-gray-600 flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-500" />
                Beheer winkel
              </h2>
              <button onClick={() => { setAdminOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-700" aria-label="Sluiten">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-7">
              <section>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Winkelinstellingen</h3>
                <div className="space-y-3">
                  <Field label="Winkelnaam">
                    <input value={shopNameDraft} onChange={(e) => setShopNameDraft(e.target.value)} className="input" placeholder="Bvolve Webshop" />
                  </Field>
                  <Field label="E-mailadres voor bestellingen">
                    <input type="email" value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} className="input" placeholder="bestellingen@jouwbedrijf.nl" />
                  </Field>
                  <button onClick={saveSettings} className="text-sm bg-gray-600 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-full">
                    Instellingen opslaan
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">{form.id ? "Artikel bewerken" : "Nieuw artikel toevoegen"}</h3>
                <div className="space-y-3">
                  <Field label="Naam">
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Kwartet Dieren van de Wereld" />
                  </Field>
                  <Field label="Categorie">
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Prijs (EUR)">
                    <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" placeholder="9,95" inputMode="decimal" />
                  </Field>
                  <Field label="Beschrijving">
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[70px]" placeholder="Korte omschrijving van het artikel" />
                  </Field>
                  <Field label="Afbeelding (URL)">
                    <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" placeholder="https://..." />
                  </Field>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">of</span>
                    <div className="flex-1 h-px bg-stone-200" />
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 text-sm text-slate-600 border border-stone-200 rounded-full px-4 py-2 hover:bg-stone-50 disabled:opacity-60"
                    >
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploading ? "Verwerken..." : "Afbeelding uploaden"}
                    </button>
                    {uploadError && <p className="text-xs text-red-600 mt-1.5">{uploadError}</p>}
                  </div>
                  {form.image && (
                    <img src={form.image} alt="Voorbeeld" className="w-20 h-20 rounded-lg object-cover border border-stone-200" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveProduct} className="text-sm bg-orange-400 hover:bg-orange-300 text-gray-600 font-medium px-4 py-2 rounded-full">
                      {form.id ? "Wijzigingen opslaan" : "Artikel toevoegen"}
                    </button>
                    {form.id && (
                      <button onClick={resetForm} className="text-sm text-slate-500 px-4 py-2 hover:underline">
                        Annuleren
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Huidige artikelen ({products.length})</h3>
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 border border-stone-200 rounded-xl px-3 py-2">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-600 truncate">{p.name}</p>
                        <p className="text-xs text-slate-400">{catInfo(p.category).label} · {euro(p.price)}</p>
                      </div>
                      <button onClick={() => editProduct(p)} className="text-slate-400 hover:text-slate-700" aria-label="Bewerken">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="text-slate-300 hover:text-red-500" aria-label="Verwijderen">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input {
          width: 100%;
          font-size: 0.875rem;
          border: 1px solid rgb(214 211 209);
          border-radius: 0.75rem;
          padding: 0.55rem 0.75rem;
          background: white;
          outline: none;
        }
        .input:focus {
          border-color: rgb(251 191 36);
          box-shadow: 0 0 0 3px rgba(251,191,36,0.25);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
