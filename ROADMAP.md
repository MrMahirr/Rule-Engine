# Rule Engine - CV & Portfolyo Projesi Yol Haritası

Bu doküman, Rule Engine projesini basit bir CRUD uygulamasından çıkarıp, mülakatlarda "Senior / Mid-Level" kalitesinde bir mühendislik vizyonunu yansıtacak seviyeye getirmek için atılacak adımları teknik detaylarıyla listeler. Her bir madde, sistemin farklı bir teknik kasını (Örn: performans, data processing, architectural design) göstermek üzere tasarlanmıştır.

---

## 🚀 Aşama 1: Analitik ve İzlenebilirlik (Dashboard & Audit Logs)
*Mülakat Mesajı: "Kodumun prod ortamında nasıl davrandığını ve monitör edileceğini düşünürüm."*

### Adım 1: Audit Log (Çalışma Kayıtları) Altyapısı
- **Backend:** `RuleExecutionLogEntity` adında yeni bir JPA tablosu oluşturulacak. Bu tabloda şu alanlar olacak:
  - `ruleId` (Hangi kural çalıştı?)
  - `executionTimeMs` (Kaç milisaniyede tamamlandı?)
  - `factPayload` (Kurala hangi JSON datası gönderildi?)
  - `result` (Kural geçti mi, kaldı mı? Hangi aksiyon fırladı?)
  - `createdAt` (Zaman damgası)
- **Backend:** `RuleExecutionService` içinde değerlendirme (evaluate) işlemi bittiğinde asenkron olarak (`@Async` kullanarak veya bir Message Queue taklidi yaparak) bu log veritabanına yazılacak.
- **Frontend:** `/logs` adında yeni bir sayfa (veya modal) eklenecek. Kullanıcılar bir tablo üzerinde geçmişte çalışan kuralların saatini, gönderilen veriyi ve sonucunu görebilecek.

### Adım 2: Performans Dashboard'u (Recharts Entegrasyonu)
- **Backend:** `/api/metrics` adında yeni bir endpoint yazılacak. Bu endpoint veritabanındaki logları gruplayarak (Örn: "Son 7 günde en çok tetiklenen 5 kural", "Ortalama çalışma süresi") istatistik dönecek.
- **Frontend:** React tarafında `recharts` veya `chart.js` kütüphanesi kurularak anasayfaya bir Dashboard çizilecek.
  - Pasta Grafik (Pie Chart): Başarılı/Başarısız kural oranları.
  - Bar Grafik (Bar Chart): En çok tetiklenen kurallar.

---

## 🔬 Aşama 2: Toplu Veri İşleme (Batch CSV Simulation)
*Mülakat Mesajı: "Büyük verileri (Big Data) işleme ve performanslı algoritmalar yazma yeteneğine sahibim."*

### Adım 1: CSV Yükleme ve Parse Etme
- **Frontend:** RuleSimulator kısmına "Toplu Test (CSV Yükle)" sekmesi eklenecek. `papaparse` gibi bir kütüphane ile kullanıcıdan alınan CSV dosyası (Örn: 1000 müşterinin yaş, bakiye bilgisi) JSON dizisine çevrilecek.
### Adım 2: Toplu Değerlendirme (Batch Evaluation) Uç Noktası
- **Backend:** `/api/rules/evaluate-batch` adında yeni bir endpoint eklenecek. Tek bir JSON almak yerine `List<Map<String, Object>>` (Fact Listesi) alacak.
- **Backend (Performans):** 1000 satırlık veriyi değerlendirirken kural ağacı (AST) sadece bir kere derlenecek (Compile), ardından 1000 satır bu derlenmiş ağaçtan geçirilerek performans optimize edilecek (Ağacı her satır için tekrar kurmak ciddi bir hatadır, bunu mülakatta vurgulayabilirsin).
### Adım 3: Sonuçların Görselleştirilmesi
- **Frontend:** Dönen toplu sonuç ekranda "Özet Rapor" olarak sunulacak (Kaç kişi ALLOW aldı, kaç kişi DENY aldı).

---

## 🕰️ Aşama 3: Kural Sürümleme ve Geri Alma (Versioning & Rollback)
*Mülakat Mesajı: "Kurumsal mimarilerde veri kaybını önleme ve geçmişe dönük izlenebilirlik (Traceability) konularına hakimim."*

### Adım 1: Hibernate Envers Entegrasyonu (Kolay ve Etkili Yol)
- **Backend:** `pom.xml` dosyasına `hibernate-envers` bağımlılığı eklenecek.
- **Backend:** `RuleDefinitionEntity` sınıfının başına `@Audited` anotasyonu konulacak. Bu sayede Hibernate, kural her güncellendiğinde otomatik olarak `rule_definition_aud` (Audit) tablosuna kuralın eski halini kaydedecek.
### Adım 2: Geçmişi Görüntüleme API'si
- **Backend:** `/api/rules/{id}/history` adında bir endpoint yazılıp Spring Data Envers kullanılarak kuralın tüm geçmiş versiyonları (Revizyonları) liste halinde dönülecek.
### Adım 3: Frontend Versiyon Arayüzü ve Rollback
- **Frontend:** Canvas ekranına bir "Geçmiş Versiyonlar" butonu eklenecek. Buna tıklandığında bir çekmece (Drawer) açılıp kuralın V1, V2, V3 halleri listelenecek.
- **Frontend:** Kullanıcı eski bir versiyona tıklayıp "Bu Versiyona Dön" dediğinde, backend'e o versiyonun verisi yollanıp kural o anki haline geri döndürülecek.

---

## 🧠 Aşama 4: Zenginleştirilmiş Operatörler
*Mülakat Mesajı: "Genişletilebilir (Extensible) ve esnek tasarımlar yapabilirim."*

### Adım 1: Yeni Operatörlerin Backend'e Eklenmesi
- **Backend:** `RuleOperator.java` Enum sınıfına şu operatörler eklenecek: `IN`, `NOT_IN`, `STARTS_WITH`, `ENDS_WITH`, `REGEX_MATCH`.
- **Backend:** Evaluator tarafında (Örn: `OperatorStrategy` sınıflarında) bu yeni operatörlerin mantığı yazılacak (Örn: `RegexMatchOperator` sınıfı `Pattern.compile` kullanarak regex validasyonu yapacak).
### Adım 2: Frontend Seçeneklerinin Güncellenmesi
- **Frontend:** `ConditionNode.tsx` içerisine yeni operatörler dahil edilecek. `IN` seçildiğinde kullanıcıya virgülle ayrılmış değerler girmesi için bir yönlendirme/tooltip yapılacak.

---

## ⚡ Aşama 5: Kurallar Arası Çakışma Analizi (Conflict Detection) - (Opsiyonel / İleri Seviye)
*Mülakat Mesajı: "Sadece kod yazmam, sistemin matematiksel bütünlüğünü ve olası mantık hatalarını da (Logical Flaws) öngörürüm."*

### Adım 1: Basit Çakışma Mantığı
- **Backend:** `RuleConflictAnalyzer` adında bir servis yazılacak. Bu servis, sisteme yeni bir kural eklendiğinde aynı alanı (Field) sorgulayan diğer kuralları bulacak.
- Eğer Kural A "Yas < 18 -> DENY" diyorsa, ve Kural B "Yas < 15 -> ALLOW" diyorsa, sistem aralığın çakıştığını tespit edip `Warning` dönecek.
### Adım 2: Frontend Uyarıları
- **Frontend:** Kural listesi ekranında, çakışan kuralların yanında sarı bir ünlem işareti çıkacak ve "Bu kural, Kural B ile çelişiyor olabilir" uyarısı gösterecek.

---

## 🎯 Çalışma Sırası Önerisi
Projeyi kodlarken motivasyonunu yüksek tutmak ve hemen görsel sonuç almak için şu sırayı izlemeni tavsiye ederim:

1. **Aşama 4 (Zengin Operatörler):** Kodlaması en kolay olanıdır, hemen biter ve sisteme yetenek katar.
2. **Aşama 1 (Dashboard & Loglar):** Uygulamaya girer girmez profesyonel bir görünüm katar. Görselliği hemen fark edilir.
3. **Aşama 2 (Toplu CSV Testi):** Hem frontend'de dosya okuma hem backend'de performanslı veri işleme yeteneklerini gösterir.
4. **Aşama 3 (Versiyonlama):** Biraz daha arka plan mimarisi gerektirir ama projenin "kurumsal" kimliğini mühürler.
