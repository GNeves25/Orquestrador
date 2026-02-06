import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Project } from '../../core/models/models';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>{{ projectToEdit ? '✏️ Editar Projeto' : '📁 Criar Novo Projeto' }}</h2>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nome do Projeto *</label>
            <input type="text" [(ngModel)]="name" name="name" required placeholder="Ex: Sistema de E-commerce">
          </div>

          <div class="form-group">
            <label>Descrição *</label>
            <textarea [(ngModel)]="description" name="description" required rows="3" 
                      placeholder="Descreva o projeto..."></textarea>
          </div>

          <div class="form-group">
            <label>Requisitos</label>
            <textarea [(ngModel)]="requirements" name="requirements" rows="3"
                      placeholder="Liste os requisitos principais..."></textarea>
          </div>

          <div class="form-group">
            <label>Stack Técnica</label>
            <input type="text" [(ngModel)]="technicalStack" name="technicalStack" 
                   placeholder="Ex: React, Node.js, PostgreSQL">
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="onCancel()">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="!name || !description">
              {{ projectToEdit ? 'Salvar Alterações' : 'Criar Projeto' }}
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
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: #1e293b;
      border-radius: 12px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    h2 {
      margin-bottom: 1.5rem;
      color: #f1f5f9;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #cbd5e1;
      font-weight: 500;
    }

    input, textarea {
      width: 100%;
      padding: 0.75rem;
      background: #334155;
      border: 1px solid #475569;
      border-radius: 8px;
      color: #f1f5f9;
      font-family: inherit;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: #6366f1;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #475569;
      color: white;
    }

    .btn-secondary:hover {
      background: #64748b;
    }
  `]
})
export class CreateProjectComponent {
  @Output() close = new EventEmitter<void>();
  @Input() projectToEdit: Project | null = null;

  name = '';
  description = '';
  requirements = '';
  technicalStack = '';

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    if (this.projectToEdit) {
      this.name = this.projectToEdit.name;
      this.description = this.projectToEdit.description;
      this.requirements = this.projectToEdit.requirements || '';
      this.technicalStack = this.projectToEdit.technicalStack || '';
    }
  }

  onSubmit() {
    if (!this.name || !this.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const payload = {
      name: this.name.trim(),
      description: this.description.trim(),
      requirements: this.requirements?.trim() || undefined,
      technicalStack: this.technicalStack?.trim() || undefined
    };

    if (this.projectToEdit) {
      this.apiService.updateProject(this.projectToEdit.id, payload).subscribe({
        next: () => {
          this.close.emit();
          window.location.reload();
        },
        error: (error: any) => {
          console.error('Error updating project:', error);
          alert('Erro ao atualizar projeto.');
        }
      });
    } else {
      this.apiService.createProject(payload).subscribe({
        next: (project: any) => {
          console.log('Project created successfully:', project);
          this.close.emit();
          window.location.reload();
        },
        error: (error: any) => {
          console.error('Error creating project:', error);
          const errorMessage = error.error?.errors
            ? JSON.stringify(error.error.errors, null, 2)
            : error.message || 'Erro desconhecido';
          alert(`Erro ao criar projeto:\n${errorMessage}`);
        }
      });
    }
  }

  onCancel() {
    this.close.emit();
  }
}
