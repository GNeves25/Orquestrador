import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, AfterViewChecked, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { marked } from 'marked';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { MermaidService } from '../../core/services/mermaid.service';
import { SignalrService } from '../../core/services/signalr.service';
import { ProjectTask, AgentResponse, TaskStatus } from '../../core/models/models';

@Component({
  selector: 'app-task-execution',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None, // Needed for dynamic HTML styling
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="header">
          <h2>⚡ Executando Tarefa</h2>
          <button class="close-btn" (click)="onClose()">×</button>
        </div>

        <div class="task-info">
          <h3>{{ task.title }}</h3>
          <span class="status-badge" [class.running]="executing">
            {{ executing ? 'EM EXECUÇÃO' : 'FINALIZADO' }}
          </span>
        </div>

        <div class="console-output">
          <div *ngIf="executing" class="loading-state">
            <div class="spinner"></div>
            <p>Conectando ao agente...</p>
            <p class="sub-text">{{ progressMessage }}</p>
          </div>

          <div *ngIf="result" class="result-content">
            <div class="result-header">
              <span class="timestamp">{{ result.timestamp | date:'HH:mm:ss' }}</span>
              <span class="status-success">Concluído com Sucesso</span>
            </div>
            
            <!-- Rendered Content -->
            <div *ngIf="result.content" class="markdown-body" [innerHTML]="renderedContent"></div>
            
            <!-- Fallback for empty content -->
            <div *ngIf="!result.content" class="empty-content-state">
              <p>⚠️ Nenhum conteúdo textual retornado pelo agente.</p>
              <p class="sub-text">Isso pode ocorrer devido a erros de quota ou se a tarefa não gerou saída de texto.</p>
            </div>
            
            <div *ngIf="result.artifacts && result.artifacts.length > 0" class="artifacts">
              <h4>Arquivos Gerados:</h4>
              <ul>
                <li *ngFor="let artifact of result.artifacts">📄 {{ artifact }}</li>
              </ul>
            </div>
            
             <!-- Debug Info Toggle -->
             <div class="debug-section">
                <button class="btn-sm btn-secondary" (click)="toggleDebug()">
                    {{ showDebug ? 'Ocultar Detalhes da Resposta' : 'Ver Detalhes da Resposta (Debug)' }}
                </button>
                <div *ngIf="showDebug" class="debug-json">
                    <pre>{{ result | json }}</pre>
                </div>
            </div>
          </div>

          <div *ngIf="error" class="error-state">
            ❌ Erro na execução: {{ error }}
          </div>
        </div>

        <div class="footer">
          <button class="btn-secondary" (click)="executeTask()" [disabled]="executing" style="margin-right: 1rem;">
            🔄 Tentar Novamente
          </button>
          <button class="btn-primary" (click)="onClose()" [disabled]="executing">
            {{ executing ? 'Aguarde...' : 'Fechar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
      background: #0f172a;
      border-radius: 16px;
      padding: 0;
      max-width: 800px;
      width: 95%;
      height: 80vh;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .debug-section {
        margin-top: 2rem;
        border-top: 1px solid #334155;
        padding-top: 1rem;
    }
    
    .debug-json {
        background: #020617;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        overflow-x: auto;
    }
    
    .debug-json pre {
        color: #94a3b8;
        font-size: 0.8rem;
        margin: 0;
    }

    .empty-content-state {
        text-align: center;
        padding: 3rem;
        background: rgba(255,255,255,0.03);
        border-radius: 8px;
        margin: 1rem 0;
        border: 1px dashed #334155;
    }

    .header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1e293b;
      border-radius: 16px 16px 0 0;
    }

    .header h2 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .close-btn:hover {
      color: #f8fafc;
    }

    .task-info {
      padding: 1rem 2rem;
      background: #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #334155;
    }

    .task-info h3 {
      margin: 0;
      color: #e2e8f0;
      font-size: 1rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: #10b981;
      color: #064e3b;
    }

    .status-badge.running {
      background: #f59e0b;
      color: #78350f;
      animation: pulse 2s infinite;
    }

    .console-output {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      color: #e2e8f0;
      background: #0f172a;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #94a3b8;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #334155;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    .result-content {
      line-height: 1.6;
    }

    .result-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #1e293b;
    }

    .timestamp {
      color: #64748b;
    }

    .status-success {
      color: #4ade80;
    }

    /* Markdown Styles */
    .markdown-body {
      white-space: normal;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      color: #cbd5e1;
    }
    .markdown-body p {
      margin-bottom: 1rem;
    }
    .markdown-body ul, .markdown-body ol {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }
    .markdown-body strong {
      color: #fff;
      font-weight: 700;
    }
    .markdown-body code {
      background: #334155;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9em;
      font-family: 'Menlo', 'Monaco', monospace;
      color: #e2e8f0;
    }
    .markdown-body pre {
      background: #1e293b;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 1rem;
      border: 1px solid #334155;
    }
    .markdown-body pre code {
      background: transparent;
      padding: 0;
      border: none;
      color: #e2e8f0;
    }
    .markdown-body h1, .markdown-body h2, .markdown-body h3 {
      color: #f8fafc;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
      line-height: 1.25;
      display: block !important;
    }
    .markdown-body h1 { font-size: 1.8em; border-bottom: 1px solid #334155; padding-bottom: 0.3em; }
    .markdown-body h2 { font-size: 1.5em; border-bottom: 1px solid #334155; padding-bottom: 0.3em; }
    .markdown-body h3 { font-size: 1.25em; }

    .markdown-body a {
      color: #6366f1;
      text-decoration: none;
    }
    .markdown-body a:hover {
      text-decoration: underline;
    }
    
    .markdown-body blockquote {
      border-left: 4px solid #6366f1;
      padding-left: 1rem;
      color: #94a3b8;
      margin-left: 0;
      font-style: italic;
    }

    /* Mermaid Container */
    .mermaid {
      background: transparent;
      margin: 1rem 0;
      text-align: center;
    }

    .footer {
      padding: 1.5rem 2rem;
      background: #1e293b;
      border-top: 1px solid #334155;
      display: flex;
      justify-content: flex-end;
      border-radius: 0 0 16px 16px;
    }

    .btn-primary {
      background: #6366f1;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #4f46e5;
    }
    
    .btn-secondary {
        background: transparent;
        color: #94a3b8;
        border: 1px solid #334155;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
    }
    
    .btn-secondary:hover {
        background: #1e293b;
        color: #e2e8f0;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #475569;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(20px) scale(0.98); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class TaskExecutionComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() task!: ProjectTask;
  @Output() close = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<void>();

  executing = true;
  result: AgentResponse | null = null;
  error: string | null = null;
  showDebug = false;
  progressMessage: string = 'Iniciando processamento da tarefa...';

  private needsMermaidRender = false;
  private signalRSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private mermaidService: MermaidService,
    private signalrService: SignalrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Subscribe to SignalR updates
    this.signalRSub = this.signalrService.getTaskUpdates().subscribe(update => {
      // console.log('Task Execution Update:', update); 
      if (update.task_id === this.task.id) { // Ensure we only update for THIS task
        this.progressMessage = update.status;
        this.cdr.detectChanges(); // Force UI update
      }
    });

    // Fetch fresh task state to ensure we have the latest status
    this.executing = true; // Show loading initially
    this.apiService.getTask(this.task.id).subscribe({
      next: (freshTask) => {
        this.task = freshTask; // Update local task reference
        if (this.task.status === 'Completed') {
          this.loadLastResponse();
        } else {
          this.executeTask(); // This executes!
        }
      },
      error: (err) => {
        console.error('Error fetching fresh task details', err);
        // Fallback to input task
        if (this.task.status === 'Completed') {
          this.loadLastResponse();
        } else {
          this.executeTask();
        }
      }
    });
  }

  ngOnDestroy() {
    this.signalRSub?.unsubscribe();
  }

  ngAfterViewChecked() {
    if (this.needsMermaidRender) {
      this.mermaidService.renderDiagrams().then(() => {
        this.needsMermaidRender = false;
      });
    }
  }

  loadLastResponse() {
    this.executing = true;
    this.result = null;
    this.error = null;
    this.showDebug = false;

    this.apiService.getTaskResponses(this.task.id).subscribe({
      next: (responses) => {
        if (responses && responses.length > 0) {
          this.result = responses[0];
          this.executing = false;
          this.needsMermaidRender = true;
          // If empty content, auto-show debug
          if (!this.result.content) {
            this.showDebug = true;
          }
        } else {
          // Task marked completed but no response? Fallback to execute or show error?
          // Let's fallback to execute to ensure content, or maybe just show "No content found" and allow retry.
          // Better to just show the state and let user Retry.
          this.executing = false;
          this.error = 'Tarefa concluída, mas nenhum resultado encontrado.';
        }
      },
      error: (err) => {
        console.error('Error loading responses:', err);
        this.error = 'Erro ao carregar o histórico da tarefa.';
        this.executing = false;
      }
    });
  }

  executeTask() {
    this.executing = true;
    this.result = null; // Clear previous result
    this.error = null;
    this.showDebug = false;
    this.progressMessage = 'Iniciando processamento da tarefa...';

    this.apiService.executeTask(this.task.id).subscribe({
      next: (response) => {
        this.result = response;
        this.executing = false;
        this.taskUpdated.emit();
        // Trigger mermaid render check
        this.needsMermaidRender = true;

        // If empty content, auto-show debug for convenience
        if (!response.content) {
          this.showDebug = true;
        }
      },
      error: (err) => {
        console.error('Execution error:', err);
        this.error = 'Ocorreu um erro ao executar a tarefa. Tente novamente mais tarde.';
        if (err.error && err.error.message) {
          this.error = err.error.message;
        }
        this.executing = false;
      }
    });
  }

  toggleDebug() {
    this.showDebug = !this.showDebug;
  }

  onClose() {
    this.close.emit();
  }

  get renderedContent(): string {
    if (!this.result?.content) return '';
    try {
      // 1. Configure marked
      // 2. Pre-process content to handle mermaid blocks effectively if needed, 
      // but usually standard markdown code blocks ```mermaid works if we class them correctly.

      const renderer = new marked.Renderer();
      const codeRenderer = renderer.code.bind(renderer);

      renderer.code = ({ text, lang }: { text: string, lang?: string }) => {
        if (lang === 'mermaid') {
          return '<div class="mermaid">' + text + '</div>';
        }
        // Force cast to any because marked types are strict about the Token interface
        return codeRenderer({ text, lang } as any);
      };

      return marked.parse(this.result.content, { renderer }) as string;
    } catch (e) {
      console.error('Markdown rendering error', e);
      return this.result.content;
    }
  }
}
