INSERT INTO api_keys (id, name, key, key_hash, user_id, enabled, scopes, created_at, updated_at, accessed_at)
VALUES (
    'key_mcit_studio_default',
    'MCIT AI Studio Default',
    'sk-lh-mcitstudio000001',
    '45f460e10ff3104dd58e203cf01a2317fe5157fb7bdd4c6a61ca5c2515826a4d',
    'user_4eDsv8rgH7oybIUSAHQeoDGt3pz',
    true,
    '["model:invoke", "chat:write", "agent:write"]'::jsonb,
    now(),
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET key_hash = EXCLUDED.key_hash, enabled = true;
