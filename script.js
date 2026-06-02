// --- DOM elements ---
const gamesGrid = document.getElementById("gamesGrid");
const gamesCount = document.getElementById("gamesCount");
const searchBar = document.getElementById("searchBar");
const searchToggle = document.getElementById("searchToggle");
const searchInput = document.getElementById("searchInput");
const scrollToGamesBtn = document.getElementById("scrollToGames");
const gameModal = document.getElementById("gameModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const modalAddToCart = document.getElementById("modalAddToCart");
const cartPanel = document.getElementById("cartPanel");
const cartToggle = document.getElementById("cartToggle");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutToggle = document.getElementById("checkoutToggle");
const checkoutSection = document.getElementById("checkoutSection");
const closeCheckoutBtn = document.getElementById("closeCheckout");
const loginToggle = document.getElementById("loginToggle");
const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerModal = document.getElementById("registerModal");
const openRegister = document.getElementById("openRegister");
const registerForm = document.getElementById("registerForm");
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerPhone = document.getElementById("registerPhone");
const googleLoginBtn = document.getElementById("googleLogin");
const userDropdown = document.getElementById("userDropdown");
const btnLogout = document.getElementById("btnLogout");
const btnMyOrders = document.getElementById("btnMyOrders");

let games = [];
let filteredGames = [];
let selectedGame = null;
let cart = [];
let currentUser = null;

function mapCategory(cat) {
  switch (cat) {
    case "eid": return "ألعاب العيد";
    case "brain": return "ألعاب الذكاء";
    case "summer": return "ألعاب الذكاء الاصطناعي";
    case "edu": return "ألعاب تعليمية";
    default: return "ألعاب تفاعلية";
  }
}

function openModal(el) {
  if (!el) return;
  el.classList.remove("hidden");
  el.style.display = "flex";
}

function closeModal(el) {
  if (!el) return;
  el.classList.add("hidden");
  el.style.display = "";
}

function updateHeaderUser(user) {
  if (!loginToggle) return;
  if (user) {
    loginToggle.textContent = user.displayName || "حسابي";
    loadUserProfile(user);
  } else {
    loginToggle.textContent = "تسجيل الدخول";
    if (userDropdown) userDropdown.classList.add("hidden");
    var old = document.getElementById("userProfileInfo");
    if (old) old.remove();
  }
}

function loadUserProfile(user) {
  var currentDb = window.db || (typeof db !== "undefined" ? db : null);
  if (!currentDb || !userDropdown) return;

  currentDb.collection("users").doc(user.uid).get().then(function(doc) {
    var data = doc.exists ? doc.data() : {};
    var name = (data && data.name) ? data.name : (user.displayName || "مستخدم");
    var phone = (data && data.phone) ? data.phone : "";
    var email = (data && data.email) ? data.email : 
                (user.email && user.email.indexOf("@rafqa-store.com") === -1 ? user.email : "");
    var info = phone || email || "";

    var oldDiv = document.getElementById("userProfileInfo");
    if (oldDiv) oldDiv.remove();

    var profileDiv = document.createElement("div");
    profileDiv.id = "userProfileInfo";
    profileDiv.style.padding = "12px 15px";
    profileDiv.style.borderBottom = "1px solid rgba(148,163,184,0.15)";
    profileDiv.style.background = "var(--primary-soft)";

    var nameEl = document.createElement("div");
    nameEl.style.fontWeight = "700";
    nameEl.style.fontSize = "0.95rem";
    nameEl.textContent = "👤 " + name;
    profileDiv.appendChild(nameEl);

    if (info) {
      var infoEl = document.createElement("div");
      infoEl.style.fontSize = "0.8rem";
      infoEl.style.color = "var(--text-muted)";
      infoEl.style.marginTop = "3px";
      infoEl.textContent = phone ? "📱 " + phone : "✉️ " + email;
      profileDiv.appendChild(infoEl);
    }

    userDropdown.insertBefore(profileDiv, userDropdown.firstChild);
  }).catch(function(err) {
    console.error("فشل جلب بيانات المستخدم:", err);
  });
}

function renderGames(list) {
  if (!gamesGrid) return;
  gamesGrid.innerHTML = "";
  list.forEach(function(game) {
    var card = document.createElement("article");
    card.className = "game-card";
    card.dataset.id = game.id;
    card.innerHTML =
      '<div class="game-thumb"><img src="' + game.image + '" alt="' + game.name + '"></div>' +
      '<div class="game-body">' +
        '<div class="game-title">' + game.name + '</div>' +
        '<div class="game-meta">' +
          '<span>' + mapCategory(game.category) + '</span>' +
          '<span class="game-price">' + game.price + ' ر.س</span>' +
        '</div>' +
        '<div class="game-actions">' +
          '<button class="add-btn" data-add="' + game.id + '">إضافة إلى السلة</button>' +
        '</div>' +
      '</div>';
    gamesGrid.appendChild(card);
  });
  if (gamesCount) gamesCount.textContent = list.length + " لعبة";
}

function renderCart() {
  if (!cartItemsEl) return;
  cartItemsEl.innerHTML = "";
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p style="font-size:0.85rem;color:#6b7280;padding:10px;">السلة فارغة حالياً.</p>';
  } else {
    cart.forEach(function(item) {
      var game = games.find(function(g) { return g.id === item.id; });
      if (!game) return;
      var row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        '<div class="cart-item-thumb"><img src="' + game.image + '" alt="' + game.name + '"></div>' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-title">' + game.name + '</div>' +
          '<div class="cart-item-meta">' +
            '<span>' + game.price + ' ر.س</span>' +
            '<button class="cart-remove" data-remove="' + game.id + '">حذف</button>' +
          '</div>' +
        '</div>';
      cartItemsEl.appendChild(row);
    });
  }
  var total = cart.reduce(function(sum, item) {
    var game = games.find(function(g) { return g.id === item.id; });
    return sum + (game ? parseFloat(game.price) : 0);
  }, 0);
  if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);
  if (cartCountEl) cartCountEl.textContent = cart.length;
}

function loadGames() {
  var currentRtdb = window.rtdb || (typeof rtdb !== "undefined" ? rtdb : null);
  if (!currentRtdb) return;
  currentRtdb.ref("games").on("value", function(snapshot) {
    games = [];
    if (snapshot.exists()) {
      snapshot.forEach(function(child) {
        var val = child.val();
        val.id = child.key;
        games.push(val);
      });
      games.sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    }
    filteredGames = games.slice();
    renderGames(filteredGames);
    renderCart();
  });
}

if (searchToggle && searchBar) {
  searchToggle.addEventListener("click", function() {
    searchBar.classList.toggle("hidden");
    if (!searchBar.classList.contains("hidden") && searchInput) searchInput.focus();
  });
}

if (searchInput) {
  searchInput.addEventListener("input", function(e) {
    var q = e.target.value.trim().toLowerCase();
    filteredGames = games.filter(function(g) { return g.name.toLowerCase().indexOf(q) !== -1; });
    renderGames(filteredGames);
  });
}

if (scrollToGamesBtn) {
  scrollToGamesBtn.addEventListener("click", function() {
    var sect = document.getElementById("gamesSection");
    if (sect) sect.scrollIntoView({ behavior: "smooth" });
  });
}

var heroLearnMore = document.getElementById("heroLearnMore");
if (heroLearnMore) {
  heroLearnMore.addEventListener("click", function() {
    alert("طريقة الشراء:\n\n1. تصفّحي الألعاب واختاري ما يناسبك\n2. اضغطي إضافة إلى السلة\n3. اضغطي إتمام الشراء\n4. أكملي الدفع بأمان\n5. ستصلك اللعبة فوراً على بريدك الإلكتروني\n\nللاستفسار واتساب: 0570261205");
  });
}

document.querySelectorAll(".category-card").forEach(function(btn) {
  btn.addEventListener("click", function() {
    var cat = btn.dataset.category;
    filteredGames = games.filter(function(g) { return g.category === cat; });
    renderGames(filteredGames);
  });
});

if (gamesGrid) {
  gamesGrid.addEventListener("click", function(e) {
    var addId = e.target.dataset.add;
    var card = e.target.closest(".game-card");
    if (!card) return;
    var game = games.find(function(g) { return g.id === card.dataset.id; });
    if (!game) return;
    if (addId) {
      cart.push({ id: game.id });
      renderCart();
    } else {
      selectedGame = game;
      if (modalImage) modalImage.src = game.image;
      if (modalTitle) modalTitle.textContent = game.name;
      if (modalCategory) modalCategory.textContent = mapCategory(game.category);
      if (modalDescription) modalDescription.textContent = game.description || "";
      if (modalPrice) modalPrice.textContent = game.price + " ر.س";
      openModal(gameModal);
    }
  });
}

if (modalAddToCart) {
  modalAddToCart.addEventListener("click", function() {
    if (!selectedGame) return;
    cart.push({ id: selectedGame.id });
    renderCart();
    closeModal(gameModal);
  });
}

document.querySelectorAll(".close-modal").forEach(function(btn) {
  btn.addEventListener("click", function() {
    var target = btn.dataset.close;
    if (target === "gameModal") closeModal(gameModal);
    if (target === "cartPanel") closeModal(cartPanel);
    if (target === "loginModal") closeModal(loginModal);
    if (target === "registerModal") closeModal(registerModal);
  });
});

if (cartToggle && cartPanel) {
  cartToggle.addEventListener("click", function() { cartPanel.classList.toggle("hidden"); });
}

if (checkoutToggle) {
  checkoutToggle.addEventListener("click", function() {
    if (!currentUser) { alert("الرجاء تسجيل الدخول أولاً لإتمام الطلب."); openModal(loginModal); return; }
    if (cart.length === 0) { alert("سلتك فارغة حالياً، يرجى إضافة لعبة أولاً."); return; }
    window.location.href = "https://buy.stripe.com/YOUR_REAL_STRIPE_LINK";
  });
}

if (closeCheckoutBtn) {
  closeCheckoutBtn.addEventListener("click", function() { closeModal(checkoutSection); });
}

if (loginToggle) {
  loginToggle.addEventListener("click", function(e) {
    e.stopPropagation();
    var currentAuth = window.auth || (typeof auth !== "undefined" ? auth : null);
    if (!currentAuth) return;
    if (currentUser) { if (userDropdown) userDropdown.classList.toggle("hidden"); }
    else openModal(loginModal);
  });
}

document.addEventListener("click", function() { if (userDropdown) userDropdown.classList.add("hidden"); });

if (btnLogout) {
  btnLogout.addEventListener("click", function() {
    var currentAuth = window.auth || (typeof auth !== "undefined" ? auth : null);
    if (!currentAuth) return;
    if (confirm("هل تريد تسجيل الخروج؟")) {
      currentAuth.signOut().then(function() {
        if (userDropdown) userDropdown.classList.add("hidden");
        alert("تم تسجيل الخروج بنجاح.");
      });
    }
  });
}

if (btnMyOrders) {
  btnMyOrders.addEventListener("click", function(e) {
    e.preventDefault();
    alert("قريباً: سيتم عرض ألعابك التفاعلية التي قمتِ بشرائها هنا!");
  });
}

if (openRegister) {
  openRegister.addEventListener("click", function() { closeModal(loginModal); openModal(registerModal); });
}

var openLogin = document.getElementById("openLogin");
if (openLogin) {
  openLogin.addEventListener("click", function(e) { e.preventDefault(); closeModal(registerModal); openModal(loginModal); });
}

if (loginForm) {
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    var userInput = loginEmail.value.trim();
    var pass = loginPassword.value;
    var currentAuth = window.auth || (typeof auth !== "undefined" ? auth : null);
    if (!currentAuth) return;
    if (userInput.indexOf("@") === -1) userInput = userInput + "@rafqa-store.com";
    try {
      await currentAuth.signInWithEmailAndPassword(userInput, pass);
      closeModal(loginModal);
      alert("مرحباً بعودتكِ مجدداً إلى متجر رِفقة!");
    } catch (err) {
      alert("خطأ في تسجيل الدخول: يرجى التحقق من صحة البيانات أو كلمة المرور.");
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    var name = registerName.value.trim();
    var phone = registerPhone ? registerPhone.value.trim() : "";
    var realEmail = registerEmail ? registerEmail.value.trim() : "";
    var pass = registerPassword.value;
    var currentAuth = window.auth || (typeof auth !== "undefined" ? auth : null);
    var currentDb = window.db || (typeof db !== "undefined" ? db : null);
    if (!currentAuth) return;
    if (phone.length < 10) { alert("الرجاء إدخال رقم جوال صحيح مكون من 10 خانات."); return; }
    if (pass.length < 6) { alert("يجب أن تكون كلمة المرور من 6 خانات أو أكثر."); return; }
    var authEmail = phone + "@rafqa-store.com";
    try {
      var cred = await currentAuth.createUserWithEmailAndPassword(authEmail, pass);
      await cred.user.updateProfile({ displayName: name });
      if (currentDb) {
        await currentDb.collection("users").doc(cred.user.uid).set({
          uid: cred.user.uid, name: name, phone: phone, email: realEmail, createdAt: Date.now()
        });
      }
      alert("تم إنشاء حسابكِ بنجاح! أهلاً بكِ في عائلة Rafqa.");
      updateHeaderUser(cred.user);
      closeModal(registerModal);
    } catch (err) {
      var msgs = {
        "auth/email-already-in-use": "هذا الرقم مسجّل مسبقاً، جربي تسجيل الدخول.",
        "auth/weak-password": "كلمة المرور ضعيفة، يجب 6 أحرف أو أكثر."
      };
      alert(msgs[err.code] || "حدث خطأ: " + err.message);
    }
  });
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async function() {
    if (typeof firebase === "undefined") return;
    var currentAuth = window.auth || (typeof auth !== "undefined" ? auth : null);
    var currentDb = window.db || (typeof db !== "undefined" ? db : null);
    if (!currentAuth) return;
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      var result = await currentAuth.signInWithPopup(provider);
      var user = result.user;
      if (currentDb) {
        var userRef = currentDb.collection("users").doc(user.uid);
        var snap = await userRef.get();
        if (!snap.exists) {
          await userRef.set({ uid: user.uid, name: user.displayName || "", email: user.email || "", phone: "", provider: "google", createdAt: Date.now() });
        }
      }
      updateHeaderUser(user);
      closeModal(loginModal);
      alert("أهلاً " + (user.displayName || "") + "! تم تسجيل الدخول بـ Google بنجاح");
    } catch (err) {
      var googleErrors = {
        "auth/popup-closed-by-user": "تم إغلاق نافذة Google.",
        "auth/popup-blocked": "المتصفح حجب النافذة، يرجى السماح بها.",
        "auth/network-request-failed": "تعذّر الاتصال."
      };
      alert(googleErrors[err.code] || "تعذّر تسجيل الدخول بـ Google: " + err.message);
    }
  });
}

if (cartItemsEl) {
  cartItemsEl.addEventListener("click", function(e) {
    var removeId = e.target.dataset.remove;
    if (!removeId) return;
    cart = cart.filter(function(item) { return item.id !== removeId; });
    renderCart();
  });
}

function initializeAppLogic() {
  var currentAuth = window.auth || (typeof auth !== "undefined" ? auth : null);
  if (currentAuth) {
    currentAuth.onAuthStateChanged(function(user) { currentUser = user; updateHeaderUser(user); });
  }
  try { loadGames(); } catch (error) { console.error("تعذر جلب الألعاب:", error); }
  renderCart();
}

window.addEventListener("DOMContentLoaded", function() {
  var attempts = 0;
  var waitForFirebase = setInterval(function() {
    var currentAuth = window.auth || (typeof auth !== "undefined" ? auth : null);
    attempts++;
    if (currentAuth || attempts >= 30) { clearInterval(waitForFirebase); initializeAppLogic(); }
  }, 100);
});
