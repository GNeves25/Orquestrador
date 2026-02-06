import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom, forkJoin, timeout, finalize } from 'rxjs';
import { ApiService } from './core/services/api.service';
import { SignalrService } from './core/services/signalr.service';
import { Project, ProjectTask, TeamMember, ProjectStatus, TaskStatus, TeamMemberRole, TaskPriority } from './core/models/models';
import { CreateProjectComponent } from './features/projects/create-project.component';
import { CreateMemberComponent } from './features/team/create-member.component';
import { CreateTaskComponent } from './features/tasks/create-task.component';
import { ConfirmationModalComponent } from './shared/components/confirmation-modal.component';
import { TaskExecutionComponent } from './features/tasks/task-execution.component';
import { ProjectWorkflowComponent } from './features/workflow/project-workflow.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, CreateProjectComponent, CreateMemberComponent, CreateTaskComponent, ConfirmationModalComponent, TaskExecutionComponent, ProjectWorkflowComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  title = 'AI Development Team Orchestrator';
  projects: Project[] = [];
  tasks: ProjectTask[] = [];
  teamMembers: TeamMember[] = [];
  loading = true;
  error: string | null = null;

  showCreateProject = false;
  showCreateMember = false;
  showCreateTask = false;

  // Confirmation Modal State
  // Confirmation Modal State
  showConfirmation = false;
  confirmationTitle = '';
  confirmationMessage = '';
  confirmationIsAlert = false;
  confirmationButtonText = 'Confirmar';
  pendingAction: (() => void) | null = null;

  // Task Execution State
  showExecution = false;
  executingTask: ProjectTask | null = null;
  selectedProject: Project | null = null;
  isCreatingTeam = false;

  // Theme State
  darkMode = false;

  constructor(
    private apiService: ApiService,
    private signalrService: SignalrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadData();

    // SignalR is optional, don't block on it
    this.signalrService.startConnection().catch(err => {
      console.warn('SignalR connection failed (optional):', err);
    });

    this.signalrService.getTaskUpdates().subscribe(update => {
      console.log('Task update received:', update);
      this.loadData();
    });

    // Initialize Theme
    const savedTheme = localStorage.getItem('darkMode');
    this.darkMode = savedTheme === 'true';
    this.applyTheme();
  }

  loadData(isBackground = false) {
    console.log('loadData() called', { isBackground });
    if (!isBackground) {
      this.loading = true;
      this.cdr.detectChanges();
    }

    forkJoin({
      projects: this.apiService.getProjects(),
      tasks: this.apiService.getTasks(),
      members: this.apiService.getTeamMembers(true)
    }).pipe(
      timeout(10000), // 10s timeout to prevent infinite loading
      finalize(() => {
        console.log('loadData() finished (finalize)');
        if (!isBackground) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      })
    ).subscribe({
      next: (data) => {
        this.projects = data.projects || [];
        this.tasks = data.tasks || [];
        this.teamMembers = data.members || [];
        console.log('Data loaded successfully:', data);
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Erro ao carregar dados. Verifique a conexão.';
        // Ensure empty arrays on error
        this.projects = [];
        this.tasks = [];
        this.teamMembers = [];
      }
    });
  }

  getStatusColor(status: ProjectStatus | TaskStatus): string {
    const colors: Record<string, string> = {
      'Planning': '#3b82f6',
      'InProgress': '#f59e0b',
      'Testing': '#8b5cf6',
      'Completed': '#10b981',
      'OnHold': '#6b7280',
      'Cancelled': '#ef4444',
      'Pending': '#6b7280',
      'Assigned': '#3b82f6',
      'UnderReview': '#8b5cf6',
      'Failed': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  getRoleIcon(role: TeamMemberRole): string {
    const icons: Record<string, string> = {
      'ProductOwner': '📋',
      'ProjectManager': '📊',
      'Designer': '🎨',
      'TechLead': '🏗️',
      'Developer': '💻',
      'QA': '🧪',
      'DevOps': '🚀'
    };
    return icons[role] || '👤';
  }

  getInProgressCount(): number {
    return this.tasks.filter(t => t.status === 'InProgress').length;
  }

  getPriorityClass(priority: TaskPriority): string {
    return 'priority-' + priority.toLowerCase();
  }

  getPriorityName(priority: TaskPriority): string {
    return priority;
  }

  getStatusName(status: ProjectStatus | TaskStatus): string {
    return status;
  }

  hasArtifacts(task: ProjectTask): boolean {
    return task.responses?.some(r => r.artifacts && r.artifacts.length > 0) ?? false;
  }

  addCompleteTeam() {
    if (this.teamMembers.length + 7 > 12) {
      this.openAlert('Limite Atingido', 'Não é possível adicionar o time completo. O limite máximo é de 12 agentes para evitar lentidão.');
      return;
    }

    this.openConfirmation(
      'Adicionar Time Completo',
      'Isso criará automaticamente 7 agentes especializados (PO, PM, Designer, Tech Lead, Dev, QA, DevOps). Deseja continuar?',
      () => this.performAddCompleteTeam()
    );
  }

  performAddCompleteTeam() {
    this.isCreatingTeam = true;
    this.showConfirmation = false;

    // Note: Names match the 'performAddCompleteTeam' roles array
    const roles = [
      { role: TeamMemberRole.ProductOwner, name: 'Alice - Product Owner', desc: 'Define a visão do produto e prioriza o backlog.', port: 8001 },
      { role: TeamMemberRole.ProjectManager, name: 'Bob - Project Manager', desc: 'Gerencia prazos, riscos e recursos do projeto.', port: 8002 },
      { role: TeamMemberRole.Designer, name: 'Anna - Designer', desc: 'Designer UX/UI especializado em criar interfaces intuitivas.', port: 8003 },
      { role: TeamMemberRole.TechLead, name: 'David - Tech Lead', desc: 'Líder técnico com ampla experiência em arquitetura de software.', port: 8004 },
      { role: TeamMemberRole.Developer, name: 'John - Developer', desc: 'Desenvolvedor full-stack com expertise em código limpo e testes.', port: 8005 },
      { role: TeamMemberRole.QA, name: 'Lisa - QA Engineer', desc: 'Engenheira de qualidade focada em testes automatizados.', port: 8006 },
      { role: TeamMemberRole.DevOps, name: 'Alex - DevOps', desc: 'Especialista em CI/CD, infraestrutura e automação de deploy.', port: 8007 } // Assuming 8007 or mock if not in docker
    ];

    let createdCount = 0;

    roles.forEach(r => {
      this.apiService.createTeamMember({
        name: r.name,
        role: r.role,
        description: r.desc,
        agentEndpoint: `http://localhost:${r.port}`
      }).subscribe({
        next: () => {
          createdCount++;
          if (createdCount === roles.length) {
            this.isCreatingTeam = false;
            this.openAlert(
              'Time Criado com Sucesso!',
              'Todos os agentes foram adicionados ao time.',
              () => {
                this.loadData(true); // Background reload
              }
            );
          }
        },
        error: (err) => {
          console.error('Error creating team member', err);
          createdCount++;
          if (createdCount === roles.length) {
            this.isCreatingTeam = false;
            this.openAlert('Concluído com Erros', 'Alguns agentes podem não ter sido criados. Verifique o console.');
            this.loadData(true);
          }
        }
      });
    });
  }

  confirmAction() {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.closeConfirmation();
  }

  closeConfirmation() {
    this.showConfirmation = false;
    this.pendingAction = null;
  }

  openConfirmation(title: string, message: string, action: () => void) {
    this.confirmationTitle = title;
    this.confirmationMessage = message;
    this.pendingAction = action;
    this.confirmationIsAlert = false;
    this.confirmationButtonText = 'Confirmar';
    this.showConfirmation = true;
  }

  openAlert(title: string, message: string, action: (() => void) | null = null) {
    this.confirmationTitle = title;
    this.confirmationMessage = message;
    this.pendingAction = action;
    this.confirmationIsAlert = true;
    this.confirmationButtonText = 'OK';
    this.showConfirmation = true;
  }

  openExecuteTask(task: ProjectTask) {
    this.executingTask = task;
    this.showExecution = true;
  }

  openProjectStudio(project: Project) {
    this.selectedProject = project;
  }

  closeProjectStudio() {
    this.selectedProject = null;
    this.loadData(true); // reload data to see new tasks/requirements
  }

  onTaskUpdated() {
    this.loadData();
  }

  // existing helpers...



  openCreateMember() {
    if (this.teamMembers.length >= 12) {
      this.openAlert('Limite Atingido', 'Você atingiu o limite máximo de 12 agentes.');
      return;
    }
    this.showCreateMember = true;
  }

  toggleAgentStatus(member: TeamMember) {
    const newStatus = !member.isActive;
    const actionName = newStatus ? 'ativar' : 'parar';

    // Optimistic update
    member.isActive = newStatus;

    this.apiService.updateTeamMember(member.id, { isActive: newStatus }).subscribe({
      error: () => {
        // Revert on error
        member.isActive = !newStatus;
        alert(`Erro ao ${actionName} o agente.`);
      }
    });
  }

  deleteMember(member: TeamMember) {
    this.openConfirmation(
      'Excluir Agente',
      `Tem certeza que deseja excluir ${member.name}? Esta ação não pode ser desfeita.`,
      () => {
        this.apiService.deleteTeamMember(member.id).subscribe({
          next: () => {
            this.openAlert('Sucesso', 'Agente excluído com sucesso.');
            this.loadData(true);
          },
          error: (err) => {
            console.error('Error deleting member', err);
            this.openAlert('Erro', 'Não foi possível excluir o agente.');
          }
        });
      }
    );
  }

  deleteProject(project: Project) {
    this.openConfirmation(
      'Excluir Projeto',
      `Tem certeza que deseja excluir o projeto "${project.name}"? Todas as tarefas e dados associados serão perdidos.`,
      () => {
        this.apiService.deleteProject(project.id).subscribe({
          next: () => {
            this.openAlert('Sucesso', 'Projeto excluído com sucesso.');
            this.loadData(true);
          },
          error: (err) => {
            console.error('Error deleting project', err);
            this.openAlert('Erro', 'Não foi possível excluir o projeto.');
          }
        });
      }
    );
  }

  deleteTask(task: ProjectTask) {
    this.openConfirmation(
      'Excluir Tarefa',
      `Tem certeza que deseja excluir a tarefa "${task.title}"?`,
      () => {
        this.apiService.deleteTask(task.id).subscribe({
          next: () => {
            this.openAlert('Sucesso', 'Tarefa excluída com sucesso.');
            this.loadData(true);
          },
          error: (err) => {
            console.error('Error deleting task', err);
            this.openAlert('Erro', 'Não foi possível excluir a tarefa.');
          }
        });
      }
    );
  }

  // Edit State
  projectToEdit: Project | null = null;
  taskToEdit: ProjectTask | null = null;

  openCreateProject() {
    this.projectToEdit = null;
    this.showCreateProject = true;
  }

  openEditProject(project: Project) {
    this.projectToEdit = project;
    this.showCreateProject = true;
  }

  openCreateTask() {
    if (this.projects.length === 0) {
      alert('Você precisa criar um projeto antes de criar tarefas.');
      return;
    }
    this.taskToEdit = null;
    this.showCreateTask = true;
  }

  openEditTask(task: ProjectTask) {
    this.taskToEdit = task;
    this.showCreateTask = true;
  }
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', String(this.darkMode));
    this.applyTheme();
  }

  applyTheme() {
    if (this.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
}
