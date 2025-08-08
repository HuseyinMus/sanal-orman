import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { gsap } from 'gsap';
import { TurkeyMap } from './components/TurkeyMap.js';
import { toast } from './utils/Toast.js';
import { soundManager } from './utils/SoundManager.js';

// Firebase konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyAFKVv7cMvL0VLPIB6CvwgKBtDq4xwhrC4",
  authDomain: "sanal-ab206.firebaseapp.com",
  projectId: "sanal-ab206",
  storageBucket: "sanal-ab206.firebasestorage.app",
  messagingSenderId: "754559793224",
  appId: "1:754559793224:web:a7ef56082d9b9deef9c07d",
  measurementId: "G-SRHF22CXBB"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// DOM elementleri
const loadingScreen = document.getElementById('loading-screen');
const authModal = document.getElementById('auth-modal');
const appContainer = document.getElementById('app');
const citySelection = document.getElementById('city-selection');
const forestView = document.getElementById('forest-view');
const forestContainer = document.getElementById('forest-container');
const plantTreeModal = document.getElementById('plant-tree-modal');
const treeInfoModal = document.getElementById('tree-info-modal');
const turkeyMapContainer = document.getElementById('turkey-map');

// Türkiye şehirleri verisi
const cities = [
  { id: 'istanbul', name: 'İstanbul', lat: 41.0082, lng: 28.9784, description: 'Boğazın incisi' },
  { id: 'ankara', name: 'Ankara', lat: 39.9334, lng: 32.8597, description: 'Başkent' },
  { id: 'izmir', name: 'İzmir', lat: 38.4192, lng: 27.1287, description: 'Ege\'nin incisi' },
  { id: 'bursa', name: 'Bursa', lat: 40.1885, lng: 29.0610, description: 'Yeşil Bursa' },
  { id: 'antalya', name: 'Antalya', lat: 36.8969, lng: 30.7133, description: 'Turizm başkenti' },
  { id: 'adana', name: 'Adana', lat: 37.0000, lng: 35.3213, description: 'Çukurova\'nın merkezi' },
  { id: 'konya', name: 'Konya', lat: 37.8667, lng: 32.4833, description: 'Mevlana şehri' },
  { id: 'gaziantep', name: 'Gaziantep', lat: 37.0662, lng: 37.3833, description: 'Gastronomi şehri' },
  { id: 'mersin', name: 'Mersin', lat: 36.8000, lng: 34.6333, description: 'Akdeniz\'in incisi' },
  { id: 'diyarbakir', name: 'Diyarbakır', lat: 37.9144, lng: 40.2306, description: 'Güneydoğu\'nun merkezi' },
  { id: 'samsun', name: 'Samsun', lat: 41.2867, lng: 36.3300, description: 'Karadeniz\'in incisi' },
  { id: 'kayseri', name: 'Kayseri', lat: 38.7312, lng: 35.4787, description: 'Erciyes\'in eteğinde' },
  { id: 'trabzon', name: 'Trabzon', lat: 41.0015, lng: 39.7178, description: 'Karadeniz\'in kalbi' },
  { id: 'eskisehir', name: 'Eskişehir', lat: 39.7767, lng: 30.5206, description: 'Gençlik şehri' },
  { id: 'malatya', name: 'Malatya', lat: 38.3552, lng: 38.3095, description: 'Kayısının anavatanı' },
  { id: 'van', name: 'Van', lat: 38.4891, lng: 43.4089, description: 'Doğu\'nun incisi' },
  { id: 'denizli', name: 'Denizli', lat: 37.7765, lng: 29.0864, description: 'Pamukkale\'nin evi' },
  { id: 'sanliurfa', name: 'Şanlıurfa', lat: 37.1591, lng: 38.7969, description: 'Peygamberler şehri' },
  { id: 'adapazari', name: 'Adapazarı', lat: 40.7808, lng: 30.4033, description: 'Sakarya\'nın merkezi' },
  { id: 'manisa', name: 'Manisa', lat: 38.6191, lng: 27.4289, description: 'Mesir macununun evi' },
  { id: 'kocaeli', name: 'Kocaeli', lat: 40.8533, lng: 29.8815, description: 'Sanayi kenti' },
  { id: 'aydin', name: 'Aydın', lat: 37.8560, lng: 27.8416, description: 'İncir ve zeytin diyarı' },
  { id: 'tekirdag', name: 'Tekirdağ', lat: 40.9783, lng: 27.5112, description: 'Rakı ve köfte şehri' },
  { id: 'balikesir', name: 'Balıkesir', lat: 39.6484, lng: 27.8826, description: 'Zeytinyağının başkenti' },
  { id: 'kahramanmaras', name: 'Kahramanmaraş', lat: 37.5858, lng: 36.9371, description: 'Dondurmanın anavatanı' }
];

// Uygulama durumu
let currentUser = null;
let currentCity = null;
let trees = [];
let isDragging = false;
let lastMousePos = { x: 0, y: 0 };
let camera = { x: 0, y: 0, zoom: 1 };
let turkeyMap = null;

// Ağaç türleri
const treeTypes = {
  pine: { emoji: '🌲', name: 'Çam Ağacı' },
  oak: { emoji: '🌳', name: 'Meşe Ağacı' },
  maple: { emoji: '🍁', name: 'Akçaağaç' },
  birch: { emoji: '🌿', name: 'Huş Ağacı' },
  cherry: { emoji: '🌸', name: 'Kiraz Ağacı' }
};

// Uygulama başlatma
class SanalOrmanApp {
  constructor() {
    this.currentUser = null;
    this.currentCity = null;
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.currentTree = null;
    
    // Hayvan sistemi
    this.animals = [];
    
    // Hava durumu sistemi
    this.weatherSystem = {
      currentWeather: 'sunny',
      currentSeason: 'spring',
      temperature: 22,
      humidity: 60,
      windSpeed: 5,
      lastUpdate: Date.now(),
      weatherDuration: 60000, // 1 dakika (test için)
      seasonDuration: 300000 // 5 dakika (test için)
    };
    
    this.init();
  }

  async init() {
    // Loading ekranını göster
    this.showLoading();
    
    // Firebase auth state listener
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.onUserLogin(user);
      } else {
        this.onUserLogout();
      }
    });

    // Event listener'ları ekle
    this.setupEventListeners();
    
    // Loading ekranını gizle
    setTimeout(() => {
      this.hideLoading();
    }, 2000);
    
    // Hava durumu sistemini başlat
    this.initWeatherSystem();
  }

  showLoading() {
    loadingScreen.style.display = 'flex';
  }

  hideLoading() {
    gsap.to(loadingScreen, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        loadingScreen.style.display = 'none';
      }
    });
  }

  onUserLogin(user) {
    currentUser = user;
    this.showApp();
    this.updateUserInfo();
  }

  onUserLogout() {
    currentUser = null;
    this.showAuthModal();
  }

  showAuthModal() {
    authModal.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }

  showApp() {
    authModal.classList.add('hidden');
    appContainer.classList.remove('hidden');
    this.initTurkeyMap();
  }

  updateUserInfo() {
    // user-info element was removed from header during weather system implementation
    // User info is now displayed in the weather info section
  }

  setupEventListeners() {
    // Auth tab değiştirme
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchAuthTab(e.target.dataset.tab);
      });
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Register form
    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      this.handleLogout();
    });

    // Plant tree (moved to forest-view)
    const plantTreeBtn = document.getElementById('plant-tree-btn');
    if (plantTreeBtn) {
      plantTreeBtn.addEventListener('click', () => {
        this.showPlantTreeModal();
      });
    }

    // Plant tree form
    document.getElementById('plant-tree-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlePlantTree();
    });

    // Modal kapatma
    document.getElementById('cancel-plant').addEventListener('click', () => {
      this.hidePlantTreeModal();
    });

    document.getElementById('close-tree-info').addEventListener('click', () => {
      this.hideTreeInfoModal();
    });

    // Geri dönüş butonu (moved to forest-view)
    const backToMapBtn = document.getElementById('back-to-map');
    if (backToMapBtn) {
      backToMapBtn.addEventListener('click', () => {
        this.backToMap();
      });
    }

      // Ses toggle butonu
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        this.toggleSound();
      });
    }

    // Profil butonu
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        this.showProfile();
      });
    }

    // Profil modal kapatma
    const closeProfileBtn = document.getElementById('close-profile');
    if (closeProfileBtn) {
      closeProfileBtn.addEventListener('click', () => {
        this.hideProfile();
      });
    }

    // Tree interaction butonları
    const waterTreeBtn = document.getElementById('water-tree');
    if (waterTreeBtn) {
      waterTreeBtn.addEventListener('click', () => {
        this.waterTree();
      });
    }

    const careTreeBtn = document.getElementById('care-tree');
    if (careTreeBtn) {
      careTreeBtn.addEventListener('click', () => {
        this.careForTree();
      });
    }

    const fertilizeTreeBtn = document.getElementById('fertilize-tree');
    if (fertilizeTreeBtn) {
      fertilizeTreeBtn.addEventListener('click', () => {
        this.fertilizeTree();
      });
    }

    // Social interaction butonları
    const likeTreeBtn = document.getElementById('like-tree');
    if (likeTreeBtn) {
      likeTreeBtn.addEventListener('click', () => {
        this.likeTree();
      });
    }

    const shareTreeBtn = document.getElementById('share-tree');
    if (shareTreeBtn) {
      shareTreeBtn.addEventListener('click', () => {
        this.shareTree();
      });
    }

    const commentTreeBtn = document.getElementById('comment-tree');
    if (commentTreeBtn) {
      commentTreeBtn.addEventListener('click', () => {
        this.toggleCommentForm();
      });
    }

    const submitCommentBtn = document.getElementById('submit-comment');
    if (submitCommentBtn) {
      submitCommentBtn.addEventListener('click', () => {
        this.submitComment();
      });
    }

    // Yorum input'u için Enter tuşu desteği
    const commentInput = document.getElementById('comment-input');
    if (commentInput) {
      commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.submitComment();
        }
      });
    }

    // Harita kontrolleri
    const mapZoomIn = document.getElementById('map-zoom-in');
    const mapZoomOut = document.getElementById('map-zoom-out');
    const mapReset = document.getElementById('map-reset');

    if (mapZoomIn) {
      mapZoomIn.addEventListener('click', () => {
        if (turkeyMap) turkeyMap.zoomIn();
      });
    }

    if (mapZoomOut) {
      mapZoomOut.addEventListener('click', () => {
        if (turkeyMap) turkeyMap.zoomOut();
      });
    }

    if (mapReset) {
      mapReset.addEventListener('click', () => {
        if (turkeyMap) turkeyMap.resetView();
      });
    }

    // Forest mouse events - forest-container kullan
    const forestContainer = document.getElementById('forest-container');
    if (forestContainer) {
      forestContainer.addEventListener('mousedown', (e) => {
        this.startDrag(e);
      });

      forestContainer.addEventListener('mousemove', (e) => {
        this.drag(e);
      });

      forestContainer.addEventListener('mouseup', () => {
        this.endDrag();
      });

      forestContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.handleWheel(e);
      });
    }
  }

  switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.add('hidden');
    });
    document.getElementById(`${tab}-form`).classList.remove('hidden');
  }

  async handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Başarıyla giriş yaptınız!', {
        title: '👋 Tekrar Hoş Geldiniz!',
        duration: 3000
      });
      soundManager.login();
    } catch (error) {
      console.error('Firebase Error:', error);
      if (error.code === 'auth/configuration-not-found') {
        this.showError('Firebase Authentication henüz etkinleştirilmemiş. Lütfen Firebase Console\'da Authentication\'ı etkinleştirin.');
      } else if (error.code === 'auth/user-not-found') {
        this.showError('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.');
      } else if (error.code === 'auth/wrong-password') {
        this.showError('Hatalı şifre.');
      } else if (error.code === 'auth/invalid-email') {
        this.showError('Geçersiz e-posta adresi.');
      } else {
        this.showError('Giriş başarısız: ' + error.message);
      }
    }
  }

  async handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      // Kullanıcıyı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Profil bilgilerini güncelle
      if (userCredential.user) {
        await this.updateUserProfile(userCredential.user, name);
        toast.success('Hesabınız başarıyla oluşturuldu!', {
          title: '🎉 Hoş Geldiniz!',
          duration: 4000
        });
        soundManager.success();
      }
    } catch (error) {
      console.error('Firebase Error:', error);
      if (error.code === 'auth/configuration-not-found') {
        this.showError('Firebase Authentication henüz etkinleştirilmemiş. Lütfen Firebase Console\'da Authentication\'ı etkinleştirin.');
      } else if (error.code === 'auth/email-already-in-use') {
        this.showError('Bu e-posta adresi zaten kullanımda. Lütfen farklı bir e-posta adresi deneyin.');
      } else if (error.code === 'auth/weak-password') {
        this.showError('Şifre çok zayıf. En az 6 karakter kullanın.');
      } else if (error.code === 'auth/invalid-email') {
        this.showError('Geçersiz e-posta adresi.');
      } else {
        this.showError('Kayıt başarısız: ' + error.message);
      }
    }
  }

  async updateUserProfile(user, displayName) {
    // Kullanıcı profilini güncelle
    try {
      await updateProfile(user, {
        displayName: displayName
      });
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
    }
  }

  async handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      this.showError('Çıkış başarısız: ' + error.message);
    }
  }

  initTurkeyMap() {
    if (!turkeyMapContainer) return;
    
    // Türkiye haritasını başlat
    turkeyMap = new TurkeyMap(turkeyMapContainer, (cityId, cityName) => {
      this.selectCityFromMap(cityId, cityName);
    });
    
    // Şehir istatistiklerini yükle
    this.loadCityStats();
  }

  async loadCityStats() {
    try {
      // Tüm şehirlerdeki ağaçları yükle
      const treesRef = collection(db, 'trees');
      const snapshot = await getDocs(treesRef);
      
      const cityStats = {};
      
      snapshot.forEach((doc) => {
        const tree = doc.data();
        const cityId = tree.cityId;
        
        if (!cityStats[cityId]) {
          cityStats[cityId] = { count: 0, users: new Set() };
        }
        
        cityStats[cityId].count++;
        cityStats[cityId].users.add(tree.userId);
      });
      
      // Haritayı güncelle
      if (turkeyMap) {
        const formattedStats = {};
        Object.keys(cityStats).forEach(cityId => {
          formattedStats[cityId] = {
            count: cityStats[cityId].count,
            users: cityStats[cityId].users.size
          };
        });
        turkeyMap.updateCityData(formattedStats);
      }
    } catch (error) {
      console.error('Şehir istatistikleri yüklenirken hata:', error);
    }
  }

  selectCityFromMap(cityId, cityName) {
    const city = cities.find(c => c.id === cityId);
    if (city) {
      this.selectCity(city);
    }
  }

  async selectCity(city) {
    console.log('selectCity çağrıldı:', city);
    currentCity = city;
    this.currentCity = city; // Sınıf özelliğini de güncelle
    
    console.log('currentCity güncellendi:', currentCity);
    console.log('this.currentCity güncellendi:', this.currentCity);
    
    // Şehir seçimini gizle, orman görünümünü göster
    citySelection.classList.add('hidden');
    forestView.classList.remove('hidden');
    
    // Mevcut şehir bilgisini güncelle
    const currentCityDisplay = document.getElementById('current-city-display');
    if (currentCityDisplay) {
      currentCityDisplay.textContent = `${city.name} Ormanı`;
    }
    
    // Bilgi toast'u göster
    toast.info(`${city.name} ormanına hoş geldiniz! Ağaç dikmeye başlayabilirsiniz.`, {
      title: '🌲 Orman Keşfi',
      duration: 4000
    });
    
    // Ağaçları yükle
    console.log('loadTrees çağrılıyor...');
    await this.loadTrees();
    
    // Orman görünümünü başlat
    this.initForestView();
  }

  async loadTrees() {
    try {
      console.log('Loading trees for city:', currentCity.id);
      const treesRef = collection(db, 'trees');
      const q = query(treesRef, where('cityId', '==', currentCity.id));
      
      console.log('Firestore query oluşturuldu:', q);
      
      onSnapshot(q, (snapshot) => {
        console.log('onSnapshot tetiklendi, snapshot size:', snapshot.size);
        trees = [];
        snapshot.forEach((doc) => {
          const treeData = { id: doc.id, ...doc.data() };
          console.log('Firestore doc.id:', doc.id);
          console.log('Firestore doc.data():', doc.data());
          console.log('Oluşturulan treeData:', treeData);
          console.log('treeData.id:', treeData.id);
          console.log('treeData.id type:', typeof treeData.id);
          
          if (!treeData.id) {
            console.error('Tree ID eksik!', treeData);
            return; // Bu ağacı atla
          }
          
          trees.push(treeData);
          console.log('Ağaç yüklendi:', treeData.name, 'ID:', treeData.id);
        });
        console.log('Toplam', trees.length, 'ağaç yüklendi');
        this.renderTrees();
        this.updateStats();
      }, (error) => {
        console.error('onSnapshot error:', error);
      });
    } catch (error) {
      console.error('Ağaçlar yüklenirken hata:', error);
    }
  }

  renderTrees() {
    console.log('Rendering trees:', trees.length, 'trees');
    
    // Mevcut ağaçları temizle
    const treesContainer = document.getElementById('trees-container');
    if (!treesContainer) {
      console.error('trees-container not found!');
      return;
    }
    
    const existingTrees = treesContainer.querySelectorAll('.tree');
    existingTrees.forEach(tree => tree.remove());

    // Yeni ağaçları ekle
    trees.forEach(tree => {
      const treeElement = this.createTreeElement(tree);
      if (treeElement) {
        treesContainer.appendChild(treeElement);
        console.log('Added tree:', tree.name, 'at position:', tree.x, tree.y);
      } else {
        console.error('Tree element oluşturulamadı:', tree);
      }
    });
    
    // Hayvanları yeniden spawn et (eğer orman görünümündeyse)
    if (!document.getElementById('forest-view').classList.contains('hidden')) {
      this.spawnAnimals();
      
      // Olgun ağaçlara kuş ekle
      trees.forEach(tree => {
        if (tree && tree.id && tree.growthStage >= 5) {
          this.addBirdToMatureTree(tree);
        }
      });
    }
  }

  createTreeElement(tree) {
    if (!tree || !tree.id) {
      console.error('createTreeElement: Tree veya tree.id eksik!', tree);
      return null;
    }
    
    const treeDiv = document.createElement('div');
    treeDiv.className = 'tree';
    treeDiv.dataset.treeId = tree.id;
    treeDiv.dataset.type = tree.type;
    
    const treeType = treeTypes[tree.type] || treeTypes.pine;
    
    // E-posta adresi varsa, sadece @ işaretinden önceki kısmı al
    let ownerName = tree.userName;
    if (ownerName && ownerName.includes('@')) {
      ownerName = ownerName.split('@')[0];
    }
    
    treeDiv.innerHTML = `
      <div class="tree-icon">${treeType.emoji}</div>
      <div class="tree-label">
        <strong>${tree.name}</strong><br>
        <small>Diken: ${ownerName || 'Bilinmeyen'}</small>
      </div>
    `;
    
    // Pozisyonu ayarla
    treeDiv.style.left = `${tree.x}px`;
    treeDiv.style.top = `${tree.y}px`;
    
    // Rastgele küçük dönüş efekti
    const rotation = (Math.random() - 0.5) * 10; // -5 ile +5 derece arası
    treeDiv.style.transform = `rotate(${rotation}deg)`;
    
    // Click event
    treeDiv.addEventListener('click', () => {
      this.showTreeInfo(tree);
    });
    
    // Hover ses efekti
    treeDiv.addEventListener('mouseenter', () => {
      soundManager.hover();
    });
    
    return treeDiv;
  }

  updateStats() {
    document.getElementById('tree-count').textContent = trees.length;
    document.getElementById('user-count').textContent = this.getUniqueUsers().length;
  }

  getUniqueUsers() {
    const users = trees.map(tree => tree.userId);
    return [...new Set(users)];
  }

  formatDate(date) {
    if (!date) return 'Bilinmiyor';
    
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  initForestView() {
    // Canvas boyutunu ayarla
    this.resizeCanvas();
    
    // Kamera pozisyonunu sıfırla
    this.resetView();
    
    // Hayvan sistemini başlat
    this.initAnimalSystem();
    
    // Window resize listener
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  resizeCanvas() {
    const container = forestContainer.parentElement;
    const rect = container.getBoundingClientRect();
    forestContainer.style.width = `${rect.width}px`;
    forestContainer.style.height = `${rect.height}px`;
  }

  startDrag(e) {
    isDragging = true;
    lastMousePos = { x: e.clientX, y: e.clientY };
    forestContainer.style.cursor = 'grabbing';
  }

  drag(e) {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    this.camera.x += deltaX;
    this.camera.y += deltaY;
    
    this.updateCamera();
    
    lastMousePos = { x: e.clientX, y: e.clientY };
  }

  endDrag() {
    isDragging = false;
    forestContainer.style.cursor = 'grab';
  }

  handleWheel(e) {
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    this.camera.zoom = Math.max(0.5, Math.min(3, this.camera.zoom * zoomFactor));
    this.updateCamera();
  }

  zoomIn() {
    this.camera.zoom = Math.min(3, this.camera.zoom * 1.2);
    this.updateCamera();
  }

  zoomOut() {
    this.camera.zoom = Math.max(0.5, this.camera.zoom * 0.8);
    this.updateCamera();
  }

  resetView() {
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.updateCamera();
  }

  updateCamera() {
    forestContainer.style.transform = `translate(${this.camera.x}px, ${this.camera.y}px) scale(${this.camera.zoom})`;
  }

  showPlantTreeModal() {
    plantTreeModal.classList.remove('hidden');
  }

  hidePlantTreeModal() {
    plantTreeModal.classList.add('hidden');
    document.getElementById('plant-tree-form').reset();
  }

  async handlePlantTree() {
    const name = document.getElementById('tree-name').value;
    const message = document.getElementById('tree-message').value;
    const type = document.getElementById('tree-type').value;

    // Rastgele pozisyon (forest container boyutuna göre)
    const container = document.getElementById('forest-container');
    const rect = container.getBoundingClientRect();
    const x = Math.random() * (rect.width - 100) + 50;
    const y = Math.random() * (rect.height - 100) + 50;

    // Yeni plantTree metodunu kullan
    await this.plantTree({
      name,
      message,
      type,
      x,
      y
    });

    this.hidePlantTreeModal();
    
    // Harita istatistiklerini güncelle
    this.loadCityStats();
  }

  showTreeInfo(tree) {
    console.log('showTreeInfo çağrıldı, tree objesi:', tree);
    console.log('tree.id:', tree.id);
    console.log('tree.id type:', typeof tree.id);
    
    if (!tree || !tree.id) {
      console.error('showTreeInfo: Tree veya tree.id eksik!', tree);
      this.showError('Ağaç bilgisi eksik, lütfen tekrar deneyin');
      return;
    }
    
    this.currentTree = tree;
    
    document.getElementById('tree-info-name').textContent = tree.name;
    document.getElementById('tree-info-date').textContent = this.formatDate(tree.createdAt);
    document.getElementById('tree-info-message').textContent = tree.message || 'Bu ağaç sevgiyle dikildi! 🌱';
    document.getElementById('tree-info-owner').textContent = tree.userName;
    
    // Ağaç istatistiklerini güncelle
    this.updateTreeStats(tree);
    
    // Sosyal özellikleri yükle
    this.loadSocialFeatures(tree);
    
    // Ağaç bilgilerini göster
    document.getElementById('tree-info-modal').classList.remove('hidden');
    
    // Hava durumu bilgilerini ekle
    if (tree.plantedWeather && tree.plantedSeason) {
      const weatherInfo = document.createElement('div');
      weatherInfo.className = 'tree-weather-info';
      weatherInfo.innerHTML = `
        <div class="weather-detail">
          <span>🌤️ Dikildiği Hava: ${this.getWeatherDescription(tree.plantedWeather)}</span>
        </div>
        <div class="weather-detail">
          <span>🌱 Dikildiği Mevsim: ${this.getSeasonDescription(tree.plantedSeason)}</span>
        </div>
        <div class="weather-detail">
          <span>🌡️ Sıcaklık: ${tree.plantedTemperature}°C</span>
        </div>
      `;
      
      const treeInfoContent = document.querySelector('.tree-info-content');
      const existingWeatherInfo = treeInfoContent.querySelector('.tree-weather-info');
      if (existingWeatherInfo) {
        existingWeatherInfo.remove();
      }
      treeInfoContent.insertBefore(weatherInfo, treeInfoContent.firstChild);
    }
  }

  getWeatherDescription(weather) {
    const descriptions = {
      sunny: 'Güneşli',
      cloudy: 'Bulutlu',
      rainy: 'Yağmurlu',
      stormy: 'Fırtınalı',
      foggy: 'Sisli'
    };
    return descriptions[weather] || weather;
  }

  getSeasonDescription(season) {
    const descriptions = {
      spring: 'İlkbahar',
      summer: 'Yaz',
      autumn: 'Sonbahar',
      winter: 'Kış'
    };
    return descriptions[season] || season;
  }

  hideTreeInfoModal() {
    treeInfoModal.classList.add('hidden');
  }

  backToMap() {
    // Orman görünümünü gizle, şehir seçimini göster
    forestView.classList.add('hidden');
    citySelection.classList.remove('hidden');
    
    // Şehir verilerini güncelle
    currentCity = null;
    trees = [];
    
    // Harita istatistiklerini yenile
    this.loadCityStats();
    
    // Smooth geçiş efekti
    gsap.fromTo(citySelection, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }

  showError(message) {
    console.error('Error:', message);
    toast.error(message);
    soundManager.error();
  }

  showSuccess(message) {
    console.log('Success:', message);
    toast.success(message);
  }

  showWarning(message) {
    console.warn('Warning:', message);
    toast.warning(message);
  }

  showInfo(message) {
    console.info('Info:', message);
    toast.info(message);
  }

  toggleSound() {
    const isEnabled = soundManager.toggle();
    const button = document.getElementById('sound-toggle-btn');
    const status = document.getElementById('sound-status');
    const icon = button.querySelector('.icon');
    
    if (isEnabled) {
      icon.textContent = '🔊';
      status.textContent = 'Ses Açık';
      soundManager.click(); // Test sesi
    } else {
      icon.textContent = '🔇';
      status.textContent = 'Ses Kapalı';
    }
  }

  async showProfile() {
    if (!currentUser) return;
    
    soundManager.click();
    
    // Modal'ı göster
    const modal = document.getElementById('profile-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'block';
    
    // Profil bilgilerini doldur
    await this.loadProfileData();
    
    // Animasyon
    gsap.fromTo(modal.querySelector('.modal-content'), 
      { opacity: 0, scale: 0.9 }, 
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    );
  }

  hideProfile() {
    const modal = document.getElementById('profile-modal');
    
    gsap.to(modal.querySelector('.modal-content'), {
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
    });
  }

  async loadProfileData() {
    try {
      // Kullanıcı bilgileri
      const userName = this.getUserDisplayName(currentUser);
      document.getElementById('profile-name').textContent = userName;
      document.getElementById('profile-email').textContent = currentUser.email;
      
      // Avatar emojisini ismin ilk harfine göre ayarla veya emoji kullan
      const avatar = userName.charAt(0).toUpperCase() || '👤';
      document.getElementById('user-avatar').textContent = avatar;
      
      // Katılım tarihi (Firebase creation time kullanılabilir)
      const joinDate = currentUser.metadata.creationTime ? 
        new Date(currentUser.metadata.creationTime).toLocaleDateString('tr-TR') : 
        new Date().toLocaleDateString('tr-TR');
      document.getElementById('profile-join-date').textContent = `Katılım: ${joinDate}`;
      
      // Kullanıcının ağaçlarını al
      const userTrees = await this.getUserTrees();
      
      // İstatistikleri hesapla
      const stats = this.calculateUserStats(userTrees);
      
      // İstatistikleri güncelle
      document.getElementById('total-trees').textContent = stats.totalTrees;
      document.getElementById('total-cities').textContent = stats.totalCities;
      document.getElementById('days-active').textContent = stats.daysActive;
      document.getElementById('achievements-count').textContent = stats.achievements;
      
      // Şehirlere göre ağaçları göster
      this.renderTreesByCity(stats.treesByCity);
      
      // Son dikilen ağaçları göster
      this.renderRecentTrees(userTrees.slice(-10).reverse());
      
      // Başarımları göster
      this.renderAchievements(stats);
      
    } catch (error) {
      console.error('Profil verileri yüklenirken hata:', error);
      this.showError('Profil verileri yüklenirken bir hata oluştu');
    }
  }

  async getUserTrees() {
    const treesRef = collection(db, 'trees');
    const q = query(treesRef, where('userId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    const userTrees = [];
    querySnapshot.forEach((doc) => {
      userTrees.push({ id: doc.id, ...doc.data() });
    });
    
    return userTrees;
  }

  calculateUserStats(userTrees) {
    const treesByCity = {};
    const treeDates = [];
    
    userTrees.forEach(tree => {
      // Şehirlere göre grupla
      if (!treesByCity[tree.city]) {
        treesByCity[tree.city] = 0;
      }
      treesByCity[tree.city]++;
      
      // Tarih analizi için
      if (tree.createdAt) {
        const date = tree.createdAt.toDate ? tree.createdAt.toDate() : new Date(tree.createdAt);
        treeDates.push(date);
      }
    });
    
    // Aktif gün sayısını hesapla (farklı günlerde ağaç dikme)
    const uniqueDates = [...new Set(treeDates.map(date => date.toDateString()))];
    
    // Başarım sayısını hesapla
    const achievements = this.calculateAchievements(userTrees.length, Object.keys(treesByCity).length);
    
    return {
      totalTrees: userTrees.length,
      totalCities: Object.keys(treesByCity).length,
      daysActive: uniqueDates.length,
      achievements: achievements.length,
      treesByCity: treesByCity
    };
  }

  calculateAchievements(totalTrees, totalCities) {
    const achievements = [];
    
    if (totalTrees >= 1) achievements.push('first-tree');
    if (totalTrees >= 5) achievements.push('tree-planter');
    if (totalTrees >= 10) achievements.push('forest-keeper');
    if (totalTrees >= 25) achievements.push('tree-master');
    if (totalTrees >= 50) achievements.push('forest-guardian');
    if (totalTrees >= 100) achievements.push('eco-hero');
    
    if (totalCities >= 3) achievements.push('city-explorer');
    if (totalCities >= 5) achievements.push('region-explorer');
    if (totalCities >= 10) achievements.push('country-explorer');
    
    return achievements;
  }

  renderTreesByCity(treesByCity) {
    const container = document.getElementById('trees-by-city');
    container.innerHTML = '';
    
    Object.entries(treesByCity)
      .sort(([,a], [,b]) => b - a) // En çok ağacı olan şehirler önce
      .forEach(([cityName, count]) => {
        const cityCard = document.createElement('div');
        cityCard.className = 'city-tree-card';
        cityCard.innerHTML = `
          <div class="city-tree-header">
            <span class="city-name">${cityName}</span>
            <span class="city-tree-count">${count} ağaç</span>
          </div>
          <div class="city-tree-progress">
            <div class="progress-bar" style="width: ${Math.min(count * 10, 100)}%"></div>
          </div>
        `;
        
        cityCard.addEventListener('click', () => {
          // Şehre git
          this.selectCity(cityName);
          this.hideProfile();
        });
        
        container.appendChild(cityCard);
      });
    
    if (Object.keys(treesByCity).length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Henüz ağaç dikmemişsiniz. İlk ağacınızı dikmek için bir şehir seçin!</p>';
    }
  }

  renderRecentTrees(recentTrees) {
    const container = document.getElementById('recent-trees');
    container.innerHTML = '';
    
    recentTrees.forEach(tree => {
      const treeItem = document.createElement('div');
      treeItem.className = 'recent-tree-item';
      
      const date = tree.createdAt ? 
        (tree.createdAt.toDate ? tree.createdAt.toDate() : new Date(tree.createdAt)) : 
        new Date();
      
      treeItem.innerHTML = `
        <div class="recent-tree-icon">${this.getTreeEmoji(tree.type)}</div>
        <div class="recent-tree-info">
          <div class="recent-tree-name">${tree.name || 'İsimsiz Ağaç'}</div>
          <div class="recent-tree-meta">${tree.city} • ${date.toLocaleDateString('tr-TR')}</div>
        </div>
      `;
      
      treeItem.addEventListener('click', () => {
        // Ağaca git
        this.selectCity(tree.city);
        this.hideProfile();
        // Tree'ye focus yapılabilir
      });
      
      container.appendChild(treeItem);
    });
    
    if (recentTrees.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Henüz ağaç dikmemişsiniz.</p>';
    }
  }

  renderAchievements(stats) {
    const container = document.getElementById('user-achievements');
    container.innerHTML = '';
    
    const allAchievements = [
      { id: 'first-tree', icon: '🌱', title: 'İlk Ağaç', description: 'İlk ağacınızı diktin', requirement: 1 },
      { id: 'tree-planter', icon: '🌿', title: 'Ağaç Dikici', description: '5 ağaç diktin', requirement: 5 },
      { id: 'forest-keeper', icon: '🌳', title: 'Orman Bekçisi', description: '10 ağaç diktin', requirement: 10 },
      { id: 'tree-master', icon: '🎋', title: 'Ağaç Ustası', description: '25 ağaç diktin', requirement: 25 },
      { id: 'forest-guardian', icon: '🌲', title: 'Orman Koruyucusu', description: '50 ağaç diktin', requirement: 50 },
      { id: 'eco-hero', icon: '🏆', title: 'Ekoloji Kahramanı', description: '100 ağaç diktin', requirement: 100 },
      { id: 'city-explorer', icon: '🏙️', title: 'Şehir Kaşifi', description: '3 farklı şehirde ağaç diktin', requirement: 3, type: 'city' },
      { id: 'region-explorer', icon: '🗺️', title: 'Bölge Kaşifi', description: '5 farklı şehirde ağaç diktin', requirement: 5, type: 'city' },
      { id: 'country-explorer', icon: '🇹🇷', title: 'Ülke Kaşifi', description: '10 farklı şehirde ağaç diktin', requirement: 10, type: 'city' }
    ];
    
    const userAchievements = this.calculateAchievements(stats.totalTrees, stats.totalCities);
    
    allAchievements.forEach(achievement => {
      const isUnlocked = userAchievements.includes(achievement.id);
      const currentValue = achievement.type === 'city' ? stats.totalCities : stats.totalTrees;
      
      const achievementCard = document.createElement('div');
      achievementCard.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      
      achievementCard.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
        ${!isUnlocked ? `<div class="achievement-progress">${currentValue}/${achievement.requirement}</div>` : ''}
      `;
      
      container.appendChild(achievementCard);
    });
  }

  getTreeEmoji(type) {
    const emojis = {
      'meşe': '🌳',
      'çam': '🌲',
      'kavak': '🌿',
      'çınar': '🍃',
      'default': '🌱'
    };
    return emojis[type] || emojis.default;
  }

  async checkAchievements() {
    try {
      // Kullanıcının tüm ağaçlarını al
      const userTrees = await this.getUserTrees();
      const stats = this.calculateUserStats(userTrees);
      
      // Mevcut başarımları kontrol et
      const currentAchievements = this.calculateAchievements(stats.totalTrees, stats.totalCities);
      
      // Daha önce elde edilen başarımları localStorage'dan al
      const storedAchievements = JSON.parse(localStorage.getItem(`achievements_${currentUser.uid}`) || '[]');
      
      // Yeni başarımları bul
      const newAchievements = currentAchievements.filter(achievement => 
        !storedAchievements.includes(achievement)
      );
      
      // Yeni başarımları göster
      if (newAchievements.length > 0) {
        newAchievements.forEach((achievementId, index) => {
          setTimeout(() => {
            this.showAchievementNotification(achievementId);
          }, index * 1000); // Her başarımı 1 saniye arayla göster
        });
        
        // Başarımları localStorage'a kaydet
        localStorage.setItem(`achievements_${currentUser.uid}`, JSON.stringify(currentAchievements));
      }
    } catch (error) {
      console.error('Başarım kontrolü yapılırken hata:', error);
    }
  }

  showAchievementNotification(achievementId) {
    const achievements = {
      'first-tree': { icon: '🌱', title: 'İlk Ağaç', description: 'İlk ağacınızı diktin!' },
      'tree-planter': { icon: '🌿', title: 'Ağaç Dikici', description: '5 ağaç diktin!' },
      'forest-keeper': { icon: '🌳', title: 'Orman Bekçisi', description: '10 ağaç diktin!' },
      'tree-master': { icon: '🎋', title: 'Ağaç Ustası', description: '25 ağaç diktin!' },
      'forest-guardian': { icon: '🌲', title: 'Orman Koruyucusu', description: '50 ağaç diktin!' },
      'eco-hero': { icon: '🏆', title: 'Ekoloji Kahramanı', description: '100 ağaç diktin!' },
      'city-explorer': { icon: '🏙️', title: 'Şehir Kaşifi', description: '3 farklı şehirde ağaç diktin!' },
      'region-explorer': { icon: '🗺️', title: 'Bölge Kaşifi', description: '5 farklı şehirde ağaç diktin!' },
      'country-explorer': { icon: '🇹🇷', title: 'Ülke Kaşifi', description: '10 farklı şehirde ağaç diktin!' }
    };
    
    const achievement = achievements[achievementId];
    if (!achievement) return;
    
    // Başarım bildirimi göster
    this.createAchievementPopup(achievement);
    
    // Ses efekti
    soundManager.success();
    
    // Toast bildirimi
    toast.success(achievement.description, {
      title: `🏆 ${achievement.title} Başarımı Kazandın!`,
      duration: 6000
    });
  }

  createAchievementPopup(achievement) {
    // Başarım popup'ı oluştur
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
      <div class="achievement-popup-content">
        <div class="achievement-popup-icon">${achievement.icon}</div>
        <div class="achievement-popup-text">
          <div class="achievement-popup-title">Başarım Kazandın!</div>
          <div class="achievement-popup-name">${achievement.title}</div>
          <div class="achievement-popup-desc">${achievement.description}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Animasyon
    gsap.fromTo(popup, 
      { 
        opacity: 0, 
        y: -100, 
        scale: 0.8 
      }, 
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.6,
        ease: "back.out(1.7)"
      }
    );
    
    // 4 saniye sonra kaldır
    setTimeout(() => {
      gsap.to(popup, {
        opacity: 0,
        y: -50,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          document.body.removeChild(popup);
        }
      });
    }, 4000);
  }

  updateTreeStats(tree) {
    // Varsayılan değerler (eski ağaçlar için)
    const waterLevel = tree.waterLevel || 100;
    const healthLevel = tree.healthLevel || 100;
    const growthStage = tree.growthStage || 1;
    const totalCareCount = tree.totalCareCount || 0;
    
    // Su seviyesi güncelle
    const waterBar = document.getElementById('water-level-bar');
    const waterText = document.getElementById('water-level-text');
    waterBar.style.width = `${waterLevel}%`;
    waterText.textContent = `${waterLevel}%`;
    
    // Sağlık seviyesi güncelle
    const healthBar = document.getElementById('health-level-bar');
    const healthText = document.getElementById('health-level-text');
    healthBar.style.width = `${healthLevel}%`;
    healthText.textContent = `${healthLevel}%`;
    
    // Büyüme aşaması güncelle
    document.getElementById('growth-stage-text').textContent = `Aşama ${growthStage}/5`;
    this.updateGrowthIcons(growthStage);
    
    // Bakım geçmişi güncelle
    document.getElementById('total-care-count').textContent = totalCareCount;
    
    // Son sulama zamanı
    if (tree.lastWatered) {
      const lastWatered = tree.lastWatered.toDate ? tree.lastWatered.toDate() : new Date(tree.lastWatered);
      document.getElementById('last-watered').textContent = this.formatRelativeTime(lastWatered);
    } else {
      document.getElementById('last-watered').textContent = 'Hiç sulanmamış';
    }
    
    // Son bakım zamanı
    if (tree.lastCaredFor) {
      const lastCared = tree.lastCaredFor.toDate ? tree.lastCaredFor.toDate() : new Date(tree.lastCaredFor);
      document.getElementById('last-cared').textContent = this.formatRelativeTime(lastCared);
    } else {
      document.getElementById('last-cared').textContent = 'Hiç bakım yapılmamış';
    }
  }

  updateGrowthIcons(stage) {
    const container = document.getElementById('growth-icons');
    container.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
      const icon = document.createElement('div');
      icon.className = `growth-icon ${i <= stage ? 'completed' : ''}`;
      icon.textContent = i <= stage ? '✓' : i;
      container.appendChild(icon);
    }
  }

  updateActionButtons(tree) {
    const waterBtn = document.getElementById('water-tree');
    const careBtn = document.getElementById('care-tree');
    const fertilizeBtn = document.getElementById('fertilize-tree');
    
    // Kullanıcı sadece kendi ağaçlarını bakabilir
    const isOwner = tree.userId === currentUser?.uid;
    
    waterBtn.disabled = !isOwner;
    careBtn.disabled = !isOwner;
    fertilizeBtn.disabled = !isOwner;
    
    if (!isOwner) {
      waterBtn.title = 'Sadece kendi ağaçlarınızı sulayabilirsiniz';
      careBtn.title = 'Sadece kendi ağaçlarınıza bakım yapabilirsiniz';
      fertilizeBtn.title = 'Sadece kendi ağaçlarınızı gübreleyebilirsiniz';
    } else {
      // Cooldown kontrolü
      const now = new Date();
      
      if (tree.lastWatered) {
        const lastWatered = tree.lastWatered.toDate ? tree.lastWatered.toDate() : new Date(tree.lastWatered);
        const hoursSinceWater = (now - lastWatered) / (1000 * 60 * 60);
        if (hoursSinceWater < 24) {
          waterBtn.disabled = true;
          waterBtn.title = `${Math.ceil(24 - hoursSinceWater)} saat sonra tekrar sulayabilirsiniz`;
        } else {
          waterBtn.title = 'Ağacınızı sulayın';
        }
      }
      
      if (tree.lastCaredFor) {
        const lastCared = tree.lastCaredFor.toDate ? tree.lastCaredFor.toDate() : new Date(tree.lastCaredFor);
        const hoursSinceCare = (now - lastCared) / (1000 * 60 * 60);
        if (hoursSinceCare < 48) {
          careBtn.disabled = true;
          careBtn.title = `${Math.ceil(48 - hoursSinceCare)} saat sonra tekrar bakım yapabilirsiniz`;
        } else {
          careBtn.title = 'Ağacınıza bakım yapın';
        }
      }
      
      fertilizeBtn.title = 'Ağacınızı gübreleyerek hızlı büyütün';
    }
  }

  formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} gün önce`;
    } else if (hours > 0) {
      return `${hours} saat önce`;
    } else {
      return 'Az önce';
    }
  }

  async waterTree() {
    if (!this.currentTree || !currentUser) return;
    
    try {
      console.log('waterTree çağrıldı, currentTree:', this.currentTree);
      console.log('currentTree.id:', this.currentTree.id);
      console.log('currentTree type:', typeof this.currentTree.id);
      
      if (!this.currentTree.id) {
        console.error('Tree ID bulunamadı!');
        this.showError('Ağaç bilgisi eksik, lütfen tekrar deneyin');
        return;
      }
      
      soundManager.click();
      

      
      // Firestore'da ağacı güncelle
      const treeRef = doc(db, 'trees', this.currentTree.id);
      const updates = {
        waterLevel: Math.min(100, (this.currentTree.waterLevel || 50) + 30),
        healthLevel: Math.min(100, (this.currentTree.healthLevel || 50) + 10),
        lastWatered: new Date(),
        totalCareCount: (this.currentTree.totalCareCount || 0) + 1
      };
      
      await updateDoc(treeRef, updates);
      
      // Yerel ağaç objesini güncelle
      Object.assign(this.currentTree, updates);
      
      // UI'yi güncelle
      this.updateTreeStats(this.currentTree);
      this.updateActionButtons(this.currentTree);
      
      // Başarı efekti
      toast.success('Ağacınızı suladınız! Su seviyesi arttı.', {
        title: '💧 Sulama Başarılı',
        duration: 3000
      });
      
      // Ağaç animasyonu
      this.animateTreeCare('water');
      
    } catch (error) {
      console.error('Sulama hatası:', error);
      this.showError('Ağaç sulanırken bir hata oluştu');
    }
  }

  async careForTree() {
    if (!this.currentTree || !currentUser) return;
    
    try {
      console.log('careForTree çağrıldı, currentTree:', this.currentTree);
      console.log('currentTree.id:', this.currentTree.id);
      console.log('currentTree type:', typeof this.currentTree.id);
      
      if (!this.currentTree.id) {
        console.error('Tree ID bulunamadı!');
        this.showError('Ağaç bilgisi eksik, lütfen tekrar deneyin');
        return;
      }
      
      soundManager.click();
      

      
      // Firestore'da ağacı güncelle
      const treeRef = doc(db, 'trees', this.currentTree.id);
      const updates = {
        healthLevel: Math.min(100, (this.currentTree.healthLevel || 50) + 20),
        lastCaredFor: new Date(),
        totalCareCount: (this.currentTree.totalCareCount || 0) + 1
      };
      
      // Büyüme şansı (sağlık 80+ ise)
      if (updates.healthLevel >= 80 && this.currentTree.growthStage < 5) {
        const growthChance = Math.random();
        if (growthChance < 0.3) { // %30 şans
          updates.growthStage = (this.currentTree.growthStage || 1) + 1;
        }
      }
      
      await updateDoc(treeRef, updates);
      
      // Yerel ağaç objesini güncelle
      Object.assign(this.currentTree, updates);
      
      // UI'yi güncelle
      this.updateTreeStats(this.currentTree);
      this.updateActionButtons(this.currentTree);
      
      // Ağaç büyüdüyse kuş ekle
      if (updates.growthStage && this.currentTree.growthStage >= 5) {
        this.addBirdToMatureTree(this.currentTree);
      }
      
      // Başarı efekti
      const message = updates.growthStage ? 'Ağacınız büyüdü ve yeni aşamaya geçti!' : 'Ağacınıza bakım yaptınız! Sağlık seviyesi arttı.';
      toast.success(message, {
        title: '🌿 Bakım Başarılı',
        duration: 4000
      });
      
      // Ağaç animasyonu
      this.animateTreeCare('care');
      
    } catch (error) {
      console.error('Bakım hatası:', error);
      this.showError('Ağaca bakım yapılırken bir hata oluştu');
    }
  }

  async fertilizeTree() {
    if (!this.currentTree || !currentUser) return;
    
    try {
      console.log('fertilizeTree çağrıldı, currentTree:', this.currentTree);
      console.log('currentTree.id:', this.currentTree.id);
      console.log('currentTree type:', typeof this.currentTree.id);
      
      if (!this.currentTree.id) {
        console.error('Tree ID bulunamadı!');
        this.showError('Ağaç bilgisi eksik, lütfen tekrar deneyin');
        return;
      }
      
      soundManager.click();
      

      
      // Firestore'da ağacı güncelle
      const treeRef = doc(db, 'trees', this.currentTree.id);
      const updates = {
        waterLevel: 100,
        healthLevel: 100,
        growthStage: Math.min(5, (this.currentTree.growthStage || 1) + 1),
        lastWatered: new Date(),
        lastCaredFor: new Date(),
        totalCareCount: (this.currentTree.totalCareCount || 0) + 1
      };
      
      await updateDoc(treeRef, updates);
      
      // Yerel ağaç objesini güncelle
      Object.assign(this.currentTree, updates);
      
      // UI'yi güncelle
      this.updateTreeStats(this.currentTree);
      this.updateActionButtons(this.currentTree);
      
      // Ağaç büyüdüyse kuş ekle
      if (updates.growthStage && this.currentTree.growthStage >= 5) {
        this.addBirdToMatureTree(this.currentTree);
      }
      
      // Başarı efekti
      toast.success('Gübreleme başarılı! Ağacınız hızla büyüdü.', {
        title: '🌱 Güçlü Gübreleme',
        duration: 4000
      });
      
      // Ağaç animasyonu
      this.animateTreeCare('fertilize');
      
    } catch (error) {
      console.error('Gübreleme hatası:', error);
      this.showError('Gübreleme yapılırken bir hata oluştu');
    }
  }

  animateTreeCare(action) {
    console.log('animateTreeCare çağrıldı, action:', action);
    console.log('this.currentTree:', this.currentTree);
    console.log('this.currentTree.id:', this.currentTree?.id);
    
    if (!this.currentTree || !this.currentTree.id) {
      console.error('animateTreeCare: currentTree veya ID eksik!');
      return;
    }
    
    // Görsel ağaç elementini bul
    const treeElement = document.querySelector(`[data-tree-id="${this.currentTree.id}"]`);
    if (!treeElement) {
      console.error('animateTreeCare: Tree element bulunamadı, ID:', this.currentTree.id);
      return;
    }
    
    switch (action) {
      case 'water':
        // Su damlası efekti
        gsap.fromTo(treeElement, 
          { filter: 'hue-rotate(0deg) brightness(1)' },
          { 
            filter: 'hue-rotate(180deg) brightness(1.2)', 
            duration: 0.5, 
            yoyo: true, 
            repeat: 1 
          }
        );
        break;
      
      case 'care':
        // Yeşil parlaklık efekti
        gsap.fromTo(treeElement, 
          { scale: 1 },
          { 
            scale: 1.1, 
            duration: 0.3, 
            yoyo: true, 
            repeat: 1,
            ease: "power2.inOut"
          }
        );
        break;
      
      case 'fertilize':
        // Büyüme efekti
        gsap.fromTo(treeElement, 
          { scale: 1, rotation: 0 },
          { 
            scale: 1.2, 
            rotation: 5,
            duration: 0.6, 
            yoyo: true, 
            repeat: 1,
            ease: "back.inOut(1.7)"
          }
        );
        break;
    }
  }

  // Sosyal özellikler
  async loadSocialFeatures(tree) {
    // Beğeni sayısını yükle
    await this.loadLikes(tree.id);
    
    // Yorumları yükle
    await this.loadComments(tree.id);
    
    // Kullanıcının beğenip beğenmediğini kontrol et
    this.checkUserLike(tree.id);
  }

  async loadLikes(treeId) {
    try {
      const likesQuery = query(collection(db, 'likes'), where('treeId', '==', treeId));
      const likesSnapshot = await getDocs(likesQuery);
      const likeCount = likesSnapshot.size;
      
      document.getElementById('like-count').textContent = likeCount;
    } catch (error) {
      console.error('Beğeni yükleme hatası:', error);
      document.getElementById('like-count').textContent = '0';
    }
  }

  async loadComments(treeId) {
    try {
      const commentsQuery = query(
        collection(db, 'comments'), 
        where('treeId', '==', treeId),
        orderBy('createdAt', 'desc')
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const commentsContainer = document.getElementById('comments-container');
      commentsContainer.innerHTML = '';
      
      if (commentsSnapshot.empty) {
        commentsContainer.innerHTML = '<p class="no-comments">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
        return;
      }
      
      commentsSnapshot.forEach(doc => {
        const comment = doc.data();
        const commentElement = this.createCommentElement(comment);
        commentsContainer.appendChild(commentElement);
      });
    } catch (error) {
      console.error('Yorum yükleme hatası:', error);
      document.getElementById('comments-container').innerHTML = '<p class="error">Yorumlar yüklenirken hata oluştu.</p>';
    }
  }

  createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    
    const date = comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt);
    
    commentDiv.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${comment.userName || 'Anonim'}</span>
        <span class="comment-date">${this.formatRelativeTime(date)}</span>
      </div>
      <div class="comment-text">${this.escapeHtml(comment.text)}</div>
    `;
    
    return commentDiv;
  }

  checkUserLike(treeId) {
    if (!currentUser) return;
    
    const likeBtn = document.getElementById('like-tree');
    const userLikesRef = doc(db, 'likes', `${currentUser.uid}_${treeId}`);
    
    getDoc(userLikesRef).then(doc => {
      if (doc.exists()) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('.icon-like').textContent = '❤️';
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('.icon-like').textContent = '🤍';
      }
    }).catch(error => {
      console.error('Beğeni kontrol hatası:', error);
    });
  }

  async likeTree() {
    if (!currentUser || !this.currentTree) return;
    
    try {
      soundManager.click();
      
      const treeId = this.currentTree.id;
      const userLikesRef = doc(db, 'likes', `${currentUser.uid}_${treeId}`);
      const likeDoc = await getDoc(userLikesRef);
      
      if (likeDoc.exists()) {
        // Beğeniyi kaldır
        await deleteDoc(userLikesRef);
        document.getElementById('like-tree').classList.remove('liked');
        document.getElementById('like-tree').querySelector('.icon-like').textContent = '🤍';
        
        toast.success('Beğeniniz kaldırıldı', {
          title: '💔 Beğeni Kaldırıldı',
          duration: 2000
        });
      } else {
        // Beğeni ekle
        await setDoc(userLikesRef, {
          userId: currentUser.uid,
          treeId: treeId,
          userName: currentUser.displayName || 'Kullanıcı',
          createdAt: new Date()
        });
        
        document.getElementById('like-tree').classList.add('liked');
        document.getElementById('like-tree').querySelector('.icon-like').textContent = '❤️';
        
        toast.success('Ağacı beğendiniz!', {
          title: '❤️ Beğenildi',
          duration: 2000
        });
      }
      
      // Beğeni sayısını güncelle
      await this.loadLikes(treeId);
      
    } catch (error) {
      console.error('Beğeni hatası:', error);
      this.showError('Beğeni işlemi sırasında hata oluştu');
    }
  }

  async shareTree() {
    if (!this.currentTree) return;
    
    try {
      soundManager.click();
      
      const shareData = {
        title: `${this.currentTree.name} - Sanal Orman`,
        text: `${this.currentTree.userName} tarafından dikilen "${this.currentTree.name}" ağacını görüntüleyin!`,
        url: `${window.location.origin}?tree=${this.currentTree.id}`
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Ağaç başarıyla paylaşıldı!', {
          title: '📤 Paylaşıldı',
          duration: 3000
        });
      } else {
        // Fallback: URL'yi panoya kopyala
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Ağaç linki panoya kopyalandı!', {
          title: '📋 Kopyalandı',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      this.showError('Paylaşım sırasında hata oluştu');
    }
  }

  toggleCommentForm() {
    const commentForm = document.querySelector('.comment-form');
    const commentInput = document.getElementById('comment-input');
    
    if (commentForm.style.display === 'none') {
      commentForm.style.display = 'flex';
      commentInput.focus();
    } else {
      commentForm.style.display = 'none';
      commentInput.value = '';
    }
  }

  async submitComment() {
    if (!currentUser || !this.currentTree) return;
    
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
      this.showError('Lütfen bir yorum yazın');
      return;
    }
    
    if (commentText.length > 200) {
      this.showError('Yorum 200 karakterden uzun olamaz');
      return;
    }
    
    try {
      soundManager.click();
      
      // Yorumu Firestore'a ekle
      await addDoc(collection(db, 'comments'), {
        treeId: this.currentTree.id,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Kullanıcı',
        text: commentText,
        createdAt: new Date()
      });
      
      // Input'u temizle
      commentInput.value = '';
      
      // Yorumları yeniden yükle
      await this.loadComments(this.currentTree.id);
      
      toast.success('Yorumunuz eklendi!', {
        title: '💬 Yorum Eklendi',
        duration: 3000
      });
      
    } catch (error) {
      console.error('Yorum ekleme hatası:', error);
      this.showError('Yorum eklenirken hata oluştu');
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Hava durumu sistemi
  initWeatherSystem() {
    this.updateWeather();
    this.updateSeason();
    
    // Hava durumunu düzenli olarak güncelle
    setInterval(() => {
      this.updateWeather();
    }, this.weatherSystem.weatherDuration);
    
    // Mevsimi düzenli olarak güncelle
    setInterval(() => {
      this.updateSeason();
    }, this.weatherSystem.seasonDuration);
  }

  updateWeather() {
    const weatherTypes = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'];
    const temperatures = {
      sunny: { min: 20, max: 35 },
      cloudy: { min: 15, max: 25 },
      rainy: { min: 10, max: 20 },
      stormy: { min: 8, max: 18 },
      foggy: { min: 5, max: 15 }
    };

    // Mevsime göre sıcaklık ayarlaması
    const seasonTempAdjustment = {
      spring: 0,
      summer: 10,
      autumn: -5,
      winter: -15
    };

    const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    const tempRange = temperatures[newWeather];
    const seasonAdjustment = seasonTempAdjustment[this.weatherSystem.currentSeason];
    
    const oldWeather = this.weatherSystem.currentWeather;
    this.weatherSystem.currentWeather = newWeather;
    this.weatherSystem.temperature = Math.floor(
      Math.random() * (tempRange.max - tempRange.min) + tempRange.min + seasonAdjustment
    );
    this.weatherSystem.lastUpdate = Date.now();

    this.updateWeatherUI();
    this.updateWeatherEffects();
    this.applyWeatherToTrees();

    // Hava durumu değişikliği bildirimi
    if (oldWeather !== newWeather) {
      const weatherDescriptions = {
        sunny: 'Güneşli',
        cloudy: 'Bulutlu',
        rainy: 'Yağmurlu',
        stormy: 'Fırtınalı',
        foggy: 'Sisli'
      };

      toast.info(`Hava durumu değişti: ${weatherDescriptions[newWeather]}`, {
        title: '🌤️ Hava Durumu',
        duration: 4000
      });
    }
  }

  updateSeason() {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = seasons.indexOf(this.weatherSystem.currentSeason);
    const nextIndex = (currentIndex + 1) % seasons.length;
    
    const oldSeason = this.weatherSystem.currentSeason;
    this.weatherSystem.currentSeason = seasons[nextIndex];
    this.updateSeasonUI();
    this.updateSeasonEffects();
    this.applySeasonToTrees();
    this.updateAnimalsForSeason();

    // Mevsim değişikliği bildirimi
    const seasonDescriptions = {
      spring: 'İlkbahar',
      summer: 'Yaz',
      autumn: 'Sonbahar',
      winter: 'Kış'
    };

    toast.success(`Mevsim değişti: ${seasonDescriptions[this.weatherSystem.currentSeason]}`, {
      title: '🌱 Mevsim Değişimi',
      duration: 5000
    });
  }

  updateWeatherUI() {
    const weatherIcons = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      stormy: '⛈️',
      foggy: '🌫️'
    };

    const weatherDescriptions = {
      sunny: 'Güneşli',
      cloudy: 'Bulutlu',
      rainy: 'Yağmurlu',
      stormy: 'Fırtınalı',
      foggy: 'Sisli'
    };

    document.getElementById('weather-icon').textContent = weatherIcons[this.weatherSystem.currentWeather];
    document.getElementById('weather-temp').textContent = `${this.weatherSystem.temperature}°C`;
    document.getElementById('weather-desc').textContent = weatherDescriptions[this.weatherSystem.currentWeather];
  }

  updateSeasonUI() {
    const seasonIcons = {
      spring: '🌱',
      summer: '☀️',
      autumn: '🍂',
      winter: '❄️'
    };

    document.getElementById('season-indicator').textContent = seasonIcons[this.weatherSystem.currentSeason];
  }

  updateWeatherEffects() {
    const forestBackground = document.querySelector('.forest-background');
    const rainContainer = document.getElementById('rain-container');
    const snowContainer = document.getElementById('snow-container');
    const fogContainer = document.getElementById('fog-container');
    const sunRays = document.getElementById('sun-rays');

    // Tüm efektleri kapat
    rainContainer.classList.remove('active');
    snowContainer.classList.remove('active');
    fogContainer.classList.remove('active');
    sunRays.classList.remove('active');

    // Hava durumuna göre efektleri aç
    switch (this.weatherSystem.currentWeather) {
      case 'sunny':
        sunRays.classList.add('active');
        this.createSunRays();
        break;
      case 'rainy':
        if (this.weatherSystem.currentSeason === 'winter') {
          snowContainer.classList.add('active');
          this.createSnow();
        } else {
          rainContainer.classList.add('active');
          this.createRain();
        }
        break;
      case 'stormy':
        if (this.weatherSystem.currentSeason === 'winter') {
          snowContainer.classList.add('active');
          this.createSnow();
        } else {
          rainContainer.classList.add('active');
          this.createRain(true);
        }
        break;
      case 'foggy':
        fogContainer.classList.add('active');
        this.createFog();
        break;
    }
  }

  updateSeasonEffects() {
    const forestBackground = document.querySelector('.forest-background');
    
    // Mevsim sınıflarını kaldır
    forestBackground.classList.remove('spring', 'summer', 'autumn', 'winter');
    
    // Yeni mevsim sınıfını ekle
    forestBackground.classList.add(this.weatherSystem.currentSeason);
  }

  createRain(isStorm = false) {
    const rainContainer = document.getElementById('rain-container');
    rainContainer.innerHTML = '';

    const dropCount = isStorm ? 100 : 50;
    const dropSpeed = isStorm ? 0.8 : 1.2;

    for (let i = 0; i < dropCount; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${dropSpeed + Math.random() * 0.5}s`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      rainContainer.appendChild(drop);
    }
  }

  createSnow() {
    const snowContainer = document.getElementById('snow-container');
    snowContainer.innerHTML = '';

    for (let i = 0; i < 30; i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${3 + Math.random() * 2}s`;
      flake.style.animationDelay = `${Math.random() * 3}s`;
      snowContainer.appendChild(flake);
    }
  }

  createFog() {
    const fogContainer = document.getElementById('fog-container');
    fogContainer.innerHTML = '';

    for (let i = 0; i < 3; i++) {
      const fogLayer = document.createElement('div');
      fogLayer.className = 'fog-layer';
      fogLayer.style.top = `${i * 30}%`;
      fogLayer.style.animationDelay = `${i * 5}s`;
      fogContainer.appendChild(fogLayer);
    }
  }

  createSunRays() {
    const sunRays = document.getElementById('sun-rays');
    sunRays.innerHTML = '';

    for (let i = 0; i < 8; i++) {
      const ray = document.createElement('div');
      ray.className = 'sun-ray';
      ray.style.transform = `rotate(${i * 45}deg)`;
      ray.style.animationDelay = `${i * 0.1}s`;
      sunRays.appendChild(ray);
    }
  }

  applyWeatherToTrees() {
    // Hava durumuna göre ağaçlara etki
    const weatherEffects = {
      sunny: { growthBonus: 1.2, waterConsumption: 1.5 },
      cloudy: { growthBonus: 1.0, waterConsumption: 1.0 },
      rainy: { growthBonus: 1.3, waterConsumption: 0.5 },
      stormy: { growthBonus: 0.8, waterConsumption: 0.3 },
      foggy: { growthBonus: 0.9, waterConsumption: 0.8 }
    };

    const effect = weatherEffects[this.weatherSystem.currentWeather];
    
    // Ağaçları güncelle
    trees.forEach(tree => {
      if (tree && tree.id && tree.waterLevel > 0) {
        tree.waterLevel = Math.max(0, tree.waterLevel - effect.waterConsumption);
        tree.healthLevel = Math.min(100, tree.healthLevel + (effect.growthBonus - 1) * 5);
        
        // Firestore'da güncelle
        this.updateTreeInFirestore(tree);
      }
    });

    // UI'ı güncelle
    this.renderTrees();
  }

  applySeasonToTrees() {
    // Mevsime göre ağaçlara etki
    const seasonEffects = {
      spring: { growthBonus: 1.5, color: '#32CD32' },
      summer: { growthBonus: 1.2, color: '#228B22' },
      autumn: { growthBonus: 0.8, color: '#FFA500' },
      winter: { growthBonus: 0.5, color: '#FFFFFF' }
    };

    const effect = seasonEffects[this.weatherSystem.currentSeason];
    
    // Ağaçları güncelle
    trees.forEach(tree => {
      if (tree && tree.id) {
        tree.healthLevel = Math.min(100, tree.healthLevel + (effect.growthBonus - 1) * 10);
        
        // Firestore'da güncelle
        this.updateTreeInFirestore(tree);
      }
    });

    // UI'ı güncelle
    this.renderTrees();
  }

  updateTreeInFirestore(tree) {
    if (!currentUser) return;
    
    if (!tree || !tree.id) {
      console.error('updateTreeInFirestore: Tree veya tree.id eksik!', tree);
      return;
    }

    const treeRef = doc(db, 'trees', tree.id);
    updateDoc(treeRef, {
      waterLevel: tree.waterLevel,
      healthLevel: tree.healthLevel,
      lastUpdated: new Date()
    }).catch(error => {
      console.error('Ağaç güncelleme hatası:', error);
    });
  }

  async plantTree(treeData) {
    console.log('plantTree çağrıldı:', { treeData, currentUser, currentCity: this.currentCity });
    
    if (!currentUser) {
      console.error('Kullanıcı giriş yapmamış!');
      this.showError('Ağaç dikmek için giriş yapmalısınız');
      return;
    }
    
    if (!this.currentCity) {
      console.error('Şehir seçilmemiş!');
      this.showError('Ağaç dikmek için bir şehir seçmelisiniz');
      return;
    }

    try {
      console.log('Ağaç dikme işlemi başlıyor...');
      soundManager.plantTree();

      const treeDataForFirestore = {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        name: treeData.name,
        message: treeData.message || 'Bu ağaç sevgiyle dikildi! 🌱',
        type: treeData.type,
        cityId: this.currentCity.id,
        cityName: this.currentCity.name,
        x: treeData.x,
        y: treeData.y,
        createdAt: new Date(),
        waterLevel: 100,
        healthLevel: 100,
        growthStage: 1,
        lastWatered: new Date(),
        lastCaredFor: new Date(),
        totalCareCount: 0,
        // Hava durumu bilgileri
        plantedWeather: this.weatherSystem.currentWeather,
        plantedSeason: this.weatherSystem.currentSeason,
        plantedTemperature: this.weatherSystem.temperature
      };

      console.log('Firestore\'a gönderilecek ağaç verisi:', treeDataForFirestore);
      console.log('Firebase db objesi:', db);

      const docRef = await addDoc(collection(db, 'trees'), treeDataForFirestore);
      console.log('Ağaç başarıyla eklendi, docRef:', docRef);
      console.log('Ağaç ID\'si:', docRef.id);

      // onSnapshot listener will automatically update the trees array and render
      // No need to manually update this.trees or call renderTrees()

      toast.success('Ağaç başarıyla dikildi!', {
        title: '🌱 Ağaç Dikildi',
        duration: 3000
      });

      // Başarım kontrolü
      this.checkAchievements();

    } catch (error) {
      console.error('Ağaç dikme hatası detayı:', error);
      console.error('Hata mesajı:', error.message);
      console.error('Hata kodu:', error.code);
      this.showError(`Ağaç dikilirken hata oluştu: ${error.message}`);
    }
  }

  // Hayvan Sistemi
  initAnimalSystem() {
    this.animals = [];
    this.animalSounds = {
      rabbit: ['🐰', '🐰', '🐰'],
      squirrel: ['🐿️', '🐿️', '🐿️'],
      bird: ['🐦', '🐤', '🦅', '🦆', '🦉', '🦜']
    };
    
    this.birdTypes = [
      { emoji: '🐦', name: 'Kızılgerdan', sound: 'Cik cik!' },
      { emoji: '🐤', name: 'Serçe', sound: 'Civ civ!' },
      { emoji: '🦅', name: 'Kartal', sound: 'Kraa!' },
      { emoji: '🦆', name: 'Ördek', sound: 'Vak vak!' },
      { emoji: '🦉', name: 'Baykuş', sound: 'Huu huu!' },
      { emoji: '🦜', name: 'Papağan', sound: 'Merhaba!' }
    ];

    // Hayvanları başlat
    this.spawnAnimals();
    
    // Düzenli olarak hayvanları güncelle
    setInterval(() => {
      this.updateAnimals();
    }, 5000);

    // Hayvan seslerini çal
    setInterval(() => {
      this.playRandomAnimalSound();
    }, 15000);
  }

  spawnAnimals() {
    const container = document.getElementById('animals-container');
    if (!container) return;

    // Mevcut hayvanları temizle
    container.innerHTML = '';
    this.animals = [];

    // Tavşanlar ekle (2-4 adet)
    const rabbitCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < rabbitCount; i++) {
      this.spawnAnimal('rabbit');
    }

    // Sincaplar ekle (1-3 adet)
    const squirrelCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < squirrelCount; i++) {
      this.spawnAnimal('squirrel');
    }

    // 5. seviye ağaçlara kuş ekle
    trees.forEach(tree => {
      if (tree && tree.id && tree.growthStage >= 5) {
        this.spawnBirdOnTree(tree);
      }
    });
  }

  spawnAnimal(type) {
    const container = document.getElementById('animals-container');
    if (!container) return;

    const animal = {
      id: `animal_${Date.now()}_${Math.random()}`,
      type: type,
      x: Math.random() * (container.offsetWidth - 50),
      y: Math.random() * (container.offsetHeight - 50),
      direction: Math.random() > 0.5 ? 1 : -1,
      speed: Math.random() * 2 + 1,
      lastMove: Date.now(),
      lastSound: 0,
      state: 'idle' // idle, walking, running
    };

    const animalElement = document.createElement('div');
    animalElement.className = `animal ${type}`;
    animalElement.id = animal.id;
    animalElement.style.left = `${animal.x}px`;
    animalElement.style.top = `${animal.y}px`;
    animalElement.textContent = this.getAnimalEmoji(type);
    animalElement.title = this.getAnimalName(type);

    // Hayvan tıklama olayı
    animalElement.addEventListener('click', () => {
      this.interactWithAnimal(animal);
    });

    container.appendChild(animalElement);
    this.animals.push(animal);
  }

  spawnBirdOnTree(tree) {
    if (!tree || !tree.id) {
      console.error('spawnBirdOnTree: Tree veya tree.id eksik!', tree);
      return;
    }
    
    console.log('spawnBirdOnTree called for tree:', tree.name, 'id:', tree.id);
    
    const container = document.getElementById('animals-container');
    if (!container) {
      console.error('animals-container not found!');
      return;
    }

    // Ağacın pozisyonunu al
    const treeElement = document.querySelector(`[data-tree-id="${tree.id}"]`);
    if (!treeElement) {
      console.error('Tree element not found for tree:', tree.name, 'id:', tree.id);
      return;
    }

    const treeRect = treeElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const birdType = this.birdTypes[Math.floor(Math.random() * this.birdTypes.length)];
    
    const bird = {
      id: `bird_${tree.id}_${Date.now()}`,
      type: 'bird',
      birdType: birdType,
      treeId: tree.id,
      x: treeRect.left - containerRect.left + treeRect.width / 2,
      y: treeRect.top - containerRect.top - 20,
      direction: Math.random() > 0.5 ? 1 : -1,
      speed: Math.random() * 1 + 0.5,
      lastMove: Date.now(),
      lastSound: 0,
      state: 'perched', // perched, flying, singing
      perchedTime: Date.now()
    };

    const birdElement = document.createElement('div');
    birdElement.className = 'animal bird';
    birdElement.id = bird.id;
    birdElement.style.left = `${bird.x}px`;
    birdElement.style.top = `${bird.y}px`;
    birdElement.textContent = birdType.emoji;
    birdElement.title = `${birdType.name} - ${birdType.sound}`;

    // Kuş tıklama olayı
    birdElement.addEventListener('click', () => {
      this.interactWithBird(bird);
    });

    container.appendChild(birdElement);
    this.animals.push(bird);
    
    console.log('Bird successfully spawned on tree:', tree.name, 'bird id:', bird.id);
  }

  getAnimalEmoji(type) {
    switch (type) {
      case 'rabbit': return '🐰';
      case 'squirrel': return '🐿️';
      case 'bird': return '🐦';
      default: return '🐾';
    }
  }

  getAnimalName(type) {
    switch (type) {
      case 'rabbit': return 'Tavşan';
      case 'squirrel': return 'Sincap';
      case 'bird': return 'Kuş';
      default: return 'Hayvan';
    }
  }

  updateAnimals() {
    this.animals.forEach(animal => {
      this.updateAnimalPosition(animal);
      this.updateAnimalBehavior(animal);
    });
  }

  updateAnimalPosition(animal) {
    const element = document.getElementById(animal.id);
    if (!element) return;

    const container = document.getElementById('animals-container');
    if (!container) return;

    const now = Date.now();
    const timeDiff = now - animal.lastMove;

    // Her 3 saniyede bir hareket et
    if (timeDiff > 3000) {
      // Rastgele yön değiştir
      if (Math.random() < 0.3) {
        animal.direction *= -1;
      }

      // Yeni pozisyon hesapla
      const newX = animal.x + (animal.speed * animal.direction * 20);
      const newY = animal.y + (Math.random() - 0.5) * 30;

      // Sınırları kontrol et
      if (newX > 0 && newX < container.offsetWidth - 50) {
        animal.x = newX;
      } else {
        animal.direction *= -1;
      }

      if (newY > 0 && newY < container.offsetHeight - 50) {
        animal.y = newY;
      }

      // Element pozisyonunu güncelle
      element.style.left = `${animal.x}px`;
      element.style.top = `${animal.y}px`;

      // Animasyon sınıfını güncelle
      if (animal.type === 'rabbit') {
        element.className = `animal rabbit ${animal.state}`;
      } else if (animal.type === 'squirrel') {
        element.className = `animal squirrel ${animal.state}`;
      }

      animal.lastMove = now;
    }
  }

  updateAnimalBehavior(animal) {
    const now = Date.now();

    // Durum değişiklikleri
    if (animal.type === 'rabbit' || animal.type === 'squirrel') {
      if (Math.random() < 0.1) {
        animal.state = Math.random() < 0.5 ? 'walking' : 'idle';
      }
    } else if (animal.type === 'bird') {
      // Kuş davranışları
      if (animal.state === 'perched' && now - animal.perchedTime > 10000) {
        // 10 saniye sonra uçmaya başla
        if (Math.random() < 0.3) {
          animal.state = 'flying';
          animal.flyingStartTime = now;
        }
      } else if (animal.state === 'flying' && now - animal.flyingStartTime > 5000) {
        // 5 saniye uçtuktan sonra tekrar kon
        animal.state = 'perched';
        animal.perchedTime = now;
      }
    }
  }

  interactWithAnimal(animal) {
    const element = document.getElementById(animal.id);
    if (!element) return;

    // Etkileşim animasyonu
    element.classList.add('interacting');
    setTimeout(() => {
      element.classList.remove('interacting');
    }, 500);

    // Ses çal
    this.playAnimalSound(animal);

    // Popup göster
    this.showAnimalPopup(animal, element);

    // Toast mesajı
    const messages = {
      rabbit: ['Tavşan zıpladı! 🐰', 'Tavşan havuç arıyor! 🥕', 'Tavşan kulaklarını dikti! 👂'],
      squirrel: ['Sincap fındık topluyor! 🥜', 'Sincap ağaca tırmanıyor! 🌳', 'Sincap kuyruğunu sallıyor! 🐿️'],
      bird: ['Kuş şarkı söylüyor! 🎵', 'Kuş kanatlarını açtı! 🦅', 'Kuş gökyüzüne bakıyor! ☁️']
    };

    const messageArray = messages[animal.type] || ['Hayvan etkileşimde! 🐾'];
    const randomMessage = messageArray[Math.floor(Math.random() * messageArray.length)];

    toast.info(randomMessage, {
      title: '🐾 Hayvan Etkileşimi',
      duration: 2000
    });
  }

  interactWithBird(bird) {
    const element = document.getElementById(bird.id);
    if (!element) return;

    // Kuş şarkı söylemeye başla
    bird.state = 'singing';
    element.classList.add('singing');

    // Ses çal
    this.playBirdSound(bird);

    // Popup göster
    this.showBirdPopup(bird, element);

    // 3 saniye sonra normal duruma dön
    setTimeout(() => {
      bird.state = 'perched';
      element.classList.remove('singing');
    }, 3000);

    // Toast mesajı
    toast.success(`${bird.birdType.name} şarkı söylüyor! ${bird.birdType.sound}`, {
      title: '🎵 Kuş Şarkısı',
      duration: 3000
    });
  }

  playAnimalSound(animal) {
    const now = Date.now();
    if (now - animal.lastSound < 2000) return; // 2 saniye bekle

    const sounds = {
      rabbit: ['🐰', '🐰', '🐰'],
      squirrel: ['🐿️', '🐿️', '🐿️']
    };

    const soundEmoji = sounds[animal.type] ? 
      sounds[animal.type][Math.floor(Math.random() * sounds[animal.type].length)] : 
      '🐾';

    this.showSoundIndicator(animal, soundEmoji);
    animal.lastSound = now;
  }

  playBirdSound(bird) {
    const now = Date.now();
    if (now - bird.lastSound < 3000) return; // 3 saniye bekle

    this.showSoundIndicator(bird, bird.birdType.sound);
    bird.lastSound = now;
  }

  playRandomAnimalSound() {
    if (this.animals.length === 0) return;

    const randomAnimal = this.animals[Math.floor(Math.random() * this.animals.length)];
    if (randomAnimal.type === 'bird') {
      this.playBirdSound(randomAnimal);
    } else {
      this.playAnimalSound(randomAnimal);
    }
  }

  showSoundIndicator(animal, sound) {
    const container = document.getElementById('animals-container');
    if (!container) return;

    const element = document.getElementById(animal.id);
    if (!element) return;

    const soundIndicator = document.createElement('div');
    soundIndicator.className = 'animal-sound-indicator';
    soundIndicator.textContent = sound;
    soundIndicator.style.left = `${animal.x + 20}px`;
    soundIndicator.style.top = `${animal.y - 20}px`;

    container.appendChild(soundIndicator);

    // 2 saniye sonra kaldır
    setTimeout(() => {
      if (soundIndicator.parentNode) {
        soundIndicator.parentNode.removeChild(soundIndicator);
      }
    }, 2000);
  }

  showAnimalPopup(animal, element) {
    const popup = document.createElement('div');
    popup.className = 'animal-popup';
    
    const info = {
      rabbit: 'Tavşan - Ormanın en hızlı hayvanı!',
      squirrel: 'Sincap - Fındık toplayıcısı!',
      bird: 'Kuş - Gökyüzünün özgür ruhu!'
    };

    popup.textContent = info[animal.type] || 'Hayvan - Orman sakinleri!';
    popup.style.left = `${animal.x}px`;
    popup.style.top = `${animal.y - 40}px`;

    const container = document.getElementById('animals-container');
    container.appendChild(popup);

    // 3 saniye sonra kaldır
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 3000);
  }

  showBirdPopup(bird, element) {
    const popup = document.createElement('div');
    popup.className = 'animal-popup';
    popup.textContent = `${bird.birdType.name} - ${bird.birdType.sound}`;
    popup.style.left = `${bird.x}px`;
    popup.style.top = `${bird.y - 40}px`;

    const container = document.getElementById('animals-container');
    container.appendChild(popup);

    // 3 saniye sonra kaldır
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 3000);
  }

  // Ağaç büyüdüğünde kuş ekle
  addBirdToMatureTree(tree) {
    if (!tree || !tree.id) {
      console.error('addBirdToMatureTree: Tree veya tree.id eksik!', tree);
      return;
    }
    
    console.log('addBirdToMatureTree called for tree:', tree.name, 'growthStage:', tree.growthStage);
    
    if (tree.growthStage >= 5) {
      // Bu ağaçta zaten kuş var mı kontrol et
      const existingBird = this.animals.find(animal => 
        animal.type === 'bird' && animal.treeId === tree.id
      );

      if (!existingBird) {
        console.log('Adding bird to mature tree:', tree.name);
        this.spawnBirdOnTree(tree);
      } else {
        console.log('Bird already exists on tree:', tree.name);
      }
    } else {
      console.log('Tree not mature enough:', tree.name, 'growthStage:', tree.growthStage);
    }
  }

  // Mevsime göre hayvan davranışlarını güncelle
  updateAnimalsForSeason() {
    const season = this.weatherSystem.currentSeason;
    
    this.animals.forEach(animal => {
      const element = document.getElementById(animal.id);
      if (!element) return;

      if (season === 'winter') {
        if (animal.type === 'rabbit' || animal.type === 'squirrel') {
          element.classList.add('hibernating');
        } else if (animal.type === 'bird') {
          element.classList.add('winter-active');
        }
      } else {
        element.classList.remove('hibernating', 'winter-active');
      }
    });
  }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
  new SanalOrmanApp();
}); 