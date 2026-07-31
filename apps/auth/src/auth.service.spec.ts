import { Test, TestingModule } from '@nestjs/testing';
import { AuthService} from "./auth.service";
import { JwtService } from '@nestjs/jwt';
import { KAFKA_SERVICE } from '@app/kafka';
import { DatabaseService } from '@app/database';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn(),
}));

describe('AuthServiceService', () => {
    let service: AuthService;

    // create mock objects

    const mockKafkaClient = {
        emit: jest.fn(),
        connect: jest.fn(),
    };

    const mockDbService = {
        db: {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnValue([]),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockReturnValue([]),
        },
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: KAFKA_SERVICE, useValue: mockKafkaClient },
                { provide: DatabaseService, useValue: mockDbService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);

        // Clear mock call history before each test
        jest.clearAllMocks();
    });


    describe('register', () => {
        it('should register a new user successfully', async () => {
            // Mock no existing user
            mockDbService.db.limit.mockReturnValueOnce([]);

            const mockUser = {
                id: 'user-id-123',
                email: 'joseph@mulwa.com',
                name: 'Joseph',
            };
            mockDbService.db.returning.mockReturnValueOnce([mockUser]);

            const result = await service.register(
                'joseph@mulwa.com',
                'securePassword',
                'Joseph',
            );

            expect(result).toEqual({
                message: 'User registered successfully',
                userId: 'user-id-123',
            });

            expect(bcrypt.hash).toHaveBeenCalledWith('securePassword', 10);

            expect(mockKafkaClient.emit).toHaveBeenCalledWith(
                'user.registered',
                expect.objectContaining({
                    userId: 'user-id-123',
                    email: 'joseph@mulwa.com',
                    name: 'Joseph',
                }),
            );
        });

        it('should throw ConflictException if user already exists', async () => {
            mockDbService.db.limit.mockReturnValueOnce([
                { id: 'existing-user-id', email: 'joseph@mulwa.com' },
            ]);

            await expect(
                service.register('joseph@mulwa.com', 'securePassword', 'Joseph'),
            ).rejects.toThrow('User already exists');
        });
    });
});