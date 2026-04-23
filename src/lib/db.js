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

  const { data: dbRows, error: fetchErr } = await supabase
    .from("flips").select("*").eq("user_id", user.id);
  if (fetchErr) { console.error("syncFlips fetch:", fetchErr); return; }

  const existing = dbRows ?? [];

  // Safety: empty state with existing DB rows means a bug, not an intentional delete.
  if (flips.length === 0 && existing.length > 0) {
    console.warn("syncFlips: state is empty but DB has", existing.length, "rows — aborting to prevent accidental wipe");
    return;
  }

  const dbIds = new Set(existing.map((r) => r.id));
  const stateIds = new Set(flips.map((f) => f.id));

  // INSERT rows that are in state but not in DB
  const toInsert = flips.filter((f) => !dbIds.has(f.id));
  if (toInsert.length > 0) {
    const rows = toInsert.map((f) => ({ ...toDbFlip(f), user_id: user.id }));
    const { error } = await supabase.from("flips").insert(rows);
    if (error) console.error("syncFlips insert:", error);
  }

  // DELETE rows that are in DB but not in state
  const idsToDelete = existing.filter((r) => !stateIds.has(r.id)).map((r) => r.id);
  if (idsToDelete.length > 0) {
    const { error } = await supabase.from("flips").delete().in("id", idsToDelete).eq("user_id", user.id);
    if (error) console.error("syncFlips delete:", error);
  }

  // UPDATE rows whose id matches but contents have changed
  const dbById = Object.fromEntries(existing.map((r) => [r.id, r]));
  for (const f of flips) {
    if (!dbIds.has(f.id)) continue; // newly inserted above
    const dbRow = dbById[f.id];
    const stateRow = toDbFlip(f);
    const dbCompare = {
      id: dbRow.id, ticker: dbRow.ticker, merchant: dbRow.merchant,
      category: dbRow.category, card_id: dbRow.card_id, confidence: dbRow.confidence,
      flipped: dbRow.flipped, done: dbRow.done, statement_id: dbRow.statement_id,
      purchases: dbRow.purchases, resolved_price: dbRow.resolved_price, resolved_name: dbRow.resolved_name,
    };
    if (JSON.stringify(stateRow) !== JSON.stringify(dbCompare)) {
      const { error } = await supabase.from("flips").update(stateRow).eq("id", f.id).eq("user_id", user.id);
      if (error) console.error("syncFlips update:", error);
    }
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

  const { data: dbRows, error: fetchErr } = await supabase
    .from("portfolio_holdings").select("*").eq("user_id", user.id);
  if (fetchErr) { console.error("syncPortfolio fetch:", fetchErr); return; }

  const existing = dbRows ?? [];

  // Safety: empty state with existing DB rows means a bug, not an intentional delete.
  if (portfolio.length === 0 && existing.length > 0) {
    console.warn("syncPortfolio: state is empty but DB has", existing.length, "rows — aborting to prevent accidental wipe");
    return;
  }

  const dbTickers = new Set(existing.map((r) => r.ticker));
  const stateTickers = new Set(portfolio.map((h) => h.ticker));

  // INSERT
  const toInsert = portfolio.filter((h) => !dbTickers.has(h.ticker));
  if (toInsert.length > 0) {
    const rows = toInsert.map((h) => ({ ...toDbHolding(h), user_id: user.id }));
    const { error } = await supabase.from("portfolio_holdings").insert(rows);
    if (error) console.error("syncPortfolio insert:", error);
  }

  // DELETE
  const tickersToDelete = existing.filter((r) => !stateTickers.has(r.ticker)).map((r) => r.ticker);
  if (tickersToDelete.length > 0) {
    const { error } = await supabase.from("portfolio_holdings").delete().in("ticker", tickersToDelete).eq("user_id", user.id);
    if (error) console.error("syncPortfolio delete:", error);
  }

  // UPDATE rows whose ticker matches but contents have changed
  const dbByTicker = Object.fromEntries(existing.map((r) => [r.ticker, r]));
  for (const h of portfolio) {
    if (!dbTickers.has(h.ticker)) continue;
    const dbRow = dbByTicker[h.ticker];
    const stateRow = toDbHolding(h);
    const dbCompare = {
      ticker: dbRow.ticker, shares: dbRow.shares, avg_price: dbRow.avg_price,
      buys: dbRow.buys, current_price: dbRow.current_price,
      day_change_pct: dbRow.day_change_pct, day_change_dollar: dbRow.day_change_dollar,
    };
    if (JSON.stringify(stateRow) !== JSON.stringify(dbCompare)) {
      const { error } = await supabase.from("portfolio_holdings").update(stateRow).eq("ticker", h.ticker).eq("user_id", user.id);
      if (error) console.error("syncPortfolio update:", error);
    }
  }
}

// ── User cards ─────────────────────────────────────────────────────────────

export async function getUserCards() {
  const { data, error } = await supabase.from("user_cards").select("*");
  if (error) { console.error("getUserCards:", error); return []; }
  return (data ?? []).map((row) => row.card_data ?? { id: row.card_id, nickname: row.nickname });
}

export async function syncUserCards(userCards) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: dbRows, error: fetchErr } = await supabase
    .from("user_cards").select("*").eq("user_id", user.id);
  if (fetchErr) { console.error("syncUserCards fetch:", fetchErr); return; }

  const existing = dbRows ?? [];

  // Safety: empty state with existing DB rows means a bug, not an intentional delete.
  if (userCards.length === 0 && existing.length > 0) {
    console.warn("syncUserCards: state is empty but DB has", existing.length, "rows — aborting to prevent accidental wipe");
    return;
  }

  const dbCardIds = new Set(existing.map((r) => r.card_id));
  const stateCardIds = new Set(userCards.map((c) => c.id));

  // INSERT
  const toInsert = userCards.filter((c) => !dbCardIds.has(c.id));
  if (toInsert.length > 0) {
    const rows = toInsert.map((card) => ({
      user_id: user.id,
      card_id: card.id,
      nickname: card.nickname ?? null,
      card_data: card,
    }));
    const { error } = await supabase.from("user_cards").insert(rows);
    if (error) console.error("syncUserCards insert:", error);
  }

  // DELETE
  const cardIdsToDelete = existing.filter((r) => !stateCardIds.has(r.card_id)).map((r) => r.card_id);
  if (cardIdsToDelete.length > 0) {
    const { error } = await supabase.from("user_cards").delete().in("card_id", cardIdsToDelete).eq("user_id", user.id);
    if (error) console.error("syncUserCards delete:", error);
  }

  // UPDATE rows whose card_id matches but card_data has changed
  const dbByCardId = Object.fromEntries(existing.map((r) => [r.card_id, r]));
  for (const card of userCards) {
    if (!dbCardIds.has(card.id)) continue;
    const dbRow = dbByCardId[card.id];
    if (JSON.stringify(card) !== JSON.stringify(dbRow.card_data)) {
      const { error } = await supabase.from("user_cards").update({
        nickname: card.nickname ?? null,
        card_data: card,
      }).eq("card_id", card.id).eq("user_id", user.id);
      if (error) console.error("syncUserCards update:", error);
    }
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
