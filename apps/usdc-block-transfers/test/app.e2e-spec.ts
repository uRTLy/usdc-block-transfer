import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});

describe('TransfersController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/v1/transfers (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/transfers')
      .query({
        chain: 'ethereum',
        asset: 'USDC',
        blockNumber: '123',
      })
      .expect(200)
      .expect({
        chain: 'ethereum',
        asset: 'USDC',
        blockNumber: '123',
        transfers: [],
      });
  });

  it('/v1/transfers returns 400 for invalid query', () => {
    return request(app.getHttpServer())
      .get('/v1/transfers')
      .query({
        chain: 'ethereum',
        asset: 'USDC',
        blockNumber: '-1',
      })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
