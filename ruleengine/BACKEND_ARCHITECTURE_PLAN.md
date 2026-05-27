# Rule Engine Backend Architecture Plan

## Hedef

Bu backend, React tabanli surukle-birak kural editorunun urettigi AST verisini kalici olarak PostgreSQL'de saklayan, aktif kurallari Redis cache uzerinden cok hizli degerlendiren ve Swagger/OpenAPI ile dokumante edilen kurumsal seviye bir Spring Boot servisidir.

Frontend'in mevcut sozlesmesi asagidaki endpointleri bekler:

- `POST /api/rules`
- `GET /api/rules`
- `GET /api/rules/{id}`
- `DELETE /api/rules/{id}`
- `PATCH /api/rules/{id}/toggle`
- `POST /api/rules/evaluate`
- `GET /api/fields`
- `POST /api/fields`
- `DELETE /api/fields/{id}`

Frontend'in mevcut AST formati:

```json
{
  "name": "High value order",
  "description": "Approve high value trusted orders",
  "category": "ORDER",
  "priority": 10,
  "isActive": true,
  "ast": {
    "type": "AND",
    "children": [
      {
        "type": "CONDITION",
        "field": "orderAmount",
        "operator": ">",
        "value": "1000"
      }
    ]
  },
  "actions": [
    {
      "type": "ACTION",
      "actionType": "ALLOW",
      "params": {}
    }
  ]
}
```

## Secilen Mimari

Secilen yapi: Clean Architecture / Hexagonal'e yakin katmanli monolith.

Neden bu mimari:

- Controller katmani HTTP ve DTO disinda is mantigi tasimaz.
- Application katmani use-case servislerini ve transaction sinirlarini yonetir.
- Domain katmani kural AST modeli, operator stratejileri, action modeli ve evaluator algoritmasini icerir.
- Infrastructure katmani PostgreSQL, Redis, Jackson, Swagger, CORS ve dis teknoloji ayrintilarini izole eder.
- Rule evaluation algoritmasi framework bagimsiz tutulur; ileride Easy Rules, Drools veya MVEL gibi motorlara adapter eklenebilir.

Onemli karar: Kural agacini JPA self-referencing tablo olarak modellemek yerine PostgreSQL `jsonb` alaninda saklamak daha uygundur. Frontend zaten AST'yi nested JSON olarak uretir. `jsonb` saklama modeli:

- Drag-and-drop editor sozlesmesini birebir korur.
- Recursive JPA graph persistence karmasasini azaltir.
- Cache'e alinacak rule snapshot'ini daha dogal hale getirir.
- Operator/action genisletmeyi migration ihtiyaci olmadan kolaylastirir.

Self-referencing `RuleNode` modeli gerekirse ikinci fazda raporlama veya node bazli audit icin eklenebilir; ilk stabil backend icin ana kaynak `RuleDefinition.ast` olacaktir.

## Teknoloji Kararlari

- Java: 21
- Spring Boot: 4.0.6. Proje mevcut `pom.xml` kararina uygun olarak Spring Boot 4 hattinda tutulacaktir. MVC backend icin `spring-boot-starter-webmvc`, testler icin Boot 4 uyumlu test starter'lari, Swagger/OpenAPI icin Springdoc 3.x hatti kullanilacaktir.
- Web: Spring MVC
- Persistence: Spring Data JPA + PostgreSQL
- AST persistence: PostgreSQL `jsonb`
- Cache: Spring Cache abstraction + Redis
- API docs: Springdoc OpenAPI 3.x / Swagger UI
- Validation: Jakarta Validation
- Mapping: Basit ve okunur mapper siniflari; proje buyudugunde MapStruct'a gecilebilir.
- Test: JUnit 5, Mockito, Spring Boot Test, Testcontainers PostgreSQL/Redis ikinci fazda.

## Paket ve Dosya Yapisi

```text
src/main/java/com/ruleengine/ruleengine
|-- RuleengineApplication.java
|-- config
|   |-- CacheConfig.java
|   |-- CorsConfig.java
|   |-- OpenApiConfig.java
|   `-- JacksonConfig.java
|-- common
|   |-- api
|   |   |-- ApiResponse.java
|   |   `-- PaginatedResponse.java
|   |-- error
|   |   |-- ApiErrorResponse.java
|   |   |-- GlobalExceptionHandler.java
|   |   |-- ResourceNotFoundException.java
|   |   `-- RuleValidationException.java
|   `-- time
|       `-- TimeProvider.java
|-- rule
|   |-- api
|   |   |-- RuleController.java
|   |   `-- dto
|   |       |-- AstNodeDto.java
|   |       |-- ConditionNodeDto.java
|   |       |-- LogicNodeDto.java
|   |       |-- ActionNodeDto.java
|   |       |-- RuleCreateRequest.java
|   |       |-- RuleResponse.java
|   |       |-- RuleToggleRequest.java
|   |       |-- RuleEvaluationRequest.java
|   |       |-- RuleEvaluationResponse.java
|   |       `-- RuleMatchResult.java
|   |-- application
|   |   |-- RuleCommandService.java
|   |   |-- RuleQueryService.java
|   |   |-- RuleExecutionService.java
|   |   |-- RuleCacheService.java
|   |   `-- impl
|   |       |-- RuleCommandServiceImpl.java
|   |       |-- RuleQueryServiceImpl.java
|   |       |-- RuleExecutionServiceImpl.java
|   |       `-- RuleCacheServiceImpl.java
|   |-- domain
|   |   |-- ActionType.java
|   |   |-- RuleOperator.java
|   |   |-- RuleStatus.java
|   |   |-- ast
|   |   |   |-- AstNode.java
|   |   |   |-- ConditionNode.java
|   |   |   `-- LogicNode.java
|   |   |-- evaluator
|   |   |   |-- RuleEvaluator.java
|   |   |   |-- EvaluationContext.java
|   |   |   |-- EvaluationResult.java
|   |   |   |-- OperatorStrategy.java
|   |   |   `-- operators
|   |   |       |-- EqualsOperator.java
|   |   |       |-- NotEqualsOperator.java
|   |   |       |-- GreaterThanOperator.java
|   |   |       |-- LessThanOperator.java
|   |   |       |-- GreaterOrEqualOperator.java
|   |   |       |-- LessOrEqualOperator.java
|   |   |       |-- ContainsOperator.java
|   |   |       `-- NotContainsOperator.java
|   |   `-- action
|   |       |-- RuleAction.java
|   |       |-- ActionExecutor.java
|   |       `-- ActionExecutionResult.java
|   |-- infrastructure
|   |   |-- cache
|   |   |   |-- CachedRuleDefinition.java
|   |   |   `-- RuleCacheKeys.java
|   |   |-- persistence
|   |   |   |-- RuleDefinitionEntity.java
|   |   |   |-- RuleDefinitionRepository.java
|   |   |   |-- RuleDefinitionSpecification.java
|   |   |   `-- JsonbConverter.java
|   |   `-- mapper
|   |       `-- RuleMapper.java
|   `-- validation
|       |-- RuleAstValidator.java
|       `-- RuleFieldValidator.java
`-- field
    |-- api
    |   |-- FieldController.java
    |   `-- dto
    |       |-- FieldCreateRequest.java
    |       `-- FieldResponse.java
    |-- application
    |   |-- FieldService.java
    |   `-- impl
    |       `-- FieldServiceImpl.java
    |-- domain
    |   `-- FieldType.java
    `-- infrastructure
        |-- FieldDefinitionEntity.java
        |-- FieldDefinitionRepository.java
        `-- FieldMapper.java
```

## Veri Modeli

### `rule_definitions`

- `id uuid primary key`
- `name varchar not null`
- `description text`
- `category varchar`
- `priority int not null default 0`
- `active boolean not null`
- `ast jsonb not null`
- `actions jsonb not null`
- `version bigint not null`
- `created_at timestamp not null`
- `updated_at timestamp not null`

Index onerileri:

- `(active, priority desc)`
- `(category)`
- `gin(ast)` sadece AST icinde query gerektiginde

### `field_definitions`

- `id uuid primary key`
- `name varchar unique not null`
- `label varchar not null`
- `type varchar not null`
- `required boolean not null`
- `allowed_values jsonb`
- `created_at timestamp not null`
- `updated_at timestamp not null`

## Cache Stratejisi

Cache hedefi: Evaluate akisinda PostgreSQL'e gitmeden aktif kural snapshot'ini okumak.

Cache keyleri:

- `rules:active`: tum aktif kurallarin priority sirali snapshot'i
- `rules:by-id:{id}`: tek kural snapshot'i

Kurallar:

- `RuleCacheService.getActiveRules()` -> `@Cacheable("activeRules")`
- `RuleCacheService.getRuleById(UUID id)` -> `@Cacheable("ruleById")`
- Kural create/update/delete/toggle islemleri -> `@CacheEvict(cacheNames = {"activeRules", "ruleById"}, allEntries = true)`

Redis'te entity degil, immutable `CachedRuleDefinition` saklanir. Boylece lazy loading, transaction ve Hibernate proxy problemleri cache katmanina sizmaz.

## Evaluation Akisi

1. `POST /api/rules/evaluate` request gelir.
2. Request `ruleId` iceriyorsa ilgili aktif kural Redis'ten okunur.
3. Request `ruleId` icermiyorsa tum aktif kurallar Redis'ten priority sirasi ile okunur.
4. `RuleEvaluator` AST uzerinde recursive calisir.
5. `CONDITION` node icin field degeri fact map icinden okunur.
6. Operator stratejisi secilir ve typed comparison yapilir.
7. `AND` node tum child sonuclarini, `OR` node en az bir child sonucunu degerlendirir.
8. Kural match ederse action listesi response'a eklenir.

Response ornegi:

```json
{
  "success": true,
  "message": "Evaluation completed",
  "data": {
    "matched": true,
    "matchedRules": [
      {
        "ruleId": "7d5d3cf7-7c0d-4428-a9ed-0af6ea47fd97",
        "ruleName": "High value order",
        "actions": [
          {
            "actionType": "ALLOW",
            "params": {}
          }
        ]
      }
    ],
    "evaluatedRuleCount": 1
  }
}
```

## Operator Altyapisi

Ilk operator seti:

- `==`
- `!=`
- `>`
- `<`
- `>=`
- `<=`
- `contains`
- `not_contains`

Operatorler `OperatorStrategy` arayuzu ile ayrilir. Bu sayede yeni operator eklemek icin evaluator degistirilmez; sadece yeni strategy bean'i eklenir.

Tip donusumu:

- Number karsilastirmalari `BigDecimal`
- Boolean karsilastirmalari `Boolean`
- Date/time karsilastirmalari ikinci fazda `OffsetDateTime`
- Digerleri `String`

## Action Altyapisi

Ilk action tipleri:

- `ALLOW`
- `DENY`
- `LOG`
- `NOTIFY`
- `CUSTOM`

Ilk fazda action'lar side effect calistirmadan response olarak doner. Ikinci fazda `ActionExecutor` adapter'lari ile audit log, webhook, notification veya queue publish eklenebilir.

## API Response Standardi

Basarili tekil response:

```json
{
  "success": true,
  "message": "Rule created",
  "data": {}
}
```

Liste response:

```json
{
  "data": [],
  "total": 0,
  "page": 0,
  "pageSize": 20
}
```

Hata response:

```json
{
  "message": "Rule not found",
  "statusCode": 404,
  "details": {},
  "timestamp": "2026-05-26T21:00:00Z"
}
```

## Uygulama Fazlari

### Faz 1 - Temel Konfigurasyon

- `pom.xml` dependency duzenleme, Spring Boot 4.0.6 uyumlulugu
- `application.yml` olusturma
- PostgreSQL, Redis, cache, Swagger ve CORS konfigurasyonu
- `application.properties` yerine `application.yml` kullanimi

### Faz 2 - Domain ve Persistence

- Rule domain model ve enumlar
- `RuleDefinitionEntity`
- `FieldDefinitionEntity`
- Repository katmani
- JSONB converter
- Audit timestamp alanlari

### Faz 3 - DTO, Mapper ve Validation

- Frontend uyumlu request/response DTO'lari
- AST polymorphic DTO modeli
- Rule mapper
- AST semantic validation
- Field validation

### Faz 4 - Service ve Cache

- Command/query servis ayrimi
- Redis cache servisleri
- Cache eviction
- Toggle/delete lifecycle
- Pagination/filter support

### Faz 5 - Rule Evaluation Engine

- Recursive AST evaluator
- Operator strategy registry
- Typed comparison
- Rule match result
- Single rule ve active-rules evaluation akislari

### Faz 6 - REST API ve Swagger

- RuleController
- FieldController
- OpenAPI annotations
- Global exception handler
- Frontend response format uyumu

### Faz 7 - Test ve Dogrulama

- Operator unit testleri
- AST evaluator unit testleri
- Service testleri
- Controller slice testleri
- PostgreSQL/Redis entegrasyon testleri icin Testcontainers hazirligi

## Kabul Kriterleri

- Entity'ler API'den dogrudan donmez.
- Controller katmaninda is mantigi bulunmaz.
- Service bagimliliklari interface uzerinden kurulur.
- Evaluate endpoint'i aktif kurallari Redis cache uzerinden okur.
- Kural create/delete/toggle islemleri cache'i temizler.
- Swagger UI tum endpointleri request/response semalariyla gosterir.
- Frontend'in mevcut TypeScript tipleriyle uyumlu response donulur.
- Global hata formati frontend `ApiError` tipiyle uyumludur.
- Yeni operator eklemek mevcut evaluator kodunu degistirmeden mumkundur.

## Sonraki Adim

Planlanan 7 faz tamamlandi. Docker altyapisi `compose.yaml` ile eklendi; PostgreSQL ve Redis resmi `latest` imajlari uzerinden calisir. Varsayilan compose calistirmasi sadece PostgreSQL/Redis altyapisini acar; backend container'i icin `app` profili kullanilir. Lokal IDE calistirmalarinda makinedeki servis portlariyla cakismamak icin Docker PostgreSQL host portu varsayilan olarak `4567`, Redis host portu varsayilan olarak `7856` secilmistir.

Komutlar:

- `docker compose up -d`
- `docker compose --profile app up --build`
- `docker compose down`

Sonraki pratik adimlar: JDK 21 ile tam test calistirma, Docker aktifken PostgreSQL/Redis Testcontainers tabanli entegrasyon testlerini genisletme ve frontend ile uctan uca smoke test yapma.
