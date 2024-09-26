// types.ts
export interface Tag {
    id: string;
    userId: string;
    tagName: string;
}

export interface Task {
    id: string;
    userId: string;
    taskDescription: string;
    taskStatus: boolean;
    tag: Tag[];
}

export interface TasksAndTagsResponse {
    userId: string;
    tag: Tag[];
    task: Task[];
}