# 🎨 Portfolio Admin Dashboard

<div align="center">

**🌍 Langues / Languages / Diller**

[![Français](https://img.shields.io/badge/Langue-Français-blue?style=for-the-badge&logo=flag-icon&logoColor=white)](README.md)
[![English](https://img.shields.io/badge/Language-English-red?style=for-the-badge&logo=flag-icon&logoColor=white)](README_EN.md)
[![Türkçe](https://img.shields.io/badge/Dil-Türkçe-white?style=for-the-badge&logo=flag-icon&logoColor=red)](README_TR.md)

---

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

  <br />
  
  <h3>🚀 Profesyonel portföyünüzü yönetmek için modern, kodsuz bir çözüm</h3>
  
  <p>Kaynak kodunu manuel olarak düzenlemeye son! Her şeyi şık bir arayüzden yönetin.</p>

[Demoyu Görüntüle](https://your-demo.vercel.app) • [Dokümantasyon](#-kurulum) • [Hata Bildir](https://github.com/mehmetsalihkuscu/portfolio-admin/issues)

</div>

<br />

## 📋 İçindekiler

- [🎯 Hakkında](#-hakkında)
- [✨ Detaylı Özellikler](#-detaylı-özellikler)
- [🛡️ Güvenlik ve Mimari](#%EF%B8%8F-güvenlik-ve-mimari)
- [💻 Yönetici Arayüzü Rehberi](#-yönetici-arayüzü-rehberi)
- [🛠 Teknoloji Yığını](#-teknoloji-yığını)
- [📁 Proje Yapısı](#-proje-yapısı)
- [🌐 API Rotaları](#-api-rotaları)
- [📥 Tam Kurulum](#-tam-kurulum)
- [⚙️ Yapılandırma](#%EF%B8%8F-yapılandırma)
- [🔧 Sorun Giderme (SSS)](#-sorun-giderme-sss)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)
- [📄 Lisans](#-lisans)

---

## 🎯 Hakkında

**Portfolio Admin**, basit bir ihtiyaçtan doğdu: Geliştiricilerin, portföy içeriklerini sürdürmekle vakit kaybetmeden sevdikleri işe (kodlama) odaklanmalarını sağlamak.

> "Portföyünüz, yetenekleriniz kadar hızlı gelişmeli."

### Neden Portfolio Admin kullanmalısınız?

- **⚡ Zaman Tasarrufu**: 30 saniyede bir metni düzenleyin veya proje ekleyin.
- **🎨 Premium Tasarım**: Varsayılan olarak özenli, duyarlı ve animasyonlu bir arayüz.
- **🔐 Maksimum Güvenlik**: Verileriniz endüstri standartlarıyla korunur.
- **📱 %100 Duyarlı**: Sitenizi cep telefonunuzdan yönetin.

---

## ✨ Detaylı Özellikler

### 🎨 İçerik Yönetimi (CMS)

- **Zengin Editör (WYSIWYG)**: HTML yazmadan biçimlendirme (kalın, italik, listeler, renkler).
- **Canlı Önizleme**: Yayınlamadan önce değişikliklerinizi görün.
- **Otomatik SEO**: Dinamik olarak oluşturulan Meta veriler ve OpenGraph.

### 🔐 Kimlik Doğrulama ve Güvenlik

- **NextAuth.js**: Token rotasyonu ile sağlam oturum sistemi.
- **İki Faktörlü Kimlik Doğrulama (2FA)**: E-posta yoluyla gönderilen geçici kodlar (Resend aracılığıyla).
- **Roller**: Yönetici (tam erişim) ve Ziyaretçi (salt okunur) arasında net ayrım.

### 📊 Projeler ve Beceriler

- **Tam CRUD**: Projelerinizi ekleyin, düzenleyin, silin.
- **Kategorilendirme**: Projelerinizi etiketlere veya teknolojilere göre sıralayın.
- **Etkileşimli Modallar**: Resim galerisi ve bağlantılarla detaylı sunum.
- **Sürükle ve Bırak**: Görüntüleme sırasını yeniden düzenleyin (Yakında).

### 📄 CV Yönetimi

- **PDF Yükleme**: CV'nizin basit güncellenmesi.
- **Görüntüleme Modalı**: İşverenler siteden ayrılmadan CV'nizi okuyabilir.
- **Hızlı Eylemler**: Entegre "İndir" veya "Aç" butonları.

---

## 🛡️ Güvenlik ve Mimari

**"Varsayılan Olarak Güvenli"** politikasını uyguluyoruz.

| Özellik                | Açıklama                                                                                       |
| :--------------------- | :--------------------------------------------------------------------------------------------- |
| **🛡️ Rate Limiting**   | DDoS ve Kaba Kuvvet saldırılarına karşı koruma (girişte `10 istek/dk`, API'de `100 istek/dk`). |
| **🔒 Zod Doğrulama**   | Tüm girdiler için katı şemalar (API ve Formlar).                                               |
| **🧹 Sanitization**    | XSS'i önlemek için `DOMPurify` ile HTML temizliği.                                             |
| **⛓️ HTTP Başlıkları** | Güçlendirilmiş yapılandırma (HSTS, CSP, X-Frame-Options, No-Sniff).                            |
| **🕵️ Anti-Snooping**   | Prodüksiyonda konsol, `localStorage` ve geliştirici araçları erişiminin engellenmesi.          |

---

## 💻 Yönetici Arayüzü Rehberi

Verimlilik için tasarlanmış bir arayüz.

### 🏠 Ana Kontrol Paneli

Aktivitenize genel bakış, önemli bölümlere hızlı bağlantılar ve ziyaret istatistikleri (Vercel Analytics ile).

### 📝 Proje Düzenleme

Başarılarınızı tanımlamak için sezgisel formlar:

- **Temel Bilgiler**: Başlık, alt başlık, tarihler.
- **Zengin İçerik**: Görevin detaylı açıklaması.
- **Teknoloji Yığını**: Otomatik ikon önerisi.
- **Medya**: Otomatik yeniden boyutlandırma ile resim galerisi.

### 📍 Konum

- **Otomatik Tamamlama**: Kolay adres girişi (Geo API).
- **Doğrulama**: Otomatik biçimlendirme.

---

## 🛠 Teknoloji Yığını

Modern, performanslı ve sürdürülebilir bir mimari.

### 🎨 Frontend

| Teknoloji         | Rozet                                                                                                         | Açıklama                            |
| :---------------- | :------------------------------------------------------------------------------------------------------------ | :---------------------------------- |
| **Next.js 14**    | ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)                         | App Router & Server Components      |
| **TypeScript**    | ![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white) | Sağlamlık için katı tipleme         |
| **Tailwind CSS**  | ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Utility-first ve hızlı stillendirme |
| **Framer Motion** | ![Framer](https://img.shields.io/badge/Framer-0055FF?style=flat-square&logo=framer&logoColor=white)           | Akıcı animasyonlar                  |
| **TipTap**        | ![TipTap](https://img.shields.io/badge/TipTap-black?style=flat-square)                                        | Zengin metin editörü                |

### ⚙️ Backend

| Teknoloji    | Rozet                                                                                                     | Açıklama               |
| :----------- | :-------------------------------------------------------------------------------------------------------- | :--------------------- |
| **Node.js**  | ![Node](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)     | JavaScript Runtime     |
| **MongoDB**  | ![Mongo](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)      | Esnek NoSQL Veritabanı |
| **Mongoose** | ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white) | MongoDB için ODM       |

### 🔒 Güvenlik ve Araçlar

| Teknoloji    | Rozet                                                                                                  | Kullanım            |
| :----------- | :----------------------------------------------------------------------------------------------------- | :------------------ |
| **NextAuth** | ![Auth](https://img.shields.io/badge/NextAuth-purple?style=flat-square&logo=nextdotjs&logoColor=white) | Oturum Yönetimi     |
| **Zod**      | ![Zod](https://img.shields.io/badge/Zod-3068B7?style=flat-square&logo=zod&logoColor=white)             | Veri Doğrulama      |
| **Resend**   | ![Resend](https://img.shields.io/badge/Resend-black?style=flat-square&logo=resend&logoColor=white)     | İşlemsel E-postalar |

---

## 📁 Proje Yapısı

```bash
portfolio-admin/
├── src/
│   ├── components/      # 🧱 Yeniden Kullanılabilir Bileşenler
│   │   ├── admin/       # UI Yönetimi
│   │   ├── modals/      # CV, Projeler...
│   │   └── ui/          # Butonlar, Girdiler, Kartlar...
│   ├── pages/
│   │   ├── api/         # ⚡ API Uç Noktaları (Backend)
│   │   ├── admin/       # 🔐 Yönetici Sayfaları
│   │   └── index.tsx    # 🏠 Halka Açık Ana Sayfa
│   ├── styles/          # 🎨 Global CSS & Tailwind
│   ├── lib/             # 🛠 Araçlar (DB, Auth...)
│   └── models/          # 💾 Mongoose Şemaları
├── public/              # 🖼 Resimler, Faviconlar...
└── ...
```

---

## 🌐 API Rotaları

Mevcut uç noktaların kısa dokümantasyonu.

| Yöntem   | Uç Nokta             | Açıklama              | Erişim       |
| :------- | :------------------- | :-------------------- | :----------- |
| `GET`    | `/api/projects`      | Tüm projeleri listele | Herkes       |
| `POST`   | `/api/projects`      | Proje oluştur         | **Yönetici** |
| `PUT`    | `/api/projects/[id]` | Projeyi güncelle      | **Yönetici** |
| `DELETE` | `/api/projects/[id]` | Projeyi sil           | **Yönetici** |
| `GET`    | `/api/homepage`      | Ana sayfa verileri    | Herkes       |
| `POST`   | `/api/auth/send-2fa` | Giriş kodu gönder     | Herkes       |

---

## 📥 Tam Kurulum

### Ön Gereksinimler

- Node.js 18+
- MongoDB Atlas Hesabı (Ücretsiz)
- GitHub Hesabı (OAuth için)

### 1️⃣ Projeyi klonlayın

```bash
git clone https://github.com/mehmetsalihkuscu/portfolio-admin.git
cd portfolio-admin
```

### 2️⃣ Bağımlılıkları yükleyin

```bash
npm install
```

### 3️⃣ Ortam Değişkenleri

`.env.local` dosyasını oluşturun ve yapılandırın:

```env
# 📦 Veritabanı
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/portfolio

# 🔐 Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=rastgele_bir_dize_olusturun
# GitHub OAuth
GITHUB_ID=istemci_id_niz
GITHUB_SECRET=istemci_gizli_anahtariniz

# 📧 E-postalar (2FA)
RESEND_API_KEY=re_123...
RESEND_EMAIL=onboarding@resend.dev

# 👤 Yönetici
ADMIN_EMAIL=epostaniz@email.com
ADMIN_PASSWORD=sifreniz
```

### 4️⃣ Yerel olarak çalıştırın

```bash
npm run dev
```

---

## 🔧 Sorun Giderme (SSS)

<details>
<summary><strong>🔴 MongoDB Bağlantı Hatası?</strong></summary>
<br>
Şunları kontrol edin:
1. IP'niz MongoDB Atlas'ta (Network Access) yetkilendirilmiş mi?
2. `.env.local` içindeki URI doğru mu ve gerekirse tırnak içinde mi?
3. Kullanıcı adı/şifre kaçış karakteri gerektirmeyen özel karakterler içeriyor mu?
</details>

<details>
<summary><strong>🔑 GitHub Kimlik Doğrulama Hatası?</strong></summary>
<br>
Şunları kontrol edin:
1. GitHub Apps'teki geri çağırma (callback) URL'si `http://localhost:3000/api/auth/callback/github` mu?
2. İstemci Kimliği (Client ID) ve Gizli Anahtar (Secret) doğru mu?
</details>

<details>
<summary><strong>✉️ 2FA E-postaları gelmiyor mu?</strong></summary>
<br>
1. Resend'in bir hata döndürüp döndürmediğini görmek için sunucu günlüklerinizi kontrol edin.
2. Prodüksiyondaysanız gönderen etki alanını doğruladığınızdan emin olun.
3. Test modunda, yalnızca Resend hesap e-postanıza gönderim yapabilirsiniz.
</details>

---

## 🤝 Katkıda Bulunma

Katkılarınız memnuniyetle karşılanır!

1.  Projeyi **Forklayın**
2.  Dalınızı oluşturun (`git checkout -b feature/SuperFeature`)
3.  Değişikliklerinizi commitleyin (`git commit -m '✨ Add SuperFeature'`)
4.  Pushlayın (`git push origin feature/SuperFeature`)
5.  Bir **Pull Request** açın

---

## 📄 Lisans

**MIT** lisansı altında dağıtılmaktadır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

---

<div align="center">
  
  **[Mehmet Salih Kuscu](https://github.com/mehmetsalihkuscu) tarafından ❤️ ile yapılmıştır**
  
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mehmetsalihkuscu)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/mehmetsalihkuscu)
  [![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:contact@mehmetsalihk.fr)

</div>
