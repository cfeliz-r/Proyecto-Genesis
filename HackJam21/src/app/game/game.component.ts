import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  private player!: { 
    mesh: THREE.Mesh, 
    controls: any, 
    textures: { [key: string]: THREE.Texture[] }, 
    currentTextureIndex: number,
    direction: string
  };
  private oxygenTank!: THREE.Mesh;
  private stars: THREE.Points | null = null;
  private walls: THREE.Mesh[] = [];
  private collisionRadius = 0.8;
  private planets: THREE.Mesh[] = [];

  private textureLoader = new THREE.TextureLoader();

  // Texturas del mapa
  private wallTexture = this.textureLoader.load('https://i.ibb.co/KcF96vpW/3.png');
  private oxygenTexture = this.textureLoader.load('https://i.ibb.co/KzKdJZjF/orb.gif');

  // Texturas del personaje P
  private playerTextures: { [key: string]: THREE.Texture[] } = {
    'right': [
      this.textureLoader.load('https://i.ibb.co/s9NQ8WVd/stepone-removebg-preview.png'),
      this.textureLoader.load('https://i.ibb.co/Cp7S1BPt/steptwo-removebg-preview.png')
    ],
    'left': [
      this.textureLoader.load('https://i.ibb.co/s9NQ8WVd/stepone-removebg-preview.png'),
      this.textureLoader.load('https://i.ibb.co/Cp7S1BPt/steptwo-removebg-preview.png')
    ],
    'up': [
      this.textureLoader.load('https://i.ibb.co/nNhFR2W1/upone-removebg-preview.png'),
      this.textureLoader.load('https://i.ibb.co/9H4z7HqS/uptwo-removebg-preview.png')
    ],
    'down': [
      this.textureLoader.load('https://i.ibb.co/CsD3qzpY/downone-removebg-preview.png'),
      this.textureLoader.load('https://i.ibb.co/1Yt4xXf8/downtwo-removebg-preview.png')
    ]
  };
  
  private createPlanets() {
    const numPlanets = 15; // Aseguramos que haya suficientes para ver al menos 4 o 5
    const planetTextures: THREE.Texture[] = [];
  
    // 🎨 Crear texturas con gradientes de color
    for (let i = 0; i < numPlanets; i++) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 256;
      canvas.height = 256;
  
      // Crear gradiente radial
      const gradient = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
      const color1 = `hsl(${Math.random() * 360}, 100%, 50%)`; // Color aleatorio
      const color2 = `hsl(${Math.random() * 360}, 80%, 30%)`;
  
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
  
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
  
      // Crear textura a partir del canvas
      const texture = new THREE.CanvasTexture(canvas);
      planetTextures.push(texture);
    }
  
    for (let i = 0; i < numPlanets; i++) {
      const size = THREE.MathUtils.randFloat(1, 3); // Asegurar variedad de tamaños
      const distance = THREE.MathUtils.randFloat(50, 150); // Mayor rango de profundidad
      const geometry = new THREE.SphereGeometry(size, 64, 64);
  
      // Material con gradiente generado
      const material = new THREE.MeshStandardMaterial({
        map: planetTextures[i % planetTextures.length],
        roughness: 0.5,
        metalness: 0.3,
        emissive: new THREE.Color(0x222222), // Brillo sutil
        transparent: true,
        opacity: THREE.MathUtils.mapLinear(distance, 50, 150, 1, 0.4) // Más transparencia en planetas lejanos
      });
  
      const planet = new THREE.Mesh(geometry, material);
  
      // Posicionar aleatoriamente lejos del jugador pero asegurando visibilidad
      planet.position.set(
        (Math.random() - 0.5) * 120, // Aumentamos el rango de dispersión
        (Math.random() - 0.5) * 120,
        -distance
      );
  
      this.scene.add(planet);
      this.planets.push(planet);
    }
  }
  
  
  
  
  // Mapa con un solo jugador (P)
  private mapData: string[] = [
    "1111111111111111111111111111111111111111111111111111111111111111",
    "1000000000000000000000000000000000000000000000000000000000000001",
    "1000111100001100001111000110000110011111100001111000110000110001",
    "100000000000000O000000000000000000000000O00000000000000000000001",
    "1000111100001110000111000110000110011111100001111000110000110001",
    "1000000000000000000000000000000000010000000000000000000000000001",
    "1011111111111000000000000001111111011111000000000000111111111101",
    "1000000000000000000000000000000000000000000000000000000000000001",
    "1000000111111111000111111111000111111111000111111111000000000001",
    "1000000000000000000000000000000000000000000000000000000000000001",
    "100000000000000P000000000000000000000000000000000000000000000001",
    "1000000000000000000000000000000000000000000000000000000000000001",
    "1011111111111000000000000001111111011111000000000000111111111101",
    "1000000000000000000000000000000000000000000000000000000000000001",
    "1000000111111111000111111111000111111111000111111111000000000001",
    "1000000000000000000000000000000000000000000000000000000000000001",
    "1011111111111000000000000001111111011111000000000000111111111101",
    "1000000000000000000000000000000000000000000000000000000000000001",
    "1000000111111111000111111111000111111111000111111111000000000001",
    "1000000000000000000000000000000000000000000000000000000000000001",
    "1111111111111111111111111111111111111111111111111111111111111111"
  ];
  


  constructor() {}

  async ngOnInit(): Promise<void> {
    this.initThreeJS();
    this.addLights(); // ✅ Agregar luces para los planetas

    this.createStars();
    this.createPlanets(); // ✅ Agregar planetas al fondo

    this.generateMap();
    this.animateScene();
  }

  private animateScene() {
    requestAnimationFrame(() => this.animateScene());
  
    // Hacer que la cámara siga al jugador
    this.camera.position.set(this.player.mesh.position.x, this.player.mesh.position.y, 10);
    this.camera.lookAt(this.player.mesh.position.x, this.player.mesh.position.y, 0);
  
    // Animación del fondo de estrellas
    if (this.stars) {
      this.stars.rotation.y += 0.0001; // Más lenta para mejorar el efecto
    }
  
    // 🔹 Movimiento más fluido de los planetas
    this.planets.forEach(planet => {
      planet.rotation.y += 0.0001; // Rotación más lenta
      planet.rotation.x += 0.00005;
  
      // Movimiento más suave en el fondo
      planet.position.x += Math.sin(Date.now() * 0.00002) * 0.005;
      planet.position.y += Math.cos(Date.now() * 0.00002) * 0.005;
    });
  
    this.renderer.render(this.scene, this.camera);
  }
  
  
  
  

  private initThreeJS() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
  
    const aspectRatio = window.innerWidth / window.innerHeight;
    const zoom = 7; // Ajusta este valor según necesites
    this.camera = new THREE.OrthographicCamera(
      -zoom * aspectRatio, zoom * aspectRatio, zoom, -zoom, 0.1, 1000
    );
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);
  
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio); // ✅ Asegura calidad en pantallas retina
  
    document.body.appendChild(this.renderer.domElement);
  }
  
  private addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz ambiental suave
    this.scene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10); // Luz proveniente de un ángulo
    this.scene.add(directionalLight);
  }
  

  private createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 500; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
  }

  private generateMap() {
    const wallGeometry = new THREE.PlaneGeometry(1, 1); // 🔹 Convertir en plano 2D
    const wallMaterial = new THREE.MeshBasicMaterial({ map: this.wallTexture, transparent: true });

    const oxygenGeometry = new THREE.PlaneGeometry(2, 2); // 🔹 Ahora es plano
    const oxygenMaterial = new THREE.MeshBasicMaterial({
        map: this.oxygenTexture, 
        transparent: true,
        side: THREE.DoubleSide // Se verá de ambos lados
    });

    const playerGeometry = new THREE.PlaneGeometry(1, 1.2);

    for (let y = 0; y < this.mapData.length; y++) {
        for (let x = 0; x < this.mapData[y].length; x++) {
            const char = this.mapData[y][x];
            const posX = x - this.mapData[0].length / 2;
            const posY = this.mapData.length / 2 - y;

            if (char === '1') {
                this.addWall(posX, posY, wallGeometry, wallMaterial);
            } else if (char === 'P') {
                this.addPlayer(posX, posY, playerGeometry, this.playerTextures, { up: 'w', down: 's', left: 'a', right: 'd' });
            } else if (char === 'O') {
                this.addOxygenTank(posX, posY, oxygenGeometry, oxygenMaterial);
            }
        }
    }
}
private loadGIFTexture(url: string): THREE.Texture {
  const image = document.createElement("img");
  image.src = url;
  image.crossOrigin = "anonymous";

  const texture = new THREE.CanvasTexture(image);
  texture.minFilter = THREE.LinearFilter; // Para suavizar el GIF
  texture.needsUpdate = true;

  return texture;
}



private addPlayer(x: number, y: number, geometry: THREE.PlaneGeometry, textures: { [key: string]: THREE.Texture[] }, controls: any) {
  const material = new THREE.MeshBasicMaterial({ map: textures['right'][0], transparent: true });
  const player = new THREE.Mesh(geometry, material);
  player.position.set(x, y, 0);

  // 🔹 Asegurar que siempre mire hacia la cámara
  player.lookAt(this.camera.position);

  this.scene.add(player);
  this.player = { mesh: player, controls, textures, currentTextureIndex: 0, direction: 'right' };
}


  private addWall(x: number, y: number, geometry: THREE.PlaneGeometry, material: THREE.MeshBasicMaterial) {
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, 0);
    this.scene.add(wall);
    this.walls.push(wall);
  }

  private addOxygenTank(x: number, y: number, geometry: THREE.PlaneGeometry, material: THREE.MeshBasicMaterial) {
    const oxygen = new THREE.Mesh(geometry, material);
    oxygen.position.set(x, y, 0);
    
    // 🔹 Hacer que siempre mire a la cámara
    oxygen.lookAt(this.camera.position);
    
    this.scene.add(oxygen);
}


  @HostListener('document:keydown', ['$event'])
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const speed = 0.5;
    let newX = this.player.mesh.position.x;
    let newY = this.player.mesh.position.y;
  
    let newDirection = this.player.direction;
  
    if (event.key === this.player.controls.right) {
      newX += speed;
      newDirection = 'right';
      this.player.mesh.scale.x = 1; 
    }
    if (event.key === this.player.controls.left) {
      newX -= speed;
      newDirection = 'left';
      this.player.mesh.scale.x = -1; 
    }
    if (event.key === this.player.controls.up) {
      newY += speed;
      newDirection = 'up';
    }
    if (event.key === this.player.controls.down) {
      newY -= speed;
      newDirection = 'down';
    }
  
    // ✅ Solo actualiza si NO hay colisión con margen de seguridad
    if (!this.isCollidingWithWall(newX, newY)) {
      this.player.currentTextureIndex = (this.player.currentTextureIndex + 1) % this.player.textures[newDirection].length;
      (this.player.mesh.material as THREE.MeshBasicMaterial).map = this.player.textures[newDirection][this.player.currentTextureIndex];
      this.player.mesh.position.set(newX, newY, 0);
    }
  }
  

  private isCollidingWithWall(x: number, y: number): boolean {
    const collisionMargin = 0.2; // 🔹 Margen adicional para evitar sobreposición
    return this.walls.some(wall => {
      const distance = Math.sqrt(Math.pow(wall.position.x - x, 2) + Math.pow(wall.position.y - y, 2));
      return distance < (this.collisionRadius + collisionMargin); // 🔹 Considera el margen
    });
  }

  @HostListener('window:resize', ['$event'])
onResize() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const zoom = 7;

  this.camera.left = -zoom * aspectRatio;
  this.camera.right = zoom * aspectRatio;
  this.camera.top = zoom;
  this.camera.bottom = -zoom;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize(window.innerWidth, window.innerHeight);
}

@HostListener('wheel', ['$event'])
onMouseWheel(event: WheelEvent) {
  const zoomSpeed = 0.5;
  this.camera.zoom += event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
  this.camera.zoom = Math.max(3, Math.min(10, this.camera.zoom)); // Restringe el zoom
  this.camera.updateProjectionMatrix();
}

  
}