# Donate-bot

# Donat bot (Telegram + Arcadezy)

## Imkoniyatlar
- 3 til: O'zbek, Русский, English
- Arcadezy'dagi barcha o'yinlar va paketlar (narx = $ narx × kurs × (1 + ustama%), standart 10%)
- O'yinchi ID'sini tekshirish, buyurtma, holatini avtomatik kuzatish
- Buyurtma bajarilmasa pul avtomatik balansga qaytadi
- Hisobni to'ldirish: kartaga o'tkazma + chek rasmi → admin ✅/❌
- Admin panel (/admin): statistika, Arcadezy balansi, hammaga xabar, bloklash/blokdan chiqarish,
  balans qo'shish/ayirish, ustama %, dollar kursi, karta raqami, foydalanuvchini qidirish, kutilayotgan cheklar

## Mini App (ilova)
Bot endi faqat "Do'konni ochish" tugmasi va admin panel (/admin) dan iborat. Qolgan hammasi
(o'yinlar, paketlar, balans, to'ldirish, tarix, profil) Telegram ichidagi ilovada.
Ishlashi uchun Railway → servis → Settings → Networking → **Generate Domain** qiling.

## 1. GitHub'ga yuklash
1. github.com → **New repository** → nom bering (masalan `donat-bot`) → **Private** → Create.
2. **uploading an existing file** ni bosing va shu papkadagi hamma fayllarni (`src`, `package.json`, `.gitignore`, `README.md`, `.env.example`) tashlang → **Commit**.
   (`node_modules` va `.env` ni YUKLAMANG.)

## 2. Railway
1. railway.app → **New Project** → **Deploy from GitHub repo** → `donat-bot` ni tanlang.
2. Shu loyihada **+ New → Database → PostgreSQL** qo'shing.
3. Bot servisi → **Variables** bo'limiga qo'shing:
   - `BOT_TOKEN` — @BotFather'dan
   - `ADMIN_IDS` — sizning Telegram ID (@userinfobot'dan bilasiz). Bir nechta bo'lsa vergul bilan.
   - `ARCADEZY_API_KEY` — Arcadezy kaliti (YANGI, chatda ko'rinmagan kalit!)
   - `DATABASE_URL` — qiymatiga `${{Postgres.DATABASE_URL}}` yozing
   - `CARD_NUMBER`, `CARD_OWNER` — to'lov kartangiz (keyin admin paneldan ham o'zgartirsa bo'ladi)
4. Deploy tugagach Telegram'da botga `/start` yozing.

## 3. (Ixtiyoriy) Arcadezy webhook — tezroq xabar uchun
Webhooksiz ham ishlaydi (bot har 2 daqiqada buyurtmalarni o'zi tekshiradi).
1. Railway → servis → **Settings → Networking → Generate Domain**.
2. Kompyuterda:
   `curl -X PUT https://arcadezy.com/api/v1/webhook -H "X-API-Key: KALIT" -H "Content-Type: application/json" -d '{"url":"https://SIZNING-DOMEN.up.railway.app/arcadezy-hook"}'`
3. Javobda kelgan sirni Railway'ga `ARCADEZY_WEBHOOK_SECRET` qilib qo'shing.

## Muhim
- Arcadezy hamyonida dollar bo'lishi kerak, aks holda buyurtmalar qaytariladi (admin xabar oladi).
- Dollar kursini admin paneldan vaqti-vaqti bilan yangilab turing.
