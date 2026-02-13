import { GameEngine } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('city-canvas');
    const startBtn = document.getElementById('start-btn');
    const overlay = document.getElementById('overlay');
    const results = document.getElementById('results');
    
    // UI Elements
    const ui = {
        score: document.getElementById('score'),
        health: document.getElementById('health-bar'),
        finalScore: document.getElementById('final-score')
    };

    const engine = new GameEngine(canvas, ui);

    startBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        results.classList.add('hidden');
        engine.start();
    });

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 1.5;
    });
    
    // Initial size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 1.5;
});
