export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthUser extends Pick<User, 'id' | 'email'>{
    roles: string[];
}