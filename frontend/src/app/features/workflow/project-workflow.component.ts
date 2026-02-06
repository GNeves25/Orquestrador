import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SignalrService } from '../../core/services/signalr.service';
import { Project, WorkflowStep, TeamMemberRole } from '../../core/models/models';
import { Subscription } from 'rxjs';
import { WorkflowStateService, ProjectWorkflowState } from '../../core/services/workflow-state.service';

@Component({
    selector: 'app-project-workflow',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './project-workflow.component.html',
    styleUrls: ['./project-workflow.component.css']
})
export class ProjectWorkflowComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Input() project!: Project;
    @Output() close = new EventEmitter<void>();
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    state$?: Subscription;

    // Properties used in template
    steps: WorkflowStep[] = [];
    isStarted = false;
    activeAgentName: string | null = null;
    activeAgentRole: TeamMemberRole | null = null;
    currentActionStatus: string = '';
    currentStepIndex = 0;
    debugInfo: string = '';
    isConnected = false;

    workflowStepsOrder = [
        TeamMemberRole.ProjectManager,
        TeamMemberRole.ProductOwner,
        TeamMemberRole.TechLead,
        TeamMemberRole.Designer,
        TeamMemberRole.Developer,
        TeamMemberRole.QA,
        TeamMemberRole.DevOps
    ];

    constructor(
        private apiService: ApiService,
        private signalrService: SignalrService,
        private workflowStateService: WorkflowStateService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.addLog('Initializing Workflow View...');
        this.joinWithRetry();

        // Subscribe to global state
        this.state$ = this.workflowStateService.getState(this.project.id).subscribe((state: ProjectWorkflowState) => {
            this.steps = state.steps;
            console.log(`[Component] Received State Update. Steps: ${this.steps.length}, Status: ${state.currentActionStatus}`);
            this.isStarted = state.isStarted;
            this.activeAgentRole = state.activeAgentRole;
            this.activeAgentName = state.activeAgentName || this.getRoleName(state.activeAgentRole || '');
            this.currentActionStatus = state.currentActionStatus;
            this.currentStepIndex = state.currentStepIndex;

            if (state.steps.length > 0) {
                const lastStep = state.steps[state.steps.length - 1];
                this.addLog(`Received step update: ${lastStep.agentRole} - ${lastStep.stepName}`);
            }
            // Manually trigger change detection to ensure UI updates
            this.cdr.detectChanges();
        });

        // Track Connection Status
        this.signalrService.connectionState$.subscribe(connected => {
            this.isConnected = connected;
            if (connected) {
                this.addLog('SignalR Status: Connected');
            } else {
                this.addLog('SignalR Status: Disconnected');
            }
        });
    }

    async joinWithRetry(attempts = 0) {
        try {
            this.addLog('Connecting to SignalR...');
            // Ensure connection is established first
            await this.signalrService.startConnection();
            this.addLog('SignalR connected. Joining project room...');
            // Then join the project group
            await this.signalrService.joinProject(this.project.id);
            this.addLog(`Successfully joined project ${this.project.id}`);
        } catch (error) {
            console.error('Error in joinWithRetry:', error);
            this.addLog(`Failed to join project: ${error}`);
            // Retry up to 3 times
            if (attempts < 3) {
                this.addLog(`Retrying in 2 seconds... (attempt ${attempts + 1}/3)`);
                setTimeout(() => this.joinWithRetry(attempts + 1), 2000);
            }
        }
    }

    addLog(msg: string) {
        const time = new Date().toISOString().split('T')[1].split('.')[0];
        this.debugInfo = `[${time}] ${msg}\n` + this.debugInfo;
    }

    ngOnDestroy() {
        // We DO NOT leave the project or unsubscribe SignalR here to keep receiving updates in background
        // We only unsubscribe from the local state subject
        this.state$?.unsubscribe();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    getStepStatus(role: TeamMemberRole): 'pending' | 'active' | 'completed' {
        const index = this.workflowStepsOrder.indexOf(role);

        if (this.activeAgentRole === role) return 'active';
        if (this.currentStepIndex > index) return 'completed';
        if (this.currentStepIndex === index && this.activeAgentRole === null) return 'completed';

        return 'pending';
    }

    startKickoff() {
        this.workflowStateService.resetState(this.project.id);

        this.addLog('Starting Kickoff...');
        this.apiService.startKickoff(this.project.id).subscribe({
            next: () => {
                this.addLog('Kickoff started successfully.');
            },
            error: (err) => {
                this.addLog(`Kickoff Error: ${JSON.stringify(err)}`);
            }
        });
    }

    restartKickoff() {
        if (confirm('Tem certeza que deseja reiniciar o processo? Todo o progresso atual será perdido.')) {
            this.startKickoff();
        }
    }

    getRoleIcon(role: TeamMemberRole | string): string {
        const icons: any = {
            'ProductOwner': 'kb',
            'Designer': 'art_track',
            'TechLead': 'architecture',
            'DevOps': 'rocket_launch',
            'ProjectManager': 'assignment',
            'Developer': 'code',
            'QA': 'bug_report'
        };
        const emojis: any = {
            'ProductOwner': '📋',
            'Designer': '🎨',
            'TechLead': '🏗️',
            'DevOps': '🚀',
            'ProjectManager': '📊',
            'Developer': '💻',
            'QA': '🧪'
        };
        return emojis[role] || '🤖';
    }

    getRoleName(role: TeamMemberRole | string): string {
        const names: any = {
            'ProductOwner': 'Product Owner',
            'Designer': 'UI/UX Designer',
            'TechLead': 'Tech Lead',
            'DevOps': 'DevOps Engineer',
            'ProjectManager': 'Project Manager',
            'Developer': 'Developer',
            'QA': 'QA Engineer'
        };
        return names[role] || role;
    }
}
