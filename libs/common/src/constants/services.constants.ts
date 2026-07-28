export const services = {
    API_GATEWAY: 'api-gateway',
    AUTH: 'auth',
    USERS_SERVICE: 'user-service',
    EVENTS_SERVICE: 'events-service',
    TICKETS_SERVICE: 'tickets-service',
    PAYMENTS_SERVICE: 'payments-service',
    NOTIFICATION_SERVICE: 'notification-service',
} as const;

export const SERVICES_PORTS = {
    API_GATEWAY: 3000,
    AUTHE: 3001,
    USERS_SERVICE: 3002,
    EVENTS_SERVICE: 3003,
    TICKETS_SERVICE: 3004,
    PAYMENTS_SERVICE: 3005,
    NOTIFICATION_SERVICE: 3006,
} as const;