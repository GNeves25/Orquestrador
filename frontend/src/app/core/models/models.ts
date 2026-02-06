export enum TeamMemberRole {
    ProductOwner = 'ProductOwner',
    ProjectManager = 'ProjectManager',
    Designer = 'Designer',
    TechLead = 'TechLead',
    Developer = 'Developer',
    QA = 'QA',
    DevOps = 'DevOps'
}

export enum ProjectStatus {
    Planning = 'Planning',
    InProgress = 'InProgress',
    Testing = 'Testing',
    Completed = 'Completed',
    OnHold = 'OnHold',
    Cancelled = 'Cancelled'
}

export enum TaskStatus {
    Pending = 'Pending',
    Assigned = 'Assigned',
    InProgress = 'InProgress',
    UnderReview = 'UnderReview',
    Completed = 'Completed',
    Failed = 'Failed'
}

export enum TaskPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical'
}

export interface TeamMember {
    id: string;
    name: string;
    role: TeamMemberRole;
    description: string;
    isActive: boolean;
    agentEndpoint?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    createdAt: Date;
    updatedAt?: Date;
    startDate?: Date;
    endDate?: Date;
    requirements?: string;
    technicalStack?: string;
    tasks?: ProjectTask[];
}

export interface ProjectTask {
    id: string;
    projectId: string;
    assignedToId?: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    createdAt: Date;
    updatedAt?: Date;
    completedAt?: Date;
    context?: string;
    expectedOutput?: string;
    assignedTo?: TeamMember;
    responses?: AgentResponse[];
}

export interface AgentResponse {
    id: string;
    taskId: string;
    teamMemberId: string;
    content: string;
    createdAt: Date;
    isSuccessful: boolean;
    errorMessage?: string;
    tokensUsed: number;
    processingTimeMs: number;
    teamMember?: TeamMember;
    timestamp?: Date;
    artifacts?: string[];
}

export interface CreateTeamMemberDto {
    name: string;
    role: TeamMemberRole;
    description: string;
    agentEndpoint?: string;
}

export interface CreateProjectDto {
    name: string;
    description: string;
    requirements?: string;
    technicalStack?: string;
}

export interface CreateTaskDto {
    projectId: string;
    assignedToId?: string;
    title: string;
    description: string;
    priority: TaskPriority;
    context?: string;
    expectedOutput?: string;
}

export interface WorkflowStep {
    projectId: string;
    agentRole: TeamMemberRole;
    agentName: string;
    stepName: string;
    content: string;
    timestamp: Date;
    isThinking: boolean;
    isCompleted: boolean;
}
