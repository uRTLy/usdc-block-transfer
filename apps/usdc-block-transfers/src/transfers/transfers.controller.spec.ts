import { ApplicationError, GetTransfersUseCase } from '@app/application';
import { Transfer } from '@app/domain';
import { TransfersController } from './transfers.controller';

describe('TransfersController', () => {
  it('calls use case with normalized query params', async () => {
    const useCase = createGetTransfersUseCase([]);
    const controller = new TransfersController(useCase);

    await expect(
      controller.getTransfers(' Ethereum ', ' usdc ', '123'),
    ).resolves.toEqual({
      chain: 'ethereum',
      asset: 'USDC',
      blockNumber: '123',
      transfers: [],
    });

    expect(useCase.execute).toHaveBeenCalledWith({
      chainSlug: 'ethereum',
      assetSymbol: 'USDC',
      position: '123',
    });
  });

  it('maps transfers to response shape', async () => {
    const controller = new TransfersController(
      createGetTransfersUseCase([
        new Transfer({
          chainSlug: 'ethereum',
          assetSymbol: 'USDC',
          position: '123',
          transactionHash: '0xabc',
          transactionIndex: 1,
          logIndex: 2,
          from: '0xfrom',
          to: '0xto',
          amountRaw: '1000000',
        }),
      ]),
    );

    await expect(
      controller.getTransfers('ethereum', 'USDC', '123'),
    ).resolves.toEqual({
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

  it.each([
    ['chain', undefined, 'USDC', '123'],
    ['asset', 'ethereum', undefined, '123'],
    ['blockNumber', 'ethereum', 'USDC', undefined],
    ['blockNumber', 'ethereum', 'USDC', '-1'],
    ['blockNumber', 'ethereum', 'USDC', 'abc'],
  ])(
    'throws application error for invalid %s',
    async (_field, chain, asset, blockNumber) => {
      const controller = new TransfersController(createGetTransfersUseCase([]));

      await expect(
        controller.getTransfers(chain, asset, blockNumber),
      ).rejects.toThrow(ApplicationError);
    },
  );

  it('passes application errors from use case', async () => {
    const useCase = createGetTransfersUseCase([]);
    useCase.execute.mockRejectedValue(
      new ApplicationError('UNSUPPORTED_CHAIN', 'Unsupported chain: polygon'),
    );
    const controller = new TransfersController(useCase);

    await expect(
      controller.getTransfers('polygon', 'USDC', '123'),
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_CHAIN',
    });
  });
});

function createGetTransfersUseCase(
  transfers: Transfer[],
): jest.Mocked<Pick<GetTransfersUseCase, 'execute'>> {
  return {
    execute: jest.fn().mockResolvedValue(transfers),
  };
}
