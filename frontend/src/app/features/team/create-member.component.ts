import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { TeamMemberRole } from '../../core/models/models';

@Component({
  selector: 'app-create-member',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>👥 Adicionar Agente ao Time</h2>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nome do Agente *</label>
            <input type="text" [(ngModel)]="name" name="name" required 
                   placeholder="Ex: Sarah - Product Owner">
          </div>

          <div class="form-group">
            <label>Papel/Role *</label>
            <select [(ngModel)]="role" name="role" required (change)="onRoleChange()">
              <option value="">Selecione um papel...</option>
              <option [value]="TeamMemberRole.ProductOwner">Product Owner</option>
              <option [value]="TeamMemberRole.ProjectManager">Project Manager</option>
              <option [value]="TeamMemberRole.Designer">Designer</option>
              <option [value]="TeamMemberRole.TechLead">Tech Lead</option>
              <option [value]="TeamMemberRole.Developer">Developer</option>
              <option [value]="TeamMemberRole.QA">QA Engineer</option>
            </select>
          </div>

          <div class="form-group">
            <label>Descrição *</label>
            <textarea [(ngModel)]="description" name="description" required rows="3"
                      placeholder="Descreva as especialidades deste agente..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="onCancel()">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="!name || !role || !description">
              Adicionar Agente
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

    input, textarea, select {
      width: 100%;
      padding: 0.75rem;
      background: #334155;
      border: 1px solid #475569;
      border-radius: 8px;
      color: #f1f5f9;
      font-family: inherit;
    }

    input:focus, textarea:focus, select:focus {
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
export class CreateMemberComponent {
  @Output() close = new EventEmitter<void>();

  TeamMemberRole = TeamMemberRole; // Expose enum to template

  name = '';
  role: TeamMemberRole | '' = '';
  description = '';

  private roleDescriptions: Record<string, string> = {
    [TeamMemberRole.ProductOwner]: 'Especialista em definição de produto, requisitos e priorização de backlog. Responsável por garantir que o produto atenda às necessidades dos usuários e objetivos de negócio.',
    [TeamMemberRole.ProjectManager]: 'Gerente de projetos com expertise em planejamento, coordenação de equipes e gestão de cronogramas. Garante a entrega eficiente e dentro do prazo.',
    [TeamMemberRole.Designer]: 'Designer UX/UI especializado em criar interfaces intuitivas e experiências de usuário excepcionais. Foco em usabilidade e estética moderna.',
    [TeamMemberRole.TechLead]: 'Líder técnico com ampla experiência em arquitetura de software, revisão de código e decisões tecnológicas. Mentor da equipe de desenvolvimento.',
    [TeamMemberRole.Developer]: 'Desenvolvedor full-stack com expertise em implementação de código limpo, testes e debugging. Especializado em transformar requisitos em soluções funcionais.',
    [TeamMemberRole.QA]: 'Engenheiro de qualidade focado em testes automatizados, planejamento de testes e garantia de qualidade. Assegura que o produto atenda aos padrões de excelência.'
  };

  constructor(private apiService: ApiService) { }

  onRoleChange() {
    if (this.role && this.roleDescriptions[this.role]) {
      this.description = this.roleDescriptions[this.role];
    }
  }

  onSubmit() {
    if (!this.role || !this.name || !this.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const payload = {
      name: this.name.trim(),
      role: this.role,
      description: this.description.trim()
    };

    console.log('Creating team member with payload:', payload);

    this.apiService.createTeamMember(payload).subscribe({
      next: (member: any) => {
        console.log('Team member created successfully:', member);
        this.close.emit();
        window.location.reload();
      },
      error: (error: any) => {
        console.error('Error creating team member:', error);
        const errorMessage = error.error?.errors
          ? JSON.stringify(error.error.errors, null, 2)
          : error.message || 'Erro desconhecido';
        alert(`Erro ao criar agente:\n${errorMessage}`);
      }
    });
  }

  onCancel() {
    this.close.emit();
  }
}
