# Setup Supabase untuk Re-Route

## Cara Migrasi dari SQLite ke Supabase

### Langkah 1: Setup Project Supabase

1. Buka https://supabase.com dan buat project baru
2. Tunggu hingga project ready (biasanya ~2 menit)
3. Buka **Settings** > **Database**
4. Catat informasi berikut:
   - **Host**: biasanya dalam format `db.xxxx.supabase.co`
   - **Port**: 5432
   - **User**: postgres
   - **Password**: password yang Anda buat saat daftar
   - **Database name**: postgres

### Langkah 2: Konfigurasi Environment Variables

Copy file `.env.example` ke `.env` dan isi dengan credentials Supabase Anda:

```bash
cd backend
cp .env.example .env
```

Edit file `.env`:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Catatan Penting untuk Supabase:**

- Gunakan port `5432` untuk direct connection
- Atau gunakan port `6543` untuk connection pooling (disarankan)

Contoh:

```env
DATABASE_URL="postgresql://postgres:mypassword@db.abc123.supabase.co:5432/postgres"
```

### Langkah 3: Generate Prisma Client

```bash

```
