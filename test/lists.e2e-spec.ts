import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Lists API (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let authToken: string;
    let listId: string;
    let itemId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        connection = moduleFixture.get<Connection>(getConnectionToken());

        // Register and login to get auth token
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'listuser@example.com',
                password: 'password123',
                name: 'List User',
            });

        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'listuser@example.com',
                password: 'password123',
            });

        authToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
        await app.close();
    });

    describe('POST /lists', () => {
        it('should create a new list', () => {
            return request(app.getHttpServer())
                .post('/lists')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Grocery Shopping',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('_id');
                    expect(response.body.name).toBe('Grocery Shopping');
                    expect(response.body.status).toBe('draft');
                    listId = response.body._id;
                });
        });

        it('should fail without authentication', () => {
            return request(app.getHttpServer())
                .post('/lists')
                .send({
                    name: 'Test List',
                })
                .expect(401);
        });

        it('should fail with missing name', () => {
            return request(app.getHttpServer())
                .post('/lists')
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);
        });
    });

    describe('GET /lists', () => {
        it('should get all lists for authenticated user', () => {
            return request(app.getHttpServer())
                .get('/lists')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .then((response) => {
                    expect(Array.isArray(response.body)).toBe(true);
                    expect(response.body.length).toBeGreaterThan(0);
                });
        });

        it('should fail without authentication', () => {
            return request(app.getHttpServer())
                .get('/lists')
                .expect(401);
        });
    });

    describe('GET /lists/:id', () => {
        it('should get a specific list', () => {
            return request(app.getHttpServer())
                .get(`/lists/${listId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body._id).toBe(listId);
                    expect(response.body.name).toBe('Grocery Shopping');
                });
        });

        it('should fail with invalid list id', () => {
            return request(app.getHttpServer())
                .get('/lists/invalid-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(500);
        });
    });

    describe('PATCH /lists/:id', () => {
        it('should update a list', () => {
            return request(app.getHttpServer())
                .patch(`/lists/${listId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Updated Grocery List',
                    status: 'shared',
                })
                .expect(200)
                .then((response) => {
                    expect(response.body.name).toBe('Updated Grocery List');
                    expect(response.body.status).toBe('shared');
                });
        });
    });

    describe('POST /lists/:id/items', () => {
        it('should add an item to the list', () => {
            return request(app.getHttpServer())
                .post(`/lists/${listId}/items`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Milk',
                    quantity: 2,
                    unit: 'liters',
                    notes: 'Full cream',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('_id');
                    expect(response.body.name).toBe('Milk');
                    expect(response.body.quantity).toBe(2);
                    expect(response.body.status).toBe('to_buy');
                    itemId = response.body._id;
                });
        });

        it('should fail with missing required fields', () => {
            return request(app.getHttpServer())
                .post(`/lists/${listId}/items`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    quantity: 1,
                })
                .expect(400);
        });
    });

    describe('GET /lists/:id/items', () => {
        it('should get all items for a list', () => {
            return request(app.getHttpServer())
                .get(`/lists/${listId}/items`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .then((response) => {
                    expect(Array.isArray(response.body)).toBe(true);
                    expect(response.body.length).toBeGreaterThan(0);
                    expect(response.body[0].name).toBe('Milk');
                });
        });
    });

    describe('GET /lists/:id/items/:itemId', () => {
        it('should get a specific item', () => {
            return request(app.getHttpServer())
                .get(`/lists/${listId}/items/${itemId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body._id).toBe(itemId);
                    expect(response.body.name).toBe('Milk');
                });
        });
    });

    describe('PATCH /lists/:id/items/:itemId', () => {
        it('should update an item status', () => {
            return request(app.getHttpServer())
                .patch(`/lists/${listId}/items/${itemId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    status: 'in_progress',
                    notes: 'Looking for it',
                })
                .expect(200)
                .then((response) => {
                    expect(response.body.status).toBe('in_progress');
                    expect(response.body.notes).toBe('Looking for it');
                });
        });
    });

    describe('POST /lists/:id/duplicate', () => {
        it('should duplicate a list', () => {
            return request(app.getHttpServer())
                .post(`/lists/${listId}/duplicate`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('_id');
                    expect(response.body._id).not.toBe(listId);
                    expect(response.body.name).toContain('Copy');
                });
        });
    });

    describe('DELETE /lists/:id/items/:itemId', () => {
        it('should delete an item', async () => {
            // Create a new item specifically for deletion
            const itemResponse = await request(app.getHttpServer())
                .post(`/lists/${listId}/items`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Item to Delete',
                    quantity: 1,
                    unit: 'piece',
                });

            const deleteItemId = itemResponse.body._id;

            return request(app.getHttpServer())
                .delete(`/lists/${listId}/items/${deleteItemId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
        });
    });

    describe('DELETE /lists/:id', () => {
        it('should delete a list', () => {
            return request(app.getHttpServer())
                .delete(`/lists/${listId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
        });
    });
});
