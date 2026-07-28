export const KAFKA_BROKER = process.env.KAFKA_BROKER ?? 'localhost:9093';
export const KAFKA_CLIENT_ID ='nexivent';
export const KAFKA_CONSUMER_GROUP = 'nexivent-consumer';

//Kafka Topics
export const KAFKA_TOPICS = {
    //Auth events
    USER_REGISTERED: 'user.registered',
    USER_LOGIN: 'user.login',
    PASSWORD_RESET_REQUESTED: 'user.passwordResetRequested',

    //EVENTS
    EVENT_CREATED: 'event.created',
    EVENT_UPDATED: 'event.updated',
    EVENT_CANCELLED: 'event.cancelled',

    //Ticket events
    TICKET_PURCHASED: 'ticket.purchased',
    TICKET_CANCELLED: 'ticket.cancelled',
    TICKET_CHECKED_IN: 'ticket.checkedIn',

    //PAYMENTS EVENTS
    PAYMENT_COMPLETED: 'payment.completed',
    PAYMENT_FAILED: 'payment.failed',
    PAYMENT_REFUNDED: 'payment.refunded',

    //NOTIFICATIONS TRIGGERS
    SEND_EMAIL: 'notification.sendEmail',
    SEND_PUSH: 'notification.sendPush',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];