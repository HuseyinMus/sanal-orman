// Basit Türkiye haritası bileşeni

export class TurkeyMap {
  constructor(container, onCitySelect) {
    this.container = container;
    this.onCitySelect = onCitySelect;
    this.cityData = {};
    this.init();
  }

  async init() {
    this.prepareCityData();
    this.createSimpleMap();
    this.setupEventListeners();
  }

  prepareCityData() {
    // Şehir verilerini hazırla
    this.cityData = {
      'istanbul': { name: 'İstanbul', count: 0, users: 0, color: '#2d5a27' },
      'ankara': { name: 'Ankara', count: 0, users: 0, color: '#4a7c59' },
      'izmir': { name: 'İzmir', count: 0, users: 0, color: '#7fb069' },
      'bursa': { name: 'Bursa', count: 0, users: 0, color: '#2d5a27' },
      'antalya': { name: 'Antalya', count: 0, users: 0, color: '#4a7c59' },
      'adana': { name: 'Adana', count: 0, users: 0, color: '#7fb069' },
      'konya': { name: 'Konya', count: 0, users: 0, color: '#2d5a27' },
      'gaziantep': { name: 'Gaziantep', count: 0, users: 0, color: '#4a7c59' },
      'mersin': { name: 'Mersin', count: 0, users: 0, color: '#7fb069' },
      'diyarbakir': { name: 'Diyarbakır', count: 0, users: 0, color: '#2d5a27' },
      'samsun': { name: 'Samsun', count: 0, users: 0, color: '#4a7c59' },
      'kayseri': { name: 'Kayseri', count: 0, users: 0, color: '#7fb069' },
      'trabzon': { name: 'Trabzon', count: 0, users: 0, color: '#2d5a27' },
      'eskisehir': { name: 'Eskişehir', count: 0, users: 0, color: '#4a7c59' },
      'malatya': { name: 'Malatya', count: 0, users: 0, color: '#7fb069' },
      'van': { name: 'Van', count: 0, users: 0, color: '#2d5a27' },
      'denizli': { name: 'Denizli', count: 0, users: 0, color: '#4a7c59' },
      'sanliurfa': { name: 'Şanlıurfa', count: 0, users: 0, color: '#7fb069' },
      'adapazari': { name: 'Adapazarı', count: 0, users: 0, color: '#2d5a27' },
      'manisa': { name: 'Manisa', count: 0, users: 0, color: '#4a7c59' },
      'kocaeli': { name: 'Kocaeli', count: 0, users: 0, color: '#7fb069' },
      'aydin': { name: 'Aydın', count: 0, users: 0, color: '#2d5a27' },
      'tekirdag': { name: 'Tekirdağ', count: 0, users: 0, color: '#4a7c59' },
      'balikesir': { name: 'Balıkesir', count: 0, users: 0, color: '#7fb069' },
      'kahramanmaras': { name: 'Kahramanmaraş', count: 0, users: 0, color: '#2d5a27' }
    };
  }

  createSimpleMap() {
    // Container'ı temizle
    this.container.innerHTML = '';
    
    // Ana wrapper
    const mapWrapper = document.createElement('div');
    mapWrapper.className = 'turkey-map-simple';
    mapWrapper.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
      border-radius: 12px;
      overflow: hidden;
    `;
    
    // Şehirleri yerleştir
    this.createCityElements(mapWrapper);
    
    // Tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'map-tooltip';
    this.tooltip.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      opacity: 0;
      pointer-events: none;
      z-index: 1000;
      min-width: 150px;
      transition: opacity 0.3s ease;
    `;
    
    mapWrapper.appendChild(this.tooltip);
    this.container.appendChild(mapWrapper);
  }

  createCityElements(container) {
    // Şehir pozisyonları (container'a göre yüzdeli)
    const cityPositions = {
      'istanbul': { x: 15, y: 25, size: 'large' },
      'ankara': { x: 50, y: 45, size: 'large' },
      'izmir': { x: 20, y: 55, size: 'large' },
      'bursa': { x: 25, y: 35, size: 'medium' },
      'antalya': { x: 45, y: 75, size: 'medium' },
      'adana': { x: 65, y: 70, size: 'medium' },
      'konya': { x: 55, y: 60, size: 'medium' },
      'gaziantep': { x: 75, y: 65, size: 'medium' },
      'mersin': { x: 60, y: 75, size: 'medium' },
      'diyarbakir': { x: 85, y: 50, size: 'medium' },
      'samsun': { x: 62, y: 22, size: 'medium' },
      'kayseri': { x: 62, y: 50, size: 'medium' },
      'trabzon': { x: 85, y: 18, size: 'medium' },
      'eskisehir': { x: 40, y: 50, size: 'medium' },
      'malatya': { x: 78, y: 55, size: 'small' },
      'van': { x: 95, y: 55, size: 'small' },
      'denizli': { x: 35, y: 65, size: 'small' },
      'sanliurfa': { x: 80, y: 60, size: 'small' },
      'adapazari': { x: 20, y: 30, size: 'small' },
      'manisa': { x: 25, y: 58, size: 'small' },
      'kocaeli': { x: 18, y: 28, size: 'small' },
      'aydin': { x: 28, y: 62, size: 'small' },
      'tekirdag': { x: 12, y: 22, size: 'small' },
      'balikesir': { x: 22, y: 48, size: 'small' },
      'kahramanmaras': { x: 70, y: 62, size: 'small' }
    };

    Object.keys(this.cityData).forEach(cityId => {
      const city = this.cityData[cityId];
      const position = cityPositions[cityId];
      
      if (!position) return;
      
      // Şehir elementi
      const cityElement = document.createElement('div');
      cityElement.className = 'city-marker';
      cityElement.dataset.cityId = cityId;
      
      // Boyut belirle
      let size = 30;
      if (position.size === 'large') size = 40;
      else if (position.size === 'medium') size = 35;
      else if (position.size === 'small') size = 25;
      
      cityElement.style.cssText = `
        position: absolute;
        left: ${position.x}%;
        top: ${position.y}%;
        width: ${size}px;
        height: ${size}px;
        background: ${this.getCityColor(cityId)};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -50%);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10;
      `;
      
      // Şehir ismi
      const cityLabel = document.createElement('div');
      cityLabel.className = 'city-label';
      cityLabel.textContent = city.name; // Tam adı kullan
      cityLabel.style.cssText = `
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        color: #333;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
        border: 1px solid rgba(45, 90, 39, 0.1);
        max-width: 120px;
        text-align: center;
      `;
      
      cityElement.appendChild(cityLabel);
      
      // Event listeners
      cityElement.addEventListener('mouseenter', (e) => this.handleMouseOver(e, cityId));
      cityElement.addEventListener('mouseleave', (e) => this.handleMouseOut(e, cityId));
      cityElement.addEventListener('click', (e) => this.handleCityClick(e, cityId));
      
      container.appendChild(cityElement);
    });
  }



  getShortCityName(cityName) {
    // Artık kullanılmıyor, tam adları gösteriyoruz
    return cityName;
  }

  getCityColor(cityId) {
    const city = this.cityData[cityId];
    if (!city) return '#e0e0e0';
    
    // Ağaç sayısına göre renk gradyanı
    if (city.count === 0) return '#e0e0e0';
    else if (city.count <= 5) return '#7fb069';
    else if (city.count <= 10) return '#4a7c59';
    else return '#2d5a27';
  }

  handleMouseOver(event, cityId) {
    const city = this.cityData[cityId];
    const cityElement = event.currentTarget;
    
    // Hover efekti
    cityElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
    cityElement.style.zIndex = '20';
    
    // Label'i göster
    const label = cityElement.querySelector('.city-label');
    if (label) {
      label.style.opacity = '1';
    }
    
    // Tooltip göster
    if (city && this.tooltip) {
      this.tooltip.innerHTML = `
        <div class="tooltip-content">
          <h4 style="margin: 0 0 8px 0; color: #2d5a27; font-size: 14px; font-weight: 600;">${city.name}</h4>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">🌲 ${city.count} Ağaç</p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">👥 ${city.users} Kullanıcı</p>
        </div>
      `;
      
      this.tooltip.style.opacity = '1';
      this.tooltip.style.left = (event.pageX + 10) + 'px';
      this.tooltip.style.top = (event.pageY - 28) + 'px';
    }
  }

  handleMouseOut(event, cityId) {
    const cityElement = event.currentTarget;
    
    // Hover efektini kaldır
    cityElement.style.transform = 'translate(-50%, -50%) scale(1)';
    cityElement.style.zIndex = '10';
    
    // Label'i gizle
    const label = cityElement.querySelector('.city-label');
    if (label) {
      label.style.opacity = '0';
    }
    
    // Tooltip gizle
    if (this.tooltip) {
      this.tooltip.style.opacity = '0';
    }
  }

  handleCityClick(event, cityId) {
    const city = this.cityData[cityId];
    if (this.onCitySelect && city) {
      this.onCitySelect(cityId, city.name);
    }
  }

  updateCityData(cityStats) {
    // Şehir istatistiklerini güncelle
    Object.keys(cityStats).forEach(cityId => {
      if (this.cityData[cityId]) {
        this.cityData[cityId] = { ...this.cityData[cityId], ...cityStats[cityId] };
      }
    });
    
    // Haritayı yeniden çiz
    this.redrawMap();
  }

  redrawMap() {
    // Şehir renklerini güncelle
    const cityMarkers = this.container.querySelectorAll('.city-marker');
    cityMarkers.forEach(marker => {
      const cityId = marker.dataset.cityId;
      if (cityId) {
        marker.style.background = this.getCityColor(cityId);
      }
    });
  }

  setupEventListeners() {
    // Window resize
    window.addEventListener('resize', () => {
      this.resizeMap();
    });
  }

  resizeMap() {
    // Harita container'ı yeniden boyutlandır
    const mapWrapper = this.container.querySelector('.turkey-map-simple');
    if (mapWrapper) {
      // Responsive davranış için gerekirse burada işlemler yapılabilir
      console.log('Harita yeniden boyutlandırıldı');
    }
  }

  zoomIn() {
    const mapWrapper = this.container.querySelector('.turkey-map-simple');
    if (mapWrapper) {
      const currentScale = parseFloat(mapWrapper.style.transform.replace(/.*scale\(([^)]+)\).*/, '$1') || '1');
      const newScale = Math.min(currentScale * 1.2, 2);
      mapWrapper.style.transform = `scale(${newScale})`;
    }
  }

  zoomOut() {
    const mapWrapper = this.container.querySelector('.turkey-map-simple');
    if (mapWrapper) {
      const currentScale = parseFloat(mapWrapper.style.transform.replace(/.*scale\(([^)]+)\).*/, '$1') || '1');
      const newScale = Math.max(currentScale * 0.8, 0.5);
      mapWrapper.style.transform = `scale(${newScale})`;
    }
  }

  resetView() {
    const mapWrapper = this.container.querySelector('.turkey-map-simple');
    if (mapWrapper) {
      mapWrapper.style.transform = 'scale(1)';
    }
  }
} 