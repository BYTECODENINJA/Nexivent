import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {drizzle, NodePgDatabase} from "drizzle-orm/node-postgres";
import {Pool} from "pg";
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleDestroy{
    private pool: Pool;
    public db: NodePgDatabase<typeof schema>

    constructor() {
        const connectionString = 'postgresql://nexivent:nexivent_password@localhost:5432/nexivent?schema=public';

        this.pool = new Pool({ connectionString });
        this.db = drizzle(this.pool, { schema });

        console.log('Database connected successfully')
    }

    async onModuleDestroy(){
        await this.pool.end()
    }

    get schema() {
        return schema;
    }
}
