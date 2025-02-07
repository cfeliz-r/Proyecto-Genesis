// src/app/components/game/game.component.ts
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
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private players: { mesh: THREE.Mesh, controls: any }[] = [];
  private oxygenTank!: THREE.Mesh;
  private stars: THREE.Points | null = null;
  private walls: THREE.Mesh[] = [];
  private collisionRadius = 0.6; // Mejora la detección de colisiones

  constructor() {}

  ngOnInit(): void {
    this.initThreeJS();
    this.createStars();
    this.createWalls();
    this.createPlayers();
    this.createOxygenTank();
    this.animate();
  }

  private initThreeJS() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
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

  private createWalls() {
    const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const wallPositions = [
      { x: -2, y: 1 }, { x: -1, y: 1 }, { x: 0, y: 1 },
      { x: 2, y: -1 }, { x: 1, y: -1 }, { x: 0, y: -1 },
      { x: -2, y: -2 }, { x: -1, y: -2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
    ];

    wallPositions.forEach(pos => {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(pos.x, pos.y, 0);
      this.scene.add(wall);
      this.walls.push(wall);
    });
  }

  private createPlayers() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    
    const player1 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    player1.position.set(-3, 0, 0);
    this.scene.add(player1);
    
    const player2 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    player2.position.set(3, 0, 0);
    this.scene.add(player2);
    
    this.players.push({ mesh: player1, controls: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' } });
    this.players.push({ mesh: player2, controls: { up: 'w', down: 's', left: 'a', right: 'd' } });
  }

  private createOxygenTank() {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.oxygenTank = new THREE.Mesh(geometry, material);
    this.oxygenTank.position.set(0, 2, 0);
    this.scene.add(this.oxygenTank);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    console.log(`Key pressed: ${event.key}`);
    const speed = 0.5;
    
    this.players.forEach(player => {
      let newX = player.mesh.position.x;
      let newY = player.mesh.position.y;

      if (event.key === player.controls.up) newY += speed;
      if (event.key === player.controls.down) newY -= speed;
      if (event.key === player.controls.left) newX -= speed;
      if (event.key === player.controls.right) newX += speed;

      if (!this.isColliding(newX, newY)) {
        player.mesh.position.set(newX, newY, 0);
      } else {
        console.log(`Colisión detectada: No se permite el movimiento en (${newX}, ${newY})`);
      }
    });

    this.checkWinCondition();
  }

  private isColliding(x: number, y: number): boolean {
    return this.walls.some(wall => {
      const distance = Math.sqrt(Math.pow(wall.position.x - x, 2) + Math.pow(wall.position.y - y, 2));
      return distance < this.collisionRadius + 0.3; // Se ajusta el buffer de colisión
    });
  }

  private checkWinCondition() {
    this.players.forEach((player, index) => {
      const distance = player.mesh.position.distanceTo(this.oxygenTank.position);
      if (distance < 0.5) {
        alert(`¡Jugador ${index + 1} ha ganado!`);
      }
    });
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    if (this.stars) {
      this.stars.rotation.y += 0.0005;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
