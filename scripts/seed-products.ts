/**
 * Script para popular o banco de dados com produtos de exemplo
 * Execução: tsx scripts/seed-products.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import { analyses } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const produtos = [
  // Eletrônicos
  { nome: "fone bluetooth", categoria: "eletrônicos", precoChina: 15, precoBrasil: 89 },
  { nome: "smartwatch", categoria: "eletrônicos", precoChina: 45, precoBrasil: 299 },
  { nome: "câmera wifi", categoria: "eletrônicos", precoChina: 35, precoBrasil: 249 },
  { nome: "mouse gamer", categoria: "eletrônicos", precoChina: 12, precoBrasil: 79 },
  { nome: "teclado mecânico", categoria: "eletrônicos", precoChina: 38, precoBrasil: 289 },
  { nome: "webcam hd", categoria: "eletrônicos", precoChina: 22, precoBrasil: 149 },
  { nome: "carregador wireless", categoria: "eletrônicos", precoChina: 8, precoBrasil: 59 },
  { nome: "power bank", categoria: "eletrônicos", precoChina: 18, precoBrasil: 119 },
  { nome: "fone de ouvido", categoria: "eletrônicos", precoChina: 25, precoBrasil: 179 },
  { nome: "ring light", categoria: "eletrônicos", precoChina: 28, precoBrasil: 189 },
  
  // Casa e Decoração
  { nome: "luminária led", categoria: "casa", precoChina: 12, precoBrasil: 79 },
  { nome: "organizador de gaveta", categoria: "casa", precoChina: 5, precoBrasil: 39 },
  { nome: "tapete antiderrapante", categoria: "casa", precoChina: 8, precoBrasil: 49 },
  { nome: "kit de facas", categoria: "casa", precoChina: 15, precoBrasil: 99 },
  { nome: "jogo de panelas", categoria: "casa", precoChina: 35, precoBrasil: 249 },
  { nome: "cortina blackout", categoria: "casa", precoChina: 18, precoBrasil: 129 },
  { nome: "espelho decorativo", categoria: "casa", precoChina: 22, precoBrasil: 149 },
  { nome: "quadro decorativo", categoria: "casa", precoChina: 12, precoBrasil: 79 },
  { nome: "vaso de planta", categoria: "casa", precoChina: 8, precoBrasil: 59 },
  { nome: "almofada decorativa", categoria: "casa", precoChina: 6, precoBrasil: 45 },
  
  // Moda e Acessórios
  { nome: "relógio digital", categoria: "moda", precoChina: 18, precoBrasil: 119 },
  { nome: "óculos de sol", categoria: "moda", precoChina: 12, precoBrasil: 89 },
  { nome: "bolsa feminina", categoria: "moda", precoChina: 25, precoBrasil: 179 },
  { nome: "carteira masculina", categoria: "moda", precoChina: 8, precoBrasil: 59 },
  { nome: "cinto de couro", categoria: "moda", precoChina: 10, precoBrasil: 69 },
  { nome: "mochila", categoria: "moda", precoChina: 22, precoBrasil: 149 },
  { nome: "tênis esportivo", categoria: "moda", precoChina: 35, precoBrasil: 249 },
  { nome: "jaqueta corta vento", categoria: "moda", precoChina: 28, precoBrasil: 189 },
  { nome: "boné", categoria: "moda", precoChina: 6, precoBrasil: 45 },
  { nome: "lenço de seda", categoria: "moda", precoChina: 8, precoBrasil: 59 },
  
  // Fitness e Esportes
  { nome: "tapete de yoga", categoria: "fitness", precoChina: 15, precoBrasil: 99 },
  { nome: "halteres", categoria: "fitness", precoChina: 25, precoBrasil: 179 },
  { nome: "corda de pular", categoria: "fitness", precoChina: 5, precoBrasil: 39 },
  { nome: "faixa elástica", categoria: "fitness", precoChina: 8, precoBrasil: 59 },
  { nome: "luva de treino", categoria: "fitness", precoChina: 10, precoBrasil: 69 },
  { nome: "garrafa térmica", categoria: "fitness", precoChina: 12, precoBrasil: 79 },
  { nome: "bola de pilates", categoria: "fitness", precoChina: 18, precoBrasil: 119 },
  { nome: "rolo de massagem", categoria: "fitness", precoChina: 15, precoBrasil: 99 },
  { nome: "tornozeleira de peso", categoria: "fitness", precoChina: 12, precoBrasil: 89 },
  { nome: "ab wheel", categoria: "fitness", precoChina: 10, precoBrasil: 69 },
  
  // Beleza e Cuidados Pessoais
  { nome: "escova alisadora", categoria: "beleza", precoChina: 28, precoBrasil: 189 },
  { nome: "massageador facial", categoria: "beleza", precoChina: 15, precoBrasil: 99 },
  { nome: "kit de pincéis", categoria: "beleza", precoChina: 12, precoBrasil: 79 },
  { nome: "espelho com led", categoria: "beleza", precoChina: 22, precoBrasil: 149 },
  { nome: "secador de cabelo", categoria: "beleza", precoChina: 35, precoBrasil: 249 },
  { nome: "modelador de cachos", categoria: "beleza", precoChina: 25, precoBrasil: 179 },
  { nome: "limpador de pele", categoria: "beleza", precoChina: 18, precoBrasil: 119 },
  { nome: "aparador de pelos", categoria: "beleza", precoChina: 15, precoBrasil: 99 },
  { nome: "kit de manicure", categoria: "beleza", precoChina: 10, precoBrasil: 69 },
  { nome: "organizador de maquiagem", categoria: "beleza", precoChina: 12, precoBrasil: 79 },
];

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");
  
  let count = 0;
  
  for (const produto of produtos) {
    try {
      // Simular dados de análise
      const cotacaoDolar = 5.25;
      const precoUSD = produto.precoChina;
      const precoBRL = precoUSD * cotacaoDolar;
      const impostoImportacao = precoBRL * 0.60;
      const iof = precoBRL * 0.0538;
      const freteInternacional = 50;
      const custoTotal = precoBRL + impostoImportacao + iof + freteInternacional;
      
      const precoMedioBrasil = produto.precoBrasil;
      const margemLucro = ((precoMedioBrasil - custoTotal) / custoTotal) * 100;
      
      // Score baseado na margem
      let score = 50;
      if (margemLucro > 50) score = 85;
      else if (margemLucro > 30) score = 70;
      else if (margemLucro > 15) score = 55;
      else score = 30;
      
      const viavel = margemLucro > 30;
      
      await db.insert(analyses).values({
        userId: 1, // Admin user
        searchTerm: produto.nome,
        cotacaoDolar: cotacaoDolar.toString(),
        precoMedioChina: precoUSD.toString(),
        precoMedioBrasil: precoMedioBrasil.toString(),
        custoTotal: custoTotal.toString(),
        margemLucroPercentual: margemLucro.toString(),
        nivelConcorrencia: margemLucro > 40 ? "baixa" : margemLucro > 20 ? "média" : "alta",
        totalVendedores: Math.floor(Math.random() * 1000) + 50,
        opportunityScore: Math.round(score * 10),
        isViable: viavel ? 1 : 0,
        recommendation: viavel 
          ? `Ótima oportunidade! Margem de ${margemLucro.toFixed(1)}%` 
          : `Margem muito baixa (${margemLucro.toFixed(1)}%). Busque produtos com margem acima de 30%.`,
      });
      
      count++;
      console.log(`✓ ${count}/${produtos.length} - ${produto.nome}`);
    } catch (error) {
      console.error(`✗ Erro ao inserir ${produto.nome}:`, error);
    }
  }
  
  console.log(`\n🎉 Seed concluído! ${count} produtos adicionados.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Erro no seed:", error);
  process.exit(1);
});
