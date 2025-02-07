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
  private players: THREE.Mesh[] = [];
  private oxygenTank!: THREE.Mesh;
  private stars: THREE.Points | null = null;

  constructor() {}

  ngOnInit(): void {
    this.initThreeJS();
    this.createStars();
    this.createPlayers();
    this.createOxygenTank();
    this.animate();
  }

  private initThreeJS() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // Fondo negro simulando el espacio

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

  private createPlayers() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material1 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const player1 = new THREE.Mesh(geometry, material1);
    player1.position.set(-3, 0, 0);
    this.scene.add(player1);
    this.players.push(player1);

    const player2 = new THREE.Mesh(geometry, material2);
    player2.position.set(3, 0, 0);
    this.scene.add(player2);
    this.players.push(player2);
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
    const speed = 0.2;

    if (event.key === 'ArrowUp') this.players[0].position.y += speed;
    if (event.key === 'ArrowDown') this.players[0].position.y -= speed;
    if (event.key === 'ArrowLeft') this.players[0].position.x -= speed;
    if (event.key === 'ArrowRight') this.players[0].position.x += speed;

    if (event.key === 'w') this.players[1].position.y += speed;
    if (event.key === 's') this.players[1].position.y -= speed;
    if (event.key === 'a') this.players[1].position.x -= speed;
    if (event.key === 'd') this.players[1].position.x += speed;

    this.checkWinCondition();
  }

  private checkWinCondition() {
    this.players.forEach((player, index) => {
      const distance = player.position.distanceTo(this.oxygenTank.position);
      if (distance < 0.5) {
        alert(`¡Jugador ${index + 1} ha ganado!`);
      }
    });
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    if (this.stars) {
      this.stars.rotation.y += 0.0005; // Efecto sutil de parpadeo
    }
    this.renderer.render(this.scene, this.camera);
  }
}