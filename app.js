// Menunggu hingga seluruh konten halaman HTML selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
  // =================================================================
  // BAGIAN GLOBAL: FUNGSI & DATA YANG DIGUNAKAN DI BANYAK HALAMAN
  // =================================================================

  // --- Fungsi untuk Transaksi ---
  const getTransactions = () =>
    JSON.parse(localStorage.getItem("transactions")) || [];
  const saveTransactions = (transactions) =>
    localStorage.setItem("transactions", JSON.stringify(transactions));

  // --- Fungsi untuk Profil Pengguna ---
  const getProfile = () => {
    return (
      JSON.parse(localStorage.getItem("userProfile")) || {
        firstName: "Katarina",
        lastName: "",
        email: "katarina@gmail.com",
        picture: "user.jpeg", // Gambar default
      }
    );
  };
  const saveProfile = (profile) =>
    localStorage.setItem("userProfile", JSON.stringify(profile));

  // --- Fungsi Lainnya ---
  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);

  // Kategori transaksi
  const categories = {
    income: ["Gaji", "Bonus", "Hadiah", "Investasi", "Lainnya"],
    expense: [
      "Makanan",
      "Transportasi",
      "Tagihan",
      "Hiburan",
      "Belanja",
      "Kesehatan",
    ],
  };

  // =================================================================
  // LOGIKA UPDATE SIDEBAR (BERJALAN DI SEMUA HALAMAN)
  // =================================================================
  const sidebarProfiles = document.querySelectorAll(".sidebar-profile");
  if (sidebarProfiles.length > 0) {
    const profile = getProfile();
    sidebarProfiles.forEach((sidebar) => {
      const nameEl = sidebar.querySelector(".profile-name");
      const emailEl = sidebar.querySelector(".profile-email");
      const imgEl = sidebar.querySelector("img");

      if (nameEl)
        nameEl.textContent = `${profile.firstName} ${profile.lastName}`.trim();
      if (emailEl) emailEl.textContent = profile.email;
      if (imgEl) imgEl.src = profile.picture;
    });
  }

  // =================================================================
  // LOGIKA UNTUK HALAMAN EDIT PROFIL (editprofile.html)
  // =================================================================
  const editProfileForm = document.getElementById("editProfileForm");
  if (editProfileForm) {
    const profile = getProfile();

    // Ambil elemen form
    const firstNameInput = document.getElementById("inputFirstName");
    const lastNameInput = document.getElementById("inputLastName");
    const emailInput = document.getElementById("inputEmail");
    const imagePreview = document.getElementById("profileImagePreview");
    const imageInput = document.getElementById("profilePictureInput");

    // 1. Isi form dengan data yang sudah tersimpan
    firstNameInput.value = profile.firstName;
    lastNameInput.value = profile.lastName;
    emailInput.value = profile.email;
    imagePreview.src = profile.picture;

    // 2. Logika untuk mengubah preview gambar saat file baru dipilih
    imageInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result; // Tampilkan gambar baru
        };
        reader.readAsDataURL(file); // Baca file sebagai Data URL (base64)
      }
    });

    // 3. Simpan perubahan saat form disubmit
    editProfileForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Mencegah reload halaman

      // Buat objek profil baru dari data form
      const updatedProfile = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        email: emailInput.value,
        picture: imagePreview.src, // Ambil dari preview yang mungkin sudah diubah
      };

      // Simpan ke localStorage
      saveProfile(updatedProfile);

      alert("Profil berhasil diperbarui!");
      window.location.href = "account.html"; // Arahkan kembali ke halaman akun
    });
  }

  // =================================================================
  // LOGIKA UNTUK HALAMAN BUDGET (budget.html)
  // =================================================================
  const transactionForm = document.getElementById("transactionForm");
  if (transactionForm) {
    const typeRadios = document.querySelectorAll(
      'input[name="transactionType"]'
    );
    const categoryContainer = document.getElementById("categoryRadioGroup");
    const dateInput = document.getElementById("date");
    dateInput.valueAsDate = new Date();
    const populateCategories = (type) => {
      const categoryList = categories[type];
      categoryContainer.innerHTML = categoryList
        .map(
          (category) =>
            `<div class="form-check form-check-inline category-tile"><input class="form-check-input" type="radio" name="category" id="cat-${category}" value="${category}" required><label class="form-check-label" for="cat-${category}">${category}</label></div>`
        )
        .join("");
    };
    typeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) =>
        populateCategories(e.target.value)
      );
    });
    transactionForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const type = transactionForm.elements.transactionType.value;
      const amount = parseFloat(transactionForm.elements.amount.value);
      const category = transactionForm.elements.category.value;
      const account = transactionForm.elements.account.value;
      const description = transactionForm.elements.description.value;
      const date = transactionForm.elements.date.value;
      const newTransaction = {
        id: Date.now(),
        type,
        amount,
        category,
        account,
        description,
        date,
      };
      const transactions = getTransactions();
      transactions.push(newTransaction);
      saveTransactions(transactions);
      alert("Transaksi berhasil ditambahkan!");
      transactionForm.reset();
      dateInput.valueAsDate = new Date();
      categoryContainer.innerHTML = `<p class="text-muted small">Pilih tipe transaksi dahulu untuk melihat kategori.</p>`;
      window.location.href = "dashboard.html";
    });
  }

  // =================================================================
  // LOGIKA UNTUK HALAMAN DASHBOARD (dashboard.html)
  // =================================================================
  const dashboardPage = document.getElementById("totalBalance");
  if (dashboardPage) {
    const transactions = getTransactions();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let totalIncome = 0,
      totalExpense = 0,
      monthlyIncome = 0,
      monthlyExpense = 0;
    transactions.forEach((trx) => {
      const trxDate = new Date(trx.date);
      if (trx.type === "income") {
        totalIncome += trx.amount;
        if (
          trxDate.getMonth() === currentMonth &&
          trxDate.getFullYear() === currentYear
        )
          monthlyIncome += trx.amount;
      } else {
        totalExpense += trx.amount;
        if (
          trxDate.getMonth() === currentMonth &&
          trxDate.getFullYear() === currentYear
        )
          monthlyExpense += trx.amount;
      }
    });
    const totalBalance = totalIncome - totalExpense;
    document.getElementById("totalBalance").textContent =
      formatRupiah(totalBalance);
    document.getElementById("monthlyIncome").textContent =
      formatRupiah(monthlyIncome);
    document.getElementById("monthlyExpenses").textContent =
      formatRupiah(monthlyExpense);
    document.getElementById("totalAssets").textContent =
      formatRupiah(totalBalance);
    const recentTransactionsContainer =
      document.getElementById("recentTransactions");
    recentTransactionsContainer.innerHTML = "";
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    if (recentTransactions.length > 0) {
      recentTransactions.forEach((trx) => {
        const item = document.createElement("div");
        item.className =
          "list-group-item d-flex justify-content-between align-items-center";
        item.innerHTML = `<div><div class="fw-bold">${
          trx.description
        }</div><small class="text-muted">${new Date(
          trx.date
        ).toLocaleDateString("id-ID")} - ${
          trx.category
        }</small></div><span class="fw-bold ${
          trx.type === "income" ? "text-success" : "text-danger"
        }">${trx.type === "income" ? "+" : "-"} ${formatRupiah(
          trx.amount
        )}</span>`;
        recentTransactionsContainer.appendChild(item);
      });
    } else {
      recentTransactionsContainer.innerHTML =
        '<p class="text-center text-muted p-3">Belum ada transaksi.</p>';
    }
  }

  // =================================================================
  // LOGIKA UNTUK HALAMAN HISTORY (history.html)
  // =================================================================
  const historyPage = document.getElementById("transactionHistory");
  if (historyPage) {
    const filterType = document.getElementById("filterType"),
      filterCategory = document.getElementById("filterCategory"),
      filterDateFrom = document.getElementById("filterDateFrom"),
      filterDateTo = document.getElementById("filterDateTo"),
      clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const allTransactions = getTransactions();
    const uniqueCategories = [
      ...new Set(allTransactions.map((trx) => trx.category)),
    ];
    uniqueCategories.forEach((cat) => {
      const option = new Option(cat, cat);
      filterCategory.add(option);
    });
    const renderHistory = (transactionsToRender) => {
      historyPage.innerHTML = "";
      if (transactionsToRender.length === 0) {
        historyPage.innerHTML =
          '<p class="text-center text-muted p-3">Tidak ada transaksi yang sesuai dengan filter.</p>';
        return;
      }
      [...transactionsToRender]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach((trx) => {
          const item = document.createElement("div");
          item.className = "list-group-item";
          item.innerHTML = `<div class="d-flex w-100 justify-content-between"><h5 class="mb-1 fw-bold">${
            trx.description
          }</h5><small>${new Date(trx.date).toLocaleDateString(
            "id-ID"
          )}</small></div><p class="mb-1 ${
            trx.type === "income" ? "text-success" : "text-danger"
          } fw-bold">${trx.type === "income" ? "+" : "-"} ${formatRupiah(
            trx.amount
          )}</p><small class="text-muted">Kategori: ${trx.category} | Akun: ${
            trx.account
          }</small>`;
          historyPage.appendChild(item);
        });
    };
    const applyFilters = () => {
      let filtered = allTransactions;
      if (filterType.value)
        filtered = filtered.filter((trx) => trx.type === filterType.value);
      if (filterCategory.value)
        filtered = filtered.filter(
          (trx) => trx.category === filterCategory.value
        );
      if (filterDateFrom.value)
        filtered = filtered.filter(
          (trx) => new Date(trx.date) >= new Date(filterDateFrom.value)
        );
      if (filterDateTo.value)
        filtered = filtered.filter(
          (trx) => new Date(trx.date) <= new Date(filterDateTo.value)
        );
      renderHistory(filtered);
    };
    filterType.addEventListener("change", applyFilters);
    filterCategory.addEventListener("change", applyFilters);
    filterDateFrom.addEventListener("change", applyFilters);
    filterDateTo.addEventListener("change", applyFilters);
    clearFiltersBtn.addEventListener("click", () => {
      filterType.value = "";
      filterCategory.value = "";
      filterDateFrom.value = "";
      filterDateTo.value = "";
      applyFilters();
    });
    applyFilters();
  }

  // =================================================================
  // LOGIKA UNTUK HALAMAN ACCOUNT (account.html)
  // =================================================================
  const accountPage = document.getElementById("accountsContainer");
  if (accountPage) {
    const transactions = getTransactions();
    const accountBalances = {
      Rekening: 0,
      Tabungan: 0,
      "Kartu Kredit": 0,
      Tunai: 0,
    };
    transactions.forEach((trx) => {
      if (accountBalances.hasOwnProperty(trx.account)) {
        trx.type === "income"
          ? (accountBalances[trx.account] += trx.amount)
          : (accountBalances[trx.account] -= trx.amount);
      }
    });

    document.querySelectorAll(".account-card").forEach((card) => {
      const accountNameElement = card.querySelector(".fs-5.fw-semibold");
      // Mengambil teks dari elemen span, mengabaikan ikon di dalamnya
      const accountName = accountNameElement.lastChild.textContent.trim();
      const balanceValueElement = card.querySelector(".balance-value");

      if (balanceValueElement && accountBalances.hasOwnProperty(accountName)) {
        balanceValueElement.textContent = formatRupiah(
          accountBalances[accountName]
        );
      }
    });

    const netWorth = Object.values(accountBalances).reduce(
      (sum, balance) => sum + balance,
      0
    );
    document.getElementById("totalLiquidAssets").textContent =
      formatRupiah(netWorth);
    document.getElementById("netWorth").textContent = formatRupiah(netWorth);
  }
});
