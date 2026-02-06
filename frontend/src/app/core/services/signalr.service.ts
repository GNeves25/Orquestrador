import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { WorkflowStep } from '../models/models';

export interface TaskUpdate {
    task_id: string;
    project_id: string;
    status: string;
    response_id: string;
    is_successful: boolean;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class SignalrService {
    private hubConnection?: signalR.HubConnection;
    private taskUpdates$ = new Subject<TaskUpdate>();
    private workflowSteps$ = new Subject<WorkflowStep>();
    private connectionPromise?: Promise<void>;

    public connectionState$ = new BehaviorSubject<boolean>(false);
    private lastJoinedProjectId?: string;

    constructor() { }

    startConnection(): Promise<void> {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5220/hubs/orchestration', {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.onreconnected(async () => {
            console.log('SignalR Reconnected');
            this.connectionState$.next(true);
            if (this.lastJoinedProjectId) {
                console.log('Re-joining project group after reconnect...');
                try {
                    await this.joinProject(this.lastJoinedProjectId);
                } catch (err) {
                    console.error('Failed to re-join after reconnect', err);
                }
            }
        });

        this.hubConnection.onclose(() => {
            console.log('SignalR Connection Closed');
            this.connectionState$.next(false);
        });

        this.hubConnection.on('TaskUpdate', (update: TaskUpdate) => {
            console.log('RAW SIGNALR [TaskUpdate]:', update);
            this.taskUpdates$.next(update);
        });

        this.hubConnection.on('ReceiveWorkflowStep', (step: any) => {
            console.log('RAW SIGNALR [ReceiveWorkflowStep]:', step);
            // Normalize header depending on backend serialization
            if (!step.projectId && step.ProjectId) step.projectId = step.ProjectId;
            if (!step.agentRole && step.AgentRole) step.agentRole = step.AgentRole;
            if (!step.agentName && step.AgentName) step.agentName = step.AgentName;
            if (!step.stepName && step.StepName) step.stepName = step.StepName;
            if (!step.content && step.Content) step.content = step.Content;

            // Normalize Enums (if they come as Ints)
            if (typeof step.agentRole === 'number') {
                const roles = ['ProductOwner', 'ProjectManager', 'Designer', 'TechLead', 'Developer', 'QA', 'DevOps']; // Approximate mapping if needed, but ideally string
            }

            this.workflowSteps$.next(step);
        });

        this.connectionPromise = this.hubConnection.start()
            .then(() => {
                console.log('SignalR Connected');
                this.connectionState$.next(true);
            })
            .catch(err => {
                console.error('SignalR Connection Error Detail:', err);
                if (err.statusCode) console.error('Status Code:', err.statusCode);
                this.connectionState$.next(false);
                throw err;
            });

        return this.connectionPromise;
    }

    stopConnection(): Promise<void> {
        if (this.hubConnection) {
            this.connectionPromise = undefined;
            return this.hubConnection.stop();
        }
        return Promise.resolve();
    }

    async joinProject(projectId: string): Promise<void> {
        if (!this.connectionPromise) {
            this.startConnection();
        }
        await this.connectionPromise;

        if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
            const normalizedId = projectId.toLowerCase();
            console.log(`[SignalRService] Joining group project-${normalizedId}`);
            this.lastJoinedProjectId = normalizedId;
            return this.hubConnection.invoke('JoinProject', normalizedId);
        }
        return Promise.reject('Could not connect to SignalR');
    }

    async leaveProject(projectId: string): Promise<void> {
        if (!this.connectionPromise) return Promise.resolve();
        await this.connectionPromise;

        if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
            const normalizedId = projectId.toLowerCase();
            console.log(`[SignalRService] Leaving group project-${normalizedId}`);
            return this.hubConnection.invoke('LeaveProject', normalizedId);
        }
        return Promise.reject('Could not connect to SignalR');
    }

    getTaskUpdates(): Observable<TaskUpdate> {
        return this.taskUpdates$.asObservable();
    }

    getWorkflowSteps(): Observable<WorkflowStep> {
        return this.workflowSteps$.asObservable();
    }
}
