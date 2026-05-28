# ⚙️ Rule Engine Backend

Kural motorunun kalbi olan Backend modülü. Yüksek performanslı, esnek ve ölçeklenebilir bir değerlendirme (Evaluation) sistemi sağlamak üzere tasarlanmıştır.

## 🛠️ Teknolojiler ve Mimari
- **Dil ve Framework:** Java 17, Spring Boot 3.x
- **Veritabanı (RDBMS):** PostgreSQL (Spring Data JPA / Hibernate)
- **Önbellek (Caching):** Redis (Spring Data Redis) - Kuralların milisaniyeler içerisinde bellekten okunması için.
- **Konteynerleştirme:** Docker & Docker Compose
- **Test ve Dökümantasyon:** JUnit, Testcontainers, Swagger (OpenAPI 3.0)

## 📌 Mimari Tasarım Prensipleri
- **SOLID ve Clean Architecture:** Sorumluluklar Api, Application, Domain ve Infrastructure katmanları arasında ayrıştırılmıştır. Katmanlar arası sıkı bağımlılıkları önlemek için Inversion of Control (IoC) titizlikle uygulanmıştır.
- **Domain-Driven Design (DDD):** Kurallar (Rule), Operatörler ve Değerlendirici (Evaluator) kendi domain modellerine sahiptir. Veritabanı Entity sınıfları, asıl mantıktan ayrı tutulmuştur.
- **Tasarım Şablonları (Design Patterns):** Strategy deseni ile her mantıksal operatör (`>`, `=`, `MATCHES`, `CONTAINS` vb.) ayrı sınıflarda ele alınmış, böylece sistemin genişletilebilirliği (OOM veya spagetti kod riskine girmeden) en üst düzeye çıkarılmıştır.
- **Versiyonlama:** Sisteme kaydedilen kurallar her değişiklikte yeni bir versiyon ID'si ile tutulur, eski sürümlere dönülebilir.

## 🚀 Kurulum ve Çalıştırma

### 1. Ortamı Hazırlama (Docker)
Proje kök dizininde bulunan `docker-compose.yml` dosyası, PostgreSQL ve Redis servislerini içerir. Bu servisleri başlatmak için:
```bash
docker-compose up -d
```

### 2. Uygulamayı Derleme
Eğer `mvn` sistem değişkenlerinizde ekli değilse proje içindeki `mvnw` (Maven Wrapper) betiğini kullanabilirsiniz:
```bash
# Windows
.\mvnw clean compile

# MacOS/Linux
./mvnw clean compile
```

### 3. Uygulamayı Başlatma
```bash
.\mvnw spring-boot:run
```
Uygulama `http://localhost:8080` portu üzerinde ayağa kalkacaktır.

## 📡 API Dokümantasyonu (Swagger)

Projeyi başlattıktan sonra mevcut API uç noktalarını (endpoints) test etmek ve yapısını incelemek için Swagger UI arayüzünü ziyaret edebilirsiniz:
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`

## 🧩 Önemli API Uç Noktaları (Endpoints)
- **`/api/rules`**: Kuralları oluşturma, listeleme, güncelleme ve silme işlemleri.
- **`/api/rules/evaluate`**: Belirli bir kuralı JSON Payload (Test Verisi) ile çalıştırarak sonucun Başarılı/Başarısız olduğunu dönme.
- **`/api/fields`**: Dinamik alanların yönetimi. Toplu ekleme, silme, düzenleme.

## 🚨 Hata Yönetimi (Error Handling)
Kullanıcı hataları (`RuleValidationException`) veya kaynağın bulunamaması (`ResourceNotFoundException`) gibi durumlar `GlobalExceptionHandler` ile yakalanıp, Frontend'in rahatlıkla okuyabileceği standart bir JSON formatına çevrilerek döndürülür.
