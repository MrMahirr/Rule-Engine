# Rule Engine Frontend — Feature-Driven Architecture

Sürükle-bırak destekli bir Rule Engine arayüzü geliştireceğiz. SOLID prensipleri, Feature-Driven Architecture, TanStack Query ile server state yönetimi ve deep space dark mode teması ile modern, premium bir deneyim sunulacak.

## Mevcut Durum

| Öğe | Durum |
|-----|-------|
| Vite + React 19 + TypeScript 6 | ✅ Kurulu |
| Tailwind CSS v4 (`@tailwindcss/vite`) | ✅ Kurulu |
| Mevcut `src/` içeriği | Vite boilerplate (silinecek) |
| React Flow (`@xyflow/react`) | ❌ Kurulacak |
| Axios | ❌ Kurulacak |
| TanStack Query (`@tanstack/react-query`) | ❌ Kurulacak |

## Port Konfigürasyonu

| Servis | Port |
|--------|------|
| **Frontend (Vite dev server)** | `3000` |
| **Backend API** | `3500` |

- Vite dev server `vite.config.ts` içinde `server.port: 3000` olarak ayarlanacak.
- API proxy `vite.config.ts` içinde `/api` → `http://localhost:3500` olarak ayarlanacak.
- `.env` dosyasında `VITE_API_BASE_URL=http://localhost:3500` tanımlanacak.

## Standart Kural JSON Şeması (AST)

Backend henüz geliştirilmediği için aşağıdaki standart AST yapısını kullanacağız. Backend hazır olduğunda güncellenir.

### Kural Kaydetme — Request Body (`POST /api/rules`)

```json
{
  "name": "Yaş Kontrolü Kuralı",
  "description": "18 yaşından büyük ve aktif kullanıcıları filtreler",
  "ast": {
    "type": "AND",
    "children": [
      {
        "type": "CONDITION",
        "field": "age",
        "operator": ">=",
        "value": "18"
      },
      {
        "type": "OR",
        "children": [
          {
            "type": "CONDITION",
            "field": "status",
            "operator": "==",
            "value": "active"
          },
          {
            "type": "CONDITION",
            "field": "role",
            "operator": "==",
            "value": "admin"
          }
        ]
      }
    ]
  },
  "action": {
    "type": "ACTION",
    "actionType": "ALLOW",
    "params": {
      "message": "Kullanıcı erişime uygun"
    }
  }
}
```

### Kural Yanıtı — Response (`GET /api/rules/:id`)

```json
{
  "id": "rule_abc123",
  "name": "Yaş Kontrolü Kuralı",
  "description": "18 yaşından büyük ve aktif kullanıcıları filtreler",
  "ast": { "..." },
  "action": { "..." },
  "createdAt": "2026-05-26T10:00:00Z",
  "updatedAt": "2026-05-26T12:30:00Z"
}
```

### Kural Değerlendirme — Request (`POST /api/rules/evaluate`)

```json
{
  "ruleId": "rule_abc123",
  "data": {
    "age": 25,
    "status": "active",
    "role": "user"
  }
}
```

### Kural Değerlendirme — Response

```json
{
  "result": true,
  "matchedConditions": ["age >= 18", "status == active"],
  "action": {
    "type": "ALLOW",
    "message": "Kullanıcı erişime uygun"
  }
}
```

### AST Node Tipleri

| Tip | Açıklama | Alanlar |
|-----|----------|---------|
| `CONDITION` | Tekil koşul karşılaştırması | `field`, `operator`, `value` |
| `AND` | Tüm alt koşullar doğruysa geçer | `children: ASTNode[]` |
| `OR` | Herhangi bir alt koşul doğruysa geçer | `children: ASTNode[]` |
| `ACTION` | Kural tetiklendiğinde yapılacak eylem | `actionType`, `params` |

### Desteklenen Operatörler

| Operatör | Açıklama |
|----------|----------|
| `==` | Eşittir |
| `!=` | Eşit değildir |
| `>` | Büyüktür |
| `<` | Küçüktür |
| `>=` | Büyük eşittir |
| `<=` | Küçük eşittir |
| `contains` | İçerir (string) |
| `not_contains` | İçermez (string) |

### Desteklenen Action Tipleri

| Action Type | Açıklama |
|-------------|----------|
| `ALLOW` | İzin ver |
| `DENY` | Reddet |
| `LOG` | Kayıt al |
| `NOTIFY` | Bildirim gönder |
| `CUSTOM` | Özel aksiyon |

---

## Notlar

- **Tailwind CSS v4 kullanılıyor.** TW v4'te artık `tailwind.config.js` dosyası yok, tüm konfigürasyon `index.css` içinde `@theme` direktifi ile yapılıyor.
- **TanStack Query** tüm API çağrıları için kullanılacak. Bu sayede caching, background refetching, optimistic updates ve loading/error state'leri otomatik yönetilecek. Axios sadece HTTP client olarak `apiClient` katmanında kalacak.
- **Mevcut Vite boilerplate kodu** (`App.tsx`, `App.css`, `assets/` klasörü) tamamen silinip yerine Rule Engine mimarisi kurulacaktır.

---

## Proposed Changes

Tüm çalışma **5 adım** halinde, her adım onayı alındıktan sonra sırayla uygulanacaktır.

---

### Adım 1: Proje İskeleti, API Katmanı ve TanStack Query Altyapısı

Mevcut boilerplate temizlenip Feature-Driven Architecture klasör yapısı oluşturulacak.

#### Yüklenecek Bağımlılıklar

```bash
npm install @xyflow/react axios @tanstack/react-query
npm install -D @tanstack/react-query-devtools
```

#### Hedef Klasör Yapısı

```
src/
├── app/                          # Global layout, provider'lar, giriş noktası
│   ├── App.tsx                   # Ana layout bileşeni
│   ├── App.css                   # Global layout stilleri
│   └── providers/
│       └── AppProviders.tsx      # QueryClientProvider + ReactFlowProvider
│
├── shared/                       # Projenin tamamında paylaşılan araçlar
│   ├── api/
│   │   ├── endpoints.ts          # HttpMethod & ApiEndpoint enum'ları
│   │   ├── apiClient.ts          # Axios instance + interceptor'lar
│   │   └── types.ts              # API response/request generic tipleri
│   ├── components/               # Reusable UI bileşenleri (Adım 2)
│   ├── hooks/                    # Ortak custom hook'lar
│   └── utils/                    # Helper fonksiyonlar
│
├── features/                     # İş mantığına göre ayrılmış modüller
│   ├── RuleEditor/               # Sürükle-bırak canvas (Adım 3-4)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/             # TanStack Query hooks (useRuleQuery, useRuleMutation)
│   │   └── types/
│   └── RuleList/                 # Kayıtlı kurallar listesi (Adım 5)
│       ├── components/
│       ├── hooks/
│       ├── services/             # TanStack Query hooks (useRulesQuery)
│       └── types/
│
├── index.css                     # Tailwind v4 @theme + global stiller
└── main.tsx                      # Uygulama giriş noktası
```

#### [DELETE] `src/App.css`
Vite boilerplate stilleri silinecek.

#### [DELETE] `src/App.tsx`
Vite boilerplate bileşeni silinecek.

#### [DELETE] `src/assets/` klasörü
Boilerplate asset'ler silinecek.

#### [MODIFY] `vite.config.ts`
- `server.port: 3000` ayarı
- `/api` proxy → `http://localhost:3500`

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3500',
        changeOrigin: true,
      },
    },
  },
});
```

#### [MODIFY] `src/main.tsx`
- Import yolları güncelleme: `./App` → `./app/App`

#### [MODIFY] `index.html`
- Title: "Rule Engine"
- Meta description ekleme
- Google Fonts (Inter) link'i ekleme

#### [MODIFY] `src/index.css`
Tailwind v4 `@theme` ile deep space renk paleti:

```css
@import "tailwindcss";

@theme {
  --color-space-900: #06060f;
  --color-space-800: #0c0c1d;
  --color-space-700: #12122b;
  --color-space-600: #1a1a3e;
  --color-space-500: #2a2a5a;

  --color-neon-blue: #00d4ff;
  --color-neon-purple: #a855f7;
  --color-neon-cyan: #22d3ee;

  --color-surface-primary: #0f0f23;
  --color-surface-secondary: #161633;
  --color-surface-elevated: #1e1e45;

  --color-text-primary: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;

  --color-border-subtle: rgba(100, 116, 139, 0.2);
  --color-border-glow: rgba(0, 212, 255, 0.3);

  --font-sans: 'Inter', system-ui, sans-serif;

  --shadow-glow-sm: 0 0 10px rgba(0, 212, 255, 0.15);
  --shadow-glow-md: 0 0 20px rgba(0, 212, 255, 0.2);
  --shadow-glow-lg: 0 0 40px rgba(168, 85, 247, 0.15);
}
```

#### [NEW] `src/shared/api/endpoints.ts`
```typescript
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum ApiEndpoint {
  SAVE_RULE = '/api/rules',
  EVALUATE_RULE = '/api/rules/evaluate',
  GET_ALL_RULES = '/api/rules',
  GET_RULE_BY_ID = '/api/rules/:id',
  DELETE_RULE = '/api/rules/:id',
}
```

#### [NEW] `src/shared/api/apiClient.ts`
- Axios instance (`baseURL` proxy üzerinden `/api`)
- Request/response interceptor'lar
- Generic `request<T>()` metodu → tip güvenli API çağrıları
- `replaceParams()` helper (`:id` gibi path parametreleri)

#### [NEW] `src/shared/api/types.ts`
```typescript
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### [NEW] `src/app/providers/AppProviders.tsx`
- `QueryClientProvider` (TanStack Query) — stale time, retry, refetch konfigürasyonu
- `ReactFlowProvider` sarmalama
- Development ortamında `ReactQueryDevtools` entegrasyonu

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 dakika
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

#### [NEW] `src/app/App.tsx`
- Minimal shell: header + ana içerik alanı layout'u
- Deep space themed arka plan

#### [NEW] `src/app/App.css`
- Global layout stilleri (full-height, flex layout)

#### [NEW] `.env`
```
VITE_API_BASE_URL=http://localhost:3500
```

---

### Adım 2: Temel UI Bileşenleri ve Tailwind Teması

Deep space/kozmos temasına uygun reusable bileşenler.

#### [NEW] `src/shared/components/Button/Button.tsx` + `Button.css`
- Varyantlar: `primary` (neon glow), `secondary` (subtle), `ghost` (transparent)
- Size: `sm`, `md`, `lg`
- Hover'da neon glow efekti, micro-animation'lar
- Glassmorphism efektli arka plan

#### [NEW] `src/shared/components/SelectBox/SelectBox.tsx` + `SelectBox.css`
- Operatör seçimi için custom dropdown
- Keyboard navigation desteği
- Custom hook ile state yönetimi (`useSelectBox`)
- Deep space temalı dropdown menü

#### [NEW] `src/shared/components/Card/Card.tsx` + `Card.css`
- Kural düğümleri ve genel amaçlı kart bileşeni
- Hover'da subtle glow efekti
- Glassmorphism arka plan, backdrop-filter blur

#### [NEW] `src/shared/components/Input/Input.tsx` + `Input.css`
- Text input, value/field girişleri için
- Focus'ta neon border glow, error state desteği

#### [NEW] `src/shared/components/Modal/Modal.tsx` + `Modal.css`
- Kural kaydetme/düzenleme dialog'u
- Portal ile render, backdrop blur efekti
- Giriş/çıkış transition animasyonu

#### [NEW] `src/shared/components/index.ts`
- Barrel export dosyası

---

### Adım 3: Rule Canvas (Sürükle-Bırak Alanı)

React Flow (`@xyflow/react`) ile visual rule builder.

#### [NEW] `src/features/RuleEditor/types/ruleNode.types.ts`
```typescript
export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: string;
}

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

export enum LogicGateType {
  AND = 'AND',
  OR = 'OR',
}

export enum RuleNodeType {
  CONDITION = 'condition',
  LOGIC_GATE = 'logic_gate',
  ACTION = 'action',
}
```

#### [NEW] `src/features/RuleEditor/components/ConditionNode/ConditionNode.tsx` + `.css`
- Koşul düğümü: field, operator, value girişleri
- React Flow custom node olarak register
- SelectBox ile operatör seçimi, sürüklenebilir handle'lar
- Seçildiğinde mor/mavi aura glow

#### [NEW] `src/features/RuleEditor/components/LogicGateNode/LogicGateNode.tsx` + `.css`
- AND/OR mantık kapısı düğümü
- Toggle ile AND ↔ OR geçişi
- Compact, ikonografik tasarım

#### [NEW] `src/features/RuleEditor/components/ActionNode/ActionNode.tsx` + `.css`
- Kural tetiklendiğinde yapılacak aksiyon düğümü
- Aksiyon tipi seçimi (ALLOW, DENY, LOG, NOTIFY, CUSTOM)
- Yeşilimsi neon vurgu ile koşullardan görsel ayrım

#### [NEW] `src/features/RuleEditor/components/RuleCanvas/RuleCanvas.tsx` + `.css`
- Ana React Flow canvas bileşeni
- Node ve edge tipleri kayıt
- Minimap, Controls, Background entegrasyonu
- Sidebar'dan node sürükleme desteği
- Kozmik grid arka planı

#### [NEW] `src/features/RuleEditor/components/NodePalette/NodePalette.tsx` + `.css`
- Sol sidebar: sürüklenebilir node tipleri listesi
- Condition, Logic Gate, Action node'ları
- Drag handle ile canvas'a sürükleme
- Glassmorphism sidebar tasarımı

---

### Adım 4: State Yönetimi ve AST Dönüşümü

Görsel canvas → JSON kural ağacı dönüşüm mantığı. **Tüm iş mantığı custom hook'larda** yaşayacak.

#### [NEW] `src/features/RuleEditor/types/ast.types.ts`
```typescript
export type ASTNode =
  | ASTConditionNode
  | ASTLogicNode;

export interface ASTConditionNode {
  type: 'CONDITION';
  field: string;
  operator: string;
  value: string;
}

export interface ASTLogicNode {
  type: 'AND' | 'OR';
  children: ASTNode[];
}

export interface ASTActionNode {
  type: 'ACTION';
  actionType: 'ALLOW' | 'DENY' | 'LOG' | 'NOTIFY' | 'CUSTOM';
  params: Record<string, string>;
}

export interface RulePayload {
  name: string;
  description: string;
  ast: ASTNode;
  action: ASTActionNode;
}

export interface RuleResponse extends RulePayload {
  id: string;
  createdAt: string;
  updatedAt: string;
}
```

#### [NEW] `src/features/RuleEditor/hooks/useRuleEngine.ts`
- React Flow node/edge state yönetimi
- `onNodesChange`, `onEdgesChange`, `onConnect` handler'ları
- Node ekleme/silme/güncelleme fonksiyonları
- Canvas'tan AST'ye dönüşüm (`toAST()`)
- AST'den canvas'a dönüşüm (`fromAST()`)

#### [NEW] `src/features/RuleEditor/hooks/useNodeDragAndDrop.ts`
- NodePalette'den canvas'a sürükleme mantığı
- `onDragStart`, `onDragOver`, `onDrop` handler'ları
- Yeni node oluşturma ve pozisyon hesaplama

#### [NEW] `src/features/RuleEditor/hooks/useRuleValidation.ts`
- Kural ağacı doğrulama
- Bağlı olmayan düğüm kontrolü
- Boş koşul alanları kontrolü
- Döngüsel bağlantı kontrolü

---

### Adım 5: TanStack Query ile API Entegrasyonu ve RuleList

TanStack Query hooks ile server state yönetimi. Caching, background refetching, optimistic updates otomatik.

#### [NEW] `src/features/RuleEditor/services/ruleQueryKeys.ts`
- Query key factory pattern (TanStack Query best practice)

```typescript
export const ruleKeys = {
  all: ['rules'] as const,
  lists: () => [...ruleKeys.all, 'list'] as const,
  list: (filters: RuleFilters) => [...ruleKeys.lists(), filters] as const,
  details: () => [...ruleKeys.all, 'detail'] as const,
  detail: (id: string) => [...ruleKeys.details(), id] as const,
};
```

#### [NEW] `src/features/RuleEditor/services/useRuleQueries.ts`
- `useRulesQuery()` — tüm kuralları çekme (`useQuery`)
- `useRuleByIdQuery(id)` — tek kural çekme (`useQuery`)
- `useSaveRuleMutation()` — kural kaydetme (`useMutation` + cache invalidation)
- `useDeleteRuleMutation()` — kural silme (`useMutation` + optimistic update)
- `useEvaluateRuleMutation()` — kural değerlendirme (`useMutation`)

```typescript
// Örnek kullanım
export function useSaveRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RulePayload) =>
      apiClient.request<RuleResponse>({
        endpoint: ApiEndpoint.SAVE_RULE,
        method: HttpMethod.POST,
        data: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
}
```

#### [NEW] `src/features/RuleList/types/ruleList.types.ts`
- `RuleFilters` interface (search, sort, pagination)
- Liste görünümü tipleri

#### [NEW] `src/features/RuleList/components/RuleListPanel/RuleListPanel.tsx` + `.css`
- Kayıtlı kurallar listesi
- Kural seçme → canvas'a yükleme
- Silme, düzenleme aksiyonları
- Arama/filtreleme
- Loading/error state (TanStack Query'den otomatik)

#### [NEW] `src/features/RuleList/hooks/useRuleListLogic.ts`
- Filtreleme, sıralama, arama UI mantığı
- Seçili kural state yönetimi

---

## TanStack Query Katmanlama Stratejisi

```
UI Bileşeni (render)
    ↓ çağırır
TanStack Query Hook (useRulesQuery, useSaveRuleMutation)
    ↓ çağırır
apiClient.request<T>() (Axios instance)
    ↓ istek atar
Backend API (localhost:3500)
```

> Bu katmanlama sayesinde:
> - **UI** sadece hook'un döndürdüğü `data`, `isLoading`, `error` ile ilgilenir (SRP)
> - **TanStack Query** caching, retry, stale time'ı yönetir
> - **apiClient** HTTP detaylarını (headers, interceptors) yönetir
> - Hiçbir bileşen doğrudan axios/fetch çağırmaz (DIP)

---

## Yüklenecek Bağımlılıklar (Toplam)

```bash
npm install @xyflow/react axios @tanstack/react-query
npm install -D @tanstack/react-query-devtools
```

## Verification Plan

### Automated Tests
- `npm run build` → TypeScript derleme hatası olmadığını doğrulama
- `npm run lint` → ESLint kurallarına uygunluk kontrolü

### Manual Verification
- Her adım sonunda `npm run dev` ile tarayıcıda görsel doğrulama
- Node sürükleme, bağlantı oluşturma, AST dönüşümü testleri
- TanStack Query DevTools ile cache ve query durumu izleme
- API entegrasyonu mock data ile test
- Responsive tasarım kontrolü
- Dark mode kozmik tema doğrulama

### Adım Bazlı Doğrulama

| Adım | Doğrulama Kriteri |
|------|-------------------|
| 1 | Klasör yapısı oluştu, `apiClient` çalışıyor, QueryClientProvider aktif, port 3000'de uygulama ayağa kalkıyor |
| 2 | Tüm UI bileşenleri izole render ediliyor, tema renkleri doğru |
| 3 | Canvas render oluyor, node'lar sürüklenip bırakılabiliyor, bağlantılar kuruluyor |
| 4 | Canvas → AST dönüşümü doğru JSON üretiyor, validation çalışıyor |
| 5 | TanStack Query hooks çalışıyor, kural CRUD işlemleri yapılıyor, cache invalidation doğru |
