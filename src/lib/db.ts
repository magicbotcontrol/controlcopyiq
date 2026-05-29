import { Indicador, UserCopy, Cobranca, HistoricoBanca, Configuracoes, UserAuth } from '../types';

// Simple date helper functions to keep everything lightweight and reliable
export const dateUtils = {
  todayStr(): string {
    const d = new Date();
    return d.toISOString().split('T')[0];
  },
  addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  },
  daysUntil(dateStr: string): number {
    const t = new Date(this.todayStr() + 'T00:00:00').getTime();
    const d = new Date(dateStr + 'T00:00:00').getTime();
    const diffMs = d - t;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  },
  formatBr(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
};

// Initial Data Seed for realistic experience
const INITIAL_INDICADORES: Indicador[] = [
  {
    id: 'ind-1',
    nome: 'Carlos Silva (Afiliado VIP)',
    email: 'carlos.silva@mkttrading.com',
    telegram: '@carlostrading',
    whatsapp: '11988887777',
    percentual: 15, // will be standard indicator percentage mapping
    status: 'Ativo',
    codigo_interno: 'CARLOS10',
    observacoes: 'Parceiro estratégico de tráfego orgânico do YouTube.'
  },
  {
    id: 'ind-2',
    nome: 'Maysa Amorim (Influenciadora FX)',
    email: 'maysa.fx@instagram.com',
    telegram: '@maysa_fx',
    whatsapp: '21977773333',
    percentual: 15,
    status: 'Ativo',
    codigo_interno: 'MAYSA20',
    observacoes: 'Divulgação diária nos stories e canal de sinais gratuito.'
  },
  {
    id: 'ind-3',
    nome: 'Pedro Santos (SEO Expert)',
    email: 'pedrosantos.expert@gmail.com',
    telegram: '@pedroseo',
    whatsapp: '31966665555',
    percentual: 10,
    status: 'Ativo',
    codigo_interno: 'PEDRO30',
    observacoes: 'Focado em blogs de finanças e review de robôs IQ Option.'
  }
];

const INITIAL_USERS: UserCopy[] = [
  {
    id: 'usr-1',
    nome: 'João Pedro Guedes',
    email: 'joaopedro.guedes@hotmail.com',
    whatsapp: '11911112222',
    telegram: '@joao_guedes',
    iq_id: '192477811',
    indicador_id: 'ind-1', // Carlos Silva
    banca_inicial: 1200, // SEMANAL
    banca_atual: 1450,
    plano: 'SEMANAL',
    percentual_cliente: 80,
    percentual_copy: 20,
    percentual_indicador: 10,
    receita_empresa: 10,
    data_inicio: dateUtils.addDays(dateUtils.todayStr(), -25),
    proxima_cobranca: dateUtils.addDays(dateUtils.todayStr(), 2),
    status: 'Ativo',
    link_cadastro_utilizado: 'https://iqoption.net/lp/mobile-partner-pwa/?aff=417345&aff_model=revenue&afftrack=CARLOS10',
    link_copy_utilizado: 'https://iqoption.com/pwa/copy-trading/user/178572482?aff=417345',
    created_at: dateUtils.addDays(dateUtils.todayStr(), -25)
  },
  {
    id: 'usr-2',
    nome: 'Aline Evangelista',
    email: 'alineevangelista1994@gmail.com',
    whatsapp: '11944445555',
    telegram: '@aline_evangelista',
    iq_id: '882415170',
    indicador_id: 'ind-2', // Maysa
    banca_inicial: 500, // QUINZENAL
    banca_atual: 620,
    plano: 'QUINZENAL',
    percentual_cliente: 70,
    percentual_copy: 30,
    percentual_indicador: 15,
    receita_empresa: 15,
    data_inicio: dateUtils.addDays(dateUtils.todayStr(), -14),
    proxima_cobranca: dateUtils.addDays(dateUtils.todayStr(), 1),
    status: 'Ativo',
    link_cadastro_utilizado: 'https://iqoption.net/lp/mobile-partner-pwa/?aff=417345&aff_model=revenue&afftrack=MAYSA20',
    link_copy_utilizado: 'https://iqoption.com/pwa/copy-trading/user/178572482?aff=417345',
    created_at: dateUtils.addDays(dateUtils.todayStr(), -14)
  },
  {
    id: 'usr-3',
    nome: 'Roberto Rezende',
    email: 'roberto.r@gmail.com',
    whatsapp: '11955556666',
    telegram: '@roberto_rez',
    iq_id: '301982744',
    indicador_id: 'ind-1', // Carlos
    banca_inicial: 850, // QUINZENAL
    banca_atual: 980,
    plano: 'QUINZENAL',
    percentual_cliente: 70,
    percentual_copy: 30,
    percentual_indicador: 15,
    receita_empresa: 15,
    data_inicio: dateUtils.addDays(dateUtils.todayStr(), -8),
    proxima_cobranca: dateUtils.addDays(dateUtils.todayStr(), 7),
    status: 'Ativo',
    link_cadastro_utilizado: 'https://iqoption.net/lp/mobile-partner-pwa/?aff=417345&aff_model=revenue&afftrack=CARLOS10',
    link_copy_utilizado: 'https://iqoption.com/pwa/copy-trading/user/178572482?aff=417345',
    created_at: dateUtils.addDays(dateUtils.todayStr(), -8)
  },
  {
    id: 'usr-4',
    nome: 'Mariana Costa',
    email: 'mari.costa89@outlook.com',
    whatsapp: '21988889999',
    telegram: '@mari_fx_costa',
    iq_id: '554219087',
    indicador_id: 'ind-3', // Pedro Santos
    banca_inicial: 3000, // SEMANAL
    banca_atual: 3800,
    plano: 'SEMANAL',
    percentual_cliente: 80,
    percentual_copy: 20,
    percentual_indicador: 10,
    receita_empresa: 10,
    data_inicio: dateUtils.addDays(dateUtils.todayStr(), -6),
    proxima_cobranca: dateUtils.addDays(dateUtils.todayStr(), 0), // vencendo hoje!
    status: 'Ativo',
    link_cadastro_utilizado: 'https://iqoption.net/lp/mobile-partner-pwa/?aff=417345&aff_model=revenue&afftrack=PEDRO30',
    link_copy_utilizado: 'https://iqoption.com/pwa/copy-trading/user/178572482?aff=417345',
    created_at: dateUtils.addDays(dateUtils.todayStr(), -6)
  },
  {
    id: 'usr-5',
    nome: 'Eduardo Souza',
    email: 'edu.souza@gmail.com',
    whatsapp: '31977778888',
    telegram: '@edu_souza_iq',
    iq_id: '776219800',
    indicador_id: '', // Direto / Nenhum
    banca_inicial: 750, // QUINZENAL
    banca_atual: 700, // Evolucao negativa!
    plano: 'QUINZENAL',
    percentual_cliente: 70,
    percentual_copy: 30,
    percentual_indicador: 0, // No indicator
    receita_empresa: 30, // all copy fee goes to firm
    data_inicio: dateUtils.addDays(dateUtils.todayStr(), -20),
    proxima_cobranca: dateUtils.addDays(dateUtils.todayStr(), -2), // atrasado!
    status: 'Atrasado' as any, // We will map or use Active with late billing
    link_cadastro_utilizado: 'https://iqoption.net/lp/mobile-partner-pwa/?aff=417345&aff_model=revenue',
    link_copy_utilizado: 'https://iqoption.com/pwa/copy-trading/user/178572482?aff=417345',
    created_at: dateUtils.addDays(dateUtils.todayStr(), -20)
  }
];

// Map initial users' status correcting any edge
INITIAL_USERS[4].status = 'Ativo'; // keep Active status, the billing itself determines 'Atrasado' visually

const INITIAL_COBRANCAS: Cobranca[] = [
  {
    id: 'cob-1',
    user_id: 'usr-1',
    valor_lucro: 250, // João Pedro Guedes ($1200 -> $1450 => $250 profit)
    valor_devido: 50, // 20%
    status: 'Pago',
    data_vencimento: dateUtils.addDays(dateUtils.todayStr(), -7),
    data_pagamento: dateUtils.addDays(dateUtils.todayStr(), -7),
    percentual_copy: 20,
    valor_indicador: 25, // 10%
    valor_empresa: 25 // 10%
  },
  {
    id: 'cob-2',
    user_id: 'usr-2',
    valor_lucro: 120, // Aline Evangelista ($500 -> $620 => $120 profit)
    valor_devido: 36, // 30%
    status: 'Pago',
    data_vencimento: dateUtils.addDays(dateUtils.todayStr(), -1),
    data_pagamento: dateUtils.addDays(dateUtils.todayStr(), -1),
    percentual_copy: 30,
    valor_indicador: 18, // 15%
    valor_empresa: 18 // 15%
  },
  {
    id: 'cob-3',
    user_id: 'usr-4',
    valor_lucro: 800, // Mariana Costa ($3000 -> $3800 => $800 profit)
    valor_devido: 160, // 20%
    status: 'Pendente',
    data_vencimento: dateUtils.addDays(dateUtils.todayStr(), 0), // hoje
    percentual_copy: 20,
    valor_indicador: 80, // 10%
    valor_empresa: 80 // 10%
  },
  {
    id: 'cob-4',
    user_id: 'usr-5',
    valor_lucro: 100, // Eduardo Souza (Tinha tido lucro no primeiro ciclo e depois perdeu)
    valor_devido: 30, // 30%
    status: 'Atrasado',
    data_vencimento: dateUtils.addDays(dateUtils.todayStr(), -2), // atrasada!
    percentual_copy: 30,
    valor_indicador: 0, // sem indicador
    valor_empresa: 30
  }
];

const INITIAL_HISTORICO_BANCA: HistoricoBanca[] = [
  // João Pedro Guedes
  {
    id: 'hist-1',
    user_id: 'usr-1',
    valor_anterior: 1200,
    valor_atual: 1350,
    lucro: 150,
    percentual: 12.5,
    created_at: dateUtils.addDays(dateUtils.todayStr(), -14)
  },
  {
    id: 'hist-2',
    user_id: 'usr-1',
    valor_anterior: 1350,
    valor_atual: 1450,
    lucro: 100,
    percentual: 7.4,
    created_at: dateUtils.addDays(dateUtils.todayStr(), -7)
  },
  // Aline Evangelista
  {
    id: 'hist-3',
    user_id: 'usr-2',
    valor_anterior: 500,
    valor_atual: 560,
    lucro: 60,
    percentual: 12.0,
    created_at: dateUtils.addDays(dateUtils.todayStr(), -7)
  },
  {
    id: 'hist-4',
    user_id: 'usr-2',
    valor_anterior: 560,
    valor_atual: 620,
    lucro: 60,
    percentual: 10.7,
    created_at: dateUtils.addDays(dateUtils.todayStr(), -1)
  },
  // Roberto Rezende
  {
    id: 'hist-5',
    user_id: 'usr-3',
    valor_anterior: 850,
    valor_atual: 980,
    lucro: 130,
    percentual: 15.29,
    created_at: dateUtils.addDays(dateUtils.todayStr(), -2)
  },
  // Mariana Costa
  {
    id: 'hist-6',
    user_id: 'usr-4',
    valor_anterior: 3000,
    valor_atual: 3800,
    lucro: 800,
    percentual: 26.67,
    created_at: dateUtils.addDays(dateUtils.todayStr(), -3)
  },
  // Eduardo Souza
  {
    id: 'hist-7',
    user_id: 'usr-5',
    valor_anterior: 750,
    valor_atual: 850,
    lucro: 100,
    percentual: 13.33,
    created_at: dateUtils.addDays(dateUtils.todayStr(), -9)
  },
  {
    id: 'hist-8',
    user_id: 'usr-5',
    valor_anterior: 850,
    valor_atual: 700,
    lucro: -150,
    percentual: -17.65,
    created_at: dateUtils.addDays(dateUtils.todayStr(), -1)
  }
];

const DEFAULT_CONFIGS: Configuracoes = {
  telegram_token: '7188294711:AAFu9XyZw-u8Vv9_Qv7X8M7d1Y7z8Y9YUX0',
  telegram_chat_id: '-1001928374112'
};

const DEFAULT_AUTH: UserAuth = {
  email: 'alineevangelista1994@gmail.com',
  nome: 'Aline Evangelista',
  level: 'Admin'
};

// Database class that wraps LocalStorage operations
export class ControlCopyDB {
  private static initLocalStorage() {
    if (!localStorage.getItem('cc_indicators')) {
      localStorage.setItem('cc_indicators', JSON.stringify(INITIAL_INDICADORES));
    }
    if (!localStorage.getItem('cc_users')) {
      localStorage.setItem('cc_users', JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem('cc_cobrancas')) {
      localStorage.setItem('cc_cobrancas', JSON.stringify(INITIAL_COBRANCAS));
    }
    if (!localStorage.getItem('cc_historico_banca')) {
      localStorage.setItem('cc_historico_banca', JSON.stringify(INITIAL_HISTORICO_BANCA));
    }
    if (!localStorage.getItem('cc_config')) {
      localStorage.setItem('cc_config', JSON.stringify(DEFAULT_CONFIGS));
    }
    if (!localStorage.getItem('cc_auth')) {
      localStorage.setItem('cc_auth', JSON.stringify(DEFAULT_AUTH));
    }
    // Set simulated system logs
    if (!localStorage.getItem('cc_logs')) {
      localStorage.setItem('cc_logs', JSON.stringify([
        { id: 'l-1', acao: 'Login realizado', detalhe: 'Admin logado com sucesso', data: dateUtils.todayStr(), user: 'Aline Evangelista' },
        { id: 'l-2', acao: 'Cálculo de repasse', detalhe: 'Sistema verificou cobrança de Mariana Costa automaticamente', data: dateUtils.todayStr(), user: 'Sistema' }
      ]));
    }
  }

  // --- GETTERS ---
  static getIndicators(): Indicador[] {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem('cc_indicators') || '[]');
  }

  static getUsers(): UserCopy[] {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem('cc_users') || '[]');
  }

  static getCobrancas(): Cobranca[] {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem('cc_cobrancas') || '[]');
  }

  static getHistoricos(): HistoricoBanca[] {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem('cc_historico_banca') || '[]');
  }

  static getConfig(): Configuracoes {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem('cc_config') || '{}');
  }

  static getAuth(): UserAuth {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem('cc_auth') || '{}');
  }

  static getLogs(): any[] {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem('cc_logs') || '[]');
  }

  // --- SAVE WRAPPERS ---
  private static saveIndicators(data: Indicador[]) {
    localStorage.setItem('cc_indicators', JSON.stringify(data));
  }

  private static saveUsers(data: UserCopy[]) {
    localStorage.setItem('cc_users', JSON.stringify(data));
  }

  private static saveCobrancas(data: Cobranca[]) {
    localStorage.setItem('cc_cobrancas', JSON.stringify(data));
  }

  private static saveHistoricos(data: HistoricoBanca[]) {
    localStorage.setItem('cc_historico_banca', JSON.stringify(data));
  }

  static saveConfig(data: Configuracoes) {
    localStorage.setItem('cc_config', JSON.stringify(data));
  }

  static saveAuth(data: UserAuth) {
    localStorage.setItem('cc_auth', JSON.stringify(data));
  }

  static addLog(acao: string, detalhe: string) {
    const logs = this.getLogs();
    const auth = this.getAuth();
    logs.unshift({
      id: `l-${Date.now()}`,
      acao,
      detalhe,
      data: dateUtils.todayStr(),
      user: auth.nome || 'Sistema'
    });
    localStorage.setItem('cc_logs', JSON.stringify(logs.slice(0, 100))); // keep last 100
  }

  // --- BUSINESS LOGIC & CRUDS ---

  // Indicator actions
  static addIndicator(i: Omit<Indicador, 'id'>): Indicador {
    const data = this.getIndicators();
    const newIndicator: Indicador = {
      ...i,
      id: `ind-${Date.now()}`
    };
    data.push(newIndicator);
    this.saveIndicators(data);
    this.addLog('Cadastro Indicador', `Indicador ${newIndicator.nome} cadastrado com código ${newIndicator.codigo_interno}`);
    
    // Auto-alert Telegram if bot configured
    this.triggerTelegramNotification(`🆕 *Novo Indicador Cadastrado*\n📍 *Nome:* ${newIndicator.nome}\n🔑 *Código:* ${newIndicator.codigo_interno}\n📊 *Comissão:* ${newIndicator.percentual}%`);
    
    return newIndicator;
  }

  static updateIndicator(updated: Indicador) {
    const data = this.getIndicators();
    const index = data.findIndex(x => x.id === updated.id);
    if (index !== -1) {
      data[index] = updated;
      this.saveIndicators(data);
      this.addLog('Edição Indicador', `Indicador ${updated.nome} atualizado`);
    }
  }

  static deleteIndicator(id: string) {
    const data = this.getIndicators();
    const filtered = data.filter(x => x.id !== id);
    this.saveIndicators(filtered);
    this.addLog('Exclusão Indicador', `Indicador ID ${id} removido`);
  }

  // User Actions
  static addUser(u: Omit<UserCopy, 'id' | 'plano' | 'percentual_cliente' | 'percentual_copy' | 'percentual_indicador' | 'receita_empresa' | 'proxima_cobranca' | 'banca_atual' | 'created_at'>): { success: boolean, message?: string, user?: UserCopy } {
    const users = this.getUsers();
    
    // Match ID exactly 9 numbers regex
    if (!/^\d{9}$/.test(u.iq_id)) {
      return { success: false, message: 'O ID IQ Option deve possuir exatamente 9 algarismos numéricos.' };
    }

    // Check pre-existence of IQ Option ID
    if (users.some(x => x.iq_id === u.iq_id)) {
      return { success: false, message: `Já existe um usuário cadastrado com o ID IQ Option ${u.iq_id}.` };
    }

    // Determine rules based on initial balance (banca_inicial)
    const banca = u.banca_inicial;
    const plano = banca < 1000 ? 'QUINZENAL' : 'SEMANAL';
    const percentual_cliente = banca < 1000 ? 70 : 80;
    const percentual_copy = banca < 1000 ? 30 : 20;
    
    // Of that copy percentage, how much does indicator get?
    // If client has an indicator: Carlos/Maysa get 15% (for Quinzenal) or 10% (for Semanal)
    // Remaining goes to the enterprise
    const hasIndicator = !!u.indicador_id;
    const percentual_indicador = hasIndicator ? (banca < 1000 ? 15 : 10) : 0;
    const receita_empresa = percentual_copy - percentual_indicador;

    // Next billing date: Weekly => +7 days, Quinzenal => +15 days
    const daysToAdd = plano === 'QUINZENAL' ? 15 : 7;
    const proxima_cobranca = dateUtils.addDays(u.data_inicio, daysToAdd);

    const newUser: UserCopy = {
      ...u,
      id: `usr-${Date.now()}`,
      banca_atual: banca,
      plano,
      percentual_cliente,
      percentual_copy,
      percentual_indicador,
      receita_empresa,
      proxima_cobranca,
      created_at: dateUtils.todayStr()
    };

    users.push(newUser);
    this.saveUsers(users);

    const indName = u.indicador_id ? (this.getIndicators().find(i => i.id === u.indicador_id)?.nome || 'Indicador') : 'Direto';

    this.addLog('Cadastro Usuário Copy', `Usuário ${newUser.nome} cadastrado com ID Iq ${newUser.iq_id} e banca inicial $${newUser.banca_inicial}`);
    
    this.triggerTelegramNotification(
      `🔔 *Novo Usuário Conectado ao Copy*\n👤 *Nome:* ${newUser.nome}\n🆔 *ID IQ:* ${newUser.iq_id}\n📈 *Banca Inicial:* $${newUser.banca_inicial}\n🗓️ *Plano:* ${newUser.plano}\n📣 *Indicador:* ${indName}`
    );

    return { success: true, user: newUser };
  }

  static updateUser(updated: UserCopy) {
    const data = this.getUsers();
    const index = data.findIndex(x => x.id === updated.id);
    if (index !== -1) {
      // Recalculate plan and metrics dynamically if banca_inicial changed
      const old = data[index];
      if (old.banca_inicial !== updated.banca_inicial) {
        const banca = updated.banca_inicial;
        updated.plano = banca < 1000 ? 'QUINZENAL' : 'SEMANAL';
        updated.percentual_cliente = banca < 1000 ? 70 : 80;
        updated.percentual_copy = banca < 1000 ? 30 : 20;
        const hasIndicator = !!updated.indicador_id;
        updated.percentual_indicador = hasIndicator ? (banca < 1000 ? 15 : 10) : 0;
        updated.receita_empresa = updated.percentual_copy - updated.percentual_indicador;
      }
      data[index] = updated;
      this.saveUsers(data);
      this.addLog('Edição Usuário', `Usuário ${updated.nome} editado`);
    }
  }

  static deleteUser(id: string) {
    const data = this.getUsers();
    const filtered = data.filter(x => x.id !== id);
    this.saveUsers(filtered);

    // Also remove respective charges or histories to keep database clean
    const cobrancas = this.getCobrancas().filter(x => x.user_id !== id);
    this.saveCobrancas(cobrancas);

    const hist = this.getHistoricos().filter(x => x.user_id !== id);
    this.saveHistoricos(hist);

    this.addLog('Exclusão Usuário', `Usuário ID ${id} removido do sistema`);
  }

  // Record a fast balance change
  static recordBalanceUpdate(userId: string, targetBalance: number): { success: boolean, difference: number, cobrancaGerada?: Cobranca } {
    const users = this.getUsers();
    const userIndex = users.findIndex(x => x.id === userId);
    if (userIndex === -1) return { success: false, difference: 0 };

    const user = users[userIndex];
    const valorAnterior = user.banca_atual;
    const difference = targetBalance - valorAnterior;
    
    if (difference === 0) {
      return { success: true, difference: 0 };
    }

    const growthPercent = parseFloat(((difference / valorAnterior) * 100).toFixed(2));

    // Create history record
    const history: HistoricoBanca = {
      id: `hist-${Date.now()}`,
      user_id: userId,
      valor_anterior: valorAnterior,
      valor_atual: targetBalance,
      lucro: difference,
      percentual: growthPercent,
      created_at: dateUtils.todayStr()
    };

    const histories = this.getHistoricos();
    histories.push(history);
    this.saveHistoricos(histories);

    // Update user balance
    user.banca_atual = targetBalance;
    this.saveUsers(users);

    this.addLog('Atualização de Banca', `Banca de ${user.nome} de $${valorAnterior} para $${targetBalance} (Lucro: $${difference})`);

    // Alert Telegram of negative growth
    if (difference < 0) {
      this.triggerTelegramNotification(
        `⚠️ *Evolução Negativa da Banca*\n👤 *Usuário:* ${user.nome}\n🆔 *ID IQ:* ${user.iq_id}\n📉 *Prejuízo:* $${Math.abs(difference)} (${growthPercent}%)\n🔴 *Saldo Atual:* $${targetBalance}`
      );
    }

    // Auto Billing if profit is generated and user wants to close a cycle!
    // Or we let them handle billing closures on demand. To be extremely robust,
    // we return the difference, and we'll offer a "Fechar Ciclo e Faturar" action trigger in the UI that calculates it.
    return { success: true, difference };
  }

  // Close cycle & generate bill based on generated profits
  static billUserCycle(userId: string, profit: number): Cobranca | null {
    if (profit <= 0) return null;
    const users = this.getUsers();
    const user = users.find(x => x.id === userId);
    if (!user) return null;

    // Calculate billing value
    const valor_devido = parseFloat(((profit * user.percentual_copy) / 100).toFixed(2));
    const valor_indicador = parseFloat(((profit * user.percentual_indicador) / 100).toFixed(2));
    const valor_empresa = parseFloat((valor_devido - valor_indicador).toFixed(2));

    const newCob: Cobranca = {
      id: `cob-${Date.now()}`,
      user_id: userId,
      valor_lucro: profit,
      valor_devido,
      status: 'Pendente',
      data_vencimento: dateUtils.addDays(dateUtils.todayStr(), 3), // 3 days to pay
      percentual_copy: user.percentual_copy,
      valor_indicador,
      valor_empresa
    };

    const cobrancas = this.getCobrancas();
    cobrancas.push(newCob);
    this.saveCobrancas(cobrancas);

    // Update user's next due date automatically based on plano
    const daysToAdd = user.plano === 'QUINZENAL' ? 15 : 7;
    user.proxima_cobranca = dateUtils.addDays(dateUtils.todayStr(), daysToAdd);
    this.saveUsers(users);

    const ind = this.getIndicators().find(i => i.id === user.indicador_id);
    const indName = ind ? ind.nome : 'Sem indicador';

    this.addLog('Geração de Cobrança', `Fatura de $${valor_devido} gerada para ${user.nome} (Lucro: $${profit})`);

    // Trigger Telegram automatic billing notification
    this.triggerTelegramNotification(
      `⚠️ *Cobrança Pendente Gerada*\n👤 *Usuário:* ${user.nome}\n🆔 *ID IQ:* ${user.iq_id}\n📊 *Plano:* ${user.plano}\n💰 *Lucro Ciclo:* $${profit}\n💵 *Valor Devido (${user.percentual_copy}%):* $${valor_devido}\n📣 *Indicador:* ${indName}\n⏰ *Vencimento:* ${dateUtils.formatBr(newCob.data_vencimento)}`
    );

    return newCob;
  }

  // Update Billing state
  static updateCobrancaStatus(cobrancaId: string, newStatus: 'Pendente' | 'Pago' | 'Atrasado') {
    const cobrancas = this.getCobrancas();
    const idx = cobrancas.findIndex(c => c.id === cobrancaId);
    if (idx !== -1) {
      const c = cobrancas[idx];
      const oldStatus = c.status;
      c.status = newStatus;
      if (newStatus === 'Pago') {
        c.data_pagamento = dateUtils.todayStr();
        
        // Find user to log
        const u = this.getUsers().find(user => user.id === c.user_id);
        const name = u ? u.nome : 'Desconhecido';
        this.addLog('Pagamento de Fatura', `Cobrança de ${name} no valor de $${c.valor_devido} marcada como PAGO`);
        
        // Notify Telegram of payment
        this.triggerTelegramNotification(
          `✅ *Pagamento Confirmado!*\n👤 *Usuário:* ${name}\n💰 *Valor Pago:* $${c.valor_devido}\n💼 *Receita Líquida:* $${c.valor_empresa}\n📣 *Ref Indicator:* $${c.valor_indicador}`
        );
      } else {
        c.data_pagamento = undefined;
        this.addLog('Fatura Atualizada', `Cobrança ID ${cobrancaId} marcada como ${newStatus}`);
      }
      this.saveCobrancas(cobrancas);
    }
  }

  static deleteCobranca(id: string) {
    const cobrancas = this.getCobrancas();
    const filtered = cobrancas.filter(x => x.id !== id);
    this.saveCobrancas(filtered);
    this.addLog('Exclusão Cobrança', `Cobrança ID ${id} removida`);
  }

  // REAL telegram notifier bot caller! Checks if details configured, tries to actually fetch
  // if not, it will still display properly inside the action alert modal sandbox.
  static async triggerTelegramNotification(message: string): Promise<{ sent: boolean, error?: string }> {
    const config = this.getConfig();
    if (!config.telegram_token || !config.telegram_chat_id) {
      console.warn('Telegram not configured, notification would not fire under production.');
      return { sent: false, error: 'Telegram não configurado' };
    }

    // Clean markdown characters if they cause Telegram errors, but normal markdownv2 or standard is good
    // Let's use standard Telegram HTML or Markdown
    try {
      const url = `https://api.telegram.org/bot${config.telegram_token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegram_chat_id,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        console.log('Telegram message dispatched successfully!');
        return { sent: true };
      } else {
        const errorText = await response.text();
        console.error('Telegram bot API error:', errorText);
        return { sent: false, error: `Erro API Telegram: ${errorText}` };
      }
    } catch (e: any) {
      console.error('Network failure trying to contact Telegram:', e);
      return { sent: false, error: e.message || 'Falha de rede' };
    }
  }

  // --- AUTOMATIONS RUN (DAILY SIMULATOR) ---
  // Loops over all active user billing due dates & updates statuses to "Atrasado" if expired
  static runDailyAutomations(): { countAlerts: number, updatedCharges: number } {
    const today = dateUtils.todayStr();
    const users = this.getUsers();
    const cobrancas = this.getCobrancas();
    let updatedCharges = 0;
    let countAlerts = 0;

    cobrancas.forEach(c => {
      if (c.status === 'Pendente' && c.data_vencimento < today) {
        c.status = 'Atrasado';
        updatedCharges++;
      }
    });

    if (updatedCharges > 0) {
      this.saveCobrancas(cobrancas);
      this.addLog('Automação Diária', `Verificação concluída. ${updatedCharges} faturas vencidas marcadas como em atraso.`);
    }

    // Also look for users expiring today to suggest alert warnings
    const usersExpiringToday = users.filter(u => u.proxima_cobranca === today);
    usersExpiringToday.forEach(u => {
      // Alert Telegram of billing cycle due today!
      this.triggerTelegramNotification(
        `🚨 *Aviso de Ciclo Vencendo Hoje*\n👤 *Usuário:* ${u.nome}\n🆔 *ID IQ:* ${u.iq_id}\n⏰ *O ciclo expira hoje!* Favor atualizar saldo para gerar faturamento correspondente.`
      );
      countAlerts++;
    });

    return { countAlerts, updatedCharges };
  }
}
