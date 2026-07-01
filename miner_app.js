// Miner Rocket Launcher Game Engine (Pure 2D Canvas Version)

// 18 Ore types matching vertical/horizontal segments of Free_OreSheet_VerySmallSquares.png
const ORE_TYPES_LIST = [
  'amethyst', 'ruby', 'sapphire', 'gold', 'silver', 'dirt',
  'emerald', 'diamond', 'deep_ruby', 'deep_radioactive', 'deep_gold', 'deep_silver',
  'obsidian', 'magma', 'sandstone', 'deep_diamond', 'infected_gold', 'deep_stone'
];

// Weapon Database (row/col in superweaponpack(2).png, base stats, and stat upgrade base costs)
const WEAPONS_DB = [
  {
    id: 'blaster',
    name: 'Micro Blaster',
    desc: 'Lightweight sidearm. Standard issue.',
    damage: 15,
    radius: 45,
    firerate: 250, // fast pistol
    cost: 0,
    row: 6,
    col: 3,
    upgradeBaseCost: 15,
    magazine: 12
  },
  {
    id: 'plasma_pistol',
    name: 'Plasma Pistol',
    desc: 'Fires hot superheated plasma gas bolts.',
    damage: 25,
    radius: 50,
    firerate: 200, // fast plasma pistol
    cost: 80,
    row: 6,
    col: 5,
    upgradeBaseCost: 25,
    magazine: 15
  },
  {
    id: 'cannon',
    name: 'Heavy Cannon',
    desc: 'Reinforced barrel fires high-density shells.',
    damage: 120,
    radius: 65,
    firerate: 600, // slow cannon
    cost: 200,
    row: 8,
    col: 1,
    upgradeBaseCost: 45,
    magazine: 6
  },
  {
    id: 'repeater_rifle',
    name: 'Repeater Rifle',
    desc: 'Assault rifle style energy blaster. Good firing rate.',
    damage: 50,
    radius: 55,
    firerate: 130, // very fast SMG/Rifle
    cost: 450,
    row: 6,
    col: 0,
    upgradeBaseCost: 80,
    magazine: 30
  },
  {
    id: 'grenade',
    name: 'Grenade Launcher',
    desc: 'Drum-fed launcher. Fast rate of fire.',
    damage: 180,
    radius: 90,
    firerate: 750, // slow grenade launcher
    cost: 850,
    row: 9,
    col: 1,
    upgradeBaseCost: 180,
    magazine: 4
  },
  {
    id: 'acid_spitter',
    name: 'Acid Spitter',
    desc: 'Launches corroding bio-chemical explosive capsules.',
    damage: 90,
    radius: 75,
    firerate: 350, // medium fire rate
    cost: 1800,
    row: 7,
    col: 2,
    upgradeBaseCost: 350,
    magazine: 10
  },
  {
    id: 'bazooka',
    name: 'Mini Bazooka',
    desc: 'Desert-camo military rocket launcher.',
    damage: 450,
    radius: 120,
    firerate: 900, // very slow bazooka
    cost: 3200,
    row: 8,
    col: 8,
    upgradeBaseCost: 600,
    magazine: 2
  },
  {
    id: 'plasma_railgun',
    name: 'Plasma Railgun',
    desc: 'Magnetic acceleration launcher. High kinetic energy.',
    damage: 350,
    radius: 105,
    firerate: 450, // medium railgun
    cost: 7500,
    row: 7,
    col: 8,
    upgradeBaseCost: 1200,
    magazine: 5
  },
  {
    id: 'rpg',
    name: 'Vortex RPG-7',
    desc: 'Classic rocket propelled grenade. High blast power.',
    damage: 850,
    radius: 150,
    firerate: 1100, // very slow RPG
    cost: 15000,
    row: 8,
    col: 5,
    upgradeBaseCost: 3000,
    magazine: 1
  },
  {
    id: 'nuke',
    name: 'Tactical Nuke',
    desc: 'Launches micro nuclear warheads. Devastating radius.',
    damage: 2500,
    radius: 200,
    firerate: 2000, // extremely slow nuke
    cost: 35000,
    row: 8,
    col: 7,
    upgradeBaseCost: 7500,
    magazine: 1
  },
  {
    id: 'bow',
    name: 'Quantum Bow',
    desc: 'Fires energy bolts that tear through bedrock.',
    damage: 500,
    radius: 130,
    firerate: 400, // medium bow
    cost: 65000,
    row: 9,
    col: 3,
    upgradeBaseCost: 15000,
    magazine: 8
  },
  {
    id: 'doom',
    name: 'Doom Annihilator',
    desc: 'The ultimate endgame blaster. Destroys worlds.',
    damage: 400,
    radius: 140,
    firerate: 80, // blistering fast minigun!
    cost: 250000,
    row: 7,
    col: 6,
    upgradeBaseCost: 50000,
    magazine: 150
  }
];

// Sound System using Web Audio API
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playShoot() {
    if (!this.enabled) return;
    try {
      // Use local custom MP3 pistol shot audio
      const sound = new Audio('Sound/pistol-shot.mp3');
      sound.volume = 0.35;
      sound.play().catch(() => {
        this.playSynthShoot();
      });
    } catch (e) {
      this.playSynthShoot();
    }
  }

  playSynthShoot() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playReload() {
    if (!this.enabled) return;
    try {
      // Use local custom MP3 gun reload audio
      const sound = new Audio('Sound/gunreload.mp3');
      sound.volume = 0.45;
      sound.play().catch(() => {});
    } catch (e) {}
  }

  playExplode(radius = 80, distance = 0) {
    if (!this.enabled) return;
    try {
      const sound = new Audio('Sound/explosion.mp3');
      // 1. Base volume depending on blast size
      const baseVolume = Math.min(1.0, Math.max(0.1, radius / 220));
      // 2. Attenuation factor depending on player distance (max hearing range 650px)
      const maxDistance = 650;
      const attenuation = Math.max(0.0, 1.0 - (distance / maxDistance));
      
      sound.volume = baseVolume * attenuation;
      
      if (sound.volume > 0.01) {
        sound.play().catch(() => {
          this.playSynthExplode(radius, distance);
        });
      }
    } catch (e) {
      this.playSynthExplode(radius, distance);
    }
  }

  playSynthExplode(radius = 80, distance = 0) {
    this.init();
    const now = this.ctx.currentTime;
    
    // Attenuation calculation
    const maxDistance = 650;
    const attenuation = Math.max(0.0, 1.0 - (distance / maxDistance));
    if (attenuation <= 0.01) return; // completely silent

    const baseVol = Math.min(0.4, Math.max(0.05, radius / 400));
    const finalVol = baseVol * attenuation;
    
    // Low frequency rumbler
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.35);
    
    gain.gain.setValueAtTime(finalVol, now);
    gain.gain.linearRampToValueAtTime(0.005, now + 0.4);
    
    // Add noise for texture
    const bufferSize = this.ctx.sampleRate * 0.3; // 0.3 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(300, now);
    noiseFilter.frequency.linearRampToValueAtTime(80, now + 0.3);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(finalVol * 0.5, now);
    noiseGain.gain.linearRampToValueAtTime(0.005, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.4);
    
    noiseNode.start(now);
    noiseNode.stop(now + 0.3);
  }

  playPickup() {
    if (!this.enabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1320, now + 0.05);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playCash() {
    if (!this.enabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    
    const freqs = [987.77, 1318.51, 1567.98]; // B5, E6, G6
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      
      gain.gain.setValueAtTime(0.06, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.005, now + idx * 0.04 + 0.15);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.15);
    });
  }

  playUpgrade() {
    if (!this.enabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Particle Helper
class Particle {
  constructor(x, y, vx, vy, color, size, decay, type = 'debris', oreType = null, shardVarIdx = 0) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.decay = decay;
    this.alpha = 1;
    this.type = type; // 'debris', 'smoke', 'spark', 'ore_shard', 'shell'
    this.oreType = oreType;
    this.shardVarIdx = shardVarIdx;
    
    // Rotational properties for shell casings
    this.rotation = 0;
    this.rotSpeed = 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    if (this.type === 'debris' || this.type === 'ore_shard' || this.type === 'shell') {
      this.vy += 0.18; // Apply gravity to debris, shards, and shell casings
    }
    if (this.type === 'shell') {
      this.rotation += this.rotSpeed;
    }
    
    this.alpha -= this.decay;
  }
}

// Ore Collectible
class OreCollect {
  constructor(x, y, type, config) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = config.color;
    this.char = config.char;
    this.name = config.name;
    
    // Initial drift speed
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 1.5;
    this.size = 22; // 120% size scale (originally 18)
    this.collected = false;
    this.shardVarIdx = Math.floor(Math.random() * 3); // 3 Shard Variants
  }

  update(player, magnetRadius) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < magnetRadius) {
      const force = (magnetRadius - dist) / magnetRadius * 0.5 + 0.1;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
      
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > 8) {
        this.vx = (this.vx / speed) * 8;
        this.vy = (this.vy / speed) * 8;
      }
    } else {
      this.vx *= 0.96;
      this.vy += 0.08;
    }

    this.x += this.vx;
    this.y += this.vy;
  }
}

// Rocket Projectile
class Rocket {
  constructor(x, y, targetX, targetY, speed, damage, radius) {
    this.x = x;
    this.y = y;
    this.damage = damage;
    this.radius = radius;
    
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.hypot(dx, dy);
    this.vx = (dx / dist) * speed;
    this.vy = (dy / dist) * speed;
    
    this.angle = Math.atan2(dy, dx);
    this.width = 16;
    this.height = 6;
    this.dead = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
}

// Ore Database and Configuration (18 Ores)
const ORES = {
  amethyst: { name: 'Amethyst', char: '🔮', color: '#b026ff', sell: 8 },
  ruby: { name: 'Ruby', char: '♦️', color: '#ff0055', sell: 15 },
  sapphire: { name: 'Sapphire', char: '🔷', color: '#0055ff', sell: 20 },
  gold: { name: 'Gold Ore', char: '🪙', color: '#ffb700', sell: 35 },
  silver: { name: 'Silver Ore', char: '🥈', color: '#c0c0c0', sell: 12 },
  dirt: { name: 'Clay Dirt', char: '🪨', color: '#8b5a2b', sell: 1 },
  emerald: { name: 'Emerald', char: '💎', color: '#00e575', sell: 50 },
  diamond: { name: 'Diamond', char: '✨', color: '#00d2ff', sell: 120 },
  deep_ruby: { name: 'Deep Ruby', char: '🩸', color: '#800000', sell: 85 },
  deep_radioactive: { name: 'Uranium', char: '☢️', color: '#39ff14', sell: 180 },
  deep_gold: { name: 'Deep Gold', char: '🪙', color: '#e5a93b', sell: 140 },
  deep_silver: { name: 'Deep Silver', char: '💿', color: '#a0a0a0', sell: 75 },
  obsidian: { name: 'Obsidian', char: '🖤', color: '#4a0e4e', sell: 100 },
  magma: { name: 'Magma Crystal', char: '🔥', color: '#ff3700', sell: 220 },
  sandstone: { name: 'Amber Sand', char: '🏜️', color: '#d2b48c', sell: 30 },
  deep_diamond: { name: 'Void Diamond', char: '🌌', color: '#00ffff', sell: 400 },
  infected_gold: { name: 'Plague Gold', char: '🦠', color: '#99cc00', sell: 280 },
  deep_stone: { name: 'Coal Slate', char: '🔌', color: '#404040', sell: 25 }
};

// Rock Block Data
const BLOCKS_CONFIG = {
  dirt: { hp: 12, color: '#4b382a', name: 'Dirt' },
  stone: { hp: 35, color: '#524f59', name: 'Stone' },
  hardstone: { hp: 80, color: '#35333d', name: 'Hard Stone' },
  obsidian: { hp: 180, color: '#1d122b', name: 'Obsidian' },
  bedrock: { hp: 450, color: '#0e0b14', name: 'Bedrock' }
};

// Dimensions
const BLOCK_SIZE = 40;
const COLS = 16;

// Main Game Controller
class GameController {
  constructor() {
    this.canvas = document.getElementById('mine-canvas');
    this.sound = new AudioSynth();

    // DOM References
    this.depthValEl = document.getElementById('depth-val');
    this.coinValEl = document.getElementById('coin-val');
    this.sellBtn = document.getElementById('sell-all-btn');
    this.soundToggleBtn = document.getElementById('sound-toggle');
    this.welcomeOverlay = document.getElementById('welcome-overlay');
    this.playBtn = document.getElementById('play-btn');
    
    // Popup Shop DOMs
    this.openShopBtn = document.getElementById('open-shop-btn');
    this.closeShopBtn = document.getElementById('close-shop-btn');
    this.shopModal = document.getElementById('shop-modal');

    // Shop Page Tabs DOMs
    this.tabUpgrades = document.getElementById('tab-btn-upgrades');
    this.tabWeapons = document.getElementById('tab-btn-weapons');
    this.pageUpgrades = document.getElementById('page-upgrades');
    this.pageWeapons = document.getElementById('page-weapons');

    // Weapon Detail Panel DOMs
    this.weaponDetailOverlay = document.getElementById('weapon-details-view');
    this.backToWeaponsBtn = document.getElementById('back-to-weapons-btn');
    this.closeDetailBtn = document.getElementById('close-detail-btn');

    // Upgrade items UI binding
    this.upgradeBuyButtons = {};

    // Dialogue & Quest DOMs
    this.dialogueOverlay = document.getElementById('dialogue-overlay');
    this.dialogueSpeaker = document.getElementById('dialogue-speaker');
    this.dialogueText = document.getElementById('dialogue-text');
    this.dialogueYesBtn = document.getElementById('dialogue-yes-btn');
    this.dialogueNoBtn = document.getElementById('dialogue-no-btn');
    this.interactionPrompt = document.getElementById('interaction-prompt');

    // Quest States
    this.questState = 'not_started'; // 'not_started', 'active', 'completed'
    this.dialogueOpen = false;

    // NPC Coordinates
    this.mouseMiner = { x: 8 * BLOCK_SIZE, y: 53 * BLOCK_SIZE - 24, width: 24, height: 24 };
    this.trappedFriend = { x: 10 * BLOCK_SIZE + 8, y: 111 * BLOCK_SIZE - 24, width: 24, height: 24, found: false };

    // Upgrades Configuration
    this.upgrades = {
      jetpack: { name: 'Jetpack Fuel', level: 1, baseCost: 25, scaling: 1.6, desc: 'Improves hover thrust power' },
      magnet: { name: 'Collector Magnet', level: 1, baseCost: 15, scaling: 1.5, desc: 'Wider ore magnet collection range' }
    };

    // Weapon Inventory, Equipped, and STAT levels tracking
    this.unlockedWeapons = ['blaster'];
    this.equippedWeaponId = 'blaster';
    this.selectedDetailWeaponId = 'blaster';
    
    this.weaponUpgrades = {
      blaster: { damage: 1, radius: 1, firerate: 1 },
      plasma_pistol: { damage: 1, radius: 1, firerate: 1 },
      cannon: { damage: 1, radius: 1, firerate: 1 },
      repeater_rifle: { damage: 1, radius: 1, firerate: 1 },
      grenade: { damage: 1, radius: 1, firerate: 1 },
      acid_spitter: { damage: 1, radius: 1, firerate: 1 },
      bazooka: { damage: 1, radius: 1, firerate: 1 },
      plasma_railgun: { damage: 1, radius: 1, firerate: 1 },
      rpg: { damage: 1, radius: 1, firerate: 1 },
      nuke: { damage: 1, radius: 1, firerate: 1 },
      bow: { damage: 1, radius: 1, firerate: 1 },
      doom: { damage: 1, radius: 1, firerate: 1 }
    };

    // Game Variables
    this.coins = 0;
    this.inventory = {
      amethyst: 0, ruby: 0, sapphire: 0, gold: 0, silver: 0, dirt: 0,
      emerald: 0, diamond: 0, deep_ruby: 0, deep_radioactive: 0, deep_gold: 0, deep_silver: 0,
      obsidian: 0, magma: 0, sandstone: 0, deep_diamond: 0, infected_gold: 0, deep_stone: 0
    };

    // Physics Engine Elements
    this.player = {
      x: (COLS * BLOCK_SIZE) / 2,
      y: BLOCK_SIZE * 3,
      width: 26,
      height: 34,
      vx: 0,
      vy: 0,
      isGrounded: false
    };

    this.keys = {};
    this.blocks = {};
    this.generatedCells = new Set();
    this.rockets = [];
    this.ores = [];
    this.particles = [];
    
    // Load Tilemap asset from Art directory
    this.tilemap = new Image();
    this.tilemap.src = 'Art/Tilemap.png';
    this.tilemapLoaded = false;
    this.tilemap.onload = () => {
      this.tilemapLoaded = true;
    };

    // Load Oresheet asset from Art directory
    this.oresheet = new Image();
    this.oresheet.src = 'Art/Free_OreSheet_VerySmallSquares.png';
    this.oresheetLoaded = false;
    this.oresheet.onload = () => {
      this.oresheetLoaded = true;
    };

    // Load Weapon pack asset from Art directory
    this.weaponPackImage = new Image();
    this.weaponPackImage.src = 'Art/superweaponpack(2).png';
    this.weaponPackLoaded = false;
    this.weaponPackImage.onload = () => {
      this.weaponPackLoaded = true;
    };

    // Load Crack texture overlay from Art directory
    this.crackImage = new Image();
    this.crackImage.src = 'Art/grunge crack.png';
    this.crackLoaded = false;
    this.crackIsBlack = false;
    this.crackImage.onload = () => {
      try {
        // Create an offscreen canvas to transform white-on-black into black-on-transparent
        this.crackCanvas = document.createElement('canvas');
        this.crackCanvas.width = 128;
        this.crackCanvas.height = 128;
        const cctx = this.crackCanvas.getContext('2d');
        cctx.drawImage(this.crackImage, 0, 0, 128, 128);
        
        const imgData = cctx.getImageData(0, 0, 128, 128);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          const brightness = (r + g + b) / 3;
          
          data[i] = 0;     // Red
          data[i+1] = 0;   // Green
          data[i+2] = 0;   // Blue
          data[i+3] = brightness; // Alpha transparent mask based on white line brightness
        }
        cctx.putImageData(imgData, 0, 0);
        this.crackIsBlack = true;
      } catch (e) {
        console.warn("Local security protocol sandbox active. Falling back to screen-blended white cracks.", e);
        this.crackIsBlack = false;
      }
      this.crackLoaded = true;
    };

    // Load Crack texture overlay from Art directory
    
    // Animation/Camera/Aim control
    this.cameraX = 0;
    this.cameraY = 0;
    this.mouseX = (COLS * BLOCK_SIZE) / 2;
    this.mouseY = BLOCK_SIZE * 3;
    this.lastTime = 0;
    this.shootCooldown = 0;
    this.screenShake = 0;
    this.isPaused = false;
    
    // Ammo & Reload properties
    this.currentAmmo = 12; // starts with blaster magazine
    this.reloadTimer = 0;
    this.isMouseDown = false;

    // Viewport scales
    this.logicalWidth = 800; // Zoomed out view
    this.logicalHeight = 600;

    // Load initial map surface rows & columns
    this.generateMapArea(0, 15, -12, 12);

    // Bind event controllers
    this.initEventListeners();

    // Setup visual canvases
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.updateHUD();
    this.renderUpgrades();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    let width = parent ? parent.clientWidth : 0;
    let height = parent ? parent.clientHeight : 0;
    
    if (!width || width < 100) width = window.innerWidth;
    if (!height || height < 100) height = window.innerHeight;

    this.canvas.width = width;
    this.canvas.height = height;

    const scale = width / 800;
    this.logicalHeight = height / scale;
  }

  handleInteraction() {
    if (this.dialogueOpen) return;

    // Check distance to Mouse Miner NPC
    const distToMouse = Math.hypot(
      (this.player.x + this.player.width / 2) - (this.mouseMiner.x + this.mouseMiner.width / 2),
      (this.player.y + this.player.height / 2) - (this.mouseMiner.y + this.mouseMiner.height / 2)
    );

    if (distToMouse < 60) {
      this.openDialogue();
    }
  }

  openDialogue() {
    this.dialogueOpen = true;
    this.isPaused = true;
    this.dialogueOverlay.classList.add('active');

    if (this.questState === 'not_started') {
      this.dialogueSpeaker.textContent = "Mouse Miner";
      this.dialogueText.textContent = "Hello traveler... I'm in desperate need of help. My partner got trapped in a deep cavern cave-in further down (near 105m depth). Can you find my friend for me?";
      this.dialogueYesBtn.style.display = 'inline-block';
      this.dialogueNoBtn.style.display = 'inline-block';
      this.dialogueYesBtn.textContent = "ACCEPT QUEST";
      this.dialogueNoBtn.textContent = "DECLINE";
    } else if (this.questState === 'active') {
      this.dialogueSpeaker.textContent = "Mouse Miner";
      this.dialogueText.textContent = "Please hurry! Follow the locator arrow to find my friend trapped deep down!";
      this.dialogueYesBtn.style.display = 'inline-block';
      this.dialogueNoBtn.style.display = 'none';
      this.dialogueYesBtn.textContent = "OK";
    } else if (this.questState === 'completed') {
      this.dialogueSpeaker.textContent = "Mouse Miner";
      this.dialogueText.textContent = "Thank you so much for saving my friend! We are forever in your debt.";
      this.dialogueYesBtn.style.display = 'inline-block';
      this.dialogueNoBtn.style.display = 'none';
      this.dialogueYesBtn.textContent = "OK";
    }
  }

  closeDialogue() {
    this.dialogueOpen = false;
    this.isPaused = false;
    this.dialogueOverlay.classList.remove('active');
  }

  drawMouseNPC(ctx, npc, isFriend = false) {
    ctx.save();
    ctx.translate(npc.x + npc.width / 2, npc.y + npc.height / 2);
    
    // Draw grey body
    ctx.fillStyle = isFriend ? '#a18e7c' : '#8a8a8a';
    ctx.beginPath();
    ctx.arc(0, 2, 8, 0, Math.PI * 2); // body
    ctx.arc(-2, -4, 6, 0, Math.PI * 2); // head
    ctx.fill();

    // Round ears
    ctx.fillStyle = '#ffb3c6';
    ctx.beginPath();
    ctx.arc(-8, -8, 3, 0, Math.PI * 2);
    ctx.arc(4, -8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isFriend ? '#a18e7c' : '#8a8a8a';
    ctx.beginPath();
    ctx.arc(-8, -8, 4, 0, Math.PI * 2);
    ctx.arc(4, -8, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Pink nose
    ctx.fillStyle = '#ff7597';
    ctx.beginPath();
    ctx.arc(2, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Beady black eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-1, -6, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(3, -4);
    ctx.lineTo(9, -6);
    ctx.moveTo(3, -3);
    ctx.lineTo(10, -3);
    ctx.stroke();

    // Mining Helmet (if not friend)
    if (!isFriend) {
      ctx.fillStyle = '#ffd000'; // Yellow helmet
      ctx.beginPath();
      ctx.arc(-2, -7, 6, Math.PI, 0); // half circle hat dome
      ctx.fillRect(-9, -8, 14, 2); // brim
      ctx.fill();
      
      // Helmet Headlamp Glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(5, -7, 2, 0, Math.PI * 2);
      ctx.fill();

      // Soft light beam pointing down-right
      const beamGrad = ctx.createRadialGradient(5, -7, 1, 35, 10, 45);
      beamGrad.addColorStop(0, 'rgba(255, 255, 200, 0.45)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(5, -7);
      ctx.lineTo(45, 5);
      ctx.lineTo(25, 30);
      ctx.closePath();
      ctx.fill();
    } else {
      // Trapped bandana
      ctx.fillStyle = '#ff3300';
      ctx.fillRect(-6, -7, 8, 2);
    }
    
    ctx.restore();
  }

  initEventListeners() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (['ArrowUp', 'ArrowDown', ' ', 'w', 's', 'ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) {
        e.preventDefault();
      }
      // Toggle Shop with Spacebar
      if (e.key === ' ') {
        if (this.welcomeOverlay.classList.contains('active')) return;
        if (this.shopModal.classList.contains('active')) {
          this.closeShop();
        } else {
          this.openShop();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // Track mouse aiming cursor
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.canvas.width / 800;
      this.mouseX = (e.clientX - rect.left) / scale + this.cameraX;
      this.mouseY = (e.clientY - rect.top) / scale + this.cameraY;
    });

    // Track mouse button click/hold for auto-fire
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.isPaused) return;
      this.isMouseDown = true;
      // Immediately track cursor coordinates on click down
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.canvas.width / 800;
      this.mouseX = (e.clientX - rect.left) / scale + this.cameraX;
      this.mouseY = (e.clientY - rect.top) / scale + this.cameraY;
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    // Track mobile touch aiming and hold for auto-fire
    const trackTouch = (e) => {
      if (!e.touches || !e.touches[0]) return;
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.canvas.width / 800;
      this.mouseX = (e.touches[0].clientX - rect.left) / scale + this.cameraX;
      this.mouseY = (e.touches[0].clientY - rect.top) / scale + this.cameraY;
    };

    this.canvas.addEventListener('touchstart', (e) => {
      if (this.isPaused) return;
      this.isMouseDown = true;
      trackTouch(e);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      trackTouch(e);
    });

    window.addEventListener('touchend', () => {
      this.isMouseDown = false;
    });

    // Sell All Ores
    this.sellBtn.addEventListener('click', () => this.sellAllOres());

    // Developer Cheat button
    const cheatBtn = document.getElementById('cheat-coins-btn');
    if (cheatBtn) {
      cheatBtn.addEventListener('click', () => {
        this.coins += 99999999;
        this.sound.playCash();
        this.updateHUD();
        
        if (this.tabUpgrades.classList.contains('active')) {
          this.renderUpgrades();
        } else if (this.tabWeapons.classList.contains('active')) {
          this.renderWeapons();
        }
        if (this.weaponDetailOverlay.style.display === 'flex') {
          this.renderWeaponStatUpgrades();
        }
      });
    }

    // Sound toggle
    this.soundToggleBtn.addEventListener('click', () => {
      const enabled = this.sound.toggle();
      this.soundToggleBtn.classList.toggle('active', enabled);
      this.soundToggleBtn.querySelector('span').textContent = enabled ? 'volume_up' : 'volume_off';
    });

    // Shop toggle controls
    this.openShopBtn.addEventListener('click', () => this.openShop());
    this.closeShopBtn.addEventListener('click', () => this.closeShop());

    // Shop Pages Tab switcher
    this.tabUpgrades.addEventListener('click', () => this.switchTab('upgrades'));
    this.tabWeapons.addEventListener('click', () => this.switchTab('weapons'));

    // Weapon details close / back controls
    this.backToWeaponsBtn.addEventListener('click', () => {
      this.weaponDetailOverlay.style.display = 'none';
      this.renderWeapons();
    });

    this.closeDetailBtn.addEventListener('click', () => {
      this.weaponDetailOverlay.style.display = 'none';
      this.closeShop();
    });

    // Dialogue buttons
    this.dialogueYesBtn.addEventListener('click', () => {
      if (this.questState === 'not_started') {
        this.questState = 'active';
        this.sound.playUpgrade(); // positive jingle
      }
      this.closeDialogue();
    });

    this.dialogueNoBtn.addEventListener('click', () => {
      this.closeDialogue();
    });

    // Keyboard 'E' Interaction
    window.addEventListener('keydown', (e) => {
      if (e.key === 'e' || e.key === 'E') {
        this.handleInteraction();
      }
    });

    // Start Button Overlay Click
    this.playBtn.addEventListener('click', () => {
      this.sound.init();
      this.welcomeOverlay.classList.remove('active');
      this.startGameLoop();
    });
  }

  switchTab(tab) {
    if (tab === 'upgrades') {
      this.tabUpgrades.classList.add('active');
      this.tabWeapons.classList.remove('active');
      this.pageUpgrades.style.display = 'flex';
      this.pageWeapons.style.display = 'none';
      this.renderUpgrades();
    } else {
      this.tabUpgrades.classList.remove('active');
      this.tabWeapons.classList.add('active');
      this.pageUpgrades.style.display = 'none';
      this.pageWeapons.style.display = 'flex';
      this.renderWeapons();
    }
  }

  openShop() {
    this.isPaused = true;
    this.shopModal.classList.add('active');
    this.updateHUD();
    this.switchTab('upgrades');
  }

  closeShop() {
    this.isPaused = false;
    this.shopModal.classList.remove('active');
  }

  getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.scaling, upgrade.level - 1));
  }

  getUpgradeValue(type, level) {
    switch (type) {
      case 'jetpack':
        return 3.8 + 0.5 * (level - 1);
      case 'magnet':
        return 60 + 35 * (level - 1);
      default:
        return level;
    }
  }

  // Cave Generation sinus-wave noise formula
  checkCaveNoise(r, c) {
    if (r < 6) return false;
    const n1 = Math.sin(r * 0.15) * Math.cos(c * 0.15);
    const n2 = Math.sin(r * 0.07 + c * 0.05) * Math.cos(c * 0.07 - r * 0.05);
    const noise = (n1 + n2) / 2;
    return noise > 0.35;
  }

  getBlockTypeForDepth(r) {
    if (r < 5) return 'dirt';
    if (r >= 5 && r < 20) return 'dirt';
    if (r >= 20 && r < 55) return 'stone';
    if (r >= 55 && r < 125) return 'hardstone';
    if (r >= 125 && r < 300) return 'obsidian';
    return 'bedrock';
  }

  getOreTypeForDepth(r) {
    const blockType = this.getBlockTypeForDepth(r);
    const rand = Math.random();

    if (blockType === 'dirt') {
      if (rand < 0.6) return 'dirt';
      if (rand < 0.9) return 'deep_stone';
      return 'silver';
    } else if (blockType === 'stone') {
      if (rand < 0.4) return 'deep_stone';
      if (rand < 0.7) return 'sandstone';
      if (rand < 0.9) return 'silver';
      return 'amethyst';
    } else if (blockType === 'hardstone') {
      if (rand < 0.3) return 'amethyst';
      if (rand < 0.55) return 'sapphire';
      if (rand < 0.8) return 'ruby';
      return 'gold';
    } else if (blockType === 'obsidian') {
      if (rand < 0.25) return 'gold';
      if (rand < 0.5) return 'emerald';
      if (rand < 0.75) return 'deep_silver';
      if (rand < 0.9) return 'deep_ruby';
      return 'diamond';
    } else { // bedrock
      if (rand < 0.2) return 'deep_gold';
      if (rand < 0.4) return 'obsidian';
      if (rand < 0.6) return 'magma';
      if (rand < 0.75) return 'infected_gold';
      if (rand < 0.9) return 'deep_radioactive';
      return 'deep_diamond';
    }
  }

  generateMapArea(fromRow, toRow, fromCol, toCol) {
    for (let r = fromRow; r <= toRow; r++) {
      if (r < 5) continue; // sky

      // Hollow out the Mouse Miner's small mine at row 50 to 52, cols 4 to 12
      if (r >= 50 && r <= 52) {
        for (let c = fromCol; c <= toCol; c++) {
          if (c >= 4 && c <= 12) {
            const key = `${r},${c}`;
            this.generatedCells.add(key);
            delete this.blocks[key];
          }
        }
      }
      // Add solid stone floor under the cave so they don't fall through
      if (r === 53) {
        for (let c = fromCol; c <= toCol; c++) {
          if (c >= 4 && c <= 12) {
            const key = `${r},${c}`;
            this.generatedCells.add(key);
            this.blocks[key] = {
              x: c * BLOCK_SIZE, y: r * BLOCK_SIZE, row: r, col: c,
              type: 'stone', maxHp: BLOCKS_CONFIG.stone.hp, hp: BLOCKS_CONFIG.stone.hp,
              ore: null, varIdx: 0, flipX: false, flipY: false, rot: 0
            };
          }
        }
      }

      // Hollow out trapped friend pocket at row 110, col 10
      if (r === 110) {
        for (let c = fromCol; c <= toCol; c++) {
          if (c === 10) {
            const key = `${r},${c}`;
            this.generatedCells.add(key);
            delete this.blocks[key];
          }
        }
      }
      // Floor under trapped friend
      if (r === 111) {
        for (let c = fromCol; c <= toCol; c++) {
          if (c === 10) {
            const key = `${r},${c}`;
            this.generatedCells.add(key);
            this.blocks[key] = {
              x: c * BLOCK_SIZE, y: r * BLOCK_SIZE, row: r, col: c,
              type: 'stone', maxHp: BLOCKS_CONFIG.stone.hp, hp: BLOCKS_CONFIG.stone.hp,
              ore: null, varIdx: 0, flipX: false, flipY: false, rot: 0
            };
          }
        }
      }

      const blockType = this.getBlockTypeForDepth(r);
      const config = BLOCKS_CONFIG[blockType];

      for (let c = fromCol; c <= toCol; c++) {
        const key = `${r},${c}`;
        if (this.generatedCells.has(key)) continue;
        this.generatedCells.add(key);

        if (this.blocks[key]) continue;
        if (this.checkCaveNoise(r, c)) continue;

        if (r >= 6 && Math.random() < 0.05) {
          this.generateVein(r, c);
          continue;
        }

        this.blocks[key] = {
          x: c * BLOCK_SIZE,
          y: r * BLOCK_SIZE,
          row: r,
          col: c,
          type: blockType,
          maxHp: config.hp,
          hp: config.hp,
          ore: null,
          varIdx: 0,
          flipX: Math.random() < 0.5,
          flipY: Math.random() < 0.5,
          rot: Math.floor(Math.random() * 4) * (Math.PI / 2)
        };
      }
    }
  }

  generateVein(r, c) {
    const oreType = this.getOreTypeForDepth(r);
    const size = 3 + Math.floor(Math.random() * 5);
    
    let currR = r;
    let currC = c;

    for (let i = 0; i < size; i++) {
      const key = `${currR},${currC}`;
      
      if (!this.checkCaveNoise(currR, currC) && !this.generatedCells.has(key)) {
        const blockType = this.getBlockTypeForDepth(currR);
        const config = BLOCKS_CONFIG[blockType];
        
        this.blocks[key] = {
          x: currC * BLOCK_SIZE,
          y: currR * BLOCK_SIZE,
          row: currR,
          col: currC,
          type: blockType,
          maxHp: config.hp,
          hp: config.hp,
          ore: oreType,
          varIdx: Math.floor(Math.random() * 3),
          flipX: Math.random() < 0.5,
          flipY: Math.random() < 0.5,
          rot: Math.floor(Math.random() * 4) * (Math.PI / 2)
        };
      }

      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const step = dirs[Math.floor(Math.random() * 4)];
      currR += step[0];
      currC += step[1];
    }
  }

  shootRocket() {
    if (this.shootCooldown > 0) return;
    if (this.reloadTimer > 0) return;

    const activeWeapon = WEAPONS_DB.find(w => w.id === this.equippedWeaponId) || WEAPONS_DB[0];
    const lvls = this.weaponUpgrades[activeWeapon.id];

    // If ammo is dry, trigger reload sequence
    if (this.currentAmmo <= 0) {
      this.reloadTimer = 1.5; // 1.5 seconds reload cooldown
      this.sound.playReload();
      return;
    }

    // Decrement ammunition
    this.currentAmmo--;

    const spawnX = this.player.x + this.player.width / 2;
    const spawnY = this.player.y + this.player.height / 2;

    const dmg = activeWeapon.damage * Math.pow(1.20, lvls.damage - 1);
    const rad = activeWeapon.radius * Math.pow(1.10, lvls.radius - 1);

    const rocket = new Rocket(spawnX, spawnY, this.mouseX, this.mouseY, 10, dmg, rad);
    this.rockets.push(rocket);
    this.sound.playShoot();

    // 1. Player Knockback (Opposite to shot direction, scaled by damage - horizontal is made WAY more dramatic!)
    const knockbackX = Math.min(24, 1.2 + activeWeapon.damage * 0.013);
    const knockbackY = Math.min(10, 0.4 + activeWeapon.damage * 0.0040);
    this.player.vx -= Math.cos(rocket.angle) * knockbackX;
    this.player.vy -= Math.sin(rocket.angle) * knockbackY;

    // 2. Muzzle Flash Particles (WAY more dramatic size and count!)
    const barrelLen = 38;
    const muzzleX = spawnX + Math.cos(rocket.angle) * barrelLen;
    const muzzleY = (this.player.y + 20) + Math.sin(rocket.angle) * barrelLen;
    
    const flashCount = 12 + Math.floor(Math.random() * 7);
    const colors = ['#ffba08', '#ff7b00', '#ffffff', '#ff3c00'];
    for (let k = 0; k < flashCount; k++) {
      const flashAngle = rocket.angle + (Math.random() * 0.6 - 0.3); // wider cone flash spray
      const flashSpeed = 3 + Math.random() * 8;
      const vx = Math.cos(flashAngle) * flashSpeed + this.player.vx * 0.5;
      const vy = Math.sin(flashAngle) * flashSpeed + this.player.vy * 0.5;
      const size = 5 + Math.random() * 7; // larger glow sparks
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(muzzleX, muzzleY, vx, vy, color, size, 0.05 + Math.random() * 0.05, 'spark'));
    }

    // 3. Shell Casing Ejection (For non-handgun / non-energy weapons)
    const nonShellGuns = ['blaster', 'plasma_pistol', 'bow'];
    if (!nonShellGuns.includes(activeWeapon.id)) {
      const ejectAngle = rocket.angle + Math.PI + (Math.random() * 0.6 - 0.3);
      const ejectSpeed = 2.0 + Math.random() * 1.5;
      const svx = Math.cos(ejectAngle) * ejectSpeed + this.player.vx * 0.5;
      const svy = Math.sin(ejectAngle) * ejectSpeed - 1.8 + this.player.vy * 0.5;
      
      const p = new Particle(spawnX, this.player.y + 20, svx, svy, '#ffb700', 4, 0.015, 'shell');
      p.rotation = Math.random() * Math.PI * 2;
      p.rotSpeed = 0.12 + Math.random() * 0.18;
      this.particles.push(p);
    }

    // Auto-reload immediately when magazine drops to 0
    if (this.currentAmmo === 0) {
      this.reloadTimer = 1.5;
      this.sound.playReload();
    }

    const cooldownMs = activeWeapon.firerate * Math.pow(0.88, lvls.firerate - 1);
    this.shootCooldown = Math.max(0.06, cooldownMs / 1000);
  }

  triggerExplosion(x, y, damage, radius) {
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;
    const distance = Math.hypot(x - px, y - py);

    this.sound.playExplode(radius, distance);
    this.screenShake = 12;

    // Glowing explosion particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 4 + Math.random() * 6;
      const decay = 0.02 + Math.random() * 0.02;
      const color = i % 2 === 0 ? '#ff5e00' : 'rgba(100,100,100,0.4)';
      this.particles.push(new Particle(x, y, vx, vy, color, size, decay, 'smoke'));
    }

    const minC = Math.max(0, Math.floor((x - radius) / BLOCK_SIZE));
    const maxC = Math.floor((x + radius) / BLOCK_SIZE);
    const minR = Math.max(0, Math.floor((y - radius) / BLOCK_SIZE));
    const maxR = Math.floor((y + radius) / BLOCK_SIZE);

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const key = `${r},${c}`;
        const block = this.blocks[key];
        if (!block) continue;

        const bx = block.x + BLOCK_SIZE / 2;
        const by = block.y + BLOCK_SIZE / 2;
        const dist = Math.hypot(bx - x, by - y);

        if (dist <= radius) {
          block.hp -= damage;
          
          // Spawn block debris sparks
          for (let k = 0; k < 2; k++) {
            const vx = (Math.random() * 4 - 2);
            const vy = -1 - Math.random() * 2;
            const blockColor = BLOCKS_CONFIG[block.type].color;
            this.particles.push(new Particle(bx, by, vx, vy, blockColor, 3 + Math.random() * 2, 0.04, 'spark'));
          }

          if (block.hp <= 0) {
            const blockColor = BLOCKS_CONFIG[block.type].color;
            
            // Spawn 8-12 rock fragment particles (small cubes)
            const particleCount = 8 + Math.floor(Math.random() * 5);
            for (let k = 0; k < particleCount; k++) {
              const vx = (Math.random() * 6 - 3);
              const vy = -1 - Math.random() * 4;
              const size = 5 + Math.random() * 4;
              this.particles.push(new Particle(bx, by, vx, vy, blockColor, size, 0.02 + Math.random() * 0.02, 'debris'));
            }

            // Explode it and drop ore
            if (block.ore) {
              const oreConfig = ORES[block.ore];
              this.ores.push(new OreCollect(bx, by, block.ore, oreConfig));

              // Spawn 6 ore shard particles from asset pack flying outwards (made 120% scale!)
              for (let k = 0; k < 6; k++) {
                const vx = (Math.random() * 6 - 3);
                const vy = -2 - Math.random() * 3;
                const shardVar = Math.floor(Math.random() * 3);
                const shardSize = 12 + Math.random() * 6;
                this.particles.push(new Particle(bx, by, vx, vy, oreConfig.color, shardSize, 0.02 + Math.random() * 0.02, 'ore_shard', block.ore, shardVar));
              }
            }
            delete this.blocks[key];
          }
        }
      }
    }
  }

  sellAllOres() {
    let earned = 0;
    Object.keys(this.inventory).forEach(key => {
      const qty = this.inventory[key];
      if (qty > 0) {
        const val = ORES[key].sell * qty;
        earned += val;
        this.inventory[key] = 0;
      }
    });

    if (earned > 0) {
      this.coins += earned;
      this.sound.playCash();
      this.updateHUD();
    }
  }

  buyUpgrade(type) {
    const upgrade = this.upgrades[type];
    const cost = this.getUpgradeCost(upgrade);
    if (this.coins >= cost) {
      this.coins -= cost;
      upgrade.level += 1;
      this.sound.playUpgrade();
      this.updateHUD();
      this.renderUpgrades();
    }
  }

  openWeaponDetails(weaponId) {
    const weapon = WEAPONS_DB.find(w => w.id === weaponId);
    if (!weapon) return;

    this.selectedDetailWeaponId = weaponId;
    this.weaponDetailOverlay.style.display = 'flex';

    document.getElementById('detail-weapon-name').textContent = `${weapon.name.toUpperCase()} UPGRADE`;
    document.getElementById('detail-weapon-desc').textContent = weapon.desc;

    const previewCanvas = document.getElementById('enlarged-weapon-canvas');
    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, 160, 160);
    ctx.imageSmoothingEnabled = false;
    if (this.weaponPackLoaded) {
      ctx.drawImage(
        this.weaponPackImage,
        weapon.col * 64,
        weapon.row * 64,
        64,
        64,
        0,
        0,
        160,
        160
      );
    }

    this.renderWeaponStatUpgrades();
  }

  renderWeaponStatUpgrades() {
    const weaponId = this.selectedDetailWeaponId;
    const weapon = WEAPONS_DB.find(w => w.id === weaponId);
    const lvls = this.weaponUpgrades[weaponId];
    if (!weapon || !lvls) return;

    const statsList = document.getElementById('weapon-stat-upgrades-list');
    statsList.innerHTML = '';

    const statsDef = [
      { key: 'damage', name: 'Muzzle Power', baseVal: weapon.damage, lvl: lvls.damage, scale: 1.20, unit: ' DMG', desc: 'Boosts rocket projectile damage' },
      { key: 'radius', name: 'Explosive Charge', baseVal: weapon.radius, lvl: lvls.radius, scale: 1.10, unit: 'm RAD', desc: 'Increases explosion blast radius' },
      { key: 'firerate', name: 'Hydraulic Auto-loader', baseVal: weapon.firerate, lvl: lvls.firerate, scale: 0.88, unit: 'ms CD', desc: 'Reduces firing reload cooldown' }
    ];

    statsDef.forEach(stat => {
      const currentVal = Math.round(stat.baseVal * Math.pow(stat.scale, stat.lvl - 1));
      const nextVal = Math.round(stat.baseVal * Math.pow(stat.scale, stat.lvl));
      const cost = Math.floor(weapon.upgradeBaseCost * Math.pow(1.5, stat.lvl - 1));

      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.style.background = 'rgba(255, 255, 255, 0.02)';

      const info = document.createElement('div');
      info.className = 'upgrade-info';
      
      const title = document.createElement('div');
      title.className = 'upgrade-title';
      title.textContent = stat.name;
      
      const desc = document.createElement('div');
      desc.className = 'upgrade-desc';
      desc.textContent = stat.desc;

      const valDisplay = document.createElement('div');
      valDisplay.style.fontSize = '0.75rem';
      valDisplay.style.color = 'var(--neon-cyan)';
      valDisplay.style.fontWeight = '600';
      valDisplay.textContent = `Value: ${currentVal}${stat.unit} ➔ ${nextVal}${stat.unit}`;

      info.appendChild(title);
      info.appendChild(desc);
      info.appendChild(valDisplay);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'upgrade-buy-btn';
      btn.style.minWidth = '95px';

      btn.innerHTML = `<span class="upgrade-lvl">LVL ${stat.lvl}</span><span class="upgrade-cost">${cost}c</span><span class="upgrade-label">UPGRADE</span>`;
      btn.disabled = this.coins < cost;
      
      btn.addEventListener('click', () => {
        if (this.coins >= cost) {
          this.coins -= cost;
          this.weaponUpgrades[weaponId][stat.key] += 1;
          this.sound.playUpgrade();
          this.updateHUD();
          this.renderWeaponStatUpgrades();
        }
      });

      card.appendChild(info);
      card.appendChild(btn);
      statsList.appendChild(card);
    });
  }

  updateHUD() {
    this.coinValEl.textContent = this.coins;

    Object.keys(this.inventory).forEach(key => {
      const el = document.getElementById(`ore-qty-${key}`);
      if (el) el.textContent = this.inventory[key];
    });

    Object.keys(this.upgrades).forEach(key => {
      const upgrade = this.upgrades[key];
      const btn = this.upgradeBuyButtons[key];
      if (!btn) return;

      const cost = this.getUpgradeCost(upgrade);
      btn.querySelector('.upgrade-lvl').textContent = `LVL ${upgrade.level}`;
      btn.querySelector('.upgrade-cost').textContent = `${cost}c`;
      btn.disabled = this.coins < cost;
    });

    const hasOres = Object.values(this.inventory).some(q => q > 0);
    this.sellBtn.disabled = !hasOres;
  }

  renderUpgrades() {
    const listContainer = document.getElementById('upgrades-panel-list');
    listContainer.innerHTML = '';

    Object.keys(this.upgrades).forEach(key => {
      const upgrade = this.upgrades[key];
      const cost = this.getUpgradeCost(upgrade);

      const card = document.createElement('div');
      card.className = 'upgrade-card';

      const info = document.createElement('div');
      info.className = 'upgrade-info';
      
      const title = document.createElement('div');
      title.className = 'upgrade-title';
      title.textContent = upgrade.name;
      
      const desc = document.createElement('div');
      desc.className = 'upgrade-desc';
      desc.textContent = upgrade.desc;

      info.appendChild(title);
      info.appendChild(desc);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'upgrade-buy-btn';
      
      const lvlSpan = document.createElement('span');
      lvlSpan.className = 'upgrade-lvl';
      lvlSpan.textContent = `LVL ${upgrade.level}`;

      const costSpan = document.createElement('span');
      costSpan.className = 'upgrade-cost';
      costSpan.textContent = `${cost}c`;

      const buyLabel = document.createElement('span');
      buyLabel.className = 'upgrade-label';
      buyLabel.textContent = 'BUY';

      btn.appendChild(lvlSpan);
      btn.appendChild(costSpan);
      btn.appendChild(buyLabel);

      btn.addEventListener('click', () => this.buyUpgrade(key));

      card.appendChild(info);
      card.appendChild(btn);
      listContainer.appendChild(card);

      this.upgradeBuyButtons[key] = btn;
    });

    this.updateHUD();
  }

  renderWeapons() {
    const listContainer = document.getElementById('weapons-panel-list');
    listContainer.innerHTML = '';

    WEAPONS_DB.forEach(weapon => {
      const isUnlocked = this.unlockedWeapons.includes(weapon.id);
      const isEquipped = this.equippedWeaponId === weapon.id;
      const lvls = this.weaponUpgrades[weapon.id];

      const card = document.createElement('div');
      card.className = 'upgrade-card';

      const iconContainer = document.createElement('div');
      iconContainer.style.width = '48px';
      iconContainer.style.height = '48px';
      iconContainer.style.background = 'rgba(255, 255, 255, 0.03)';
      iconContainer.style.border = '1px solid var(--border-light)';
      iconContainer.style.borderRadius = '8px';
      iconContainer.style.display = 'flex';
      iconContainer.style.justifyContent = 'center';
      iconContainer.style.alignItems = 'center';
      iconContainer.style.overflow = 'hidden';

      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      if (this.weaponPackLoaded) {
        ctx.drawImage(
          this.weaponPackImage,
          weapon.col * 64,
          weapon.row * 64,
          64,
          64,
          0,
          0,
          48,
          48
        );
      }
      iconContainer.appendChild(canvas);

      const info = document.createElement('div');
      info.className = 'upgrade-info';
      info.style.marginLeft = '0.5rem';
      
      const title = document.createElement('div');
      title.className = 'upgrade-title';
      title.textContent = weapon.name;
      
      const desc = document.createElement('div');
      desc.className = 'upgrade-desc';
      desc.textContent = weapon.desc;

      const currentDmg = Math.round(weapon.damage * Math.pow(1.20, lvls.damage - 1));
      const currentRad = Math.round(weapon.radius * Math.pow(1.10, lvls.radius - 1));
      const currentCD = Math.round(weapon.firerate * Math.pow(0.88, lvls.firerate - 1));

      const stats = document.createElement('div');
      stats.style.fontSize = '0.65rem';
      stats.style.color = 'var(--neon-cyan)';
      stats.style.fontWeight = '600';
      stats.textContent = `DMG: ${currentDmg} | RAD: ${currentRad}m | CD: ${currentCD}ms`;

      info.appendChild(title);
      info.appendChild(desc);
      info.appendChild(stats);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'upgrade-buy-btn';
      btn.style.minWidth = '85px';

      if (isEquipped) {
        btn.innerHTML = `<span class="upgrade-lvl" style="color: var(--neon-cyan)">UPGRADE</span><span class="upgrade-label">CUSTOMIZE</span>`;
        btn.addEventListener('click', () => this.openWeaponDetails(weapon.id));
      } else if (isUnlocked) {
        btn.innerHTML = `<span class="upgrade-lvl">UNLOCKED</span><span class="upgrade-label">EQUIP</span>`;
        btn.addEventListener('click', () => {
          this.equippedWeaponId = weapon.id;
          this.currentAmmo = weapon.magazine; // instantly reload to new weapon capacity
          this.reloadTimer = 0;
          this.sound.playReload();
          this.renderWeapons();
        });
      } else {
        btn.innerHTML = `<span class="upgrade-lvl">LOCKED</span><span class="upgrade-cost">${weapon.cost}c</span><span class="upgrade-label">BUY</span>`;
        btn.disabled = this.coins < weapon.cost;
        btn.addEventListener('click', () => {
          this.coins -= weapon.cost;
          this.unlockedWeapons.push(weapon.id);
          this.equippedWeaponId = weapon.id;
          this.currentAmmo = weapon.magazine; // instantly reload to new weapon capacity
          this.reloadTimer = 0;
          this.sound.playReload();
          this.updateHUD();
          this.renderWeapons();
        });
      }

      card.appendChild(iconContainer);
      card.appendChild(info);
      card.appendChild(btn);
      listContainer.appendChild(card);
    });
  }

  startGameLoop() {
    const step = (timestamp) => {
      if (!this.lastTime) this.lastTime = timestamp;
      const dt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;

      if (!this.isPaused) {
        this.update(dt);
      }
      this.draw();

      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  update(dt) {
    // 1. Cooldowns & Reloading
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    if (this.reloadTimer > 0) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        const activeWeapon = WEAPONS_DB.find(w => w.id === this.equippedWeaponId) || WEAPONS_DB[0];
        this.currentAmmo = activeWeapon.magazine;
      }
    }

    // 2. Automatic continuous firing
    if (this.isMouseDown && !this.isPaused && this.shootCooldown <= 0 && this.reloadTimer <= 0) {
      this.shootRocket();
    }

    // 3. Update HUD Ammo text display
    const activeWeapon = WEAPONS_DB.find(w => w.id === this.equippedWeaponId) || WEAPONS_DB[0];
    const ammoMarker = document.getElementById('miner-ammo-marker');
    const ammoVal = document.getElementById('ammo-val');
    if (ammoMarker && ammoVal) {
      if (this.reloadTimer > 0) {
        ammoVal.textContent = 'RELOADING...';
        ammoMarker.classList.add('reloading');
      } else {
        ammoVal.textContent = `AMMO: ${this.currentAmmo} / ${activeWeapon.magazine}`;
        ammoMarker.classList.remove('reloading');
      }
    }

    // Miner controls
    const movementSpeed = 3.5;
    
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      this.player.vx = -movementSpeed;
    } else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      this.player.vx = movementSpeed;
    } else {
      this.player.vx *= 0.75;
    }

    // Jetpack Hover
    const jetThrust = this.getUpgradeValue('jetpack', this.upgrades.jetpack.level);
    const gravity = 0.28;

    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
      this.player.vy -= jetThrust * dt * 60;
      if (this.player.vy < -7) this.player.vy = -7;
      
      // Spawn jetpack flame particles
      if (Math.random() < 0.4) {
        const px = this.player.x + Math.random() * this.player.width;
        const py = this.player.y + this.player.height;
        const vx = (Math.random() * 2 - 1);
        const vy = 1 + Math.random() * 2;
        this.particles.push(new Particle(px, py, vx, vy, '#ff5e00', 3, 0.05));
      }
    } else {
      this.player.vy += gravity;
    }

    // Move Player X and check bounds
    this.player.x += this.player.vx;
    this.handleHorizontalCollisions();

    // Move Player Y and check bounds
    this.player.y += this.player.vy;
    this.handleVerticalCollisions();

    if (this.player.y < 0) {
      this.player.y = 0;
      this.player.vy = 0;
    }

    // Update Projectiles
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const rocket = this.rockets[i];
      rocket.update();

      // Check block impact
      const key = `${Math.floor(rocket.y / BLOCK_SIZE)},${Math.floor(rocket.x / BLOCK_SIZE)}`;
      const hitBlock = this.blocks[key];

      if (hitBlock || rocket.y < 0 || rocket.y > this.cameraY + this.logicalHeight + 300 || 
          rocket.x < this.cameraX - 300 || rocket.x > this.cameraX + this.logicalWidth + 300) {
        
        this.triggerExplosion(rocket.x, rocket.y, rocket.damage, rocket.radius);
        this.rockets.splice(i, 1);
        continue;
      }

      // Spark trail
      if (Math.random() < 0.5) {
        this.particles.push(new Particle(rocket.x, rocket.y, -rocket.vx * 0.2, -rocket.vy * 0.2, '#ffd000', 2, 0.04, 'spark'));
      }
    }

    // Update Collectibles (Ores)
    const magRadius = this.getUpgradeValue('magnet', this.upgrades.magnet.level);
    
    for (let i = this.ores.length - 1; i >= 0; i--) {
      const ore = this.ores[i];
      ore.update(this.player, magRadius);

      // Collect collision
      const px = this.player.x + this.player.width / 2;
      const py = this.player.y + this.player.height / 2;
      const dist = Math.hypot(ore.x - px, ore.y - py);

      if (dist < this.player.width / 2 + 10) {
        this.inventory[ore.type] += 1;
        this.sound.playPickup();
        this.updateHUD();
        this.ores.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Depth HUD
    const currentDepth = Math.max(0, Math.floor((this.player.y - BLOCK_SIZE * 5) / 10));
    this.depthValEl.textContent = `${currentDepth}m`;

    // Dynamic map area generation
    const playerRow = Math.floor(this.player.y / BLOCK_SIZE);
    const playerCol = Math.floor(this.player.x / BLOCK_SIZE);
    this.generateMapArea(playerRow - 6, playerRow + 15, playerCol - 12, playerCol + 12);

    // Camera following LERP
    const targetCamX = this.player.x - this.logicalWidth / 2;
    const targetCamY = this.player.y - this.logicalHeight / 2.5;
    
    this.cameraX += (targetCamX - this.cameraX) * 0.08;
    this.cameraY += (targetCamY - this.cameraY) * 0.08;
    this.cameraY = Math.max(0, this.cameraY);

    // Decay screenshake
    if (this.screenShake > 0) {
      this.screenShake *= 0.9;
      if (this.screenShake < 0.1) this.screenShake = 0;
    }

    // Check NPC interaction distances to show interaction prompt
    const distToMouse = Math.hypot(
      (this.player.x + this.player.width / 2) - (this.mouseMiner.x + this.mouseMiner.width / 2),
      (this.player.y + this.player.height / 2) - (this.mouseMiner.y + this.mouseMiner.height / 2)
    );

    if (distToMouse < 60 && !this.dialogueOpen) {
      this.interactionPrompt.style.display = 'block';
    } else {
      this.interactionPrompt.style.display = 'none';
    }
  }

  handleHorizontalCollisions() {
    const minCol = Math.floor(this.player.x / BLOCK_SIZE);
    const maxCol = Math.floor((this.player.x + this.player.width) / BLOCK_SIZE);
    const minRow = Math.floor((this.player.y + 0.1) / BLOCK_SIZE);
    const maxRow = Math.floor((this.player.y + this.player.height - 0.1) / BLOCK_SIZE);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const key = `${r},${c}`;
        const block = this.blocks[key];
        if (block) {
          if (this.player.vx > 0) {
            this.player.x = block.x - this.player.width;
            this.player.vx = 0;
          } else if (this.player.vx < 0) {
            this.player.x = block.x + BLOCK_SIZE;
            this.player.vx = 0;
          }
        }
      }
    }
  }

  handleVerticalCollisions() {
    const minCol = Math.floor((this.player.x + 0.1) / BLOCK_SIZE);
    const maxCol = Math.floor((this.player.x + this.player.width - 0.1) / BLOCK_SIZE);
    const minRow = Math.floor(this.player.y / BLOCK_SIZE);
    const maxRow = Math.floor((this.player.y + this.player.height) / BLOCK_SIZE);

    this.player.isGrounded = false;

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const key = `${r},${c}`;
        const block = this.blocks[key];
        if (block) {
          if (this.player.vy > 0) {
            this.player.y = block.y - this.player.height;
            this.player.vy = 0;
            this.player.isGrounded = true;
          } else if (this.player.vy < 0) {
            this.player.y = block.y + BLOCK_SIZE;
            this.player.vy = 0;
          }
        }
      }
    }
  }

  get scale() {
    return this.canvas.width / 800;
  }

  draw() {
    const ctx = this.canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    ctx.save();
    
    // Screenshake
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake;
      shakeY = (Math.random() - 0.5) * this.screenShake;
    }
    ctx.translate(shakeX, shakeY);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.cameraX, -this.cameraY);

    // Draw sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, BLOCK_SIZE * 5);
    skyGrad.addColorStop(0, '#001a33');
    skyGrad.addColorStop(1, '#0c0817');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(this.cameraX, 0, 800, BLOCK_SIZE * 5 - this.cameraY);

    // Draw stars
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    const stars = [[30,20], [120,40], [280,30], [390,70], [450,15], [580,25], [680,60], [780,10]];
    stars.forEach(s => {
      ctx.fillRect(s[0] + this.cameraX * 0.1, s[1], 2, 2);
    });

    // Draw active blocks
    const minRow = Math.max(0, Math.floor(this.cameraY / BLOCK_SIZE) - 1);
    const maxRow = Math.floor((this.cameraY + this.logicalHeight) / BLOCK_SIZE) + 1;
    const minCol = Math.floor(this.cameraX / BLOCK_SIZE) - 1;
    const maxCol = Math.floor((this.cameraX + 800) / BLOCK_SIZE) + 1;

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const key = `${r},${c}`;
        const block = this.blocks[key];
        if (!block) continue;

        ctx.save();
        ctx.translate(block.x + BLOCK_SIZE / 2, block.y + BLOCK_SIZE / 2);
        if (block.rot) ctx.rotate(block.rot);
        if (this.tilemapLoaded) {
          ctx.drawImage(this.tilemap, 0, 0, 8, 8, -BLOCK_SIZE/2, -BLOCK_SIZE/2, BLOCK_SIZE, BLOCK_SIZE);
          
          if (block.type !== 'stone') {
            ctx.fillStyle = block.type === 'dirt' ? 'rgba(75, 56, 42, 0.35)' :
                           block.type === 'hardstone' ? 'rgba(53, 51, 61, 0.35)' :
                           block.type === 'obsidian' ? 'rgba(29, 18, 43, 0.5)' :
                           block.type === 'bedrock' ? 'rgba(14, 11, 20, 0.65)' : 'transparent';
            ctx.fillRect(-BLOCK_SIZE/2, -BLOCK_SIZE/2, BLOCK_SIZE, BLOCK_SIZE);
          }

          if (block.ore && this.oresheetLoaded) {
            const oreIdx = ORE_TYPES_LIST.indexOf(block.ore);
            if (oreIdx !== -1) {
              const segment = Math.floor(oreIdx / 6);
              const localRow = oreIdx % 6;
              const oCol = segment * 6 + block.varIdx;
              const oRow = localRow;
              ctx.drawImage(this.oresheet, oCol * 16, oRow * 16, 16, 16, -BLOCK_SIZE/2, -BLOCK_SIZE/2, BLOCK_SIZE, BLOCK_SIZE);
            }
          }
        } else {
          ctx.fillStyle = block.type === 'dirt' ? '#3c281a' : BLOCKS_CONFIG[block.type].color;
          ctx.fillRect(-BLOCK_SIZE/2, -BLOCK_SIZE/2, BLOCK_SIZE, BLOCK_SIZE);
          if (block.ore) {
            ctx.fillStyle = ORES[block.ore].color;
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Render black cracks (or screen-blended white cracks if local CORS blocks canvas inspection)
        const damagePercent = 1.0 - (block.hp / block.maxHp);
        if (damagePercent > 0.05 && this.crackLoaded) {
          const drawCrackLayer = (angle = 0, flipX = false) => {
            ctx.save();
            if (angle) ctx.rotate(angle);
            if (flipX) ctx.scale(-1, 1);
            if (this.crackIsBlack) {
              ctx.drawImage(this.crackCanvas, -BLOCK_SIZE/2, -BLOCK_SIZE/2, BLOCK_SIZE, BLOCK_SIZE);
            } else {
              ctx.globalAlpha = 0.85;
              ctx.globalCompositeOperation = 'screen';
              ctx.drawImage(this.crackImage, -BLOCK_SIZE/2, -BLOCK_SIZE/2, BLOCK_SIZE, BLOCK_SIZE);
            }
            ctx.restore();
          };

          // Layer 1
          drawCrackLayer(0, false);
          
          // Layer 2: 90 degrees offset at > 40% damage
          if (damagePercent > 0.40) {
            drawCrackLayer(Math.PI / 2, false);
          }
          
          // Layer 3: 180 degrees flipped at > 75% damage
          if (damagePercent > 0.75) {
            drawCrackLayer(Math.PI, true);
          }
        }
        ctx.restore();
      }
    }

    // Draw projectiles
    this.rockets.forEach(rocket => {
      ctx.save();
      ctx.translate(rocket.x, rocket.y);
      ctx.rotate(rocket.angle);
      ctx.fillStyle = '#ff3c00';
      ctx.fillRect(-rocket.width / 2, -rocket.height / 2, rocket.width, rocket.height);
      ctx.restore();
    });

    // Draw collectibles
    this.ores.forEach(ore => {
      ctx.save();
      ctx.translate(ore.x, ore.y);
      if (this.oresheetLoaded) {
        const oreIdx = ORE_TYPES_LIST.indexOf(ore.type);
        if (oreIdx !== -1) {
          const segment = Math.floor(oreIdx / 6);
          const localRow = oreIdx % 6;
          const oCol = segment * 6 + 3 + ore.shardVarIdx;
          const oRow = localRow;
          ctx.drawImage(this.oresheet, oCol * 16, oRow * 16, 16, 16, -ore.size / 2, -ore.size / 2, ore.size, ore.size);
        }
      } else {
        ctx.fillStyle = ore.color;
        ctx.fillRect(-ore.size / 2, -ore.size / 2, ore.size, ore.size);
      }
      ctx.restore();
    });

    // Draw NPCs (Mouse Miner & Trapped Friend)
    this.drawMouseNPC(ctx, this.mouseMiner, false);
    this.drawMouseNPC(ctx, this.trappedFriend, true);

    // Draw particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      if (p.type === 'shell') {
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-2, -1, 4, 2); // 4x2 gold cylinder casing
      } else if (p.type === 'ore_shard' && this.oresheetLoaded) {
        const oreIdx = ORE_TYPES_LIST.indexOf(p.oreType);
        if (oreIdx !== -1) {
          const segment = Math.floor(oreIdx / 6);
          const localRow = oreIdx % 6;
          const oCol = segment * 6 + 3 + p.shardVarIdx;
          const oRow = localRow;
          ctx.drawImage(this.oresheet, oCol * 16, oRow * 16, 16, 16, -p.size / 2, -p.size / 2, p.size, p.size);
        }
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    });

    // Draw player body
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    
    ctx.fillStyle = '#00f2fe';
    ctx.beginPath();
    ctx.arc(this.player.width / 2, 12, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#35333d';
    ctx.fillRect(0, 12, 6, 18);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(3, 18, this.player.width - 6, 16, 6);
    } else {
      ctx.rect(3, 18, this.player.width - 6, 16);
    }
    ctx.fill();
    ctx.restore();

    // Draw weapon
    const activeWeapon = WEAPONS_DB.find(w => w.id === this.equippedWeaponId) || WEAPONS_DB[0];
    ctx.save();
    ctx.translate(this.player.x + this.player.width / 2, this.player.y + 20); // shoulder pivot
    
    const dx = this.mouseX - (this.player.x + this.player.width / 2);
    const dy = this.mouseY - (this.player.y + 20);
    const angle = Math.atan2(dy, dx);
    ctx.rotate(angle);

    const gunWidth = 96;
    const gunHeight = 96;
    if (Math.abs(angle) > Math.PI / 2) {
      ctx.scale(1, -1);
    }

    if (this.weaponPackLoaded) {
      ctx.drawImage(
        this.weaponPackImage,
        activeWeapon.col * 64,
        activeWeapon.row * 64,
        64,
        64,
        -gunWidth / 2,
        -gunHeight / 2,
        gunWidth,
        gunHeight
      );
    } else {
      ctx.fillStyle = '#ffd000';
      ctx.fillRect(0, -5, 25, 10);
    }
    ctx.restore();

    // Draw Quest Locator Arrow pointing to the trapped friend
    if (this.questState === 'active') {
      const px = this.player.x + this.player.width / 2;
      const py = this.player.y + this.player.height / 2;
      
      const fx = this.trappedFriend.x + this.trappedFriend.width / 2;
      const fy = this.trappedFriend.y + this.trappedFriend.height / 2;

      const dx = fx - px;
      const dy = fy - py;
      const dist = Math.hypot(dx, dy);

      if (dist > 120) {
        const angle = Math.atan2(dy, dx);
        
        ctx.save();
        const arrowDist = 55;
        const arrowX = px + Math.cos(angle) * arrowDist;
        const arrowY = py + Math.sin(angle) * arrowDist;
        
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);

        // Draw HUD locator arrow
        ctx.fillStyle = '#00f2fe';
        ctx.strokeStyle = '#001a33';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-8, -8);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-8, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }

    ctx.restore();
  }
}

// Instantiate on startup (handles cases where script is loaded deferred or async)
const initGame = () => {
  if (!window.minerGame) {
    window.minerGame = new GameController();
  }
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
