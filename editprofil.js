class ProfileManager {
  constructor() {
    this.profileData = {
      firstName: "Katarina",
      lastName: "",
      email: "katarina@gmail.com",
      imageUrl: "user.jpeg"
    };
    this.loadProfile();
  }

  loadProfile() {
    const savedData = localStorage.getItem("userProfile");
    if (savedData) {
      try {
        this.profileData = JSON.parse(savedData);
      } catch (e) {
        console.error("Error parsing profile data:", e);
      }
    }
    this.updateUI();
  }

  saveProfile() {
    localStorage.setItem("userProfile", JSON.stringify(this.profileData));
    this.updateUI();
  }

  updateUI() {
    // Update form fields
    document.getElementById("inputFirstName")?.value = this.profileData.firstName;
    document.getElementById("inputLastName")?.value = this.profileData.lastName;
    document.getElementById("inputEmail")?.value = this.profileData.email;
    document.getElementById("profileImagePreview")?.src = this.profileData.imageUrl;

    // Update sidebar
    const nameElements = document.querySelectorAll(".profile-name");
    const emailElements = document.querySelectorAll(".profile-email");
    const imgElements = document.querySelectorAll(".profile-img");

    nameElements.forEach(el => {
      el.textContent = `${this.profileData.firstName} ${this.profileData.lastName}`.trim();
    });
    
    emailElements.forEach(el => {
      el.textContent = this.profileData.email;
    });

    imgElements.forEach(el => {
      el.src = this.profileData.imageUrl;
    });
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.profileData.imageUrl = e.target.result;
      this.saveProfile();
    };
    reader.readAsDataURL(file);
  }

  handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const newData = {
      firstName: form.inputFirstName.value.trim(),
      lastName: form.inputLastName.value.trim(),
      email: form.inputEmail.value.trim(),
      imageUrl: this.profileData.imageUrl // Maintain existing image
    };

    // Validasi
    if (!newData.firstName || !newData.email) {
      alert("Nama Depan dan Email wajib diisi!");
      return;
    }

    // Validasi password jika diubah
    if (form.inputNewPass?.value && form.inputNewPass.value !== form.inputKonfirmPass?.value) {
      alert("Password baru dan konfirmasi tidak cocok!");
      return;
    }

    this.profileData = { ...this.profileData, ...newData };
    this.saveProfile();
    alert("Profil berhasil diperbarui!");
  }

  // Di dalam ProfileManager.js
setupEventListeners() {
  document.getElementById("profilePictureInput")?.addEventListener(
    "change", (e) => this.handleImageUpload(e)
  );
  
  document.getElementById("editAccountForm")?.addEventListener(
    "submit", (e) => this.handleFormSubmit(e)
  );
}
}