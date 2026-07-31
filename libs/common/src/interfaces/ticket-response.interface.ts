export interface TicketResponse {
    id: string;
    ticketCode: string;
    eventTitle?: string;
    quantity: number;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
    purchasedAt: Date;
    checkedInAt?: Date | null;
    eventId?: string;
    eventDate?: Date;
    eventLocation?: string;
    message?: string;
}
