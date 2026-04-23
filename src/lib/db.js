import { supabase } from "./supabase.js";

// ── Serialization helpers ──────────────────────────────────────────────────

function toDbFlip(flip) {
  return {
    id: flip.id,
    ticker: flip.ticker,
    merchant: flip.merchant,
    category: flip.category ?? null,
    card_id: flip.cardId ?? null,
    confidence: flip.confidence ?? null,
    flipped: flip.flipped ?? false,
    done: flip.done ?? false,
    statement_id: flip.statementId ?? null,
    purchases: flip.purchases ?? [],
    resolved_price: flip.resolvedPrice ?? null,
    resolved_name: flip.resolvedName ?? null,
  };
}

function fromDbFlip(row) {
  return {
    id: row.id,
    ticker: row.ticker,
    merchant: row.merchant,
    category: row.category,
    cardId: row.card_id,
    confidence: row.confidence,
    flipped: row.flipped,
    done: row.done,
    statementId: row.statement_id,
    purchases: row.purchases ?? [],
    resolvedPrice: row.resolved_price,
    resolvedName: row.resolved_name,
  };
}

function toDbHolding(h) {
  return {
    ticker: h.ticker,
    shares: h.shares,
    avg_price: h.avgPrice ?? null,
    buys: h.buys ?? [],
    current_price: h.currentPrice ?? 0,
    day_change_pct: h.dayChangePct ?? 0,
    day_change_dollar: h.dayChangeDollar ?? 0,
  };
}

function fromDbHolding(row) {
  return {
    ticker: row.ticker,
    shares: row.shares,
    avgPrice: row.avg_price,
    buys: row.buys ?? [],
    currentPrice: row.current_price ?? 0,
    dayChangePct: row.day_change_pct ?? 0,
    dayChangeDollar: row.day_change_dollar ?? 0,
  };
}

// ── Flips ──────────────────────────────────────────────────────────────────

export async function getFlips() {
  const { data, error } = await supabase
    .from("flips")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("getFlips:", error); return []; }
  return (data ?? []).map(fromDbFlip);
}

export async function syncFlips(flips) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("flips").delete().eq("user_id", user.id);

  if (flips.length > 0) {
    const rows = flips.map((f) => ({ ...toDbFlip(f), user_id: user.id }));
    const { error } = await supabase.from("flips").insert(rows);
    if (error) console.error("syncFlips insert:", error);
  }
}

// ── Portfolio ──────────────────────────────────────────────────────────────

export async function getPortfolio() {
  const { data, error } = await supabase.from("portfolio_holdings").select("*");
  if (error) { console.error("getPortfolio:", error); return []; }
  return (data ?? []).map(fromDbHolding);
}

export async function syncPortfolio(portfolio) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("portfolio_holdings").delete().eq("user_id", user.id);

  if (portfolio.length > 0) {
    const rows = portfolio.map((h) => ({ ...toDbHolding(h), user_id: user.id }));
    const { error } = await supabase.from("portfolio_holdings").insert(rows);
    if (error) console.error("syncPortfolio insert:", error);
  }
}

// ── User cards ─────────────────────────────────────────────────────────────

export async function getUserCards() {
  const { data, error } = await supabase.from("user_cards").select("*");
  if (error) { console.error("getUserCards:", error); return []; }
  return (data ?? []).map((row) => row.card_data ?? { id: row.card_id, nickname: row.nickname });
}

export async function syncUserCards(userCards) {
  console.log('[db] syncUserCards called with', userCards.length, 'cards');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_cards").delete().eq("user_id", user.id);

  if (userCards.length > 0) {
    const rows = userCards.map((card) => ({
      user_id: user.id,
      card_id: card.id,
      nickname: card.nickname ?? null,
      card_data: card,
    }));
    const { error } = await supabase.from("user_cards").insert(rows);
    if (error) console.error("syncUserCards insert:", error);
  }
}

// ── Profile ────────────────────────────────────────────────────────────────

export async function getProfile() {
  const { data, error } = await supabase.from("profiles").select("*").single();
  if (error) { console.error("getProfile:", error); return null; }
  return data;
}

export async function upsertProfile(profile) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, ...profile }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) { console.error("upsertProfile:", error); return null; }
  return data;
}

// ── Bulk load on sign-in ───────────────────────────────────────────────────

export async function loadUserData() {
  const [flips, portfolio, userCards] = await Promise.all([
    getFlips(),
    getPortfolio(),
    getUserCards(),
  ]);
  return { flips, portfolio, userCards };
}
