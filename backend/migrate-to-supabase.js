import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Sambungkan ke Supabase pakai data di file .env lu
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  try {
    console.log("Sedang membaca file data.json...");

    // 1. Baca file data.json
    const rawData = fs.readFileSync("data.json", "utf8");
    const jsonData = JSON.parse(rawData);

    console.log(
      `Ditemukan ${jsonData.length} data. Mulai mengirim ke Supabase...`,
    );

    // 2. Format data biar cocok sama rumah/tabel di Supabase
    const formattedData = jsonData.map((item) => ({
      // Kita gabung judul dan deskripsi ke kolom 'content' biar AI-nya gampang nyari nanti
      content: `${item.judul} - ${item.deskripsi}`,

      // Seluruh data aslinya (judul, deskripsi, tanggal) kita simpan di 'metadata'
      metadata: item,
    }));

    // 3. Masukkan ke tabel my_apps_data
    const { data, error } = await supabase
      .from("my_apps_data")
      .insert(formattedData)
      .select(); // .select() berguna untuk menampilkan bukti kalau data berhasil masuk

    // 4. Cek kalau ada error dari Supabase
    if (error) {
      console.error("\n❌ GAGAL MENGIRIM DATA KE SUPABASE:");
      console.error(error.message);
    } else {
      console.log("\n✅ MANTAP BRE! Data berhasil masuk ke Supabase.");
      console.log(`Total data yang masuk: ${data.length} baris.`);
    }
  } catch (err) {
    console.error("\n❌ ERROR SISTEM/BACA FILE:");
    console.error(err.message);
  }
}

migrateData();
