/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { Plus, ShoppingCart, History, List, Trash2, Check, Search, ChevronRight, ShoppingBag, X, ArrowLeft, Minus, Cloud, CloudOff, RefreshCw, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

import { ShoppingItem, CartItem, PurchaseHistory } from "./types";
import { cn } from "@/lib/utils";

export default function App() {
  // State
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem("shoppingList");
    return saved ? JSON.parse(saved) : [];
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("currentCart");
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<PurchaseHistory[]>(() => {
    const saved = localStorage.getItem("purchaseHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [buyingItem, setBuyingItem] = useState<ShoppingItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState("1");
  const [buyUnitPrice, setBuyUnitPrice] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem("welcomeDismissed");
  });
  const [googleSheetUrl, setGoogleSheetUrl] = useState(() => localStorage.getItem("googleSheetUrl") || "");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem("currentCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("purchaseHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (googleSheetUrl) {
      localStorage.setItem("googleSheetUrl", googleSheetUrl);
    }
  }, [googleSheetUrl]);

  // Cloud Sync Actions
  const syncWithCloud = async (currentList = shoppingList, currentHistory = history) => {
    if (!googleSheetUrl) {
      toast.error("Configure a URL da planilha nas configurações");
      setIsSettingsOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      await fetch(googleSheetUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          action: "sync",
          shoppingList: currentList,
          history: currentHistory
        }),
      });
      
      toast.success("Dados sincronizados com a nuvem!");
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Erro ao sincronizar com a nuvem");
    } finally {
      setIsSyncing(false);
    }
  };

  const loadFromCloud = async () => {
    if (!googleSheetUrl) {
      toast.error("Configure a URL da planilha nas configurações");
      setIsSettingsOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(googleSheetUrl);
      if (!response.ok) throw new Error("Falha ao carregar");
      
      const data = await response.json();
      if (data.shoppingList) setShoppingList(data.shoppingList);
      if (data.history) setHistory(data.history);
      
      toast.success("Dados carregados da nuvem!");
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Erro ao carregar dados da nuvem. Verifique a URL.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const filteredHistory = useMemo(() => {
    if (!historySearch) return history;
    const search = historySearch.toLowerCase();
    return history.filter(purchase => 
      purchase.items.some(item => item.name.toLowerCase().includes(search)) ||
      format(new Date(purchase.date), "dd/MM/yyyy").includes(search)
    );
  }, [history, historySearch]);

  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: PurchaseHistory[] } = {};
    
    // Sort history by date descending first
    const sortedHistory = [...filteredHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedHistory.forEach(purchase => {
      const date = new Date(purchase.date);
      const monthYear = format(date, "MMMM 'de' yyyy", { locale: ptBR });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(purchase);
    });
    
    return Object.entries(groups);
  }, [filteredHistory]);

  const suggestions = useMemo(() => {
    const names = new Set<string>();
    history.forEach(purchase => {
      purchase.items.forEach(item => {
        names.add(item.name);
      });
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [history]);

  const filteredSuggestions = useMemo(() => {
    const search = newItemName.trim().toLowerCase();
    if (!search) return suggestions.slice(0, 6);
    return suggestions
      .filter(name => name.toLowerCase().includes(search))
      .slice(0, 6);
  }, [suggestions, newItemName]);

  // Actions
  const addItemToList = () => {
    if (!newItemName.trim()) return;
    const qty = parseInt(newItemQuantity) || 1;
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      quantity: qty,
      isBought: false,
    };
    const updatedList = [...shoppingList, newItem];
    setShoppingList(updatedList);
    setNewItemName("");
    setNewItemQuantity("1");
    setIsAddDialogOpen(false);
    toast.success("Item adicionado à lista!");

    // Auto-sync if cloud is configured
    if (googleSheetUrl) {
      syncWithCloud(updatedList, history);
    }
  };

  const removeItemFromList = (id: string) => {
    const updatedList = shoppingList.filter(item => item.id !== id);
    setShoppingList(updatedList);
    toast.info("Item removido da lista");

    // Auto-sync if cloud is configured
    if (googleSheetUrl) {
      syncWithCloud(updatedList, history);
    }
  };

  const startBuying = (item: ShoppingItem) => {
    setBuyingItem(item);
    setBuyQuantity(item.quantity.toString());
    setBuyUnitPrice("");
  };

  const addToCart = () => {
    if (!buyingItem || !buyQuantity || !buyUnitPrice) return;
    
    const qty = parseFloat(buyQuantity);
    const price = parseFloat(buyUnitPrice);
    
    if (isNaN(qty) || isNaN(price)) {
      toast.error("Por favor, insira valores válidos");
      return;
    }

    const cartItem: CartItem = {
      ...buyingItem,
      quantity: qty,
      unitPrice: price,
      totalPrice: qty * price,
      isBought: true,
    };

    setCart([...cart, cartItem]);
    setShoppingList(shoppingList.filter(item => item.id !== buyingItem.id));
    setBuyingItem(null);
    toast.success(`${cartItem.name} adicionado ao carrinho!`);
  };

  const removeFromCart = (id: string) => {
    const itemToRemove = cart.find(item => item.id === id);
    if (itemToRemove) {
      setCart(cart.filter(item => item.id !== id));
      // Put it back in the list
      const listItem: ShoppingItem = {
        id: itemToRemove.id,
        name: itemToRemove.name,
        quantity: itemToRemove.quantity,
        isBought: false,
      };
      setShoppingList([...shoppingList, listItem]);
      toast.info("Item removido do carrinho e devolvido à lista");
    }
  };

  const finalizePurchase = () => {
    if (cart.length === 0) return;

    const newPurchase: PurchaseHistory = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: [...cart],
      totalAmount: cartTotal,
    };

    const updatedHistory = [newPurchase, ...history];
    setHistory(updatedHistory);
    setCart([]);
    toast.success("Compra finalizada e salva no histórico!");
    setActiveTab("history");

    // Auto-sync if cloud is configured
    if (googleSheetUrl) {
      syncWithCloud(shoppingList, updatedHistory);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const removePurchase = (id: string) => {
    const updatedHistory = history.filter(p => p.id !== id);
    setHistory(updatedHistory);
    toast.info("Compra removida do histórico");
    
    // Auto-sync if cloud is configured
    if (googleSheetUrl) {
      // We use a small timeout to ensure state is updated or use the local variable
      syncWithCloud(shoppingList, updatedHistory);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    toast.info("Histórico limpo com sucesso");
    
    // Auto-sync if cloud is configured
    if (googleSheetUrl) {
      syncWithCloud(shoppingList, []);
    }
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("welcomeDismissed", "true");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#2D3436] font-sans pb-24">
      <Toaster position="top-center" richColors />
      
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-success flex flex-col items-center justify-center p-6 text-white text-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="space-y-8 max-w-sm"
            >
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl border border-white/30 overflow-hidden">
                <img 
                  src="https://i.ibb.co/hFtwVJZM/logo-super.png" 
                  alt="SuperMarket Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-black font-display tracking-tighter">SuperMarket</h1>
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                  Sua lista de compras inteligente, organizada e sempre com você na nuvem.
                </p>
              </div>

              <div className="pt-8">
                <Button 
                  onClick={dismissWelcome}
                  className="w-full h-14 bg-white text-success hover:bg-white/90 rounded-2xl text-lg font-bold shadow-xl shadow-black/10 transition-transform active:scale-95"
                >
                  Começar a Comprar
                </Button>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Versão 2.0 • Cloud Sync</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/[0.03]">
        <div className="max-w-xl mx-auto px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-black/5 overflow-hidden">
              <img 
                src="https://i.ibb.co/hFtwVJZM/logo-super.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl font-extrabold font-display tracking-tight text-success leading-none">SuperMarket</h1>
              <p className="text-[9px] font-bold text-black/30 uppercase tracking-[0.2em]">Sua Lista Inteligente</p>
            </div>
            {googleSheetUrl && (
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={() => syncWithCloud()}
                disabled={isSyncing}
                className={cn("text-success/40 hover:text-success", isSyncing && "animate-spin")}
              >
                <Cloud size={16} />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-xl text-black/20 hover:text-black/60"
            >
              <Settings size={18} />
            </Button>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger render={<Button size="sm" className="rounded-xl bg-success text-white hover:opacity-90 shadow-sm px-4" />}>
              <Plus size={16} className="mr-1.5" />
              Novo Item
            </DialogTrigger>
            <DialogContent className="sm:max-w-[360px] rounded-2xl border-none shadow-2xl p-6">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-xl font-extrabold font-display">O que falta?</DialogTitle>
                <DialogDescription className="text-sm">
                  Adicione um item e a quantidade desejada.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Nome do Produto</Label>
                  <Input 
                    id="name" 
                    placeholder="Ex: Café, Frutas..." 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItemToList()}
                    className="h-11 rounded-xl border-black/5 bg-black/[0.02] focus-visible:ring-success px-4 text-sm font-medium"
                    autoFocus
                  />
                  
                  {filteredSuggestions.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-black/20 mb-2 ml-1">Sugestões do histórico</p>
                      <div className="flex flex-wrap gap-1.5">
                        {filteredSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setNewItemName(suggestion)}
                            className="px-3 py-1.5 rounded-lg bg-black/[0.03] hover:bg-success/10 hover:text-success text-[10px] font-bold transition-colors border border-transparent hover:border-success/20"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial-qty" className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Quantidade</Label>
                  <Input 
                    id="initial-qty" 
                    type="number"
                    min="1"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    className="h-11 rounded-xl border-black/5 bg-black/[0.02] focus-visible:ring-success px-4 text-sm font-medium"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addItemToList} className="w-full h-11 rounded-xl bg-success text-white hover:opacity-90 text-sm font-bold">
                  Adicionar à Lista
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <AnimatePresence mode="wait">
            {/* Shopping List Tab */}
            <TabsContent value="list" className="mt-0 outline-none">
              <motion.div
                key="list-tab"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.15 }}
              >
                {shoppingList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black/10 card-shadow">
                      <List size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold font-display">Tudo em dia!</h3>
                      <p className="text-xs text-black/40 max-w-[180px] mx-auto">Sua lista está vazia. Adicione itens para começar.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {shoppingList.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group bg-white p-4 rounded-2xl border border-black/[0.03] flex items-center justify-between card-shadow hover:translate-y-[-2px] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center text-success font-bold text-base font-display">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm tracking-tight">{item.name}</span>
                            <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{item.quantity} {item.quantity === 1 ? 'unidade' : 'unidades'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => removeItemFromList(item.id)}
                            className="rounded-lg text-black/10 hover:text-red-400 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </Button>
                          <Button 
                            onClick={() => startBuying(item)}
                            size="sm"
                            className="bg-success text-white hover:opacity-90 rounded-xl px-4 h-9 font-bold text-[11px]"
                          >
                            Comprar
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Cart Tab */}
            <TabsContent value="cart" className="mt-0 outline-none">
              <motion.div
                key="cart-tab"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.15 }}
              >
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black/10 card-shadow">
                      <ShoppingCart size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold font-display">Carrinho vazio</h3>
                      <p className="text-xs text-black/40 max-w-[180px] mx-auto">Selecione itens da lista para começar sua compra.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-3">
                      {cart.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          className="bg-white p-4 rounded-2xl border border-black/[0.03] card-shadow space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-success rounded-xl flex items-center justify-center text-white">
                                <Check size={14} />
                              </div>
                              <span className="font-bold text-base tracking-tight">{item.name}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              onClick={() => removeFromCart(item.id)}
                              className="text-black/10 hover:text-red-400"
                            >
                              <X size={15} />
                            </Button>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30">Detalhes</p>
                              <p className="text-xs font-bold text-black/60">
                                {item.quantity} × {formatCurrency(item.unitPrice)}
                              </p>
                            </div>
                            <div className="text-right space-y-0.5">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30">Subtotal</p>
                              <p className="font-black text-lg tracking-tighter">{formatCurrency(item.totalPrice)}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-success text-white p-6 rounded-2xl shadow-lg shadow-success/5 space-y-5">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-60">Total Estimado</p>
                          <p className="text-2xl font-bold tracking-tighter">{formatCurrency(cartTotal)}</p>
                        </div>
                        <Badge className="bg-white/20 text-white border-none px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                          {cart.length} {cart.length === 1 ? "Item" : "Itens"}
                        </Badge>
                      </div>
                      <Button 
                        onClick={finalizePurchase} 
                        className="w-full h-11 bg-white text-success hover:bg-white/90 rounded-xl text-sm font-bold tracking-tight"
                      >
                        Finalizar Compra
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-0 outline-none">
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-success transition-colors" size={16} />
                    <Input 
                      placeholder="Pesquisar histórico..." 
                      className="h-11 pl-10 pr-4 rounded-xl bg-white border-black/[0.03] card-shadow focus-visible:ring-success text-xs font-medium"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                  </div>
                  {history.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      onClick={clearHistory}
                      className="h-11 w-11 rounded-xl bg-white border border-black/[0.03] card-shadow text-black/10 hover:text-red-400"
                      title="Limpar histórico"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black/10 card-shadow">
                      <History size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold font-display">Sem histórico</h3>
                      <p className="text-xs text-black/40 max-w-[180px] mx-auto">Suas compras finalizadas aparecerão aqui.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {groupedHistory.map(([monthYear, purchases]) => (
                      <div key={monthYear} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 whitespace-nowrap">
                            {monthYear}
                          </h3>
                          <div className="h-[1px] w-full bg-black/[0.03]" />
                        </div>
                        
                        <div className="grid gap-3">
                          {purchases.map((purchase) => (
                            <div key={purchase.id} className="relative group/item">
                              <Dialog>
                                <DialogTrigger render={<button className="w-full text-left group bg-white p-4 rounded-2xl border border-black/[0.03] flex items-center justify-between card-shadow hover:translate-y-[-1px] transition-all active:scale-[0.99]" />}>
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/20">
                                      {format(new Date(purchase.date), "dd 'de' MMMM", { locale: ptBR })}
                                    </p>
                                    <p className="text-lg font-bold tracking-tighter text-success">{formatCurrency(purchase.totalAmount)}</p>
                                    <div className="flex items-center gap-1.5">
                                      <Badge variant="outline" className="rounded-full border-black/5 text-[8px] font-bold uppercase tracking-widest px-2 py-0 text-black/40">
                                        {purchase.items.length} Itens
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon-sm" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removePurchase(purchase.id);
                                      }}
                                      className="opacity-0 group-hover/item:opacity-100 text-black/10 hover:text-red-400 transition-opacity"
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success/40 group-hover:bg-success group-hover:text-white transition-all">
                                      <ChevronRight size={16} />
                                    </div>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[380px] rounded-2xl border-none shadow-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
                                  <DialogHeader className="p-5 pb-2">
                                    <DialogTitle className="text-lg font-extrabold font-display tracking-tight">Recibo</DialogTitle>
                                    <DialogDescription className="text-xs font-medium">
                                      {format(new Date(purchase.date), "dd/MM/yyyy 'às' HH:mm")}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="flex-1 px-5">
                                    <div className="space-y-3 py-3">
                                      {purchase.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start">
                                          <div className="space-y-0.5">
                                            <p className="font-bold text-sm tracking-tight">{item.name}</p>
                                            <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                                          </div>
                                          <p className="font-bold text-sm tracking-tighter">{formatCurrency(item.totalPrice)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                  <div className="p-5 bg-success text-white">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-60">Total Pago</span>
                                      <span className="text-xl font-bold tracking-tighter">{formatCurrency(purchase.totalAmount)}</span>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Buying Dialog */}
      <Dialog open={!!buyingItem} onOpenChange={(open) => !open && setBuyingItem(null)}>
        <DialogContent className="sm:max-w-[360px] rounded-2xl border-none shadow-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-extrabold font-display">Comprando</DialogTitle>
            <DialogDescription className="text-sm font-semibold text-success/70 tracking-tight">
              {buyingItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="qty" className="text-[9px] font-bold uppercase tracking-[0.1em] text-black/30 ml-1">Quantidade</Label>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon-sm" 
                    className="h-11 w-11 rounded-xl border-black/5 bg-black/[0.02]"
                    onClick={() => setBuyQuantity(prev => Math.max(1, (parseInt(prev) || 1) - 1).toString())}
                  >
                    <Minus size={14} />
                  </Button>
                  <Input 
                    id="qty" 
                    type="number" 
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(e.target.value)}
                    className="h-11 rounded-xl border-black/5 bg-black/[0.02] focus-visible:ring-success px-2 text-center text-sm font-bold tracking-tight"
                  />
                  <Button 
                    variant="outline" 
                    size="icon-sm" 
                    className="h-11 w-11 rounded-xl border-black/5 bg-black/[0.02]"
                    onClick={() => setBuyQuantity(prev => ((parseInt(prev) || 0) + 1).toString())}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-[9px] font-bold uppercase tracking-[0.1em] text-black/30 ml-1">Preço (R$)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01"
                  placeholder="0,00"
                  value={buyUnitPrice}
                  onChange={(e) => setBuyUnitPrice(e.target.value)}
                  className="h-11 rounded-xl border-black/5 bg-black/[0.02] focus-visible:ring-success px-4 text-sm font-bold tracking-tight"
                />
              </div>
            </div>
            
            {buyQuantity && buyUnitPrice && !isNaN(parseFloat(buyQuantity)) && !isNaN(parseFloat(buyUnitPrice)) && (
              <div className="bg-success/5 text-success p-4 rounded-xl flex justify-between items-center border border-success/5">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">Subtotal</span>
                <span className="text-lg font-bold tracking-tighter">
                  {formatCurrency(parseFloat(buyQuantity) * parseFloat(buyUnitPrice))}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={addToCart} className="w-full h-11 rounded-xl bg-success text-white hover:opacity-90 text-sm font-bold">
              Adicionar ao Carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm z-40">
        <div className="glass rounded-2xl p-1.5 shadow-lg shadow-black/5 flex justify-between items-center">
          <button 
            onClick={() => setActiveTab("list")}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all",
              activeTab === "list" ? "bg-success text-white shadow-sm" : "text-black/20 hover:text-success/60 hover:bg-success/5"
            )}
          >
            <List size={18} />
            <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Lista</span>
          </button>
          <button 
            onClick={() => setActiveTab("cart")}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all relative",
              activeTab === "cart" ? "bg-success text-white shadow-sm" : "text-black/20 hover:text-success/60 hover:bg-success/5"
            )}
          >
            <div className="relative">
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Carrinho</span>
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all",
              activeTab === "history" ? "bg-success text-white shadow-sm" : "text-black/20 hover:text-success/60 hover:bg-success/5"
            )}
          >
            <History size={18} />
            <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Histórico</span>
          </button>
        </div>
      </div>

      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm z-50"
          >
            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-black/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                <img src="https://i.ibb.co/hFtwVJZM/logo-super.png" alt="App Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold tracking-tight">Instalar SuperMarket</h4>
                <p className="text-[10px] text-black/40 font-medium">Adicione à tela inicial para acesso rápido.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowInstallPrompt(false)} className="h-8 px-3 text-[10px] font-bold">Agora não</Button>
                <Button size="sm" onClick={handleInstallClick} className="h-8 px-4 bg-success text-white text-[10px] font-bold rounded-lg">Instalar</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[360px] rounded-2xl border-none shadow-2xl p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-extrabold font-display">Configurações</DialogTitle>
            <DialogDescription className="text-sm">
              Conecte sua planilha do Google para salvar seus dados na nuvem.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-url" className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">URL do App Script</Label>
              <Input 
                id="sheet-url" 
                placeholder="https://script.google.com/macros/s/.../exec" 
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                className="h-11 rounded-xl border-black/5 bg-black/[0.02] focus-visible:ring-success px-4 text-[10px] font-medium"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={loadFromCloud}
                disabled={isSyncing || !googleSheetUrl}
                className="h-11 rounded-xl border-black/5 bg-black/[0.02] text-xs font-bold"
              >
                {isSyncing ? <RefreshCw size={14} className="animate-spin mr-2" /> : <Cloud size={14} className="mr-2" />}
                Carregar
              </Button>
              <Button 
                onClick={() => syncWithCloud()}
                disabled={isSyncing || !googleSheetUrl}
                className="h-11 rounded-xl bg-success text-white hover:opacity-90 text-xs font-bold"
              >
                {isSyncing ? <RefreshCw size={14} className="animate-spin mr-2" /> : <Cloud size={14} className="mr-2" />}
                Salvar
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)} className="w-full h-11 rounded-xl bg-black text-white hover:opacity-90 text-sm font-bold">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
