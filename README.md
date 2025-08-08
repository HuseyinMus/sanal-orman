# 🌲 Sanal Orman - Türkiye

Türkiye'nin dijital ormanını birlikte büyüttüğümüz interaktif web uygulaması. Kullanıcılar şehir seçerek sanal ağaçlar dikebilir ve gerçek zamanlı olarak ormanın büyümesini izleyebilir.

## 🚀 Özellikler

### 🔐 Kullanıcı Yönetimi
- **Kayıt ve Giriş**: Firebase Authentication ile güvenli kullanıcı yönetimi
- **Profil Yönetimi**: Kullanıcı bilgileri ve ağaç geçmişi
- **Oturum Yönetimi**: Güvenli çıkış ve oturum takibi

### 🗺️ Şehir Sistemi
- **Türkiye Haritası**: 10 büyük şehir seçeneği
- **Şehir İstatistikleri**: Her şehir için ağaç ve kullanıcı sayıları
- **Dinamik Veri**: Gerçek zamanlı şehir istatistikleri

### 🌳 Orman Sistemi
- **Ağaç Dikme**: 5 farklı ağaç türü seçeneği
- **Kişiselleştirme**: Ağaç isimlendirme ve mesaj bırakma
- **Gerçek Zamanlı**: Firebase Firestore ile anlık güncelleme
- **İnteraktif**: Mouse ile gezinme, zoom ve pan özellikleri

### 🎨 Modern Arayüz
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Animasyonlar**: GSAP ile akıcı geçişler
- **Modern UI**: Inter font ve modern renk paleti
- **Loading Ekranları**: Kullanıcı deneyimi odaklı

## 🛠️ Teknolojiler

### Frontend
- **HTML5**: Semantik yapı
- **CSS3**: Modern stiller ve animasyonlar
- **JavaScript ES6+**: Modern JavaScript özellikleri
- **GSAP**: Animasyon kütüphanesi

### Backend & Veritabanı
- **Firebase Authentication**: Kullanıcı yönetimi
- **Firebase Firestore**: Gerçek zamanlı veritabanı
- **Firebase Hosting**: Web hosting

### Geliştirme Araçları
- **Vite**: Hızlı geliştirme sunucusu
- **ES6 Modules**: Modüler kod yapısı

## 📦 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/kullanici/sanal-orman.git
cd sanal-orman
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Firebase konfigürasyonu**
   - Firebase Console'da yeni proje oluşturun
   - Authentication'ı etkinleştirin (Email/Password)
   - Firestore Database'i oluşturun
   - `src/firebase/config.js` dosyasındaki konfigürasyonu güncelleyin

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

5. **Tarayıcıda açın**
```
http://localhost:3000
```

## 🔧 Firebase Kurulumu

### 1. Firebase Projesi Oluşturma
1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. "Yeni Proje Oluştur" butonuna tıklayın
3. Proje adını "sanal-orman" olarak belirleyin
4. Google Analytics'i etkinleştirin (opsiyonel)

### 2. Authentication Kurulumu
1. Sol menüden "Authentication" seçin
2. "Başlayın" butonuna tıklayın
3. "Sign-in method" sekmesine gidin
4. "Email/Password" sağlayıcısını etkinleştirin

### 3. Firestore Database Kurulumu
1. Sol menüden "Firestore Database" seçin
2. "Veritabanı oluştur" butonuna tıklayın
3. "Test modunda başlat" seçeneğini seçin
4. Bölge olarak "europe-west1" seçin

### 4. Web Uygulaması Ekleme
1. Proje genel bakış sayfasında "</>" simgesine tıklayın
2. Uygulama takma adını "sanal-orman-web" olarak belirleyin
3. "Firebase'i kaydet" butonuna tıklayın
4. Konfigürasyon bilgilerini kopyalayın

### 5. Konfigürasyon Güncelleme
`src/firebase/config.js` dosyasındaki `firebaseConfig` nesnesini güncelleyin:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 📁 Proje Yapısı

```
sanal-orman/
├── index.html              # Ana HTML dosyası
├── package.json            # Proje bağımlılıkları
├── vite.config.js          # Vite konfigürasyonu
├── README.md              # Proje dokümantasyonu
└── src/
    ├── main.js            # Ana JavaScript dosyası
    ├── firebase/
    │   └── config.js      # Firebase konfigürasyonu
    └── styles/
        └── main.css       # Ana CSS dosyası
```

## 🎮 Kullanım

### Kullanıcı Kaydı ve Giriş
1. Uygulamayı açın
2. "Kayıt Ol" sekmesine tıklayın
3. Ad, e-posta ve şifre bilgilerinizi girin
4. "Kayıt Ol" butonuna tıklayın

### Şehir Seçimi
1. Giriş yaptıktan sonra şehir seçim ekranı görünür
2. İstediğiniz şehri seçin
3. Şehir ormanına yönlendirileceksiniz

### Ağaç Dikme
1. "Ağaç Dik" butonuna tıklayın
2. Ağaç ismi, mesaj ve türünü belirleyin
3. "Ağaç Dik" butonuna tıklayın
4. Ağacınız ormana eklenir

### Orman Gezinme
- **Mouse ile sürükleme**: Ormanı hareket ettirin
- **Mouse tekerleği**: Zoom in/out
- **Kontrol butonları**: Zoom ve reset işlemleri
- **Ağaç tıklama**: Ağaç bilgilerini görüntüleme

## 🔒 Güvenlik

- Firebase Authentication ile güvenli kullanıcı yönetimi
- Firestore güvenlik kuralları ile veri koruması
- HTTPS zorunluluğu
- Input validation ve sanitization

## 🚀 Deployment

### Firebase Hosting ile Deployment

1. **Firebase CLI kurulumu**
```bash
npm install -g firebase-tools
```

2. **Firebase'e giriş**
```bash
firebase login
```

3. **Proje başlatma**
```bash
firebase init hosting
```

4. **Build oluşturma**
```bash
npm run build
```

5. **Deploy etme**
```bash
firebase deploy
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 İletişim

- **Proje Sahibi**: [Adınız]
- **E-posta**: [email@example.com]
- **GitHub**: [github.com/kullanici]

## 🙏 Teşekkürler

- Firebase ekibine harika platform için
- GSAP ekibine animasyon kütüphanesi için
- Açık kaynak topluluğuna katkıları için

---

**🌱 Geleceğimiz için ağaç dikelim!** 🌱 