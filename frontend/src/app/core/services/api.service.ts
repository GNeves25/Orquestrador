import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    TeamMember,
    Project,
    ProjectTask,
    AgentResponse,
    CreateTeamMemberDto,
    CreateProjectDto,
    CreateTaskDto
} from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'http://localhost:5220/api';

    constructor(private http: HttpClient) { }

    // Team Members
    getTeamMembers(isActive?: boolean): Observable<TeamMember[]> {
        let url = `${this.baseUrl}/teammembers`;
        if (isActive !== undefined) {
            url += `?isActive=${isActive}`;
        }
        return this.http.get<TeamMember[]>(url);
    }

    getTeamMember(id: string): Observable<TeamMember> {
        return this.http.get<TeamMember>(`${this.baseUrl}/teammembers/${id}`);
    }

    createTeamMember(dto: CreateTeamMemberDto): Observable<TeamMember> {
        return this.http.post<TeamMember>(`${this.baseUrl}/teammembers`, dto);
    }

    updateTeamMember(id: string, dto: Partial<TeamMember>): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/teammembers/${id}`, dto);
    }

    deleteTeamMember(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/teammembers/${id}`);
    }

    // Projects
    getProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(`${this.baseUrl}/projects`);
    }

    getProject(id: string): Observable<Project> {
        return this.http.get<Project>(`${this.baseUrl}/projects/${id}`);
    }

    createProject(dto: CreateProjectDto): Observable<Project> {
        return this.http.post<Project>(`${this.baseUrl}/projects`, dto);
    }

    updateProject(id: string, dto: Partial<Project>): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/projects/${id}`, dto);
    }

    deleteProject(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/projects/${id}`);
    }

    getProjectTasks(projectId: string): Observable<ProjectTask[]> {
        return this.http.get<ProjectTask[]>(`${this.baseUrl}/projects/${projectId}/tasks`);
    }

    // Tasks
    getTasks(): Observable<ProjectTask[]> {
        return this.http.get<ProjectTask[]>(`${this.baseUrl}/tasks`);
    }

    getTask(id: string): Observable<ProjectTask> {
        return this.http.get<ProjectTask>(`${this.baseUrl}/tasks/${id}`);
    }

    createTask(dto: CreateTaskDto): Observable<ProjectTask> {
        return this.http.post<ProjectTask>(`${this.baseUrl}/tasks`, dto);
    }

    updateTask(id: string, dto: Partial<ProjectTask>): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/tasks/${id}`, dto);
    }

    deleteTask(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`);
    }

    executeTask(id: string): Observable<AgentResponse> {
        return this.http.post<AgentResponse>(`${this.baseUrl}/tasks/${id}/execute`, {});
    }

    getTaskResponses(taskId: string): Observable<AgentResponse[]> {
        return this.http.get<AgentResponse[]>(`${this.baseUrl}/tasks/${taskId}/responses`);
    }

    startKickoff(projectId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/workflow/${projectId}/kickoff`, {});
    }
}
