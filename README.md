# 🚀 Rule Engine Platform

Görsel ve dinamik bir kural motoru platformu. İş mantıklarınızı (business rules) koda dokunmadan, tamamen görsel bir arayüz (Node tabanlı) üzerinden tanımlayabileceğiniz, yönetebileceğiniz ve test edebileceğiniz tam kapsamlı bir (Full-stack) uygulamadır.

## 🌟 Proje Mimarisi

Proje iki ana modülden oluşmaktadır:

1. **[Frontend (rule-engine-frontend)](./rule-engine-frontend/)**: React ve React Flow ile geliştirilmiş modern, şık ve dinamik bir Kural Tasarım Arayüzü.
2. **[Backend (ruleengine)](./ruleengine/)**: Spring Boot ve Java 17 ile geliştirilmiş, kuralları veritabanında saklayan, önbellekleyen (Redis) ve değerlendiren yüksek performanslı kural motoru arka ucu.

## ✨ Temel Özellikler

- **Görsel Kural Düzenleyici (Visual Rule Editor):** Düğümleri (Node) sürükleyip bırakarak mantıksal operatörlerle (AND/OR) kurallar oluşturun.
- **Dinamik Alan (Field) Yönetimi:** Kurallarınızda kullanacağınız alanları (yaş, tarih, e-posta, bakiye vb.) sisteminize JSON olarak topluca aktarın veya tek tek düzenleyin.
- **Yerleşik Simülatör (Built-in Simulator):** Tasarladığınız veya kaydettiğiniz kuralları anında JSON veri girerek test edin (Frontend ve Backend destekli).
- **Kapsamlı Operatör Desteği:** Sayısal büyüklük (`>`, `<`), metinsel eşleşme (`MATCHES`, `CONTAINS`), tarih/saat işlemleri ve daha fazlası.
- **Kural Versiyonlama:** Kurallarınızın geçmiş versiyonlarını görüntüleyin ve dilediğiniz versiyona geri dönün.
- **Performans (Önbellekleme):** Redis entegrasyonu ile milisaniyeler içerisinde on binlerce kural değerlendirmesi.
- **Dışa/İçe Aktarma:** Hazırladığınız kuralları JSON olarak yedekleyin veya başka ortamlara taşıyın.

## 🛠️ Kurulum Ön Koşulları

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki bileşenlere sahip olmalısınız:

- **Java 17+**
- **Node.js 18+** ve **npm**
- **Docker & Docker Compose** (PostgreSQL ve Redis servislerini kaldırmak için)

## 🚀 Hızlı Başlangıç

### 1. Veritabanı ve Önbellek Servislerini Başlatın
Docker yüklü ise uygulamanın bağımlı olduğu PostgreSQL ve Redis servislerini başlatın:
```bash
cd ruleengine
docker-compose up -d
```

### 2. Backend'i Başlatın
```bash
cd ruleengine
./mvnw clean spring-boot:run
```
*(Backend varsayılan olarak `http://localhost:8080` üzerinde çalışacaktır.)*

### 3. Frontend'i Başlatın
Yeni bir terminal açın ve ön yüzü başlatın:
```bash
cd rule-engine-frontend
npm install
npm run dev
```
*(Frontend varsayılan olarak `http://localhost:3000` veya `http://localhost:5173` üzerinde çalışacaktır.)*

## 📚 Dokümantasyon

Her iki modülün de kendine ait kapsamlı dokümantasyonu bulunmaktadır:
- [Backend Kurulum ve API Dokümantasyonu](./ruleengine/README.md)
- [Frontend Kurulum ve Bileşen Dokümantasyonu](./rule-engine-frontend/README.md)

---
*Geliştiriciler tarafından özenle kodlanmıştır. Modern tasarım (glassmorphism, neon detaylar), SOLID prensipleri ve yüksek kalite standartları ile inşa edilmiştir.*
