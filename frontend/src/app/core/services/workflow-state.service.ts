import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subscription, filter } from 'rxjs';
import { WorkflowStep, TeamMemberRole } from '../models/models';
import { SignalrService } from './signalr.service';

export interface ProjectWorkflowState {
    projectId: string;
    steps: WorkflowStep[];
    isStarted: boolean;
    activeAgentRole: TeamMemberRole | null;
    activeAgentName?: string;
    currentActionStatus: string;
    currentStepIndex: number;
}

@Injectable({
    providedIn: 'root'
})
export class WorkflowStateService {
    private states = new Map<string, ProjectWorkflowState>();
    private stateSubjects = new Map<string, BehaviorSubject<ProjectWorkflowState>>();
    private signalRSubscription?: Subscription;

    // Fixed order of steps
    private workflowStepsOrder = [
        TeamMemberRole.ProjectManager,
        TeamMemberRole.ProductOwner,
        TeamMemberRole.TechLead,
        TeamMemberRole.Designer,
        TeamMemberRole.Developer,
        TeamMemberRole.QA,
        TeamMemberRole.DevOps
    ];

    constructor(private signalrService: SignalrService, private ngZone: NgZone) {
        this.initializeSignalRListener();
    }

    private initializeSignalRListener() {
        this.signalRSubscription = this.signalrService.getWorkflowSteps().subscribe(step => {
            this.ngZone.run(() => {
                this.handleIncomingStep(step);
            });
        });
    }

    getState(projectId: string): BehaviorSubject<ProjectWorkflowState> {
        const normalizedId = projectId.toLowerCase();
        if (!this.stateSubjects.has(normalizedId)) {
            const initialState: ProjectWorkflowState = {
                projectId: normalizedId,
                steps: [],
                isStarted: false,
                activeAgentRole: null,
                currentActionStatus: '',
                currentStepIndex: 0
            };
            this.states.set(normalizedId, initialState);
            this.stateSubjects.set(normalizedId, new BehaviorSubject<ProjectWorkflowState>(initialState));
        }
        return this.stateSubjects.get(normalizedId)!;
    }

    private handleIncomingStep(step: WorkflowStep) {
        if (!step.projectId) {
            console.error('State Service received step without ProjectId!', step);
            return;
        }
        const normalizedId = step.projectId.toLowerCase();

        let state = this.states.get(normalizedId);

        // If we receive a step for a project we haven't tracked yet, initialize it
        if (!state) {
            this.getState(normalizedId); // Initialize
            state = this.states.get(normalizedId)!;
        }

        // Update Logic
        console.log(`[WorkflowState] Updating state for ${normalizedId}. Role: ${step.agentRole}, Step: ${step.stepName}`);

        // IMMUTABILITY FIX: Create new array reference
        state.steps = [...state.steps, step];
        state.isStarted = true;
        state.activeAgentRole = step.agentRole;
        state.activeAgentName = step.agentName; // Capture the real name (e.g. "Alice - Product Owner")
        state.currentActionStatus = step.isThinking ? 'Thinking...' : 'Responding...';

        // Update Step Index
        const index = this.workflowStepsOrder.indexOf(step.agentRole);
        if (index !== -1) {
            state.currentStepIndex = index;
        }

        if (step.isCompleted && step.agentRole === TeamMemberRole.ProjectManager && step.content.includes("Completed")) {
            state.currentActionStatus = 'Completed';
            state.activeAgentRole = null;
        }

        // Notify subscribers
        console.log(`[WorkflowState] Emitting new state to subscribers. Steps count: ${state.steps.length}`);
        this.stateSubjects.get(normalizedId)?.next({ ...state });
    }

    resetState(projectId: string) {
        if (this.states.has(projectId)) {
            const state = this.states.get(projectId)!;
            state.steps = [];
            state.isStarted = true; // If we refer to "reset" as "starting new", or false? 
            // Usually startKickoff calls this. Let's say we set isStarted = true explicitly in startKickoff logic
            state.currentStepIndex = 0;
            state.activeAgentRole = TeamMemberRole.ProjectManager;
            state.currentActionStatus = 'Starting...';
            this.stateSubjects.get(projectId)?.next({ ...state });
        }
    }
}
