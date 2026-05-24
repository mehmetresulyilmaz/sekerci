# 🍬 Şeker Diyarı - Klasik Eşleştirme Oyunu

Şeker Diyarı, modern web teknolojileriyle sıfırdan inşa edilmiş, akıcı oynanış mekaniklerine, özgün seviye tasarımlarına ve zengin oyuncu ödüllendirme sistemlerine sahip büyüleyici bir **Candy Crush tarzı** üçlü eşleştirme (Match-3) oyunudur.

Mobil uyumlu arayüzü, göz alıcı animasyonları ve sürükleyici ses efektleri sayesinde tarayıcı üzerinden zahmetsizce oynanabilir.

---

## ✨ Özellikler

### 📊 10 Özgün Seviye ve Artan Zorluk Eğrisi
Her seviye, oyuncuları eşsiz yapboz mekanikleriyle buluşturur:
- **Geniş Hedef Çeşitliliği**: Puan barajları, sınırlandırılmış hamle sayıları ve taktiksel düşünme gerektiren yapılar.
- **Çikolata Blokları (Engelleyiciler)**: Yanındaki dinamik şekerleri eşleştirdiğinizde kırılan, şekerlerin aşağı kaymasını engelleyen sert çikolatalar.
- **Buzlu Şeker Kafesi**: Üzerindeki buz katmanını eritmek için o şekerle eşleştirme yapmanızı gerektiren özel dondurulmuş şeker hücresi.

### 🎁 Günlük Giriş Ödülleri (Daily Rewards)
- Oyuna her gün giriş yaptığınızda yenilenen ve artan ödüller (Satır Çektiren Güçlendiriciler, Renk Bombaları ve Skor Katlayıcılar).
- Tamamen kullanıcı dostu animasyonlu modal gösterimi ve yerel durum takibi.

### 🎯 3 Farklı Dinamik Günlük Görev (Daily Quests)
Oynadıkça ek güçlendirici kazanmanızı sağlayan günlük hedefler:
1. **Skor Şampiyonu**: Tek bir el oyun içinde en az 5.000 puan limiti elde etme.
2. **Hamle Tasarrufu**: Sınırlı hamlelerden en az 8 tanesini harcamadan seviyeyi bitirme.
3. **Eşleştirme Ustası**: Patlatılan toplam şeker sayısının kümülatif takibi.

### 💥 Özel Şekerler ve Harika Kombolar
- **Çizgili / Satır Şekeri**: 4'lü eşleşmeler sonucunda tüm sırayı veya sütunu patlatır.
- **Renk Bombası (Color Bomb)**: 5'li devasa eşleşmeler sonucu eşleştiği rengin tüm şekerlerini panodan temizler.
- **Aktif Booster Çekiçleri**: Sıkıştığınız durumlarda dilediğiniz şekeri veya engeli kırmak için kullanabileceğiniz yardımcı aletler.

### 💾 Gelişmiş Tarayıcı Uyumluluğu ve Veri Depolama
- Skorlar ve kazanılan güçlendiriciler **Çerezler (Cookies)** yardımıyla tarayıcıda kalıcı olarak saklanır. Sayfayı yenileseniz dahi ilerlemeniz kaybolmaz.
- Sosyal paylaşım modülü ile rekorlarınızı anında arkadaşlarınıza WhatsApp, Facebook, Twitter veya Telegram üzerinden gönderebilirsiniz.

---

## 🛠️ Kullanılan Teknolojiler

- **Arayüz Framework'ü**: [React 18+](https://react.dev/)
- **Derleyici & Geliştirme Ortamı**: [Vite](https://vitejs.dev/) - Son derece hızlı derleme hızı.
- **Programlama Dili**: [TypeScript](https://www.typescriptlang.org/) - Güçlü tip denetimi ile güvenli kod mimarisi.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Modern, esnek ve tamamen duyarlı (Responsive) tasarım sınıfları.
- **Animasyon Kütüphanesi**: [Motion / Framer Motion](https://motion.dev/) - Akıcı kart geçişleri, patlama efektleri ve yumuşak modal animasyonları.
- **İkon Seti**: [Lucide React](https://lucide.dev/) - Minimalist ve amaca uygun vektörel simgeler.

---

## 🚀 Kurulum ve Yerel Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla uygulayabilirsiniz:

### Pratik Gereksinimler
- Bilgisayarınızda [Node.js](https://nodejs.org/) (Sürüm 16 veya üzeri sürüm) kurulu olmalıdır.

### Adım Adım Çalıştırma
1. **Depoyu Bilgisayarınıza İndirin / Klonlayın**:
   ```bash
   git clone <github-depo-linkiniz>
   cd <proje-klasor-adi>
   ```

2. **Bağımlılıkları Yükleyin**:
   ```bash
   npm install
   ```

3. **Geliştirme Sunucusunu Başlatın**:
   ```bash
   npm run dev
   ```
   *Yukarıdaki komuttan sonra tarayıcınızda `http://localhost:3000` (veya terminalde belirtilen adresi) açarak oyunu hemen test etmeye başlayabilirsiniz.*

4. **Üretim Sürümü İçin Derleme (Build)**:
   ```bash
   npm run build
   ```
   *Bu komut, projenizi en optimize şekilde sıkıştırarak yayına hazır statik dosyaları `dist/` klasörü altına oluşturur.*

---

## 🌐 GitHub Pages ile Ücretsiz Yayına Alma / Dağıtım (Deploy)

Oyunu GitHub'da tamamen ücretsiz bir şekilde canlıya taşımak için aşağıdaki basit rehberi uygulayabilirsiniz:

### 1. `gh-pages` Paketi Yardımıyla Kolay Dağıtım
Projenize `gh-pages` kütüphanesini ekleyip otomatik dağıtım yapabilirsiniz:

```bash
npm install gh-pages --save-dev
```

### 2. `package.json` Dosyasını Düzenleyin
`package.json` dosyanızın en üst seviyesine kendi GitHub sayfa adresinizi ekleyin:
```json
"homepage": "https://<kullanici-adiniz>.github.io/<depo-adi>/",
```

Ardından `"scripts"` kısmına şu iki komutu ilave edin:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### 3. Tek Komutla Canlıya Alın
Terminalinizde şu komutu yürütün:
```bash
npm run deploy
```
Bu işlem projenizi derleyecek ve otomatik olarak `gh-pages` dalına (branch) göndererek canlıya alacaktır!

---

## 🎨 Tasarım Felsefesi

Şeker Diyarı, kullanıcısını yormayan koyu kadife ve mistik mor tonların asil uyumuyla (**Cosmic Slate & Dreamy Violet**) tasarlanmıştır. Şablon kirliliğinden ve yapay zeka reklamlarından arındırılmış tamamen şık, sade ve profesyonel bir portfolyo ürünüdür.

*İyi eğlenceler, tatlı eşleştirmeler!* 🍬✨
