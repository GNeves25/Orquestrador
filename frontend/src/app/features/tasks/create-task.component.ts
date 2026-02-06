import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Project, TeamMember, TaskPriority, TaskStatus, ProjectTask } from '../../core/models/models';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>{{ taskToEdit ? '✏️ Editar Tarefa' : 'Nova Tarefa' }}</h2>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Título *</label>
            <input type="text" [(ngModel)]="title" name="title" required 
                   placeholder="Ex: Implementar autenticação via JWT">
          </div>

          <div class="form-group">
            <label>Projeto Relacionado *</label>
            <select [(ngModel)]="projectId" name="projectId" required>
              <option value="">Selecione um projeto...</option>
              <option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Responsável *</label>
            <select [(ngModel)]="assignedToId" name="assignedToId" required>
              <option value="">Selecione um responsável...</option>
              <option *ngFor="let m of members" [value]="m.id">
                {{ m.name }} - {{ m.role }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Prioridade *</label>
            <select [(ngModel)]="priority" name="priority" required>
              <option [value]="TaskPriority.Low">Baixa</option>
              <option [value]="TaskPriority.Medium">Média</option>
              <option [value]="TaskPriority.High">Alta</option>
              <option [value]="TaskPriority.Critical">Crítica</option>
            </select>
          </div>

          <div class="form-group">
            <label>Descrição *</label>
            <textarea [(ngModel)]="description" name="description" required rows="3"
                      placeholder="Descreva o que precisa ser feito..."></textarea>
          </div>

          <div class="form-group">
            <label>Contexto Adicional (Opcional)</label>
            <textarea [(ngModel)]="context" name="context" rows="2"
                      placeholder="Informações extras para o agente..."></textarea>
          </div>

          <div class="form-group">
            <label>Saída Esperada (Opcional)</label>
            <textarea [(ngModel)]="expectedOutput" name="expectedOutput" rows="2"
                      placeholder="O que se espera como resultado final..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="onCancel()">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="!title || !projectId || !description || !assignedToId || !priority">
              {{ taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa' }}
            </button>
          </div>
        </form>
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
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
      background: #1e293b;
      border-radius: 16px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    h2 {
      margin-bottom: 1.5rem;
      color: #f8fafc;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #cbd5e1;
      font-weight: 500;
      font-size: 0.95rem;
    }

    input, textarea, select {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #334155;
      border: 1px solid #475569;
      border-radius: 8px;
      color: #f1f5f9;
      font-family: inherit;
      font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #334155;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: #475569;
      color: #f8fafc;
    }

    .btn-secondary:hover {
      background: #64748b;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(10px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class CreateTaskComponent {
  @Output() close = new EventEmitter<void>();
  @Input() projects: Project[] = [];
  @Input() members: TeamMember[] = [];
  @Input() taskToEdit: ProjectTask | null = null;

  TaskPriority = TaskPriority;

  title = '';
  projectId = '';
  assignedToId = '';
  description = '';
  priority: TaskPriority = TaskPriority.Medium;
  context = '';
  expectedOutput = '';

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    if (this.taskToEdit) {
      this.title = this.taskToEdit.title;
      this.projectId = this.taskToEdit.projectId;
      this.assignedToId = this.taskToEdit.assignedToId || '';
      this.description = this.taskToEdit.description;
      this.priority = this.taskToEdit.priority;
      this.context = this.taskToEdit.context || '';
      this.expectedOutput = this.taskToEdit.expectedOutput || '';
    }
  }

  onSubmit() {
    if (!this.title || !this.projectId || !this.description || !this.assignedToId) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo o Responsável.');
      return;
    }

    const payload = {
      title: this.title.trim(),
      projectId: this.projectId,
      assignedToId: this.assignedToId || undefined,
      description: this.description.trim(),
      priority: this.priority,
      context: this.context?.trim(),
      expectedOutput: this.expectedOutput?.trim()
    };

    if (this.taskToEdit) {
      this.apiService.updateTask(this.taskToEdit.id, payload as any).subscribe({ // Cast to any or Partial<ProjectTask> if needed
        next: () => {
          this.close.emit();
          window.location.reload();
        },
        error: (error: any) => {
          console.error('Error updating task:', error);
          alert('Erro ao atualizar tarefa.');
        }
      });
    } else {
      this.apiService.createTask(payload).subscribe({
        next: (task: any) => {
          console.log('Task created successfully:', task);
          this.close.emit();
          window.location.reload();
        },
        error: (error: any) => {
          console.error('Error creating task:', error);
          alert('Erro ao criar tarefa. Verifique o console para mais detalhes.');
        }
      });
    }
  }

  onCancel() {
    this.close.emit();
  }
}
