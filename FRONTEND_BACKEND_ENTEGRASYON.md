# Frontend ↔ Backend Entegrasyon Rehberi

Bu dosya, `rule-engine-frontend` (React 19 + Vite + TanStack Query) ile `ruleengine` (Spring Boot 4.0.6 + PostgreSQL + Redis) projelerini birbirine bağlamak için adım adım yapılması gereken her şeyi içerir.

---

## İçindekiler

1. [Ön Koşullar](#1-ön-koşullar)
2. [Adım 1 — Docker ile Altyapıyı Başlat](#adım-1--docker-ile-altyapıyı-başlat)
3. [Adım 2 — Veritabanı Tablolarını Oluştur](#adım-2--veritabanı-tablolarını-oluştur)
4. [Adım 3 — Backend'i Başlat](#adım-3--backendi-başlat)
5. [Adım 4 — Frontend apiClient baseURL/Proxy Çakışmasını Düzelt](#adım-4--frontend-apiclient-baseurlproxy-çakışmasını-düzelt)
6. [Adım 5 — Frontend'i Başlat ve Bağlantıyı Doğrula](#adım-5--frontendi-başlat-ve-bağlantıyı-doğrula)
7. [Adım 6 — Evaluate Request Alan Adını Düzelt (data → facts)](#adım-6--evaluate-request-alan-adını-düzelt-data--facts)
8. [Adım 7 — Evaluate Response Tipini Güncelle](#adım-7--evaluate-response-tipini-güncelle)
9. [Adım 8 — Page Index Farkını Düzelt (1-based → 0-based)](#adım-8--page-index-farkını-düzelt-1-based--0-based)
10. [Adım 9 — Field DTO Yapısını Backend'e Uyumlu Hale Getir](#adım-9--field-dto-yapısını-backende-uyumlu-hale-getir)
11. [Adım 10 — RuleResponse Tipine version Alanı Ekle](#adım-10--ruleresponse-tipine-version-alanı-ekle)
12. [Adım 11 — Operator Setini Senkronize Et](#adım-11--operator-setini-senkronize-et)
13. [Adım 12 — RuleFilters'a category ve active Ekle + Backend'e sort Desteği Ekle](#adım-12--rulefiltersa-category-ve-active-ekle--backende-sort-desteği-ekle)
14. [Adım 13 — Error Response Tipini Güncelle](#adım-13--error-response-tipini-güncelle)
15. [Adım 14 — ast null Validation Kontrolü](#adım-14--ast-null-validation-kontrolü)
16. [Adım 15 — Son Doğrulama](#adım-15--son-doğrulama)
17. [Özet Tablo](#özet-tablo)

---

## 1. Ön Koşullar

Devam etmeden önce aşağıdakilerin kurulu olduğundan emin ol:

- [ ] **Docker Desktop** çalışır durumda
- [ ] **JDK 21** kurulu (`java -version` ile kontrol et)
- [ ] **Node.js 20+** kurulu (`node -v` ile kontrol et)
- [ ] **npm** kurulu (`npm -v` ile kontrol et)
- [ ] Frontend bağımlılıkları yüklü (`rule-engine-frontend` klasöründe `npm install` çalıştır)

---

## Adım 1 — Docker ile Altyapıyı Başlat

PostgreSQL ve Redis container'larını başlat.

**Terminal aç, `ruleengine` klasörüne git:**

```bash
cd ruleengine
docker compose up -d
```

**Doğrulama:**

```bash
docker ps
```

Çıktıda şunları görmelisin:
- PostgreSQL → port `4567`
- Redis → port `7856`

---

## Adım 2 — Veritabanı Tablolarını Oluştur

Backend'de `hibernate.ddl-auto: validate` ayarlı. Bu, tabloların **önceden var olmasını** gerektirir. İlk çalıştırmada tablolar yoksa backend hata verir.

**Yapılacak:**

1. `ruleengine/src/main/resources/application.yml` dosyasını aç
2. `ddl-auto` değerini geçici olarak değiştir:

```yaml
# ÖNCE (mevcut):
hibernate:
  ddl-auto: validate

# GEÇİCİ OLARAK DEĞIŞTIR:
hibernate:
  ddl-auto: update
```

3. Backend'i bir kez çalıştır (Adım 3), tablolar otomatik oluşacak
4. Backend'i durdur
5. `ddl-auto` değerini tekrar `validate` yap:

```yaml
hibernate:
  ddl-auto: validate
```

> **Not:** Üretim ortamı için Flyway veya Liquibase kullanılması önerilir. Bu geçici çözüm sadece geliştirme aşaması içindir.

---

## Adım 3 — Backend'i Başlat

**Terminal aç, `ruleengine` klasörüne git:**

```bash
cd ruleengine
./mvnw spring-boot:run
```

**Windows'ta:**
```bash
mvnw.cmd spring-boot:run
```

**Doğrulama:**

1. Tarayıcıda `http://localhost:3500/swagger-ui.html` adresine git
2. Swagger UI açılmalı, tüm endpoint'ler görünmeli:
   - `POST /api/rules`
   - `GET /api/rules`
   - `GET /api/rules/{id}`
   - `DELETE /api/rules/{id}`
   - `PATCH /api/rules/{id}/toggle`
   - `POST /api/rules/evaluate`
   - `GET /api/fields`
   - `POST /api/fields`
   - `DELETE /api/fields/{id}`

---

## Adım 4 — Frontend apiClient baseURL/Proxy Çakışmasını Düzelt

**Sorun:** Frontend'de Axios `baseURL` olarak `http://localhost:3500` ayarlı. Aynı zamanda Vite proxy da `/api` isteklerini `http://localhost:3500`'e yönlendiriyor. Bu çakışma nedeniyle istekler proxy'yi bypass eder veya çift yönlendirme olur.

### Adım 4.1 — `.env` dosyasını güncelle

**Dosya:** `rule-engine-frontend/.env`

```
# ÖNCE:
VITE_API_BASE_URL=http://localhost:3500

# SONRA:
VITE_API_BASE_URL=
```

### Adım 4.2 — apiClient.ts'i güncelle

**Dosya:** `rule-engine-frontend/src/shared/api/apiClient.ts`

**Satır 5'i bul ve değiştir:**

```typescript
// ÖNCE:
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3500';

// SONRA:
const baseURL = import.meta.env.VITE_API_BASE_URL || '';
```

**Neden:** Development ortamında Vite proxy kullanılacak (`/api` → `localhost:3500`). Production'da ise `VITE_API_BASE_URL` environment variable'ı ile gerçek backend URL'i set edilecek.

---

## Adım 5 — Frontend'i Başlat ve Bağlantıyı Doğrula

**Terminal aç, `rule-engine-frontend` klasörüne git:**

```bash
cd rule-engine-frontend
npm run dev
```

**Doğrulama:**

1. Tarayıcıda `http://localhost:3000` adresine git
2. **DevTools → Network** sekmesini aç
3. Sayfadaki herhangi bir API çağrısının (örn. field listesi) `http://localhost:3000/api/...` adresine gittiğini doğrula
4. Response'un `200 OK` döndüğünü kontrol et
5. Eğer CORS hatası görüyorsan, backend'in çalıştığından emin ol

---

## Adım 6 — Evaluate Request Alan Adını Düzelt (data → facts)

**Sorun:** Frontend `data` alanı gönderiyor, backend `facts` alanı bekliyor.

**Dosya:** `rule-engine-frontend/src/features/RuleEditor/services/useRuleQueries.ts`

**Satır 80-89 civarını bul ve değiştir:**

```typescript
// ÖNCE:
export function useEvaluateRuleMutation() {
  return useMutation({
    mutationFn: (payload: { ruleId: string; data: any }) =>
      apiClient.request<ApiResponse<any>>({
        endpoint: ApiEndpoint.EVALUATE_RULE,
        method: HttpMethod.POST,
        data: payload,
      }),
  });
}

// SONRA:
export function useEvaluateRuleMutation() {
  return useMutation({
    mutationFn: (payload: { ruleId?: string; facts: Record<string, unknown> }) =>
      apiClient.request<ApiResponse<RuleEvaluationResponse>>({
        endpoint: ApiEndpoint.EVALUATE_RULE,
        method: HttpMethod.POST,
        data: payload,
      }),
  });
}
```

**Dikkat:** `RuleEvaluationResponse` tipini import etmen gerekecek. Bu tipi Adım 7'de oluşturacağız.

**Bu hook'u çağıran tüm bileşenlerde de alan adı güncellenmelidir:**

```typescript
// ÖNCE:
evaluateMutation.mutate({ ruleId: 'xxx', data: { age: 25, status: 'active' } });

// SONRA:
evaluateMutation.mutate({ ruleId: 'xxx', facts: { age: 25, status: 'active' } });
```

---

## Adım 7 — Evaluate Response Tipini Güncelle

**Sorun:** Frontend'de evaluate response tipi tanımlı değil (`any` kullanılıyor). Backend'in döndüğü yapı farklı.

**Dosya:** `rule-engine-frontend/src/features/RuleEditor/types/ast.types.ts`

**Dosyanın sonuna şunları ekle:**

```typescript
export interface RuleMatchResult {
  ruleId: string;
  ruleName: string;
  actions: ASTActionNode[];
}

export interface RuleEvaluationResponse {
  matched: boolean;
  matchedRules: RuleMatchResult[];
  evaluatedRuleCount: number;
}
```

**Ardından** `useRuleQueries.ts` dosyasında import'u ekle:

```typescript
import { RulePayload, RuleResponse, RuleEvaluationResponse } from '../types/ast.types';
```

**Evaluate sonucu kullanan UI bileşenlerini güncelle.** Backend'den gelen response şu yapıda:

```json
{
  "success": true,
  "message": "Evaluation completed",
  "data": {
    "matched": true,
    "matchedRules": [
      {
        "ruleId": "uuid-here",
        "ruleName": "High value order",
        "actions": [
          { "type": "ACTION", "actionType": "ALLOW", "params": {} }
        ]
      }
    ],
    "evaluatedRuleCount": 1
  }
}
```

---

## Adım 8 — Page Index Farkını Düzelt (1-based → 0-based)

**Sorun:** Frontend sayfalama 1'den başlıyor (`page: 1`), backend Spring Data ile 0'dan başlıyor (`PageRequest.of(0, ...)`).

**Dosya:** `rule-engine-frontend/src/features/RuleEditor/services/useRuleQueries.ts`

**`useRulesQuery` fonksiyonunu bul ve güncelle:**

```typescript
// ÖNCE:
export function useRulesQuery(filters: RuleFilters) {
  return useQuery({
    queryKey: ruleKeys.list(filters),
    queryFn: () =>
      apiClient.request<PaginatedResponse<RuleResponse>>({
        endpoint: ApiEndpoint.GET_ALL_RULES,
        method: HttpMethod.GET,
        params: filters,
      }),
  });
}

// SONRA:
export function useRulesQuery(filters: RuleFilters) {
  return useQuery({
    queryKey: ruleKeys.list(filters),
    queryFn: () =>
      apiClient.request<PaginatedResponse<RuleResponse>>({
        endpoint: ApiEndpoint.GET_ALL_RULES,
        method: HttpMethod.GET,
        params: {
          ...filters,
          page: (filters.page ?? 1) - 1, // Backend 0-indexed
        },
      }),
  });
}
```

---

## Adım 9 — Field DTO Yapısını Backend'e Uyumlu Hale Getir

**Sorun:** Frontend ve backend'in field yapıları tamamen farklı.

| Alan | Frontend (mevcut) | Backend (beklenen) |
|------|-------------------|-------------------|
| `name` | ✅ | ✅ |
| `description` | ✅ var | ❌ yok |
| `label` | ❌ yok | ✅ zorunlu |
| `type` | `'string' \| 'number' \| 'boolean'` | `STRING \| NUMBER \| BOOLEAN \| DATE \| DATETIME \| ENUM` |
| `required` | ❌ yok | ✅ var |
| `allowedValues` | ❌ yok | ✅ var |
| `updatedAt` | ❌ yok | ✅ var |

### Adım 9.1 — field.types.ts'i güncelle

**Dosya:** `rule-engine-frontend/src/features/RuleEditor/types/field.types.ts`

**Tüm dosyayı şununla değiştir:**

```typescript
export type FieldType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'DATETIME' | 'ENUM';

export interface FieldPayload {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  allowedValues?: string[];
}

export interface FieldResponse {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  allowedValues: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Adım 9.2 — Field oluşturma UI bileşenlerini güncelle

Field oluşturma formu varsa, aşağıdaki alanları ekle/güncelle:

- `description` alanını **kaldır**
- `label` alanını **ekle** (zorunlu text input)
- `type` seçeneklerine **DATE**, **DATETIME**, **ENUM** ekle
- `required` alanı için **checkbox** ekle
- `allowedValues` için (ENUM seçildiğinde) **dinamik input listesi** ekle

### Adım 9.3 — Field kullanan tüm yerleri kontrol et

`FieldPayload` veya `FieldResponse` kullanan her bileşende:
- `description` referanslarını kaldır
- `label` referanslarını ekle
- `type` değer karşılaştırmalarını büyük harfe çevir (`'string'` → `'STRING'`)

---

## Adım 10 — RuleResponse Tipine version Alanı Ekle

**Sorun:** Backend `version` (long) alanı dönüyor ama frontend'de bu alan yok.

**Dosya:** `rule-engine-frontend/src/features/RuleEditor/types/ast.types.ts`

**`RuleResponse` interface'ini güncelle:**

```typescript
// ÖNCE:
export interface RuleResponse extends RulePayload {
  id: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// SONRA:
export interface RuleResponse extends RulePayload {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}
```

> `category` zaten `RulePayload`'da optional olarak mevcut olduğu için `RuleResponse`'da tekrar tanımlamaya gerek yok.

---

## Adım 11 — Operator Setini Senkronize Et

**Sorun:** Frontend'de `startsWith` ve `endsWith` operatörleri var ama backend'de yok. Backend'de `not_contains` var ama frontend'de yok.

### Adım 11.1 — Frontend evaluator'ı güncelle

**Dosya:** `rule-engine-frontend/src/features/RuleEditor/utils/ruleEvaluator.ts`

**Switch case'deki operator'leri güncelle:**

```typescript
// ÖNCE:
case 'contains': return valueStr.includes(targetStr);
case 'startsWith': return valueStr.startsWith(targetStr);
case 'endsWith': return valueStr.endsWith(targetStr);

// SONRA:
case 'contains': return valueStr.includes(targetStr);
case 'not_contains': return !valueStr.includes(targetStr);
```

### Adım 11.2 — ConditionOperator enum'unu kontrol et

**Dosya:** `rule-engine-frontend/src/features/RuleEditor/types/ruleNode.types.ts`

Enum'da `NOT_CONTAINS` zaten var:

```typescript
export enum ConditionOperator {
  EQUALS = '==',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_EQUAL = '>=',
  LESS_EQUAL = '<=',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
}
```

Bu enum doğru. Sadece `ruleEvaluator.ts`'deki switch case tutarsızdı, onu düzelttik.

### Adım 11.3 — UI operatör listesini kontrol et

ConditionNode bileşeninde operatör seçim dropdown'unda `startsWith`/`endsWith` seçenekleri varsa kaldır, `not_contains` yoksa ekle.

---

## Adım 12 — RuleFilters'a category ve active Ekle + Backend'e sort Desteği Ekle

**Sorun:** Frontend'de `sortBy` ve `sortOrder` parametreleri var ama backend desteklemiyor. Backend'de `category` ve `active` filtre parametreleri var ama frontend'de yok.

### Adım 12.1 — Frontend RuleFilters'ı güncelle

**Dosya:** `rule-engine-frontend/src/features/RuleList/types/ruleList.types.ts`

```typescript
// ÖNCE:
export interface RuleFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// SONRA:
export interface RuleFilters {
  search?: string;
  category?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}
```

### Adım 12.2 — Backend controller'a sort desteği ekle

**Dosya:** `ruleengine/src/main/java/com/ruleengine/ruleengine/rule/api/RuleController.java`

**`getRules` metodunu güncelle:**

```java
// ÖNCE:
@GetMapping
@Operation(summary = "List rules")
public PaginatedResponse<RuleResponse> getRules(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) Boolean active,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize) {
    Pageable pageable = PageRequest.of(page, pageSize);
    return queryService.getRules(category, active, search, pageable);
}

// SONRA:
@GetMapping
@Operation(summary = "List rules")
public PaginatedResponse<RuleResponse> getRules(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) Boolean active,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortOrder) {
    Sort sort = "asc".equalsIgnoreCase(sortOrder)
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page, pageSize, sort);
    return queryService.getRules(category, active, search, pageable);
}
```

**Import ekle:**

```java
import org.springframework.data.domain.Sort;
```

---

## Adım 13 — Error Response Tipini Güncelle

**Sorun:** Backend hata response'unda `details` tipi `Map<String, Object>`, frontend'de `Record<string, string[]>`. Backend `timestamp` alanı dönüyor ama frontend'de yok.

**Dosya:** `rule-engine-frontend/src/shared/api/types.ts`

```typescript
// ÖNCE:
export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

// SONRA:
export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp?: string;
}
```

---

## Adım 14 — ast null Validation Kontrolü

**Sorun:** Frontend'de `RulePayload.ast` tipi `ASTNode | null`. Backend'de `@NotNull @Valid AstNodeDto ast` — null gönderilirse 400 hatası döner.

**Yapılacak:**

Kural kaydetme butonunun tıklandığı yerde (muhtemelen RuleCanvas veya SaveModal bileşeninde) aşağıdaki kontrolü ekle:

```typescript
const { ast, actions } = toAST();

if (!ast) {
  // Kullanıcıya uyarı göster
  toast.error('Hata', 'En az bir koşul eklemelisiniz.');
  return;
}

if (actions.length === 0) {
  toast.error('Hata', 'En az bir aksiyon eklemelisiniz.');
  return;
}

// Kaydet
saveMutation.mutate({
  name,
  description,
  category: category || 'Genel',
  priority: priority ?? 0,
  isActive: true,
  ast,
  actions
});
```

---

## Adım 15 — Son Doğrulama

Tüm adımlar tamamlandıktan sonra aşağıdaki kontrolleri yap:

### 15.1 — Build Kontrolü

```bash
# Frontend
cd rule-engine-frontend
npm run build
```

TypeScript derleme hatası olmamalı.

```bash
# Backend
cd ruleengine
./mvnw compile
```

Java derleme hatası olmamalı.

### 15.2 — Uçtan Uca Test

1. Docker'ın çalıştığından emin ol (`docker ps`)
2. Backend'i başlat (`./mvnw spring-boot:run`)
3. Frontend'i başlat (`npm run dev`)
4. Tarayıcıda `http://localhost:3000` adresine git

**Test senaryoları:**

| # | Senaryo | Beklenen Sonuç |
|---|---------|---------------|
| 1 | Sayfa yükleniyor | Network tab'da `/api/rules` çağrısı 200 dönmeli |
| 2 | Yeni kural oluştur | `POST /api/rules` → 201 Created |
| 3 | Kuralları listele | `GET /api/rules` → 200 + data array |
| 4 | Kural sil | `DELETE /api/rules/{id}` → 200 |
| 5 | Kural toggle et | `PATCH /api/rules/{id}/toggle` → 200 |
| 6 | Kural değerlendir | `POST /api/rules/evaluate` → 200 + matched sonucu |
| 7 | Field oluştur | `POST /api/fields` → 201 Created |
| 8 | Field listele | `GET /api/fields` → 200 + data array |

---

## Özet Tablo

| # | Değişiklik | Taraf | Dosya | Önem |
|---|-----------|-------|-------|------|
| 4 | baseURL/Proxy çakışması düzeltme | Frontend | `.env` + `apiClient.ts` | 🔴 Kritik |
| 6 | Evaluate `data` → `facts` | Frontend | `useRuleQueries.ts` | 🔴 Kritik |
| 7 | Evaluate response tipi ekleme | Frontend | `ast.types.ts` + `useRuleQueries.ts` | 🔴 Kritik |
| 8 | Page index (1→0) düzeltme | Frontend | `useRuleQueries.ts` | 🔴 Kritik |
| 9 | Field DTO güncelleme | Frontend | `field.types.ts` + UI bileşenleri | 🔴 Kritik |
| 10 | RuleResponse `version` ekleme | Frontend | `ast.types.ts` | 🟡 Orta |
| 11 | Operator senkronizasyonu | Frontend | `ruleEvaluator.ts` | 🟡 Orta |
| 12 | RuleFilters + Backend sort | Her iki taraf | `ruleList.types.ts` + `RuleController.java` | 🟡 Orta |
| 13 | Error response tipi | Frontend | `types.ts` | 🟢 Düşük |
| 14 | ast null validation | Frontend | Kaydet bileşeni | 🟡 Orta |

---

## Hızlı Port Referansı

| Servis | Port | URL |
|--------|------|-----|
| Frontend (Vite) | 3000 | `http://localhost:3000` |
| Backend (Spring Boot) | 3500 | `http://localhost:3500` |
| Swagger UI | 3500 | `http://localhost:3500/swagger-ui.html` |
| PostgreSQL (Docker) | 4567 | `jdbc:postgresql://localhost:4567/ruleengine` |
| Redis (Docker) | 7856 | `localhost:7856` |

---

> **Son güncelleme:** 2026-05-27
