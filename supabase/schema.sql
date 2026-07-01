-- ==============================================
-- SCHEMA DATABASE: Lista della Spesa
-- ==============================================

-- Tabella prodotti della lista
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Dati prodotto
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL DEFAULT 'altro',
    checked BOOLEAN NOT NULL DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON public.shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_checked ON public.shopping_items(checked);
CREATE INDEX IF NOT EXISTS idx_shopping_items_category ON public.shopping_items(category);
CREATE INDEX IF NOT EXISTS idx_shopping_items_created_at ON public.shopping_items(created_at DESC);

-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================

-- Abilita RLS
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- Policy: Utenti vedono solo i propri prodotti
CREATE POLICY "Users can view own shopping items"
    ON public.shopping_items
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping items"
    ON public.shopping_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping items"
    ON public.shopping_items
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping items"
    ON public.shopping_items
    FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================
-- TRIGGER: Auto-update updated_at
-- ==============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_shopping_items_updated_at
    BEFORE UPDATE ON public.shopping_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
