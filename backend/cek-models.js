import "dotenv/config";

async function cekModel() {
  console.log("Sedang menginterogasi server Google...");
  try {
    // Kita nanya langsung ke server Google pakai API Key lu
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
    );
    const data = await response.json();

    if (data.models) {
      // Kita saring khusus yang namanya ada unsur 'embed' (buat otak database)
      const embeddingModels = data.models.filter((m) =>
        m.name.includes("embed"),
      );

      console.log(
        "\n✅ INTEROGASI BERHASIL! Ini daftar model AI yang diizinkan buat akun lu:",
      );
      embeddingModels.forEach((m) => console.log(`👉 ${m.name}`));
    } else {
      console.log(
        "\n❌ Waduh, ada yang salah sama API Key lu nih (mungkin copy-nya kurang pas):",
      );
      console.log(data);
    }
  } catch (error) {
    console.error("Gagal ngecek:", error.message);
  }
}

cekModel();
