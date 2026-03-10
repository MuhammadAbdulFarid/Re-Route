-- =============================================================================
-- Supabase RPC Function: match_my_apps_data
-- For Semantic Search using Full-Text Search (No pgvector required)
-- 
-- INSTRUCTIONS:
-- Run this entire script in Supabase SQL Editor
-- =============================================================================

-- Step 1: Create table for storing search content
CREATE TABLE IF NOT EXISTS app_search_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(table_name, record_id)
);

-- Step 2: Create full-text search index
CREATE INDEX IF NOT EXISTS idx_search_content_fts 
ON app_search_content 
USING gin(to_tsvector('indonesian', title || ' ' || content));

-- Step 3: Create additional indexes
CREATE INDEX IF NOT EXISTS idx_search_content_table ON app_search_content(table_name);
CREATE INDEX IF NOT EXISTS idx_search_content_record ON app_search_content(record_id);

-- =============================================================================
-- Function: match_my_apps_data
-- Main search function using full-text search and ranking
-- =============================================================================
CREATE OR REPLACE FUNCTION match_my_apps_data(
    p_query TEXT,
    p_table_name VARCHAR DEFAULT NULL,
    p_match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    table_name VARCHAR(100),
    record_id UUID,
    title TEXT,
    content TEXT,
    rank FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.table_name,
        s.record_id,
        s.title,
        s.content,
        ts_rank(to_tsvector('indonesian', s.title || ' ' || s.content), plainto_tsquery('indonesian', p_query))::FLOAT AS rank,
        s.metadata
    FROM app_search_content s
    WHERE to_tsvector('indonesian', s.title || ' ' || s.content) @@ plainto_tsquery('indonesian', p_query)
        AND (p_table_name IS NULL OR s.table_name = p_table_name)
    ORDER BY ts_rank(to_tsvector('indonesian', s.title || ' ' || s.content), plainto_tsquery('indonesian', p_query)) DESC
    LIMIT p_match_count;
END;
$$;

-- =============================================================================
-- Function: search_orders_text - Search orders
-- =============================================================================
CREATE OR REPLACE FUNCTION search_orders_text(
    p_query TEXT,
    p_match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    order_number VARCHAR,
    product_name TEXT,
    customer_name TEXT,
    status VARCHAR,
    rank FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.record_id::UUID AS id,
        (s.metadata->>'order_number')::VARCHAR AS order_number,
        (s.metadata->>'product_name')::TEXT AS product_name,
        (s.metadata->>'customer_name')::TEXT AS customer_name,
        (s.metadata->>'status')::VARCHAR AS status,
        s.rank
    FROM match_my_apps_data(p_query, 'orders', p_match_count) s;
END;
$$;

-- =============================================================================
-- Function: search_returns_text - Search returns
-- =============================================================================
CREATE OR REPLACE FUNCTION search_returns_text(
    p_query TEXT,
    p_match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    return_number VARCHAR,
    reason TEXT,
    description TEXT,
    status VARCHAR,
    rank FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.record_id::UUID AS id,
        (s.metadata->>'return_number')::VARCHAR AS return_number,
        (s.metadata->>'reason')::TEXT AS reason,
        (s.metadata->>'description')::TEXT AS description,
        (s.metadata->>'status')::VARCHAR AS status,
        s.rank
    FROM match_my_apps_data(p_query, 'returns', p_match_count) s;
END;
$$;

-- =============================================================================
-- Function: search_inventory_text - Search inventory
-- =============================================================================
CREATE OR REPLACE FUNCTION search_inventory_text(
    p_query TEXT,
    p_match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    product_sku VARCHAR,
    product_name TEXT,
    quantity INT,
    location VARCHAR,
    condition VARCHAR,
    rank FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.record_id::UUID AS id,
        (s.metadata->>'product_sku')::VARCHAR AS product_sku,
        (s.metadata->>'product_name')::TEXT AS product_name,
        (s.metadata->>'quantity')::INT AS quantity,
        (s.metadata->>'location')::VARCHAR AS location,
        (s.metadata->>'condition')::VARCHAR AS condition,
        s.rank
    FROM match_my_apps_data(p_query, 'inventory', p_match_count) s;
END;
$$;

-- =============================================================================
-- Function: index_record - Add/update a record in search index
-- =============================================================================
CREATE OR REPLACE FUNCTION index_record(
    p_table_name VARCHAR(100),
    p_record_id UUID,
    p_title TEXT,
    p_content TEXT,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO app_search_content (table_name, record_id, title, content, metadata)
    VALUES (p_table_name, p_record_id, p_title, p_content, p_metadata)
    ON CONFLICT (table_name, record_id) 
    DO UPDATE SET 
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
END;
$$;

-- =============================================================================
-- Function: bulk_index_orders - Index all orders
-- =============================================================================
CREATE OR REPLACE FUNCTION bulk_index_orders()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    count INT := 0;
    v_content TEXT;
    v_metadata JSONB;
BEGIN
    FOR rec IN 
        SELECT id, order_number, product_name, customer_name, status, notes 
        FROM "Order"
    LOOP
        v_content := COALESCE(rec.order_number, '') || ' ' || 
                    COALESCE(rec.product_name, '') || ' ' || 
                    COALESCE(rec.customer_name, '') || ' ' || 
                    COALESCE(rec.status, '') || ' ' || 
                    COALESCE(rec.notes, '');
        
        v_metadata := jsonb_build_object(
            'order_number', rec.order_number,
            'product_name', rec.product_name,
            'customer_name', rec.customer_name,
            'status', rec.status,
            'notes', rec.notes
        );
        
        PERFORM index_record('orders', rec.id, rec.order_number, v_content, v_metadata);
        count := count + 1;
    END LOOP;
    
    RETURN count;
END;
$$;

-- =============================================================================
-- Function: bulk_index_returns - Index all return requests
-- =============================================================================
CREATE OR REPLACE FUNCTION bulk_index_returns()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    count INT := 0;
    v_content TEXT;
    v_metadata JSONB;
BEGIN
    FOR rec IN 
        SELECT id, return_number, reason, description, status
        FROM "ReturnRequest"
    LOOP
        v_content := COALESCE(rec.return_number, '') || ' ' || 
                    COALESCE(rec.reason, '') || ' ' || 
                    COALESCE(rec.description, '') || ' ' || 
                    COALESCE(rec.status, '');
        
        v_metadata := jsonb_build_object(
            'return_number', rec.return_number,
            'reason', rec.reason,
            'description', rec.description,
            'status', rec.status
        );
        
        PERFORM index_record('returns', rec.id, rec.return_number, v_content, v_metadata);
        count := count + 1;
    END LOOP;
    
    RETURN count;
END;
$$;

-- =============================================================================
-- Function: bulk_index_inventory - Index all inventory
-- =============================================================================
CREATE OR REPLACE FUNCTION bulk_index_inventory()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    count INT := 0;
    v_content TEXT;
    v_metadata JSONB;
BEGIN
    FOR rec IN 
        SELECT id, product_sku, product_name, quantity, location, condition
        FROM "Inventory"
    LOOP
        v_content := COALESCE(rec.product_sku, '') || ' ' || 
                    COALESCE(rec.product_name, '') || ' ' || 
                    COALESCE(rec.location, '') || ' ' || 
                    COALESCE(rec.condition, '');
        
        v_metadata := jsonb_build_object(
            'product_sku', rec.product_sku,
            'product_name', rec.product_name,
            'quantity', rec.quantity,
            'location', rec.location,
            'condition', rec.condition
        );
        
        PERFORM index_record('inventory', rec.id, rec.product_sku, v_content, v_metadata);
        count := count + 1;
    END LOOP;
    
    RETURN count;
END;
$$;

-- =============================================================================
-- Function: search_all - Unified search across all tables
-- =============================================================================
CREATE OR REPLACE FUNCTION search_all(
    p_query TEXT,
    p_match_count INT DEFAULT 10
)
RETURNS TABLE (
    table_name VARCHAR(100),
    record_id UUID,
    title TEXT,
    content TEXT,
    rank FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.table_name,
        s.record_id,
        s.title,
        s.content,
        s.rank
    FROM match_my_apps_data(p_query, NULL, p_match_count) s
    ORDER BY s.rank DESC;
END;
$$;

-- =============================================================================
-- Grant permissions
-- =============================================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON TABLE app_search_content TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION match_my_apps_data TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_orders_text TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_returns_text TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_inventory_text TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION index_record TO postgres, authenticated, service_role;
GRANT EXECUTE ON FUNCTION bulk_index_orders TO postgres, authenticated, service_role;
GRANT EXECUTE ON FUNCTION bulk_index_returns TO postgres, authenticated, service_role;
GRANT EXECUTE ON FUNCTION bulk_index_inventory TO postgres, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_all TO postgres, anon, authenticated, service_role;

-- =============================================================================
-- USAGE EXAMPLES (run in SQL Editor):
-- =============================================================================
-- Search all tables:
-- SELECT * FROM match_my_apps_data('laptop asus', NULL, 10);

-- Search specific table:
-- SELECT * FROM match_my_apps_data('laptop', 'orders', 10);

-- Search orders:
-- SELECT * FROM search_orders_text('product laptop', 10);

-- Search returns:
-- SELECT * FROM search_returns_text('refund damaged', 10);

-- Search inventory:
-- SELECT * FROM search_inventory_text('laptop gudang', 10);

-- Index a single record:
-- SELECT index_record('orders', 'uuid-here', 'ORD-001', 'Order for Laptop Asus', '{"order_number":"ORD-001","product_name":"Laptop Asus"}'::jsonb);

-- Bulk index all data:
-- SELECT bulk_index_orders();
-- SELECT bulk_index_returns();
-- SELECT bulk_index_inventory();

-- =============================================================================
-- End of SQL Script
-- =============================================================================

