/**
 * Sistema de Cache com Redis e Fallback em Memória
 * Otimiza scraping reduzindo requisições à API
 */

// Cache em memória como fallback
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data: value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar entradas expiradas periodicamente
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Instância global do cache em memória
const memoryCache = new MemoryCache();

// Limpar cache expirado a cada 5 minutos
setInterval(() => memoryCache.cleanup(), 5 * 60 * 1000);

/**
 * Interface unificada de cache
 */
export class CacheService {
  private static instance: CacheService;
  private useRedis = false; // Redis não disponível por padrão

  private constructor() {
    // Tentar conectar ao Redis se disponível
    this.initRedis();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private async initRedis() {
    // Redis não está disponível no ambiente atual
    // Usar apenas cache em memória
    console.log("[Cache] Usando cache em memória (Redis não disponível)");
  }

  /**
   * Armazena valor no cache
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      memoryCache.set(key, value, ttlSeconds);
      console.log(`[Cache] SET ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      console.error("[Cache] Erro ao salvar:", error);
    }
  }

  /**
   * Recupera valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = memoryCache.get<T>(key);
      if (value) {
        console.log(`[Cache] HIT ${key}`);
      } else {
        console.log(`[Cache] MISS ${key}`);
      }
      return value;
    } catch (error) {
      console.error("[Cache] Erro ao recuperar:", error);
      return null;
    }
  }

  /**
   * Remove valor do cache
   */
  async delete(key: string): Promise<void> {
    try {
      memoryCache.delete(key);
      console.log(`[Cache] DELETE ${key}`);
    } catch (error) {
      console.error("[Cache] Erro ao deletar:", error);
    }
  }

  /**
   * Limpa todo o cache
   */
  async clear(): Promise<void> {
    try {
      memoryCache.clear();
      console.log("[Cache] Cache limpo");
    } catch (error) {
      console.error("[Cache] Erro ao limpar:", error);
    }
  }

  /**
   * Gera chave de cache padronizada
   */
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(":")}`;
  }
}

// Exportar instância singleton
export const cache = CacheService.getInstance();
