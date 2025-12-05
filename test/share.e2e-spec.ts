import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Share API (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let authToken: string;
    let listId: string;
    let itemId: string;
    let shareToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        connection = moduleFixture.get<Connection>(getConnectionToken());

        // Register and login
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'shareuser@example.com',
                password: 'password123',
                name: 'Share User',
            });

        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'shareuser@example.com',
                password: 'password123',
            });

        authToken = loginResponse.body.access_token;

        // Create a list
        const listResponse = await request(app.getHttpServer())
            .post('/lists')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Shared Grocery List',
            });

        listId = listResponse.body._id;

        // Add an item to the list
        const itemResponse = await request(app.getHttpServer())
            .post(`/lists/${listId}/items`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Bread',
                quantity: 1,
                unit: 'loaf',
            });

        itemId = itemResponse.body._id;
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
        await app.close();
    });

    describe('POST /lists/:id/share', () => {
        it('should create a share link for a list', () => {
            return request(app.getHttpServer())
                .post(`/lists/${listId}/share`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    shopkeeperName: 'Local Store',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('shareToken');
                    expect(response.body).toHaveProperty('shareUrl');
                    shareToken = response.body.shareToken;
                });
        });

        it('should fail without authentication', () => {
            return request(app.getHttpServer())
                .post(`/lists/${listId}/share`)
                .send({})
                .expect(401);
        });
    });

    describe('GET /share/:token', () => {
        it('should get shared list by token (public access)', () => {
            return request(app.getHttpServer())
                .get(`/share/${shareToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('list');
                    expect(response.body).toHaveProperty('items');
                    expect(response.body).toHaveProperty('share');
                    expect(response.body.list.name).toBe('Shared Grocery List');
                    expect(response.body.items.length).toBeGreaterThan(0);
                });
        });

        it('should fail with invalid token', () => {
            return request(app.getHttpServer())
                .get('/share/invalid-token')
                .expect(404);
        });
    });

    describe('POST /share/:token/accept', () => {
        it('should accept a share and set shopkeeper name', () => {
            return request(app.getHttpServer())
                .post(`/share/${shareToken}/accept`)
                .send({
                    shopkeeperName: 'Updated Store Name',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('shareToken');
                    expect(response.body.shopkeeperName).toBe('Updated Store Name');
                });
        });
    });

    describe('POST /share/:token/status', () => {
        it('should update list status via share token', () => {
            return request(app.getHttpServer())
                .post(`/share/${shareToken}/status`)
                .send({
                    status: 'shared',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body.status).toBe('shared');
                });
        });
    });

    describe('POST /share/:token/items/:itemId/status', () => {
        it('should update item status via share token', () => {
            return request(app.getHttpServer())
                .post(`/share/${shareToken}/items/${itemId}/status`)
                .send({
                    status: 'in_progress',
                    notes: 'Shopkeeper is looking for it',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body.status).toBe('in_progress');
                    expect(response.body.notes).toBe('Shopkeeper is looking for it');
                });
        });

        it('should update item to done status', () => {
            return request(app.getHttpServer())
                .post(`/share/${shareToken}/items/${itemId}/status`)
                .send({
                    status: 'done',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body.status).toBe('done');
                });
        });

        it('should update item to unavailable status', () => {
            return request(app.getHttpServer())
                .post(`/share/${shareToken}/items/${itemId}/status`)
                .send({
                    status: 'unavailable',
                    notes: 'Out of stock',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body.status).toBe('unavailable');
                    expect(response.body.notes).toBe('Out of stock');
                });
        });
    });

    describe('POST /lists/:id/share/revoke', () => {
        it('should revoke a share link', () => {
            return request(app.getHttpServer())
                .post(`/lists/${listId}/share/revoke`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(201)
                .then((response) => {
                    expect(response.body.message).toContain('revoked');
                });
        });

        it('should fail to access revoked share', () => {
            return request(app.getHttpServer())
                .get(`/share/${shareToken}`)
                .expect(404);
        });

        it('should fail without authentication', () => {
            return request(app.getHttpServer())
                .post(`/lists/${listId}/share/revoke`)
                .expect(401);
        });
    });
});
