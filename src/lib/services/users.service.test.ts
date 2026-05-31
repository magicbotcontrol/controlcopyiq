import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserCopy } from '../../types';

const mocks = vi.hoisted(() => ({
  fromMock: vi.fn(),
  addLogMock: vi.fn(),
  triggerTelegramNotificationMock: vi.fn(),
  getIndicatorsMock: vi.fn(),
}));

vi.mock('../supabase', () => ({
  supabase: {
    from: mocks.fromMock,
  },
}));

vi.mock('./logs.service', () => ({
  addLog: mocks.addLogMock,
}));

vi.mock('./notifications.service', () => ({
  triggerTelegramNotification: mocks.triggerTelegramNotificationMock,
}));

vi.mock('./indicators.service', () => ({
  getIndicators: mocks.getIndicatorsMock,
}));

import { addUser, buildUpdatedUserPayload, buildUserPayload, recordBalanceUpdate } from './users.service';

function createBaseUser(overrides: Partial<UserCopy> = {}): UserCopy {
  return {
    id: 'usr-1',
    nome: 'Cliente Teste',
    email: 'cliente@example.com',
    whatsapp: '11999999999',
    telegram: '@cliente',
    iq_id: '123456789',
    indicador_id: 'ind-1',
    banca_inicial: 500,
    banca_atual: 500,
    plano: 'QUINZENAL',
    percentual_cliente: 70,
    percentual_copy: 30,
    percentual_indicador: 15,
    receita_empresa: 15,
    data_inicio: '2026-05-01',
    proxima_cobranca: '2026-05-16',
    status: 'Ativo',
    created_at: '2026-05-01',
    ...overrides,
  };
}

describe('users.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T12:00:00Z'));
    mocks.triggerTelegramNotificationMock.mockResolvedValue({ sent: true });
    mocks.addLogMock.mockResolvedValue(undefined);
    mocks.getIndicatorsMock.mockResolvedValue([{ id: 'ind-1', nome: 'Indicador 1' }]);
  });

  it('monta payload de usuario quinzenal com percentuais corretos', () => {
    const payload = buildUserPayload(
      {
        nome: 'Cliente 1',
        email: 'cliente1@example.com',
        whatsapp: '11999999999',
        telegram: '@cliente1',
        iq_id: '123456789',
        indicador_id: 'ind-1',
        banca_inicial: 500,
        data_inicio: '2026-05-01',
        status: 'Ativo',
      },
      'usr-test'
    );

    expect(payload).toMatchObject({
      id: 'usr-test',
      plano: 'QUINZENAL',
      banca_atual: 500,
      percentual_cliente: 70,
      percentual_copy: 30,
      percentual_indicador: 15,
      receita_empresa: 15,
      proxima_cobranca: '2026-05-16',
      created_at: '2026-05-29',
    });
  });

  it('monta payload de usuario semanal sem indicador', () => {
    const payload = buildUserPayload(
      {
        nome: 'Cliente 2',
        email: 'cliente2@example.com',
        whatsapp: '11988888888',
        telegram: '@cliente2',
        iq_id: '987654321',
        indicador_id: '',
        banca_inicial: 1500,
        data_inicio: '2026-05-10',
        status: 'Ativo',
      },
      'usr-test-2'
    );

    expect(payload).toMatchObject({
      id: 'usr-test-2',
      plano: 'SEMANAL',
      percentual_cliente: 80,
      percentual_copy: 20,
      percentual_indicador: 0,
      receita_empresa: 20,
      proxima_cobranca: '2026-05-17',
    });
  });

  it('recalcula plano e proxima cobranca ao reeditar o cliente', () => {
    const updatedPayload = buildUpdatedUserPayload(
      createBaseUser({
        banca_inicial: 1500,
        indicador_id: '',
        data_inicio: '2026-05-10',
        proxima_cobranca: '2026-05-16',
        plano: 'QUINZENAL',
        percentual_cliente: 70,
        percentual_copy: 30,
        percentual_indicador: 15,
        receita_empresa: 15,
      })
    );

    expect(updatedPayload).toMatchObject({
      plano: 'SEMANAL',
      percentual_cliente: 80,
      percentual_copy: 20,
      percentual_indicador: 0,
      receita_empresa: 20,
      proxima_cobranca: '2026-05-17',
    });
  });

  it('atualiza banca e registra historico com diferenca positiva', async () => {
    const insertHistoryMock = vi.fn().mockResolvedValue({ error: null });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn(() => ({ eq: updateEqMock }));
    const selectOrderUsersMock = vi.fn().mockResolvedValue({
      data: [createBaseUser({ banca_atual: 1000, banca_inicial: 1000 })],
      error: null,
    });

    mocks.fromMock.mockImplementation((table: string) => {
      if (table === 'users_copy') {
        return {
          select: () => ({ order: selectOrderUsersMock }),
          update: updateMock,
        };
      }

      if (table === 'historico_banca') {
        return {
          insert: insertHistoryMock,
        };
      }

      throw new Error(`Tabela não mockada: ${table}`);
    });

    const result = await recordBalanceUpdate('usr-1', 1350);

    expect(result).toEqual({ success: true, difference: 350 });
    expect(insertHistoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'usr-1',
        valor_anterior: 1000,
        valor_atual: 1350,
        lucro: 350,
        percentual: 35,
        created_at: '2026-05-29',
      })
    );
    expect(updateMock).toHaveBeenCalledWith({ banca_atual: 1350 });
    expect(updateEqMock).toHaveBeenCalledWith('id', 'usr-1');
    expect(mocks.addLogMock).toHaveBeenCalledTimes(1);
    expect(mocks.triggerTelegramNotificationMock).not.toHaveBeenCalled();
  });

  it('dispara alerta quando a atualizacao de banca e negativa', async () => {
    const insertHistoryMock = vi.fn().mockResolvedValue({ error: null });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn(() => ({ eq: updateEqMock }));
    const selectOrderUsersMock = vi.fn().mockResolvedValue({
      data: [createBaseUser({ banca_atual: 1000, banca_inicial: 1000 })],
      error: null,
    });

    mocks.fromMock.mockImplementation((table: string) => {
      if (table === 'users_copy') {
        return {
          select: () => ({ order: selectOrderUsersMock }),
          update: updateMock,
        };
      }

      if (table === 'historico_banca') {
        return {
          insert: insertHistoryMock,
        };
      }

      throw new Error(`Tabela não mockada: ${table}`);
    });

    const result = await recordBalanceUpdate('usr-1', 800);

    expect(result).toEqual({ success: true, difference: -200 });
    expect(mocks.triggerTelegramNotificationMock).toHaveBeenCalledWith(
      expect.stringContaining('Prejuízo:* $200')
    );
  });

  it('rejeita cadastro quando o iq_id e invalido', async () => {
    const selectOrderUsersMock = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    mocks.fromMock.mockImplementation((table: string) => {
      if (table === 'users_copy') {
        return {
          select: () => ({ order: selectOrderUsersMock }),
        };
      }

      throw new Error(`Tabela não mockada: ${table}`);
    });

    const result = await addUser({
      nome: 'Cliente Invalido',
      email: 'invalido@example.com',
      whatsapp: '11999999999',
      telegram: '@invalido',
      iq_id: '12345',
      indicador_id: 'ind-1',
      banca_inicial: 500,
      data_inicio: '2026-05-01',
      status: 'Ativo',
    });

    expect(result).toEqual({
      success: false,
      message: 'O ID IQ Option deve possuir exatamente 9 algarismos numéricos.',
    });
    expect(mocks.addLogMock).not.toHaveBeenCalled();
    expect(mocks.triggerTelegramNotificationMock).not.toHaveBeenCalled();
  });

  it('retorna falha quando tenta atualizar banca de usuario inexistente', async () => {
    const selectOrderUsersMock = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    mocks.fromMock.mockImplementation((table: string) => {
      if (table === 'users_copy') {
        return {
          select: () => ({ order: selectOrderUsersMock }),
        };
      }

      if (table === 'historico_banca') {
        return {
          insert: vi.fn(),
        };
      }

      throw new Error(`Tabela não mockada: ${table}`);
    });

    const result = await recordBalanceUpdate('usr-ausente', 900);

    expect(result).toEqual({ success: false, difference: 0 });
    expect(mocks.addLogMock).not.toHaveBeenCalled();
    expect(mocks.triggerTelegramNotificationMock).not.toHaveBeenCalled();
  });

  it('propaga erro quando o insert do supabase falha ao cadastrar usuario', async () => {
    const selectOrderUsersMock = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const singleMock = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'insert users_copy failed' },
    });
    const selectMock = vi.fn(() => ({ single: singleMock }));
    const insertMock = vi.fn(() => ({ select: selectMock }));

    mocks.fromMock.mockImplementation((table: string) => {
      if (table === 'users_copy') {
        return {
          select: () => ({ order: selectOrderUsersMock }),
          insert: insertMock,
        };
      }

      throw new Error(`Tabela não mockada: ${table}`);
    });

    await expect(
      addUser({
        nome: 'Cliente Falha Insert',
        email: 'falha@example.com',
        whatsapp: '11999999999',
        telegram: '@falha',
        iq_id: '111222333',
        indicador_id: 'ind-1',
        banca_inicial: 800,
        data_inicio: '2026-05-01',
        status: 'Ativo',
      })
    ).rejects.toThrow('insert users_copy failed');

    expect(mocks.addLogMock).not.toHaveBeenCalled();
    expect(mocks.triggerTelegramNotificationMock).not.toHaveBeenCalled();
  });

  it('propaga erro quando o historico falha apos localizar o usuario', async () => {
    const insertHistoryMock = vi.fn().mockResolvedValue({
      error: { message: 'insert historico_banca failed' },
    });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn(() => ({ eq: updateEqMock }));
    const selectOrderUsersMock = vi.fn().mockResolvedValue({
      data: [createBaseUser({ banca_atual: 1000, banca_inicial: 1000 })],
      error: null,
    });

    mocks.fromMock.mockImplementation((table: string) => {
      if (table === 'users_copy') {
        return {
          select: () => ({ order: selectOrderUsersMock }),
          update: updateMock,
        };
      }

      if (table === 'historico_banca') {
        return {
          insert: insertHistoryMock,
        };
      }

      throw new Error(`Tabela não mockada: ${table}`);
    });

    await expect(recordBalanceUpdate('usr-1', 1300)).rejects.toThrow('insert historico_banca failed');
    expect(updateMock).not.toHaveBeenCalled();
    expect(mocks.addLogMock).not.toHaveBeenCalled();
    expect(mocks.triggerTelegramNotificationMock).not.toHaveBeenCalled();
  });
});
