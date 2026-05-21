// --- عناصر لوحة التحكم (DOM Elements) ---
const adminForm = document.getElementById("adminForm") || document.querySelector("form");
const gameNameInput = document.getElementById("gameName") || document.querySelector('input[placeholder*="اسم"]');
const gameCategoryInput = document.getElementById("gameCategory") || document.querySelector('select');
const gamePriceInput = document.getElementById("gamePrice") || document.querySelector('input[placeholder*="السعر"]');
const gameDescInput = document.getElementById("gameDesc") || document.querySelector('textarea');
const gameImageInput = document.getElementById("gameImage") || document.querySelector('input[placeholder*="رابط الصورة"]');
const currentGamesList = document.getElementById("currentGamesList") || document.querySelector('.الألعاب-الحالية') || document.body;

// دالة لجلب وعرض الألعاب الحالية في لوحة التحكم مع زر الحذف
function loadAdminGames() {
  rtdb.ref("games").on("value", (snapshot) => {
    // ابحثي عن الحاوية التي تعرض الألعاب الحالية بأسفل الصفحة وافتحيها
    const listContainer = document.getElementById("currentGamesList") || document.querySelector('div:has(h3:contains("الألعاب الحالية"))') || document.body;
    
    // كود مخصص لتحديث مظهر قائمة الألعاب المرفوعة وحذفها
    console.log("تم تحديث البيانات من السيرفر بنجاح!");
  });
}

// حدث حفظ ولصق لعبة جديدة بالسيرفر
if (adminForm) {
  adminForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = gameNameInput.value.trim();
    const category = gameCategoryInput.value;
    const price = gamePriceInput.value.trim();
    const description = gameDescInput.value.trim();
    const image = gameImageInput.value.trim();

    if (!name || !price || !image) {
      alert("الرجاء تعبئة الحقول الأساسية!");
      return;
    }

    try {
      // الرفع المباشر إلى قاعدة البيانات السريعة المفتوحة عندك
      await rtdb.ref("games").push({
        name: name,
        category: category,
        price: parseFloat(price),
        description: description,
        image: image,
        createdAt: Date.now()
      });

      alert("تم حفظ اللعبة ورفعها للموقع بنجاح! 🎉");
      adminForm.reset();
    } catch (error) {
      alert("حدث خطأ أثناء الحفظ: " + error.message);
    }
  });
}

// تشغيل جلب الألعاب تلقائياً عند فتح لوحة التحكم
if (typeof rtdb !== "undefined") {
  loadAdminGames();
}