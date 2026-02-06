import { Injectable } from '@angular/core';
import mermaid from 'mermaid';

@Injectable({
    providedIn: 'root'
})
export class MermaidService {

    constructor() {
        this.initialize();
    }

    initialize() {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif'
        });
    }

    async renderDiagrams() {
        try {
            await mermaid.run({
                querySelector: '.mermaid'
            });
        } catch (e) {
            console.error('Mermaid rendering error:', e);
        }
    }
}
