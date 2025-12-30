# 🎨 Portfolio Admin Dashboard

<div align="center">
  
  **🌍 Languages / Langues / Diller:**
  [🇫🇷 Français](README.md) | [🇬🇧 English](README_EN.md) | [🇹🇷 Türkçe](README_TR.md)
  
</div>

<div align="center">
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC.svg)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-000000.svg?logo=vercel)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  
</div>

<div align="center">
  <p><em>Profesyonel portföyünüzü yönetmek için modern, kodsuz bir çözüm</em></p>
</div>

## 📋 İçindekiler

- [🎯 Hakkında](#-hakkında)
- [🚀 Çevrimiçi Demo](#-çevrimiçi-demo)
- [✨ Ana Özellikler](#-ana-özellikler)
- [💻 Yönetici Arayüzü](#-yönetici-arayüzü)
- [🛠 Kullanılan Teknolojiler](#-kullanılan-teknolojiler)
- [📥 Hızlı Kurulum](#-hızlı-kurulum)
- [⚙️ Yapılandırma](#%EF%B8%8F-yapılandırma)
- [📁 Proje Yapısı](#-proje-yapısı)
- [🌐 API Rotaları](#-api-rotaları)
- [🚧 Proje Durumu](#-proje-durumu)
- [🔧 Sorun Giderme](#-sorun-giderme)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)
- [📄 Lisans](#-lisans)

## 🎯 Hakkında

Portfolio Admin, profesyonel portföyünüzü çevrimiçi yönetmek için modern ve sezgisel bir **kodsuz** (no-code) çözümdür. Kaynak kodunu manuel olarak düzenlemeye son! Şık ve güçlü bir yönetici arayüzü sayesinde şunları yapabilirsiniz:

- ✅ Portföy içeriğinizi **gerçek zamanlı değiştirin**
- ✅ Etkileşimli modal sistemiyle **projelerinizi yönetin**
- ✅ Entegre modal görüntüleme ile **CV'nizi özelleştirin**
- ✅ Entegre analitiklerle **varlığınızı optimize edin**
- ✅ Profesyonel bakım modu ile **sitenizi sürdürün**

> 🎯 **Hedef**: Geliştiricilerin, portföy içeriklerini sürdürmek yerine kodlarına odaklanmalarını sağlamak

## 🚀 Çevrimiçi Demo

🌐 **Demo Sitesi**: [Demoyu Görüntüle](https://votre-demo.vercel.app)

📱 **Yönetici Arayüzü**: [Admin Dashboard](https://votre-demo.vercel.app/admin)

> 💡 **İpucu**: Yönetici arayüzünü test etmek için demo bilgilerini kullanın

## ✨ Ana Özellikler

- 🎨 **Kodsuz Yönetim**

  - Koda dokunmadan içerik değişikliği
  - Sezgisel kullanıcı arayüzü
  - Gerçek zamanlı güncellemeler
  - Değişiklik önizleme

- 🔐 **Güvenli Kimlik Doğrulama**

  - Oturum yönetimi için NextAuth.js
  - Yönetici rota koruması
  - GitHub kimlik doğrulaması

- 📊 **Proje Yönetimi**

  - Kodlamadan proje Ekleme/Düzenleme/Silme
  - Önizlemeli resim yükleme
  - Sürükle & bırak organizasyonu (yakında)
  - Kategori yönetimi
  - **Etkileşimli Modal Görüntüleme**
    - Tam detayları görüntülemek için modallar
    - Arka plan etkileşimini engelleme
    - Sezgisel kapatma (dış tıklama veya X butonu)
    - Akıcı animasyonlar ve duyarlı tasarım

- 📝 **İçerik Yönetimi**

  - Sezgisel zengin metin editörü
  - Gelişmiş biçimlendirme (kalın, italik, renkler...)
  - Ana sayfa bölüm düzenleme
  - Sosyal bağlantı özelleştirmesi

- 🖼️ **Gelişmiş Medya Sistemi**

  - **Medya Yöneticisi**: Sürükle & Bırak ile yükleme
  - **Resim Düzenleme**: Entegre kırpma ve yakınlaştırma (`react-easy-crop`)
  - **Optimizasyon**: Yüklemeden önce otomatik görüntü sıkıştırma
  - **Galeri**: Proje resim galerisi yönetimi

- 🎨 **Daha Temiz ve Standartlaştırılmış UI Tasarımı**

  - Tüm sayfalarda minimalist ve modern arayüz
  - Tutarlı Karanlık/Aydınlık tema
  - Daha iyi okunabilirlik için görsel gürültünün azaltılması
  - Standartlaştırılmış bileşenler (Kartlar, Butonlar, Girişler)

- 📄 **CV Görüntüleme**
  - **Etkileşimli CV Modalı**: CV'yi doğrudan ana sayfada görüntüleme
  - **Entegre Önizleme**: Sayfadan ayrılmadan iframe içinde PDF görüntüleme
  - **Hızlı Eylemler**: İndirme veya yeni sekmede açma butonları
  - **Duyarlı Tasarım**: Tüm ekranlara uyarlanmış arayüz
  - **Optimize Edilmiş Kullanıcı Deneyimi**: Akıcı animasyonlar ve sezgisel kapatma

## 💻 Yönetici Arayüzü

Yönetici arayüzü şunları yapmanıza olanak tanır:

### 1. Ana Sayfa

- Ana başlığı değiştirme
- Alt başlığı özelleştirme
- "Hakkında" bölümünü düzenleme
- Sosyal bağlantılarınızı yönetme (GitHub, LinkedIn, Twitter)

### 2. Projeler

- Yeni projeler ekleme
- Mevcut projeleri düzenleme
- Projeleri silme
- Görüntüleme sırasını yeniden düzenleme

### 3. Metin Biçimlendirme

Zengin metin editörümüz şunları sağlar:

- Kalın, italik, altı çizili
- Metin rengini değiştirme
- Madde işaretli listeler oluşturma
- Metni hizalama (sol, orta, sağ)
- Başlık ve alt başlık ekleme

### 4. Medya Yönetimi

- **Entegre Medya Yöneticisi**: Önizlemeli sezgisel yükleme
- **Resim Editörü**: Kırpma ve yakınlaştırma ayarı
- **Otomatik Optimizasyon**: İstemci tarafı görüntü boyutu azaltma
- **Proje Galerisi**: Çoklu resim organizasyonu

### 4b. Proje Organizasyonu

- **Sürükle & Bırak**: Projelerinizi sürükleyerek yeniden sıralayın
- **Filtreler & Etiketler**: Kategorileri ve teknolojileri kolayca yönetin

### 5. CV Görüntüleme

- **Etkileşimli Modal**: CV şık bir modalda görüntülenir
- **Doğrudan Görselleştirme**: Ana sayfadan ayrılmadan PDF önizlemesi
- **Kullanıcı Eylemleri**: İndirme veya yeni sekmede açma
- **Modern Arayüz**: Site temasıyla uyumlu tasarım
- **Erişilebilirlik**: Klavye navigasyonu ve sezgisel kapatma

### 6. Coğrafi Konum Yönetimi

- **Akıllı Otomatik Tamamlama**: Gerçek zamanlı adres önerileri
- **Sezgisel Arayüz**: Bağlamsal önerilerle kolay giriş
- **Otomatik Doğrulama**: Standartlaştırılmış adres formatı
- **Dinamik Görüntüleme**: Sitede anında güncellenen konum
- **Coğrafi Konum**: Posta kodları ve şehir desteği

### 7. Analitik ve İzleme

- **Vercel Analytics**: Otomatik ziyaretçi ve sayfa görüntüleme takibi
- **Gerçek Zamanlı Veri**: Anlık trafik istatistikleri
- **Gizlilik Saygısı**: Üçüncü taraf çerezler olmadan analitik
- **Optimize Edilmiş Performans**: Site performansına minimal etki
- **Şeffaf Entegrasyon**: Müdahale olmadan otomatik yapılandırma

### 8. Güvenlik Mimarisi (Güvenlik Revizyonu)

Proje artık kurumsal düzeyde güvenlik entegre ediyor:

- **API Koruması**: Tüm hassas uç noktalarda sıkı `admin` rolü doğrulaması.
- **İçerik Güvenlik Politikası (CSP)**: Yetkisiz kaynakları engellemek için yapılandırılmış güçlü HTTP başlıkları.
- **Hız Sınırlama (Rate Limiting)**: Kaba Kuvvet ve DDOS saldırılarına karşı koruma.
- **Sterilizasyon (Sanitization)**: `isomorphic-dompurify` ile otomatik giriş temizleme (XSS) ve `zod` ile sıkı doğrulama.
- **Güvenli Kimlik Doğrulama**: `HttpOnly` çerezleri ve güvenli oturum yönetimi kullanımı.

Tüm bu değişiklikler doğrudan yönetici arayüzünden yapılır, koda dokunmanıza gerek yoktur!

## 🛠 Kullanılan Teknolojiler

<div align="center">

### 🎨 Frontend

| Teknoloji                                                                                 | Sürüm    | Açıklama                       |
| ----------------------------------------------------------------------------------------- | -------- | ------------------------------ |
| ![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?logo=next.js)                | `14.0.0` | React full-stack Framework     |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?logo=typescript)         | `5.0.0`  | JavaScript için statik tipleme |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?logo=tailwind-css) | `3.4.0`  | Utility CSS Framework          |
| ![TipTap](https://img.shields.io/badge/TipTap-2.0.0-orange)                               | `2.0.0`  | Zengin metin editörü           |

### 🔧 Backend & Veritabanı

| Teknoloji                                                               | Sürüm   | Açıklama                      |
| ----------------------------------------------------------------------- | ------- | ----------------------------- |
| ![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb) | `7.0`   | NoSQL Veritabanı              |
| ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.0.0-purple)   | `4.0.0` | Next.js için Kimlik Doğrulama |
| ![Mongoose](https://img.shields.io/badge/Mongoose-8.0.0-red)            | `8.0.0` | MongoDB için ODM              |

### 📊 Analitik & Dağıtım

| Teknoloji                                                                            | Açıklama                       |
| ------------------------------------------------------------------------------------ | ------------------------------ |
| ![Vercel Analytics](https://img.shields.io/badge/Vercel_Analytics-black?logo=vercel) | Performans ve ziyaretçi takibi |
| ![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel)                     | Dağıtım Platformu              |

### 🛠 Geliştirme Araçları

| Araç                                                                    | Açıklama                     |
| ----------------------------------------------------------------------- | ---------------------------- |
| ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint)       | JavaScript/TypeScript Linter |
| ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier) | Kod Biçimlendirici           |
| ![Git](https://img.shields.io/badge/Git-F05032?logo=git)                | Sürüm Kontrolü               |

</div>

## 📥 Hızlı Kurulum

### 🚀 5 Dakikada Kurulum

#### 1️⃣ Projeyi klonlayın

```bash
# Depoyu klonlayın
git clone https://github.com/mehmetsalihkuscu/portfolio-admin.git
cd portfolio-admin/portfolio-admin
```

#### 2️⃣ Bağımlılıkları yükleyin

```bash
# npm ile (önerilen)
npm install

# Veya yarn ile
yarn install

# Veya pnpm ile (daha hızlı)
pnpm install
```

#### 3️⃣ Ortam Yapılandırması

```bash
# Yapılandırma dosyasını oluşturun
cp .env.example .env.local

# Ortam değişkenlerini düzenleyin
nano .env.local  # veya tercih ettiğiniz editör
```

#### 4️⃣ Geliştirme Sunucusunu Başlatın

```bash
# Geliştirme modunda başlatın
npm run dev

# Site http://localhost:3000 adresinde erişilebilir olacak
```

#### 5️⃣ Yönetici Arayüzüne Erişin

```bash
# Yönetici arayüzü şurada mevcuttur:
# http://localhost:3000/admin
```

### ⚡ Komut Dosyası ile Hızlı Kurulum

```bash
# Otomatik kurulum komut dosyası
curl -fsSL https://raw.githubusercontent.com/mehmetsalihkuscu/portfolio-admin/main/install.sh | bash
```

> 💡 **İpucu**: Sisteminizde Node.js 18+ ve npm kurulu olduğundan emin olun

## ⚙️ Yapılandırma

Aşağıdaki değişkenlerle bir `.env.local` dosyası oluşturun:

```env
# Database (MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre_secret_nextauth

# Admin credentials
ADMIN_EMAIL=votre_email_admin
ADMIN_PASSWORD=votre_mot_de_passe_admin

# GitHub OAuth
GITHUB_ID=votre_github_id
GITHUB_SECRET=votre_github_secret

# Configuration de l'API Resend
RESEND_API_KEY=votre_cle_api_resend
RESEND_EMAIL=votre_email_resend
```

## 📁 Proje Yapısı

```
portfolio-admin/
├── src/
│   ├── components/      # Yeniden Kullanılabilir Bileşenler
│   │   ├── ProjectCard.tsx        # Modal ile proje kartı
│   │   ├── EnhancedProjectCard.tsx # Modal ile geliştirilmiş versiyon
│   │   ├── modals/
│   │   │   └── CVModal.tsx        # CV görüntüleme modalı
│   │   └── ...                    # Diğer bileşenler
│   ├── pages/          # Sayfalar ve API rotaları
│   ├── styles/         # Global stiller
│   ├── lib/           # Araçlar ve yapılandırmalar
│   └── models/        # MongoDB Modelleri
├── public/            # Statik Varlıklar
└── ...
```

## 🌐 API Rotaları

### GET /api/homepage

- Ana sayfa verilerini alır

### POST /api/homepage

- Ana sayfa verilerini günceller

### GET /api/projects

- Tüm projeleri listeler

### POST /api/projects

- Yeni bir proje oluşturur

### PUT /api/projects/[id]

- Mevcut bir projeyi günceller

### DELETE /api/projects/[id]

- Bir projeyi siler

## 🚧 Mevcut Proje Durumu

### ✅ Tamamlanan Özellikler

- GitHub ile güvenli kimlik doğrulama
- Ana sayfa için zengin metin editörü
  - Metin biçimlendirme (kalın, italik, altı çizili)
  - Renk değişikliği
  - Metin hizalama
- Ana sayfa içerik yönetimi
  - Başlık ve alt başlık düzenleme
  - "Hakkında" bölümü düzenleme
  - Sosyal bağlantı yönetimi
- Temel resim yükleme
- MongoDB veritabanı yapısı
- **Gelişmiş Proje Görüntüleme**
  - Tam proje detayları için etkileşimli modallar
  - Stilize edilmiş "Daha fazla oku" butonları (mavi ve altı çizili)
  - Modallarda büyük format resim görüntüleme
  - Teknolojiler ve bağlantılarla tam açıklama
  - Arka plan etkileşimini engelleme
  - Dış tıklama veya kapatma butonu ile kapatma
  - Akıcı animasyonlar ve duyarlı tasarım
  - Karanlık mod desteği
  - Modaller açıldığında sayfa kaydırma engelleme

### 🔄 Geliştirme Aşamasında

- Tam yönetici arayüzü
  - İstatistikli ana kontrol paneli
  - Bölümler arası sezgisel navigasyon
  - Karanlık/açık tema
- Gelişmiş proje yönetimi
  - Yeniden düzenleme için sürükle & bırak arayüzü
  - Proje kategorizasyonu
  - Etiketler ve filtreler
- Geliştirilmiş medya sistemi
  - Resim galerisi
  - Kırpma ve yeniden boyutlandırma
  - Otomatik optimizasyon
- Değişikliklerin gerçek zamanlı önizlemesi

### 📝 Planlanan Özellikler

- Analitik ve istatistikler
  - Ziyaret takibi
  - Sayfa başına geçirilen zaman
- Yedekleme ve versiyon sistemi
- Veri dışa/içe aktarma
- Bakım modu
- Gelişmiş SEO optimizasyonu
- Otomatik testler
- Tam API dokümantasyonu

## ⚠️ Önemli Not

Bu proje şu anda aktif geliştirme aşamasındadır. Bazı özellikler kararsız veya eksik olabilir. Katkılar ve geri bildirimler memnuniyetle karşılanır!

## 🔧 Sorun Giderme

### Yaygın Sorunlar

1. **MongoDB Bağlantı Hatası**

```bash
# MongoDB URI'nizin doğru olduğunu kontrol edin
# IP'nizin MongoDB Atlas'ta yetkilendirildiğinden emin olun
```

2. **Kimlik Doğrulama Hatası**

```bash
# GitHub ortam değişkenlerinizi kontrol edin
# OAuth geri aramalarının doğru yapılandırıldığından emin olun
```

## 🤝 Katkıda Bulunma

Katkılar memnuniyetle karşılanır! İşte nasıl katkıda bulunabileceğiniz:

### 🐛 Hata Bildirin

1. Hatanın [Issues](https://github.com/mehmetsalihkuscu/portfolio-admin/issues) bölümünde zaten bildirilmediğini kontrol edin
2. "Bug Report" şablonu ile yeni bir sorun oluşturun
3. Sorunu yeniden oluşturma adımları ile detaylıca açıklayın

### ✨ Özellik Önerin

1. "Feature Request" şablonu ile bir sorun oluşturun
2. İstenen özelliği ve faydasını açıklayın
3. Geliştirmeye başlamadan önce onay bekleyin

### 🔧 Koda Katkıda Bulunun

1. Projeyi **Forklayın**
2. Özelliğiniz için bir dal oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi **Commit**leyin (`git commit -m 'Add some AmazingFeature'`)
4. Dalınıza **Push**layın (`git push origin feature/AmazingFeature`)
5. Bir **Pull Request** açın

### 📝 Katkı Yönergeleri

- Mevcut kod kurallarına uyun
- Yeni özellikler için testler ekleyin
- Gerekirse dokümantasyonu güncelleyin
- Açık ve açıklayıcı commit mesajları kullanın

### 🏆 Katkıda Bulunanlar

Bu projeye katkıda bulunan herkese teşekkürler!

<a href="https://github.com/mehmetsalihkuscu/portfolio-admin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mehmetsalihkuscu/portfolio-admin" />
</a>

## 📄 Lisans

Bu proje MIT Lisansı altındadır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

```
MIT License

Copyright (c) 2024 Mehmet Salih Kuscu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  <p><strong><a href="https://github.com/mehmetsalihkuscu">Mehmet Salih Kuscu</a> tarafından ❤️ ile geliştirildi</strong></p>
  <p><em>Verimli kodsuz portföy yönetimi için</em></p>
  
  [![GitHub](https://img.shields.io/badge/GitHub-mehmetsalihkuscu-black?logo=github)](https://github.com/mehmetsalihkuscu)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Mehmet%20Salih%20Kuscu-blue?logo=linkedin)](https://linkedin.com/in/mehmetsalihkuscu)
  [![Email](https://img.shields.io/badge/Email-contact@mehmetsalihk.fr-red?logo=gmail)](mailto:contact@mehmetsalihk.fr)
</div>
