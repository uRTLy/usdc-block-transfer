import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ApplicationError, GetTransfersUseCase } from '@app/application';
import { Transfer } from '@app/domain';
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
  let getTransfersUseCase: jest.Mocked<Pick<GetTransfersUseCase, 'execute'>>;

  beforeEach(async () => {
    getTransfersUseCase = createGetTransfersUseCase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GetTransfersUseCase)
      .useValue(getTransfersUseCase)
      .compile();

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
        transfers: [
          {
            transactionHash: '0xabc',
            transactionIndex: 1,
            logIndex: 2,
            from: '0xfrom',
            to: '0xto',
            amountRaw: '1000000',
          },
        ],
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
      .expect(400)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          statusCode: 400,
          error: 'INVALID_QUERY',
          message: 'blockNumber must be a non-negative integer',
        });
      });
  });

  it('/v1/transfers returns 404 for unsupported chain', () => {
    return request(app.getHttpServer())
      .get('/v1/transfers')
      .query({
        chain: 'polygon',
        asset: 'USDC',
        blockNumber: '123',
      })
      .expect(404)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          statusCode: 404,
          error: 'UNSUPPORTED_CHAIN',
          message: 'Unsupported chain: polygon',
        });
      });
  });

  it('/v1/transfers returns 404 for unsupported asset', () => {
    return request(app.getHttpServer())
      .get('/v1/transfers')
      .query({
        chain: 'ethereum',
        asset: 'DAI',
        blockNumber: '123',
      })
      .expect(404)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          statusCode: 404,
          error: 'UNSUPPORTED_ASSET',
          message: 'Unsupported asset: DAI',
        });
      });
  });

  it('/v1/transfers returns 422 when block is too old for configured RPC', () => {
    return request(app.getHttpServer())
      .get('/v1/transfers')
      .query({
        chain: 'ethereum',
        asset: 'USDC',
        blockNumber: '1',
      })
      .expect(422)
      .expect(({ body }) => {
        const responseBody = body as { message: string };

        expect(body).toMatchObject({
          statusCode: 422,
          error: 'BLOCK_TOO_OLD',
        });
        expect(responseBody.message).toContain(
          'too old for the configured ethereum RPC',
        );
      });
  });

  afterEach(async () => {
    await app.close();
  });
});

function createGetTransfersUseCase(): jest.Mocked<
  Pick<GetTransfersUseCase, 'execute'>
> {
  return {
    execute: jest.fn(({ chainSlug, assetSymbol, position }) => {
      if (chainSlug === 'polygon') {
        throw new ApplicationError(
          'UNSUPPORTED_CHAIN',
          'Unsupported chain: polygon',
        );
      }

      if (assetSymbol === 'DAI') {
        throw new ApplicationError(
          'UNSUPPORTED_ASSET',
          'Unsupported asset: DAI',
        );
      }

      if (position === '1') {
        throw new ApplicationError(
          'BLOCK_TOO_OLD',
          'Block 1 is too old for the configured ethereum RPC. This endpoint accepts blocks from the last 100 blocks only.',
        );
      }

      return Promise.resolve([
        new Transfer({
          chainSlug,
          assetSymbol,
          position,
          transactionHash: '0xabc',
          transactionIndex: 1,
          logIndex: 2,
          from: '0xfrom',
          to: '0xto',
          amountRaw: '1000000',
        }),
      ]);
    }),
  };
}
