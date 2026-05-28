# 🎨 Rule Engine Frontend

Kuralların ve mantıksal ağaçların tasarlandığı, kullanıcı dostu ve görsel etkileşime dayalı modern Frontend (Arayüz) projesi. 

## 🛠️ Teknolojiler
- **Kütüphane:** React (TypeScript ile)
- **Derleyici (Bundler):** Vite (Hızlı canlı geliştirme ortamı)
- **Stil ve Tasarım:** TailwindCSS, Vanilla CSS, Lucide React (İkonlar)
- **Kural Ağacı Yönetimi (Canvas):** React Flow (Düğümler ve bağlar için)
- **Veri ve Durum Yönetimi:** React Query (Sunucu durumu) ve Zustand (İstemci durumu)
- **Ağ İstekleri:** Axios

## 🎨 Tasarım Estetiği (UI/UX)
Proje sıradan bir iş uygulamasından öte, **premium ve dinamik bir tasarım dili** ile hazırlanmıştır:
- **Koyu (Dark) ve Açık (Light) Tema Desteği:** Kullanıcının gözünü yormayan, kontrastlı ve zarif bir "Uzay Koyu" teması ana tema olarak belirlenmiştir.
- **Glassmorphism ve Neon Dokunuşlar:** Şeffaf yüzeyler ve ince çizgisel neon aydınlatmalarla derinlik hissi kazandırılmıştır.
- **Dinamik Geri Bildirim:** Etkileşim anında hover animasyonları, mikro geçişler (micro-animations) ve pürüzsüz "toast" bildirimleri kullanılmıştır.
- **Düğüm (Node) Arayüzü:** Kural operatörleri, değer girişleri ve aksiyon seçimleri tek bir tuval (canvas) üzerinden basitçe bağlanabilir. Hatalı bağlar (edge) kolayca kesilip düzeltilebilir.

## 🚀 Özellikler
- **Düğüm Ekleme/Çıkarma:** Koşul, Mantık (VE/VEYA) ve Aksiyon düğümlerini sürükle-bırak ile tuvale taşıyın.
- **Simülatör:** Sağ panelde yer alan simülatör ile hazırladığınız kuralı kaydetmeden önce doğrudan yerel ağaç üzerinden veya Backend'de canlı olarak test edin.
- **Toplu Alan Ekleme:** Kural testlerini kolaylaştırmak için örnek bir JSON yapıştırarak sistemde gerekli alanları tipleri ile birlikte otomatik oluşturun. (Örn: `{"age": 25, "date": "2026-05-10"}`)
- **Özel Kancalar (Custom Hooks):** SOLID prensiplerine uygun olarak her mantık (`useConfirm`, `useToast`, `useRuleQueries`) soyutlanmış (abstract) ve izole edilmiştir.

## ⚙️ Kurulum ve Başlatma

### 1. Bağımlılıkları Yükleme
Proje klasörüne girin ve kütüphaneleri indirin:
```bash
npm install
```

### 2. Geliştirme (Development) Modunda Başlatma
Hızlı güncelleme (Hot-Module-Reloading) ile sunucuyu başlatmak için:
```bash
npm run dev
```
Uygulama tarayıcınızda açılacaktır (Genellikle `http://localhost:3000` veya `http://localhost:5173`).

### 3. Üretime Hazırlama (Build)
Uygulamayı canlı ortama atmak üzere optimize ederek derlemek için:
```bash
npm run build
```
Oluşan dosyalar `/dist` klasörüne aktarılacaktır.

## 📁 Proje Klasör Yapısı
- `/src/features/RuleEditor`: Kural oluşturma ekranının ana mantığı, servisleri, düğüm bileşenleri ve Zustand state'i.
- `/src/shared`: Uygulama genelinde tekrar kullanılabilir UI bileşenleri (Modal, Input, Button), API istemcisi ve Hook'lar.
- `index.css`: Tüm temalandırma değişkenleri ve Tailwind enjeksiyonları.
