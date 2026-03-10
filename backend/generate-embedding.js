import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Siapkan koneksi Supabase & Gemini
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbeddings() {
  try {
    console.log("Sedang mengambil data dari Supabase yang belum punya otak...");

    const { data: appsData, error: fetchError } = await supabase
      .from("my_apps_data")
      .select("id, content")
      .is("embedding", null);

    if (fetchError) throw fetchError;
    if (!appsData || appsData.length === 0) {
      console.log("Semua data sudah punya embedding! Mantap.");
      return;
    }

    console.log(`Ditemukan ${appsData.length} data. Mulai memproses AI...`);

    // Pakai model hasil interogasi tadi
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    // Loop untuk setiap baris data
    for (const item of appsData) {
      console.log(`Memproses ID: ${item.id}...`);

      // 🔥 INI PENJAGA KEAMANANNYA 🔥
      // Kalau konten kosong/null, kita kasih teks default biar Gemini nggak error "invalid parameter"
      const textToEmbed = item.content
        ? String(item.content)
        : "Data deskripsi kosong";

      try {
        // Minta Gemini mengubah teks jadi angka vektor
        const result = await model.embedContent(textToEmbed);
        const embeddingVector = result.embedding.values;

        // Simpan angka vektor itu balik ke Supabase
        const { error: updateError } = await supabase
          .from("my_apps_data")
          .update({ embedding: embeddingVector })
          .eq("id", item.id);

        if (updateError) {
          console.error(`Gagal update ID ${item.id}:`, updateError.message);
        } else {
          console.log(`✅ ID ${item.id} berhasil diupdate!`);
        }
      } catch (embedError) {
        // Kalau ada 1 data yang gagal, script nggak akan langsung mati, tapi lanjut ke ID berikutnya
        console.error(
          `❌ Gemini gagal memproses ID ${item.id} karena:`,
          embedError.message,
        );
      }
    }

    console.log(
      "\n🎉 SELESAI BRE! Semua data lu sekarang udah pintar dan siap dicari pakai AI.",
    );
  } catch (error) {
    console.error("Terjadi kesalahan sistem:", error);
  }
}

generateEmbeddings();
