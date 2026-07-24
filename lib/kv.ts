/**
 * KV 추상화 레이어
 * - KV_REST_API_URL 환경변수가 있으면 Vercel KV 사용
 * - 없으면 프로세스 메모리 fallback (로컬 개발용)
 */

type KVValue = string | null;

// ─── 인메모리 fallback ────────────────────────────────────────────
const memStore = new Map<string, string>();
const memSets = new Map<string, Set<string>>();
const memLists = new Map<string, string[]>();

const mem = {
  async get(key: string): Promise<KVValue> {
    return memStore.get(key) ?? null;
  },
  async set(key: string, value: string): Promise<void> {
    memStore.set(key, value);
  },
  async del(...keys: string[]): Promise<void> {
    keys.forEach((k) => {
      memStore.delete(k);
      memSets.delete(k);
      memLists.delete(k);
    });
  },
  async lrem(key: string, count: number, element: string): Promise<void> {
    const list = memLists.get(key);
    if (!list) return;
    const next = list.filter((v) => v !== element);
    memLists.set(key, next);
  },
  async sadd(key: string, ...members: string[]): Promise<void> {
    if (!memSets.has(key)) memSets.set(key, new Set());
    members.forEach((m) => memSets.get(key)!.add(m));
  },
  async srem(key: string, ...members: string[]): Promise<void> {
    members.forEach((m) => memSets.get(key)?.delete(m));
  },
  async smembers(key: string): Promise<string[]> {
    return Array.from(memSets.get(key) ?? []);
  },
  async scard(key: string): Promise<number> {
    return memSets.get(key)?.size ?? 0;
  },
  async sismember(key: string, member: string): Promise<boolean> {
    return memSets.get(key)?.has(member) ?? false;
  },
  async rpush(key: string, ...values: string[]): Promise<void> {
    if (!memLists.has(key)) memLists.set(key, []);
    memLists.get(key)!.push(...values);
  },
  async lrem(key: string, _count: number, element: string): Promise<void> {
    const list = memLists.get(key);
    if (!list) return;
    memLists.set(key, list.filter((v) => v !== element));
  },
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = memLists.get(key) ?? [];
    if (stop === -1) return list.slice(start);
    return list.slice(start, stop + 1);
  },
  async hset(key: string, fields: Record<string, string>): Promise<void> {
    const existing = memStore.has(key) ? JSON.parse(memStore.get(key)!) : {};
    memStore.set(key, JSON.stringify({ ...existing, ...fields }));
  },
  async hgetall(key: string): Promise<Record<string, string> | null> {
    const val = memStore.get(key);
    if (!val) return null;
    return JSON.parse(val);
  },
  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const allKeys = [
      ...Array.from(memStore.keys()),
      ...Array.from(memSets.keys()),
      ...Array.from(memLists.keys()),
    ];
    return Array.from(new Set(allKeys)).filter((k) => regex.test(k));
  },
};

// ─── Vercel KV 래퍼 ──────────────────────────────────────────────
let _kv: typeof mem | null = null;

async function getKV() {
  if (_kv) return _kv;

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");

    _kv = {
      async get(key: string) {
        return kv.get<string>(key);
      },
      async set(key: string, value: string) {
        await kv.set(key, value);
      },
      async del(...keys: string[]) {
        for (const k of keys) await kv.del(k);
      },
      async sadd(key: string, ...members: string[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (kv.sadd as any)(key, ...members);
      },
      async srem(key: string, ...members: string[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (kv.srem as any)(key, ...members);
      },
      async smembers(key: string) {
        return kv.smembers(key);
      },
      async scard(key: string) {
        return kv.scard(key);
      },
      async sismember(key: string, member: string) {
        const result = await kv.sismember(key, member);
        return result === 1;
      },
      async rpush(key: string, ...values: string[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (kv.rpush as any)(key, ...values);
      },
      async lrem(key: string, count: number, element: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (kv as any).lrem(key, count, element);
      },
      async lrange(key: string, start: number, stop: number) {
        return kv.lrange(key, start, stop);
      },
      async hset(key: string, fields: Record<string, string>) {
        await kv.hset(key, fields);
      },
      async hgetall(key: string) {
        return kv.hgetall<Record<string, string>>(key);
      },
      async keys(pattern: string) {
        return kv.keys(pattern);
      },
    };
  } else {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[KV] KV_REST_API_URL 미설정 — 인메모리 fallback 사용 중");
    }
    _kv = mem;
  }

  return _kv;
}

export { getKV };
