<div align="center">
  <h1>Reactor Eklentisi</h1>
  <p>Discord üzerinde belirlediğiniz kullanıcıların gönderdiği her mesaja anında ve otomatik olarak emoji tepkisi (reaction) bırakmanızı sağlayan araçtır.</p>
</div>

<br>

## ⚙️ Eklentinin Amacı ve Yapısı
<hr>

* 📍 **Focus:** Hedef listesine eklenen belirli kişilerin mesajlarına önceden ayarlanan emojileri anında bırakarak etkileşimi otomatikleştirmek.
* 📍 **Esnek Emoji Motoru:** İster özel sunucu emojilerini, ister standart Discord emojilerini kullanın. Emojileri virgülle ayırarak veya yan yana yazarak sisteme tanıtabilirsiniz.
* 📍 **Çalışma Şekli:** Herhangi bir kullanıcının profiline veya ismine sağ tıklayarak açılan bağlam menüsünden (context menu) **Otomatik Tepki Başlat / Durdur** seçeneği ile kullanıcıları hedef listesine alabilirsiniz.

<br>

## 💻 Sunulan Özellikler
<hr>

#### Tepki (Reaction) Modları
![Sıralı Mod](https://img.shields.io/badge/-Sıralı_Tepki-181717?style=for-the-badge)
![Rastgele Mod](https://img.shields.io/badge/-Rastgele_Tepki-181717?style=for-the-badge)
![Tekli Mod](https://img.shields.io/badge/-Tekli_Tepki-181717?style=for-the-badge)

<br>

## 🛠️ Detaylı Kullanım ve Ayarlar
<hr>

Reactor eklentisinin davranışını ayarlar panelinden (`Settings`) dilediğiniz gibi özelleştirebilirsiniz:

* **Çoklu Ekleme (Sıralı Mod):** Ayarlanan tüm emojileri mesaj atıldığı an sırasıyla mesaja ekler. Emojiler arasına milisaniye cinsinden gecikme (`reactionDelay`) koyarak ban/rate limit riskini ortadan kaldırır.
* **Şans Topu (Rastgele Mod):** Ayarlanan emojiler içerisinden her mesaja rastgele seçilmiş sadece bir tanesini atar.
* **Tek Tabanca (Tekli Mod):** Listede ne kadar emoji olursa olsun, her zaman sadece ilk sıradaki emojiyi kullanır.
* **Tepki Gecikmeleri:** Mesajın gönderilmesiyle ilk tepkinin atılması arasındaki süreyi (`delay`) ya da emojiler arası bekleme sürelerini belirleme imkanı sunar.

> [!TIP]
> Eklenti arka planda listenizdeki kullanıcıları kaydettiği için, Discord'u kapatıp açsanız bile hedeflenen kişilerin mesajlarına tepki atılmaya çalışılır.
