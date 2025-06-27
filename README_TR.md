# Portfolio Admin

<div align="center">

  🌍 Diller:
  [🇫🇷 Français](README.md) | [🇬🇧 English](README_EN.md)

</div>

<div align="center">
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC.svg)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)
</div>

## 📋 İçindekiler

- [Hakkında](#-hakkında)
- [Özellikler](#-özellikler)
- [Yönetici Arayüzü](#-yönetici-arayüzü)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Yapılandırma](#-yapılandırma)
- [Proje Yapısı](#-proje-yapısı)
- [API Rotaları](#-api-rotaları)
- [Proje Durumu](#-proje-durumu)
- [Planlanan İyileştirmeler](#-planlanan-iyileştirmeler)
- [Sorun Giderme](#-sorun-giderme)

## 🎯 Hakkında

Portfolio Admin, çevrimiçi portföyünüzü yönetmek için bir "kod yazmadan" çözümüdür. Sitenizi güncellemek için artık kaynak kodunu değiştirmenize gerek yok! Sezgisel bir yönetici arayüzü sayesinde, portföyünüzün tüm içeriğini sadece birkaç tıklamayla değiştirebilirsiniz.

## ✨ Özellikler

- 🎨 **Kod Yazmadan Yönetim**
  - Koda dokunmadan içerik değişikliği
  - Sezgisel kullanıcı arayüzü
  - Gerçek zamanlı güncellemeler
  - Değişikliklerin önizlemesi

- 🔐 **Güvenli Kimlik Doğrulama**
  - Oturum yönetimi için NextAuth.js
  - Yönetici rota koruması
  - GitHub kimlik doğrulaması

- 📊 **Proje Yönetimi**
  - Kod yazmadan proje ekleme/düzenleme/silme
  - Önizlemeli resim yükleme
  - Sürükle ve bırak organizasyonu (yakında)
  - Kategori yönetimi
  - **Etkileşimli modal görüntüleme**
    - Tam detayları görüntülemek için modaller
    - Arka plan etkileşimini engelleme
    - Sezgisel kapatma (dış tıklama veya X butonu)
    - Akıcı animasyonlar ve duyarlı tasarım

- 📝 **İçerik Yönetimi**
  - Sezgisel zengin metin editörü
  - Gelişmiş biçimlendirme (kalın, italik, renkler...)
  - Ana sayfa bölümü düzenleme
  - Sosyal bağlantı özelleştirmesi

- 📄 **CV Görüntüleme**
  - **Etkileşimli CV modalı**: CV'yi doğrudan ana sayfada görüntüleme
  - **Entegre önizleme**: Sayfadan ayrılmadan iframe'de PDF görüntüleme
  - **Hızlı eylemler**: İndirme veya yeni sekmede açma butonları
  - **Duyarlı tasarım**: Tüm ekranlara uyarlanmış arayüz
  - **Optimize edilmiş kullanıcı deneyimi**: Akıcı animasyonlar ve sezgisel kapatma

## 💻 Yönetici Arayüzü

Yönetici arayüzü şunları yapmanıza olanak tanır:

### 1. Ana Sayfa
- Ana başlığı düzenleme
- Alt başlığı özelleştirme
- "Hakkında" bölümünü düzenleme
- Sosyal bağlantılarınızı yönetme (GitHub, LinkedIn, Twitter)

### 2. Projeler
- Yeni projeler ekleme
- Mevcut projeleri düzenleme
- Projeleri silme
- Görüntüleme sırasını yeniden düzenleme

### 3. Metin Biçimlendirme
Zengin metin editörümüz şunları yapmanıza olanak tanır:
- Kalın, italik, altı çizili
- Metin rengini değiştirme
- Madde işaretli listeler oluşturma
- Metni hizalama (sol, orta, sağ)
- Başlık ve alt başlık ekleme

### 4. Medya Yönetimi
- Projeler için resim yükleme
- Otomatik yeniden boyutlandırma
- Resim optimizasyonu
- Galeri yönetimi

### 5. CV Görüntüleme
- **Etkileşimli modal**: CV zarif bir modalda görüntülenir
- **Doğrudan görselleştirme**: Ana sayfadan ayrılmadan PDF önizlemesi
- **Kullanıcı eylemleri**: İndirme ve yeni sekmede açma
- **Modern arayüz**: Site temasıyla tutarlı tasarım
- **Erişilebilirlik**: Klavye navigasyonu ve sezgisel kapatma

### 6. Coğrafi Konum Yönetimi
- **Akıllı otomatik tamamlama**: Gerçek zamanlı Fransız adres önerileri
- **Sezgisel arayüz**: Bağlamsal önerilerle kolay giriş
- **Otomatik doğrulama**: Standartlaştırılmış adres formatı
- **Dinamik görüntüleme**: Sitede anında güncellenen konum
- **Coğrafi konum**: Fransız posta kodları ve şehir desteği

### 7. Analitik ve İzleme
- **Vercel Analytics**: Otomatik ziyaretçi ve sayfa görüntüleme takibi
- **Gerçek zamanlı veri**: Anlık trafik istatistikleri
- **Gizlilik saygısı**: Üçüncü taraf çerez olmadan analitik
- **Optimize edilmiş performans**: Site performansına minimal etki
- **Şeffaf entegrasyon**: Müdahale olmadan otomatik yapılandırma

Tüm bu değişiklikler doğrudan yönetici arayüzünden yapılır, koda dokunmanıza gerek yoktur!

## 🛠 Teknolojiler

Proje aşağıdaki teknolojileri kullanır:

- **Frontend**
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - TipTap Editor

- **Backend**
  - MongoDB
  - NextAuth.js
  - Next.js API Routes

- **Analitik**
  - Vercel Analytics

- **Araçlar**
  - ESLint
  - Prettier
  - Git

## 📥 Kurulum

1. Depoyu klonlayın
```bash
git clone https://github.com/kullanici-adiniz/portfolio-admin.git
cd portfolio-admin
```

2. Bağımlılıkları yükleyin
```bash
npm install
# veya
yarn install
```

3. Ortam değişkenlerini yapılandırın
```bash
cp .env.example .env.local
```

4. Geliştirme sunucusunu başlatın
```bash
npm run dev
# veya
yarn dev
```

## ⚙️ Yapılandırma

Aşağıdaki değişkenlerle bir `.env.local` dosyası oluşturun:

```env
# Veritabanı (MongoDB)
MONGODB_URI=mongodb+srv://kullaniciadi:sifre@cluster.mongodb.net/

# Kimlik Doğrulama (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=nextauth_gizli_anahtariniz

# Yönetici kimlik bilgileri
ADMIN_EMAIL=yonetici_emailiniz
ADMIN_PASSWORD=yonetici_sifreniz

# GitHub OAuth
GITHUB_ID=github_id_niz
GITHUB_SECRET=github_gizli_anahtariniz

# Resend API Yapılandırması
RESEND_API_KEY=resend_api_anahtariniz
RESEND_EMAIL=resend_emailiniz
```

## 📁 Proje Yapısı

```
portfolio-admin/
├── src/
│   ├── components/      # Yeniden kullanılabilir bileşenler
│   │   ├── ProjectCard.tsx        # Modal ile proje kartı
│   │   ├── EnhancedProjectCard.tsx # Modal ile geliştirilmiş versiyon
│   │   ├── modals/
│   │   │   └── CVModal.tsx        # CV görüntüleme modalı
│   │   └── ...                    # Diğer bileşenler
│   ├── pages/          # Sayfalar ve API rotaları
│   ├── styles/         # Global stiller
│   ├── lib/           # Yardımcı programlar ve yapılandırmalar
│   └── models/        # MongoDB modelleri
├── public/            # Statik varlıklar
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
- **Gelişmiş proje görüntüleme**
  - Tam proje detayları için etkileşimli modaller
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
  - Yeniden düzenleme için sürükle ve bırak arayüzü
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

1. **MongoDB bağlantı hatası**
```bash
# MongoDB URI'nizin doğru olduğunu kontrol edin
# IP'nizin MongoDB Atlas'ta yetkilendirildiğinden emin olun
```

2. **Kimlik doğrulama hatası**
```bash
# GitHub ortam değişkenlerinizi kontrol edin
```